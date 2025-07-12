import type { Product } from "@shared/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="group product-card-shadow rounded-2xl bg-card overflow-hidden border border-border/50">
      <div className="aspect-square overflow-hidden bg-muted/30">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-medium text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-primary font-semibold text-lg mb-3">
          {formatPrice(product.price)}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>
      </div>
    </div>
  );
}
