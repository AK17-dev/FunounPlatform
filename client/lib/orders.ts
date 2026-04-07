import { supabase } from "./supabase";
import type { Order, OrderItem, OrderStatus } from "@shared/types";

export interface CreateOrderItemInput {
  product_id: string;
  product_name: string;
  product_image_url?: string | null;
  quantity: number;
  unit_price: number;
  discount_percentage?: number | null;
  custom_text?: string | null;
}

export interface CreateOrderInput {
  user_id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  notes?: string;
  currency?: string;
  items: CreateOrderItemInput[];
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const total_amount = input.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: input.user_id,
      store_id: input.store_id,
      status: "pending" satisfies OrderStatus,
      total_amount,
      currency: input.currency ?? "USD",
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      shipping_address: input.shipping_address,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (orderError) {
    throw orderError;
  }

  const itemsPayload = input.items.map((item) => ({
    order_id: order.id,
    store_id: input.store_id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image_url: item.product_image_url ?? null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percentage: item.discount_percentage ?? 0,
    total_price: item.unit_price * item.quantity,
    custom_text: item.custom_text ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw itemsError;
  }

  return order as Order;
}

export async function getOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderWithItems[];
}

export async function getOrdersForStore(storeId: string): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderWithItems[];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Order;
}

/**
 * Subscribe to realtime changes on the orders table for a given store.
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 */
export function subscribeToStoreOrders(
  storeId: string,
  onchange: () => void,
): () => void {
  const channel = supabase
    .channel(`store-orders-${storeId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `store_id=eq.${storeId}`,
      },
      () => onchange(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}



