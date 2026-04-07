-- ============================================================
-- COMPLETE FIX: Infinite recursion in stores RLS policies
-- Run this ENTIRE script in the Supabase SQL Editor
-- Date: 2026-04-04
--
-- ROOT CAUSE:
-- 1. is_super_admin() and is_store_manager() use LANGUAGE SQL
--    which gets INLINED by PostgreSQL, defeating SECURITY DEFINER
-- 2. There are residual policies with unknown names from manual
--    fix attempts that still contain circular references
--
-- This script dynamically drops ALL policies on the affected
-- tables before recreating them cleanly.
-- ============================================================

-- ============================================================
-- STEP 1: DYNAMICALLY DROP *EVERY* POLICY on profiles, stores,
-- and store_members — regardless of policy name.
-- This catches any manually-created policies we don't know about.
-- ============================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop ALL policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;

    -- Drop ALL policies on stores
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stores'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.stores', pol.policyname);
    END LOOP;

    -- Drop ALL policies on store_members
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'store_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.store_members', pol.policyname);
    END LOOP;
END $$;

-- Verify: this should return 0 rows
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'stores', 'store_members');

-- ============================================================
-- STEP 2: RECREATE HELPER FUNCTIONS AS plpgsql
-- LANGUAGE SQL gets inlined by the planner, which defeats
-- SECURITY DEFINER. plpgsql is NEVER inlined.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = uid AND role = 'super_admin' AND status = 'active'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_store_manager(uid UUID, store_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.id = store_uuid
          AND s.status = 'active'
          AND (
            s.owner_id = uid OR
            EXISTS (
              SELECT 1 FROM public.store_members m
              WHERE m.store_id = s.id AND m.user_id = uid
            )
          )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_store_owner(uid UUID, store_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.id = store_uuid AND s.owner_id = uid
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_owner_role(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = uid
          AND role IN ('owner', 'super_admin')
          AND status = 'active'
    );
END;
$$;

-- ============================================================
-- STEP 3: RECREATE PROFILES POLICIES
-- No inline references to stores or store_members.
-- ============================================================

CREATE POLICY "Profiles: read by authenticated" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Profiles: insert own" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: update own" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid() OR public.is_super_admin(auth.uid()))
    WITH CHECK (id = auth.uid() OR public.is_super_admin(auth.uid()));

-- ============================================================
-- STEP 4: RECREATE STORES POLICIES
-- SELECT is public. INSERT uses only SECURITY DEFINER helpers.
-- No inline subqueries that could trigger another table's RLS.
-- ============================================================

CREATE POLICY "Stores: public read" ON public.stores
    FOR SELECT USING (true);

CREATE POLICY "Stores: owner or admin insert" ON public.stores
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR (
            owner_id = auth.uid() AND
            public.has_owner_role(auth.uid())
        )
    );

CREATE POLICY "Stores: owner update" ON public.stores
    FOR UPDATE
    USING (public.is_super_admin(auth.uid()) OR owner_id = auth.uid())
    WITH CHECK (public.is_super_admin(auth.uid()) OR owner_id = auth.uid());

CREATE POLICY "Stores: owner delete" ON public.stores
    FOR DELETE
    USING (public.is_super_admin(auth.uid()) OR owner_id = auth.uid());

-- ============================================================
-- STEP 5: RECREATE STORE_MEMBERS POLICIES
-- All cross-table checks use SECURITY DEFINER helpers only.
-- ============================================================

CREATE POLICY "Store members: read store" ON public.store_members
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

CREATE POLICY "Store members: owner manage" ON public.store_members
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        public.is_store_owner(auth.uid(), store_id)
    );

CREATE POLICY "Store members: owner update" ON public.store_members
    FOR UPDATE
    USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_owner(auth.uid(), store_id)
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        public.is_store_owner(auth.uid(), store_id)
    );

CREATE POLICY "Store members: owner delete" ON public.store_members
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_owner(auth.uid(), store_id)
    );

-- ============================================================
-- STEP 6: BACKFILL MISSING PROFILES
-- ============================================================

INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 7: VERIFY — run this after the script to confirm
-- only the expected policies exist and no ghosts remain.
-- ============================================================

-- Uncomment and run to verify:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'stores', 'store_members')
-- ORDER BY tablename, cmd;
