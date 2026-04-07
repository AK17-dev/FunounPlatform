import { useState, useEffect } from "react";
import type { ProductWithRelations } from "@shared/types";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toggleFavorite } from "@/lib/favorites";
import { fetchProductRating } from "@/lib/reviews";
import { StarRating } from "./StarRating";
import type { ProductRating } from "@shared/types";
import {
  CheckCircle2,
  Heart,
  HeartOff,
  PencilLine,
  ShoppingCart,
  Store,
} from "lucide-react";

interface ProductCardProps {
  product: ProductWithRelations;
  onFavoriteChange?: (productId: string, nextValue: boolean) => void;
}

export function ProductCard({ product, onFavoriteChange }: ProductCardProps) {
  const [rating, setRating] = useState<ProductRating | null>(null);

  useEffect(() => {
    fetchProductRating(product.id)
      .then((data) => setRating(data))
      .catch(() => {/* non-critical — silently ignore */});
  }, [product.id]);

  const [customTextDraft, setCustomTextDraft] = useState("");
  const [customText, setCustomText] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const discountPercentage = product.discount_percentage ?? 0;
  const discountedPrice =
    discountPercentage > 0
      ? product.price * (1 - discountPercentage / 100)
      : product.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      store_id: product.store_id ?? null,
      store_name: product.store?.name ?? null,
      name: product.name,
      price: Number(discountedPrice.toFixed(2)),
      base_price: product.price,
      discount_percentage: discountPercentage,
      image: product.image_url,
      quantity: 1,
      custom_text: customText || undefined,
    });

    toast({
      title: "Added to cart",
      description: product.name,
    });
  };

  const handleSaveCustomText = () => {
    setCustomText(customTextDraft.trim());
    setCustomizeOpen(false);
  };

  const handleCustomizeOpenChange = (open: boolean) => {
    setCustomizeOpen(open);
    if (open) {
      setCustomTextDraft(customText);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(true);
      const nextValue = await toggleFavorite(
        product.id,
        Boolean(product.is_favorite),
      );
      onFavoriteChange?.(product.id, nextValue);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Could not update favorites",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="group product-card-shadow rounded-2xl bg-card overflow-hidden border border-border/50">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          aria-label={product.is_favorite ? "Remove favorite" : "Add favorite"}
        >
          {product.is_favorite ? (
            <HeartOff className="h-4 w-4 text-primary" />
          ) : (
            <Heart className="h-4 w-4 text-primary" />
          )}
        </Button>
        {discountPercentage > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            {discountPercentage}% off
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Store className="h-3.5 w-3.5" />
          <span>{product.store?.name ?? "Funoun Store"}</span>
          {product.category && (
            <Badge variant="outline" className="ml-auto text-xs text-muted-foreground py-0 h-5">
              {product.category.name}
            </Badge>
          )}
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-serif text-xl font-medium text-foreground mb-1 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {/* Star rating */}
        <div className="flex items-center gap-1.5 mb-3">
          {rating && rating.total_reviews > 0 ? (
            <>
              <StarRating rating={Math.round(rating.average_rating)} size="sm" />
              <span className="text-xs text-muted-foreground">
                {rating.average_rating.toFixed(1)} ({rating.total_reviews})
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-primary font-semibold text-lg">
            {formatPrice(discountedPrice)}
          </p>
          {discountPercentage > 0 && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>
        {customText && (
          <p className="mt-3 text-xs text-primary/90 bg-primary/10 rounded-md px-3 py-2">
            Custom text: {customText}
          </p>
        )}
        <div className="mt-5 space-y-2">
          <Button onClick={handleAddToCart} className="w-full">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>

          <Dialog
            open={customizeOpen}
            onOpenChange={handleCustomizeOpenChange}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <PencilLine className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Customize {product.name}</DialogTitle>
                <DialogDescription>
                  What would you like written on this item?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`customize-${product.id}`}>Custom text</Label>
                <Input
                  id={`customize-${product.id}`}
                  value={customTextDraft}
                  onChange={(event) => setCustomTextDraft(event.target.value)}
                  placeholder="Type your text (optional)"
                  maxLength={120}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setCustomizeOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveCustomText}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}


