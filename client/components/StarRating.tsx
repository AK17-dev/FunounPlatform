import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  rating,
  onChange,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === "function";
  const displayRating = interactive && hovered > 0 ? hovered : rating;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Star rating" : `Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
            className={cn(
              "transition-transform",
              interactive
                ? "cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                : "cursor-default pointer-events-none",
            )}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(star)}
          >
            <Star
              className={cn(
                SIZE_CLASSES[size],
                "transition-colors",
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
