import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/orders";
import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

const USD_TO_LBP_RATE = 89000;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function groupByStore(items: CartItem[]) {
  return items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.store_id ?? "unknown";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(profile?.full_name ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    setCustomerName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  const isEmpty = cartItems.length === 0;
  const totalLBP = Math.round(cartTotal * USD_TO_LBP_RATE);
  const grouped = useMemo(() => groupByStore(cartItems), [cartItems]);
  const hasUnknownStore = cartItems.some((item) => !item.store_id);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      toast({
        title: "Missing details",
        description: "Please provide your name, phone, and shipping address.",
        variant: "destructive",
      });
      return;
    }

    if (hasUnknownStore) {
      toast({
        title: "Store info missing",
        description: "Some items are missing store information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPlacingOrder(true);
      for (const [storeId, items] of Object.entries(grouped)) {
        if (storeId === "unknown") continue;

        await createOrder({
          user_id: user.id,
          store_id: storeId,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          shipping_address: shippingAddress.trim(),
          notes: notes.trim() || undefined,
          items: items.map((item) => ({
            product_id: item.product_id,
            product_name: item.name,
            product_image_url: item.image,
            quantity: item.quantity,
            unit_price: item.price,
            discount_percentage: item.discount_percentage ?? 0,
            custom_text: item.custom_text ?? null,
          })),
        });
      }

      toast({
        title: "Order placed",
        description: "Your order has been submitted successfully.",
      });
      clearCart();
      setCustomerPhone("");
      setShippingAddress("");
      setNotes("");
    } catch (error) {
      console.error("Error placing order:", error);
      const isRlsError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "42501";
      toast({
        title: "Order failed",
        description: isRlsError
          ? "Permission error. Please make sure you are logged in and try again."
          : "Unable to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (isEmpty) return;

    const itemLines = cartItems
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} — ${formatPrice(item.price)} each`,
      )
      .join("\n");

    const message = [
      "Hello! I would like to place an order from Funoun Marketplace 🛍️",
      "",
      itemLines,
      "",
      `Total: ${cartTotal.toFixed(2)} $`,
      "",
      "Please confirm my order. Thank you!",
    ].join("\n");

    const url = `https://wa.me/96176511373?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
                  Add products to your cart and place an order directly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([storeId, items]) => (
                <div key={storeId} className="space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground">
                    Store: {items[0]?.store_name ?? "Funoun Store"}
                  </div>
                  {items.map((item) => (
                    <Card
                      key={`${item.product_id}-${item.custom_text ?? "default"}-${item.store_id ?? ""}`}
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
                                    item.store_id,
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
                                    item.store_id,
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
                                removeFromCart(item.product_id, item.custom_text, item.store_id)
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
              ))}
            </div>
          )}

          <Card className="mt-6 handmade-shadow">
            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="shippingAddress">Shipping address</Label>
                  <Input
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="Delivery address"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add delivery notes or special requests"
                    rows={3}
                  />
                </div>
              </div>

              {hasUnknownStore && (
                <p className="text-sm text-destructive">
                  Some items are missing store information. Please remove and re-add them.
                </p>
              )}

              {!user && (
                <p className="text-sm text-muted-foreground">
                  Please sign in to place your order.
                </p>
              )}

              <div className="flex flex-col md:flex-row gap-3 justify-end">
                {/* WhatsApp Order button */}
                <Button
                  type="button"
                  className="bg-[#25D366] hover:bg-[#1ebe57] text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isEmpty}
                  title={isEmpty ? "Your cart is empty" : "Order via WhatsApp"}
                  onClick={handleWhatsAppOrder}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Order via WhatsApp
                </Button>

                {/* Place Order button */}
                <Button
                  type="button"
                  disabled={isEmpty || placingOrder || hasUnknownStore}
                  onClick={handlePlaceOrder}
                >
                  {placingOrder ? "Placing order..." : "Place Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}


