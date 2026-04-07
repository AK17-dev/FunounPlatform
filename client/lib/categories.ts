import { supabase } from "./supabase";
import type { Category } from "@shared/types";

export async function getCategories(storeId?: string | null): Promise<Category[]> {
  let query = supabase.from("categories").select("*").order("name");

  if (storeId) {
    query = query.or(`store_id.is.null,store_id.eq.${storeId}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function createCategory(payload: {
  name: string;
  slug: string;
  store_id?: string | null;
}): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: payload.name,
      slug: payload.slug,
      store_id: payload.store_id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw error;
  }
}


