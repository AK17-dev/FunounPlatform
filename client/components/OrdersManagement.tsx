import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { OrderStatus } from "@shared/types";
import { getOrdersForStore, updateOrderStatus, subscribeToStoreOrders, type OrderWithItems } from "@/lib/orders";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrdersTableSkeleton } from "@/components/skeletons/Skeletons";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-yellow-300 bg-yellow-100 text-yellow-800",
  confirmed: "border-blue-300 bg-blue-100 text-blue-800",
  preparing: "border-indigo-300 bg-indigo-100 text-indigo-800",
  ready: "border-purple-300 bg-purple-100 text-purple-800",
  shipped: "border-sky-300 bg-sky-100 text-sky-800",
  delivered: "border-green-300 bg-green-100 text-green-800",
  cancelled: "border-red-300 bg-red-100 text-red-800",
};

function formatDate(value: string) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

export function OrdersManagement({ storeId }: { storeId?: string | null }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadOrders = async () => {
    if (!storeId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getOrdersForStore(storeId);
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error loading orders",
        description: "Failed to load store orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load whenever storeId changes
  useEffect(() => {
    loadOrders();
  }, [storeId]);

  // Realtime subscription — auto-refresh when new orders arrive
  useEffect(() => {
    if (!storeId) return;
    const unsubscribe = subscribeToStoreOrders(storeId, () => {
      loadOrders();
    });
    return unsubscribe;
  }, [storeId]);

  const handleStatusChange = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await updateOrderStatus(orderId, nextStatus);

      setOrders((prev) =>
        prev.map((order) => (order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order)),
      );
      setSelectedOrder((prev) =>
        prev && prev.id === updatedOrder.id ? { ...prev, ...updatedOrder } : prev,
      );

      toast({
        title: "Status updated",
        description: `Order ${updatedOrder.id} is now ${updatedOrder.status}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update failed",
        description: "Could not update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif">Store Orders</CardTitle>
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {!storeId ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-medium mb-2">
                Select a store to view orders
              </h3>
              <p className="text-muted-foreground">
                Choose a store to see customer orders.
              </p>
            </div>
          ) : loading ? (
            <div className="py-4">
              <OrdersTableSkeleton rows={5} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-medium mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground">
                New customer orders will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.customer_name ?? "-"}</TableCell>
                    <TableCell>{formatDate(order.created_at ?? "")}</TableCell>
                    <TableCell>{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Review order items and update the status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.customer_name ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.customer_phone ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Shipping</p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.shipping_address ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                  <p className="text-sm text-foreground">
                    {formatPrice(selectedOrder.total_amount)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3">
                      <img
                        src={item.product_image_url ?? ""}
                        alt={item.product_name}
                        className="h-12 w-12 rounded-md object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity} • {formatPrice(item.unit_price)}
                        </p>
                        {item.custom_text && (
                          <p className="text-xs text-muted-foreground">Custom: {item.custom_text}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value: OrderStatus) =>
                    handleStatusChange(selectedOrder.id, value)
                  }
                  disabled={updatingOrderId === selectedOrder.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}


