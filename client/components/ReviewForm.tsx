import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitReview, updateReview, fetchUserReview } from "@/lib/reviews";
import type { ReviewWithProfile } from "@shared/types";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  /** Pass an existing review when editing — form pre-fills and shows "Update" */
  existingReview?: ReviewWithProfile | null;
  onSubmitted: (action: "created" | "updated") => void;
  onCancelEdit?: () => void;
}

export function ReviewForm({
  productId,
  existingReview,
  onSubmitted,
  onCancelEdit,
}: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [commentError, setCommentError] = useState("");

  // Keep form in sync when parent swaps existingReview (e.g. after edit click)
  useEffect(() => {
    setRating(existingReview?.rating ?? 0);
    setComment(existingReview?.comment ?? "");
    setRatingError("");
    setCommentError("");
  }, [existingReview?.id]);

  if (!user) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 p-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Please{" "}
          <Link to="/login" className="text-primary underline underline-offset-2 hover:text-primary/80">
            log in
          </Link>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  const validate = () => {
    let valid = true;
    if (rating === 0) {
      setRatingError("Please select a star rating.");
      valid = false;
    } else {
      setRatingError("");
    }
    if (comment.trim().length < 10) {
      setCommentError("Your review must be at least 10 characters.");
      valid = false;
    } else {
      setCommentError("");
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (existingReview) {
        await updateReview(existingReview.id, rating, comment.trim());
        toast({ title: "Review updated" });
        onSubmitted("updated");
      } else {
        await submitReview(productId, user.id, rating, comment.trim());
        toast({ title: "Review submitted!" });
        onSubmitted("created");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission failed",
        description: "Could not save your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!existingReview;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4"
    >
      <h3 className="font-semibold text-base text-foreground">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h3>

      {/* Star rating picker */}
      <div className="space-y-1">
        <Label>Your Rating *</Label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
        {ratingError && (
          <p className="text-xs text-destructive">{ratingError}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <Label htmlFor="review-comment">Your Review *</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product (at least 10 characters)..."
          rows={4}
        />
        {commentError && (
          <p className="text-xs text-destructive">{commentError}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? "Updating..." : "Submitting..."}
            </>
          ) : isEditing ? (
            "Update Review"
          ) : (
            "Submit Review"
          )}
        </Button>
        {isEditing && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
