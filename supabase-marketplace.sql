-- Marketplace migration for multi-tenant Funoun platform
-- Date: 2026-03-13
-- Safe extension of existing schema (products table kept intact, new columns added)

-- Required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function (already used by products). Recreate to be safe.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('super_admin', 'owner', 'staff', 'client')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store members (staff/admin)
CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (store_id, user_id)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (store_id, slug)
);

-- Extend products table (non-destructive)
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

CREATE INDEX IF NOT EXISTS products_store_id_idx ON public.products (store_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);

-- Optional legacy mapping: assign existing products to a legacy store owned by the first super admin
DO $$
DECLARE
    admin_id UUID;
    legacy_store_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'super_admin' ORDER BY created_at LIMIT 1;

    IF admin_id IS NOT NULL THEN
        INSERT INTO public.stores (owner_id, name, slug, status)
        VALUES (admin_id, 'Legacy Store', 'legacy-store', 'active')
        ON CONFLICT (slug) DO NOTHING;

        SELECT id INTO legacy_store_id FROM public.stores WHERE slug = 'legacy-store' LIMIT 1;

        UPDATE public.products
        SET store_id = legacy_store_id
        WHERE store_id IS NULL;
    END IF;
END $$;

-- Favorites / wishlist
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC NOT NULL,
    discount_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    custom_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON public.orders (store_id);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC NOT NULL,
    discount_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    custom_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_store_id_idx ON public.order_items (store_id);

-- Ensure order items match order + product store
CREATE OR REPLACE FUNCTION public.enforce_order_item_store()
RETURNS TRIGGER AS $$
DECLARE
    order_store UUID;
    product_store UUID;
BEGIN
    SELECT store_id INTO order_store FROM public.orders WHERE id = NEW.order_id;
    SELECT store_id INTO product_store FROM public.products WHERE id = NEW.product_id;

    IF order_store IS NULL OR product_store IS NULL THEN
        RAISE EXCEPTION 'Order or product store is missing.';
    END IF;

    IF NEW.store_id <> order_store OR product_store <> order_store THEN
        RAISE EXCEPTION 'Order item store mismatch.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_order_item_store ON public.order_items;
CREATE TRIGGER enforce_order_item_store
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_item_store();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Prevent role/status escalation by non-super admins
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role <> OLD.role OR NEW.status <> OLD.status)
       AND NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only super admins can change role or status.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_change();

DROP TRIGGER IF EXISTS handle_updated_at_stores ON public.stores;
CREATE TRIGGER handle_updated_at_stores
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Prevent store status changes by non-super admins
CREATE OR REPLACE FUNCTION public.prevent_store_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status
       AND NOT public.is_super_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only super admins can change store status.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_store_status_change ON public.stores;
CREATE TRIGGER prevent_store_status_change
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_store_status_change();

DROP TRIGGER IF EXISTS handle_updated_at_orders ON public.orders;
CREATE TRIGGER handle_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = uid AND role = 'super_admin' AND status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_store_manager(uid UUID, store_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
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
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles: read own or admin" ON public.profiles;
CREATE POLICY "Profiles: read own or admin" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() OR public.is_super_admin(auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.store_members m
          JOIN public.stores s ON s.id = m.store_id
          WHERE m.user_id = public.profiles.id AND s.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own" ON public.profiles
    FOR UPDATE USING (id = auth.uid() OR public.is_super_admin(auth.uid()))
    WITH CHECK (id = auth.uid() OR public.is_super_admin(auth.uid()));

-- Stores policies
DROP POLICY IF EXISTS "Stores: public read" ON public.stores;
CREATE POLICY "Stores: public read" ON public.stores
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Stores: owner or admin insert" ON public.stores;
CREATE POLICY "Stores: owner or admin insert" ON public.stores
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR (
          owner_id = auth.uid() AND
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('owner', 'super_admin')
              AND p.status = 'active'
          )
        )
    );

DROP POLICY IF EXISTS "Stores: owner update" ON public.stores;
CREATE POLICY "Stores: owner update" ON public.stores
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR owner_id = auth.uid()
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR owner_id = auth.uid()
    );

DROP POLICY IF EXISTS "Stores: owner delete" ON public.stores;
CREATE POLICY "Stores: owner delete" ON public.stores
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR owner_id = auth.uid()
    );

-- Store members policies
DROP POLICY IF EXISTS "Store members: read store" ON public.store_members;
CREATE POLICY "Store members: read store" ON public.store_members
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

DROP POLICY IF EXISTS "Store members: owner manage" ON public.store_members;
CREATE POLICY "Store members: owner manage" ON public.store_members
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.stores s
          WHERE s.id = store_id AND s.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Store members: owner update" ON public.store_members;
CREATE POLICY "Store members: owner update" ON public.store_members
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.stores s
          WHERE s.id = store_id AND s.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.stores s
          WHERE s.id = store_id AND s.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Store members: owner delete" ON public.store_members;
CREATE POLICY "Store members: owner delete" ON public.store_members
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.stores s
          WHERE s.id = store_id AND s.owner_id = auth.uid()
        )
    );

-- Categories policies
DROP POLICY IF EXISTS "Categories: public read" ON public.categories;
CREATE POLICY "Categories: public read" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories: manage store" ON public.categories;
CREATE POLICY "Categories: manage store" ON public.categories
    FOR INSERT WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    );

DROP POLICY IF EXISTS "Categories: update store" ON public.categories;
CREATE POLICY "Categories: update store" ON public.categories
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    );

