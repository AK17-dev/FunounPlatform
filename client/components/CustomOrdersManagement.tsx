import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { cn } from "@/lib/utils";
import {
  deleteCustomOrder,
  getCustomOrders,
  updateCustomOrderStatus,
} from "@/lib/customOrders";
import type { CustomOrder, CustomOrderStatus } from "@shared/types";
import { ClipboardList, Loader2, Trash2 } from "lucide-react";

const ORDER_STATUSES: CustomOrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "ready",
];

const STATUS_STYLES: Record<CustomOrderStatus, string> = {
  pending: "border-yellow-300 bg-yellow-100 text-yellow-800",
  accepted: "border-blue-300 bg-blue-100 text-blue-800",
  rejected: "border-red-300 bg-red-100 text-red-800",
  ready: "border-green-300 bg-green-100 text-green-800",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: CustomOrderStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground break-words">{value}</p>
    </div>
  );
}

export function CustomOrdersManagement() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<CustomOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getCustomOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading custom orders:", error);
      toast({
        title: "Error loading custom orders",
        description: "Failed to load custom orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    nextStatus: CustomOrderStatus,
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await updateCustomOrderStatus(orderId, nextStatus);

      setOrders((prev) =>
        prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
      setSelectedOrder((prev) =>
        prev && prev.id === updatedOrder.id ? updatedOrder : prev,
      );

      toast({
        title: "Status updated",
        description: `Order ${updatedOrder.tracking_code} is now ${updatedOrder.status}.`,
      });
    } catch (error) {
      console.error("Error updating custom order status:", error);
      toast({
        title: "Update failed",
        description: "Could not update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (order: CustomOrder) => {
    try {
      setDeletingOrderId(order.id);
      await deleteCustomOrder(order.id);

      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      setSelectedOrder((prev) => (prev && prev.id === order.id ? null : prev));
      setOrderToDelete(null);

      toast({
        title: "Order deleted",
      });
    } catch (error) {
      console.error("Error deleting custom order:", error);
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not delete the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif">Custom Orders</CardTitle>
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading custom orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-medium mb-2">
                No custom orders yet
              </h3>
              <p className="text-muted-foreground">
                New custom order requests will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium">{order.tracking_code}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.product_type}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOrderToDelete(order);
                        }}
                        disabled={deletingOrderId === order.id}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
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
              <DialogTitle>Custom Order Details</DialogTitle>
              <DialogDescription>
                Review request and update order status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailLine label="Tracking Code" value={selectedOrder.tracking_code} />
                <DetailLine label="Created At" value={formatDate(selectedOrder.created_at)} />
                <DetailLine label="Name" value={selectedOrder.name} />
                <DetailLine label="Phone" value={selectedOrder.phone} />
                <DetailLine label="Product Type" value={selectedOrder.product_type} />
                <DetailLine label="Quantity" value={String(selectedOrder.quantity)} />
                <DetailLine label="Preferred Colors" value={selectedOrder.colors || "-"} />
                <DetailLine label="Text on Product" value={selectedOrder.custom_text || "-"} />
              </div>

              <DetailLine label="Notes" value={selectedOrder.notes || "-"} />

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value: CustomOrderStatus) =>
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

      <AlertDialog
        open={!!orderToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingOrderId) {
            setOrderToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingOrderId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!orderToDelete || !!deletingOrderId}
              onClick={(event) => {
                event.preventDefault();
                if (orderToDelete) {
                  handleDeleteOrder(orderToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingOrderId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
