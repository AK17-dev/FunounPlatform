import { useEffect, useState } from "react";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import {
  fetchReviewsByProduct,
  fetchProductRating,
  fetchUserReview,
} from "@/lib/reviews";
import { useAuth } from "@/contexts/AuthContext";
import type { ReviewWithProfile, ProductRating } from "@shared/types";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 5;

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [rating, setRating] = useState<ProductRating | null>(null);
  const [userReview, setUserReview] = useState<ReviewWithProfile | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allReviews, ratingData] = await Promise.all([
        fetchReviewsByProduct(productId),
        fetchProductRating(productId),
      ]);
      setReviews(allReviews);
      setRating(ratingData);

      if (user) {
        const mine = allReviews.find((r) => r.user_id === user.id) ?? null;
        setUserReview(mine);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [productId, user?.id]);

  const handleSubmitted = async (_action: "created" | "updated") => {
    setEditingReview(null);
    await loadAll();
  };

  const handleDeleted = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    if (userReview?.id === reviewId) setUserReview(null);
  };

  const handleEdit = (review: ReviewWithProfile) => {
    setEditingReview(review);
    // Scroll to the form
    document.getElementById("review-form-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => setEditingReview(null);

  // Compute star breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const totalReviews = reviews.length;
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < totalReviews;

  // Determine whether to show form
  const showForm =
    !userReview ||          // user hasn't reviewed yet
    editingReview !== null; // or is editing

  return (
    <section className="mt-12 pt-8 border-t border-border/50">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
        Customer Reviews
      </h2>

      {/* ── Summary bar ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-6">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading reviews...</span>
        </div>
      ) : (
        <>
          {totalReviews > 0 && rating ? (
            <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 rounded-xl bg-card/60 border border-border/50">
              {/* Average */}
              <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r sm:border-border/50 min-w-[120px]">
                <span className="text-5xl font-bold text-foreground leading-none">
                  {rating.average_rating.toFixed(1)}
                </span>
                <StarRating
                  rating={Math.round(rating.average_rating)}
                  size="md"
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {rating.total_reviews} review{rating.total_reviews !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 space-y-1.5">
                {breakdown.map(({ star, count }) => {
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-right text-muted-foreground shrink-0">
                        {star}★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : totalReviews === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <MessageSquare className="h-5 w-5" />
              <p className="text-sm">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : null}

          {/* ── Review form ───────────────────────────────────────────── */}
          <div id="review-form-anchor" className="mb-8">
            {showForm ? (
              <ReviewForm
                productId={productId}
                existingReview={editingReview}
                onSubmitted={handleSubmitted}
                onCancelEdit={editingReview ? handleCancelEdit : undefined}
              />
            ) : (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
                <span>You have already reviewed this product.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(userReview!)}
                >
                  Edit My Review
                </Button>
              </div>
            )}
          </div>

          {/* ── Review list ───────────────────────────────────────────── */}
          {totalReviews > 0 && (
            <div className="space-y-4">
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEdit}
                  onDeleted={handleDeleted}
                />
              ))}

              {hasMore && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Load More Reviews ({totalReviews - visibleCount} remaining)
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
