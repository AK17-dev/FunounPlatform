/**
 * ProductCardSkeleton — mimics a ProductCard while data is loading.
 * Uses a shimmer CSS animation defined in global.css (.skeleton-shimmer).
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      {/* Image placeholder — square aspect ratio */}
      <div className="aspect-square skeleton-shimmer" />

      <div className="p-6 space-y-3">
        {/* Store name line */}
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        {/* Product name — two lines, different widths */}
        <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
        <div className="skeleton-shimmer h-5 w-1/2 rounded-md" />
        {/* Stars placeholder */}
        <div className="skeleton-shimmer h-3 w-28 rounded-full" />
        {/* Price */}
        <div className="skeleton-shimmer h-6 w-20 rounded-md mt-1" />
        {/* Description lines */}
        <div className="space-y-1.5 pt-1">
          <div className="skeleton-shimmer h-3 w-full rounded-full" />
          <div className="skeleton-shimmer h-3 w-5/6 rounded-full" />
          <div className="skeleton-shimmer h-3 w-4/6 rounded-full" />
        </div>
        {/* Button area */}
        <div className="skeleton-shimmer h-10 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

/**
 * ProductGridSkeleton — renders a full grid of skeleton cards.
 * Used on the catalog/listing page while products load.
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * ProductDetailSkeleton — mimics the two-column product detail layout.
 * Used on /products/:id while the product data loads.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left — large image */}
      <div className="aspect-square skeleton-shimmer rounded-2xl" />

      {/* Right — text block */}
      <div className="space-y-4 py-2">
        {/* Category badge */}
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
        {/* Product name */}
        <div className="skeleton-shimmer h-9 w-3/4 rounded-lg" />
        <div className="skeleton-shimmer h-9 w-1/2 rounded-lg" />
        {/* Stars */}
        <div className="skeleton-shimmer h-4 w-32 rounded-full" />
        {/* Price */}
        <div className="skeleton-shimmer h-8 w-24 rounded-lg" />
        <hr className="border-border/40" />
        {/* Description */}
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded-full" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-full" />
          <div className="skeleton-shimmer h-4 w-4/6 rounded-full" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-full" />
        </div>
        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <div className="skeleton-shimmer h-11 flex-1 rounded-lg" />
          <div className="skeleton-shimmer h-11 w-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * OrdersTableSkeleton — mimics a table of orders with 5 rows.
 */
export function OrdersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 pb-2 border-b border-border/50">
        {["Order ID", "Customer", "Date", "Total", "Status"].map((h) => (
          <div key={h} className="skeleton-shimmer h-4 w-16 rounded-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-border/30">
          <div className="skeleton-shimmer h-4 w-20 rounded-full" />
          <div className="skeleton-shimmer h-4 w-28 rounded-full" />
          <div className="skeleton-shimmer h-4 w-24 rounded-full" />
          <div className="skeleton-shimmer h-4 w-16 rounded-full" />
          <div className="skeleton-shimmer h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
