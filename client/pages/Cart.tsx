import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, type CartItem } from "@/contexts/CartContext";
import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

const WHATSAPP_NUMBER = "96176322468";
const USD_TO_LBP_RATE = 89000;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function buildWhatsAppMessage(items: CartItem[], total: number) {
  const lines: string[] = ["Hello, I would like to order:", ""];

  items.forEach((item, index) => {
    lines.push(item.name);
    lines.push(`Quantity: ${item.quantity}`);
    if (item.custom_text) {
      lines.push(`Custom text: ${item.custom_text}`);
    }
    lines.push(`Price: ${formatPrice(item.price)}`);

    if (index < items.length - 1) {
      lines.push("");
    }
  });

  lines.push("");
  lines.push(`Total: ${formatPrice(total)}`);

  return lines.join("\n");
}

export default function Cart() {
  const {
    cartItems,
    cartTotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isEmpty = cartItems.length === 0;
  const totalLBP = Math.round(cartTotal * USD_TO_LBP_RATE);

  const handleProceedToWhatsApp = () => {
    if (isEmpty) {
      return;
    }

    const message = buildWhatsAppMessage(cartItems, cartTotal);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    clearCart();
    window.location.href = whatsappUrl;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                Your Cart
              </h1>
              <p className="text-muted-foreground mt-1">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {isEmpty ? (
            <Card className="handmade-shadow">
              <CardContent className="py-16 px-6 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-medium mb-2">Your cart is empty</p>
                <p className="text-muted-foreground">
                  Add products to your cart and complete your order on WhatsApp.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={`${item.product_id}-${item.custom_text ?? "default"}`}
                  className="handmade-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 sm:h-20 sm:w-20 rounded-md object-cover bg-muted shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h2 className="font-serif text-base sm:text-xl font-medium text-foreground line-clamp-2">
                          {item.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-primary font-semibold mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {item.custom_text && (
                          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            Custom text:{" "}
                            <span className="text-foreground font-medium">
                              {item.custom_text}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className="inline-flex items-center rounded-md border border-input overflow-hidden">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none"
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.custom_text,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-none"
                            onClick={() =>
                              updateQuantity(
                                item.product_id,
                                item.custom_text,
                                item.quantity + 1,
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-[11px] sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive px-2 sm:px-3"
                          onClick={() =>
                            removeFromCart(item.product_id, item.custom_text)
                          }
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-6 handmade-shadow">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(cartTotal)}
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    ~ {totalLBP.toLocaleString("en-US")} LBP
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={isEmpty}
                onClick={handleProceedToWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Proceed to WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
