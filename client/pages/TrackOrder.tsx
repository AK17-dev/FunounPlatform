import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCustomOrderByTrackingCode } from "@/lib/customOrders";
import type { CustomOrder, CustomOrderStatus } from "@shared/types";
import { Loader2, Search } from "lucide-react";

const STATUS_STYLES: Record<CustomOrderStatus, string> = {
  pending: "border-yellow-300 bg-yellow-100 text-yellow-800",
  accepted: "border-blue-300 bg-blue-100 text-blue-800",
  rejected: "border-red-300 bg-red-100 text-red-800",
  ready: "border-green-300 bg-green-100 text-green-800",
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm sm:text-base text-foreground break-words">{value}</p>
    </div>
  );
}

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<CustomOrder | null>(null);

  const handleCheckStatus = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedCode = trackingCode.trim().toUpperCase();
    if (!normalizedCode) {
      setOrder(null);
      setErrorMessage("Please enter your tracking code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setOrder(null);

    try {
      const foundOrder = await getCustomOrderByTrackingCode(normalizedCode);

      if (!foundOrder) {
        setErrorMessage("Order not found. Please check your tracking code.");
      } else {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Error checking order status:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not check your order status. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto handmade-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Track Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking_code">Tracking Code</Label>
                  <Input
                    id="tracking_code"
                    value={trackingCode}
                    onChange={(event) => setTrackingCode(event.target.value.toUpperCase())}
                    placeholder="FN-4821"
                    autoComplete="off"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </form>

              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}

              {order && (
                <Card className="border-border/80 bg-card/70">
                  <CardHeader className="space-y-3">
                    <CardTitle className="font-serif text-2xl">
                      Order Details
                    </CardTitle>
                    <div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-base font-bold px-4 py-2 rounded-full",
                          STATUS_STYLES[order.status],
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <DetailRow label="Tracking Code" value={order.tracking_code} />
                    <DetailRow label="Product Type" value={order.product_type} />
                    <DetailRow label="Quantity" value={String(order.quantity)} />
                    <DetailRow label="Order Date" value={formatOrderDate(order.created_at)} />
                    <DetailRow label="Requested Text" value={order.custom_text || "-"} />
                    <DetailRow label="Colors" value={order.colors || "-"} />
                    <div className="sm:col-span-2">
                      <DetailRow label="Notes" value={order.notes || "-"} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
