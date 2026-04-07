import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { deleteReview } from "@/lib/reviews";
import type { ReviewWithProfile } from "@shared/types";
import { Pencil, Trash2 } from "lucide-react";

interface ReviewCardProps {
  review: ReviewWithProfile;
  onEdit: (review: ReviewWithProfile) => void;
  onDeleted: (reviewId: string) => void;
}

function formatReviewDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function ReviewCard({ review, onEdit, onDeleted }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const isAuthor = user?.id === review.user_id;

  const handleDelete = async () => {
    if (!confirm("Delete your review?")) return;
    try {
      setDeleting(true);
      await deleteReview(review.id);
      onDeleted(review.id);
      toast({ title: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-card/60">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar circle */}
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-sm">
                {review.display_name[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground leading-tight">
                {review.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatReviewDate(review.created_at)}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(review)}
                aria-label="Edit review"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete review"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <StarRating rating={review.rating} size="sm" />

        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
