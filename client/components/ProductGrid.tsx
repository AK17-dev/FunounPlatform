import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, ProductWithRelations } from "@shared/types";
import { ProductCard } from "./ProductCard";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getFavorites } from "@/lib/favorites";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<
    "newest" | "price_asc" | "price_desc" | "discount_desc"
  >("newest");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setFavoriteIds(new Set());
        return;
      }

      try {
        const data = await getFavorites();
        setFavoriteIds(new Set(data.map((fav) => fav.product_id)));
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };

    loadFavorites();
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const min = minPrice.trim().length > 0 ? Number(minPrice) : undefined;
        const max = maxPrice.trim().length > 0 ? Number(maxPrice) : undefined;

        console.log("before getProducts");

        const loadPromise = getProducts({
          search,
          categoryId: categoryId ?? undefined,
          minPrice: Number.isFinite(min) ? min : undefined,
          maxPrice: Number.isFinite(max) ? max : undefined,
          sort,
          onlyDiscounted,
        });

        // Failsafe: if Supabase request hangs, stop spinner and show error
        const timerPromise = new Promise<null>((_, reject) =>
          setTimeout(() => {
            reject(new Error("getProducts timeout"));
          }, 15000),
        );

        const data = await Promise.race([loadPromise, timerPromise]);

        console.log("after getProducts", data);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error && err.message === "getProducts timeout"
            ? "Taking too long to load products. Please check your connection and try again."
            : "Failed to load products. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, categoryId, minPrice, maxPrice, sort, onlyDiscounted, retryKey]);

  const filteredProducts = useMemo(() => {
    const withFavorites = products.map((product) => ({
      ...product,
      is_favorite: favoriteIds.has(product.id),
    }));

    if (!favoritesOnly) {
      return withFavorites;
    }

    return withFavorites.filter((product) => favoriteIds.has(product.id));
  }, [products, favoriteIds, favoritesOnly]);

  const handleFavoriteChange = (productId: string, nextValue: boolean) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (nextValue) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setOnlyDiscounted(false);
    setFavoritesOnly(false);
  };

  // Renders grid area without unmounting filters (preserves search focus)
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading our beautiful products...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              Oops! Something went wrong
            </p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setRetryKey((k) => k + 1);
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">
              No products available
            </p>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back soon!
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each piece in our collection is carefully handcrafted using
            traditional techniques and the finest materials.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/80 backdrop-blur px-4 py-5 sm:px-6 mb-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                ref={searchRef}
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId ?? "all"}
                onValueChange={(value) =>
                  setCategoryId(value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="discount_desc">Biggest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={onlyDiscounted}
                  onCheckedChange={setOnlyDiscounted}
                  id="discounts-only"
                />
                <Label htmlFor="discounts-only">On sale</Label>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={favoritesOnly}
                    onCheckedChange={setFavoritesOnly}
                    id="favorites-only"
                  />
                  <Label htmlFor="favorites-only">Favorites only</Label>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}


