import { useState } from "react";
import type { Product } from "@shared/types";
import { Button } from "./ui/button";
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
import { CheckCircle2, PencilLine, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [customTextDraft, setCustomTextDraft] = useState("");
  const [customText, setCustomText] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
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
