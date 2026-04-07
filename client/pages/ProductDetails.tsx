import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ProductWithRelations } from "@shared/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getProductById } from "@/lib/products";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { ProductReviews } from "@/components/ProductReviews";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProductDetailSkeleton } from "@/components/skeletons/Skeletons";
import { Heart, HeartOff, Loader2, ShoppingCart, Store } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        return;
      }
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadFavorite = async () => {
      if (!user || !product) {
        return;
      }

      try {
        const data = await getFavorites();
        const isFavorite = data.some((fav) => fav.product_id === product.id);
        setProduct({ ...product, is_favorite: isFavorite });
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorite();
  }, [user, product?.id]);

  const discountPercentage = product?.discount_percentage ?? 0;
  const discountedPrice = product
    ? discountPercentage > 0
      ? product.price * (1 - discountPercentage / 100)
      : product.price
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

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
    });

    toast({
      title: "Added to cart",
      description: product.name,
    });
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

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
      setProduct({ ...product, is_favorite: nextValue });
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button asChild variant="ghost">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          {loading ? (
            <ProductDetailSkeleton />
          ) : !product ? (
            <div className="text-center py-24">
              <p className="text-lg text-muted-foreground">
                Product not found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="rounded-3xl overflow-hidden border border-border/60">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span>{product.store?.name ?? "Funoun Store"}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-semibold text-primary">
                    {formatPrice(discountedPrice)}
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </p>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-primary/10 text-primary">
                      {discountPercentage}% off
                    </Badge>
                  )}
                </div>
                {product.category && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {product.category.name}
                  </Badge>
                )}
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                  >
                    {product.is_favorite ? (
                      <HeartOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
                    {product.is_favorite ? "Remove Favorite" : "Save to Favorites"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews section — only render once product is loaded */}
          {product && <ProductReviews productId={product.id} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}