DROP POLICY IF EXISTS "Categories: delete store" ON public.categories;
CREATE POLICY "Categories: delete store" ON public.categories
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    );

-- Products policies (public read, store-managed writes)
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete to products" ON public.products;

DROP POLICY IF EXISTS "Products: public read" ON public.products;
CREATE POLICY "Products: public read" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products: insert store" ON public.products;
CREATE POLICY "Products: insert store" ON public.products
    FOR INSERT WITH CHECK (
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id)) OR
        public.is_super_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Products: update store" ON public.products;
CREATE POLICY "Products: update store" ON public.products
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    );

DROP POLICY IF EXISTS "Products: delete store" ON public.products;
CREATE POLICY "Products: delete store" ON public.products
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        (store_id IS NOT NULL AND public.is_store_manager(auth.uid(), store_id))
    );

-- Favorites policies
DROP POLICY IF EXISTS "Favorites: read own" ON public.favorites;
CREATE POLICY "Favorites: read own" ON public.favorites
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Favorites: insert own" ON public.favorites;
CREATE POLICY "Favorites: insert own" ON public.favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Favorites: delete own" ON public.favorites;
CREATE POLICY "Favorites: delete own" ON public.favorites
    FOR DELETE USING (user_id = auth.uid());

-- Orders policies
DROP POLICY IF EXISTS "Orders: read own or store" ON public.orders;
CREATE POLICY "Orders: read own or store" ON public.orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

DROP POLICY IF EXISTS "Orders: insert own" ON public.orders;
CREATE POLICY "Orders: insert own" ON public.orders
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM public.stores s
          WHERE s.id = store_id AND s.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Orders: update store" ON public.orders;
CREATE POLICY "Orders: update store" ON public.orders
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

DROP POLICY IF EXISTS "Orders: cancel own" ON public.orders;
CREATE POLICY "Orders: cancel own" ON public.orders
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid() AND status = 'cancelled');

DROP POLICY IF EXISTS "Orders: delete store" ON public.orders;
CREATE POLICY "Orders: delete store" ON public.orders
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

-- Order items policies
DROP POLICY IF EXISTS "Order items: read own or store" ON public.order_items;
CREATE POLICY "Order items: read own or store" ON public.order_items
    FOR SELECT USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id) OR
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Order items: insert own" ON public.order_items;
CREATE POLICY "Order items: insert own" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_id AND o.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Order items: update store" ON public.order_items;
CREATE POLICY "Order items: update store" ON public.order_items
    FOR UPDATE USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    )
    WITH CHECK (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

DROP POLICY IF EXISTS "Order items: delete store" ON public.order_items;
CREATE POLICY "Order items: delete store" ON public.order_items
    FOR DELETE USING (
        public.is_super_admin(auth.uid()) OR
        public.is_store_manager(auth.uid(), store_id)
    );

-- Optional: update storage policies for store-scoped product images
-- Assumes product image object names are stored as: {store_id}/{filename}
-- Requires storage.objects RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Product images public read" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Product images store upload" ON storage.objects;
CREATE POLICY "Product images store upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        (
          public.is_super_admin(auth.uid()) OR
          public.is_store_manager(
            auth.uid(),
            CASE
              WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
              THEN (storage.foldername(name))[1]::uuid
              ELSE NULL
            END
          )
        )
    );

DROP POLICY IF EXISTS "Product images store update" ON storage.objects;
CREATE POLICY "Product images store update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        (
          public.is_super_admin(auth.uid()) OR
          public.is_store_manager(
            auth.uid(),
            CASE
              WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
              THEN (storage.foldername(name))[1]::uuid
              ELSE NULL
            END
          )
        )
    );

DROP POLICY IF EXISTS "Product images store delete" ON storage.objects;
CREATE POLICY "Product images store delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        (
          public.is_super_admin(auth.uid()) OR
          public.is_store_manager(
            auth.uid(),
            CASE
              WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
              THEN (storage.foldername(name))[1]::uuid
              ELSE NULL
            END
          )
        )
    );

-- Notes:
-- 1) Create a super admin manually: update public.profiles set role='super_admin' where email='you@domain.com';
-- 2) Assign existing products to a store by setting products.store_id after creating a store.

-- ============================================================
-- Global platform categories (store_id = NULL)
-- These are available to all stores and appear in every
-- product form. Run this block in the Supabase SQL Editor.
-- Safe to re-run: uses WHERE NOT EXISTS to skip duplicates
-- (ON CONFLICT won't deduplicate NULL store_id in Postgres)
-- ============================================================

-- Index to speed up category name lookups / filters
CREATE INDEX IF NOT EXISTS categories_name_idx ON public.categories (name);

DO $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN
    SELECT * FROM (
      VALUES
        ('Pouch',   'pouch'),
        ('Pottery', 'pottery'),
        ('Mug',     'mug'),
        ('Set',     'set'),
        ('Cups',    'cups'),
        ('Case',    'case'),
        ('Bag',     'bag'),
        ('Plate',   'plate'),
        ('Tray',    'tray'),
        ('Jug',     'jug')
    ) AS t(cat_name, cat_slug)
  LOOP
    INSERT INTO public.categories (name, slug, store_id)
    SELECT cat.cat_name, cat.cat_slug, NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM public.categories
      WHERE slug = cat.cat_slug AND store_id IS NULL
    );
  END LOOP;
END $$;
