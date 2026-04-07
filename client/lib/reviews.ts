import { supabase } from "./supabase";
import type { Review, ReviewWithProfile, ProductRating } from "@shared/types";

/**
 * Fetch all reviews for a product, with display names joined from profiles.
 * Sorted newest first.
 */
export async function fetchReviewsByProduct(
  productId: string,
): Promise<ReviewWithProfile[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as Array<Review & { profile: { full_name: string | null } | null }>).map(
    (row) => ({
      ...row,
      display_name: formatDisplayName(row.profile?.full_name ?? null),
    }),
  );
}

/**
 * Fetch the current user's existing review for a product, if any.
 */
export async function fetchUserReview(
  productId: string,
  userId: string,
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Review | null) ?? null;
}

/**
 * Insert a new review.
 */
export async function submitReview(
  productId: string,
  userId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, user_id: userId, rating, comment })
    .select("*")
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Update an existing review by its ID.
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update({ rating, comment, updated_at: new Date().toISOString() })
    .eq("id", reviewId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Review;
}

/**
 * Delete a review by its ID.
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
}

/**
 * Get average rating and total review count for a product.
 * Uses the product_ratings view created by the SQL migration.
 */
export async function fetchProductRating(
  productId: string,
): Promise<ProductRating | null> {
  const { data, error } = await supabase
    .from("product_ratings")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return (data as ProductRating | null) ?? null;
}

/**
 * Fetch ratings for multiple products at once (used by ProductCard grid).
 */
export async function fetchProductRatingsBatch(
  productIds: string[],
): Promise<Record<string, ProductRating>> {
  if (productIds.length === 0) return {};

  const { data, error } = await supabase
    .from("product_ratings")
    .select("*")
    .in("product_id", productIds);

  if (error) throw error;

  return ((data ?? []) as ProductRating[]).reduce<Record<string, ProductRating>>(
    (acc, row) => {
      acc[row.product_id] = row;
      return acc;
    },
    {},
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDisplayName(fullName: string | null): string {
  if (!fullName || !fullName.trim()) return "Anonymous";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
