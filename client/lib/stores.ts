import { supabase } from "./supabase";
import type { Profile, Store, StoreMember, StoreMemberRole, StoreStatus } from "@shared/types";

export interface StoreMemberWithProfile extends StoreMember {
  profile?: Profile | null;
}

export interface StoreWithOwner extends Store {
  owner?: Profile | null;
}

export async function getStoreByOwner(ownerId: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Store | null) ?? null;
}

export async function getStoresForMember(userId: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from("store_members")
    .select("store:stores(*)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as { store: Store }[];
  return rows.map((row) => row.store).filter(Boolean);
}

export type CreateStoreErrorCode =
  | "NOT_AUTHENTICATED"
  | "PERMISSION_DENIED"
  | "SLUG_TAKEN"
  | "MISSING_PROFILE"
  | "UNKNOWN";

export class CreateStoreError extends Error {
  code: CreateStoreErrorCode;

  constructor(code: CreateStoreErrorCode, message: string) {
    super(message);
    this.name = "CreateStoreError";
    this.code = code;
  }
}

export async function createStore(payload: {
  name: string;
  slug?: string;
  description?: string | null;
}): Promise<Store> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new CreateStoreError("NOT_AUTHENTICATED", "You must be signed in to create a store.");
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new CreateStoreError("NOT_AUTHENTICATED", "No authenticated user found. Please sign in again.");
  }

  // Build insert payload with explicit nulls (never undefined)
  const insertPayload: Record<string, unknown> = {
    owner_id: userId,
    name: payload.name,
    description: payload.description ?? null,
    status: "pending" satisfies StoreStatus,
  };

  // Only include slug if the user provided one; otherwise let DB default to NULL
  if (payload.slug) {
    insertPayload.slug = payload.slug;
  }

  const { data, error } = await supabase
    .from("stores")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("[createStore] Supabase error:", error.code, error.message, error.details);

    // RLS policy violation — user's profile role isn't 'owner' or status isn't 'active'
    if (error.code === "42501") {
      throw new CreateStoreError(
        "PERMISSION_DENIED",
        "Your account does not have permission to create a store. Please make sure your account role is set to Owner and your status is Active.",
      );
    }

    // UNIQUE violation on slug
    if (error.code === "23505" && error.message?.includes("slug")) {
      throw new CreateStoreError(
        "SLUG_TAKEN",
        "A store with this slug already exists. Please choose a different slug.",
      );
    }

    // UNIQUE violation on something else (e.g. name if ever made unique)
    if (error.code === "23505") {
      throw new CreateStoreError(
        "SLUG_TAKEN",
        "A store with this name or slug already exists. Please choose different values.",
      );
    }

    // FK violation — profile row missing for owner_id
    if (error.code === "23503") {
      throw new CreateStoreError(
        "MISSING_PROFILE",
        "Your user profile was not found in the database. Please contact support.",
      );
    }

    throw new CreateStoreError("UNKNOWN", error.message || "An unexpected error occurred while creating the store.");
  }

  return data as Store;
}

export async function updateStore(
  storeId: string,
  updates: Partial<Pick<Store, "name" | "slug" | "description" | "logo_url">>,
): Promise<Store> {
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Store;
}

export async function getAllStores(): Promise<StoreWithOwner[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*, owner:profiles(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as StoreWithOwner[];
}

export async function updateStoreStatus(
  storeId: string,
  status: StoreStatus,
): Promise<Store> {
  const { data, error } = await supabase
    .from("stores")
    .update({ status })
    .eq("id", storeId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Store;
}

export async function getStoreMembers(
  storeId: string,
): Promise<StoreMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("store_members")
    .select("*, profile:profiles(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as StoreMemberWithProfile[];
}

export type AddMemberErrorCode =
  | "INVALID_UUID"
  | "USER_NOT_FOUND"
  | "ALREADY_MEMBER"
  | "RLS_DENIED"
  | "UNKNOWN";

export class AddMemberError extends Error {
  code: AddMemberErrorCode;

  constructor(code: AddMemberErrorCode, message: string) {
    super(message);
    this.name = "AddMemberError";
    this.code = code;
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function addStoreMember(payload: {
  store_id: string;
  user_id: string;
  role: StoreMemberRole;
}): Promise<StoreMember> {
  // 1. Validate UUID format
  if (!UUID_RE.test(payload.user_id)) {
    throw new AddMemberError(
      "INVALID_UUID",
      "The User ID must be a valid UUID (e.g. 3b241101-e2bb-4d5a-a3db-24a0b2f8c3e1).",
    );
  }

  // 2. Verify user exists in profiles
  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", payload.user_id)
    .maybeSingle();

  if (profileError) {
    // RLS may block the lookup — treat as "cannot verify"
    throw new AddMemberError(
      "USER_NOT_FOUND",
      "Could not find a user with that ID. Make sure the person has signed up and their User ID is correct.",
    );
  }

  if (!profileRow) {
    throw new AddMemberError(
      "USER_NOT_FOUND",
      "No account found for this User ID. The person must register first.",
    );
  }

  // 3. Check for duplicate membership
  const { data: existing } = await supabase
    .from("store_members")
    .select("id")
    .eq("store_id", payload.store_id)
    .eq("user_id", payload.user_id)
    .maybeSingle();

  if (existing) {
    throw new AddMemberError(
      "ALREADY_MEMBER",
      "This user is already a staff member of your store.",
    );
  }

  // 4. Insert the new member
  const { data, error } = await supabase
    .from("store_members")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    // Supabase RLS denial returns code 42501
    if (error.code === "42501") {
      throw new AddMemberError(
        "RLS_DENIED",
        "You do not have permission to add staff to this store.",
      );
    }
    // Duplicate key (race condition)
    if (error.code === "23505") {
      throw new AddMemberError(
        "ALREADY_MEMBER",
        "This user is already a staff member of your store.",
      );
    }
    // FK violation (profiles row missing — shouldn't happen after our check, but just in case)
    if (error.code === "23503") {
      throw new AddMemberError(
        "USER_NOT_FOUND",
        "No account found for this User ID. The person must register first.",
      );
    }
    throw new AddMemberError("UNKNOWN", error.message);
  }

  return data as StoreMember;
}

export async function removeStoreMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("store_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw error;
  }
}


