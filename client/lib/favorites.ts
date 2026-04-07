import { supabase } from "./supabase";
import type { Favorite } from "@shared/types";

export async function getFavorites(): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Favorite[];
}

export async function addFavorite(productId: string): Promise<Favorite> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error("You must be logged in to favorite products.");
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, product_id: productId })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Favorite;
}

export async function removeFavorite(productId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("You must be logged in to remove favorites.");
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function toggleFavorite(
  productId: string,
  isFavorite: boolean,
): Promise<boolean> {
  if (isFavorite) {
    await removeFavorite(productId);
    return false;
  }

  await addFavorite(productId);
  return true;
}


