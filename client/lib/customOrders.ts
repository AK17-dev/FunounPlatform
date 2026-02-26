import { supabase } from "./supabase";
import type { CustomOrder, CustomOrderStatus } from "@shared/types";

export const CUSTOM_ORDER_PRODUCT_TYPES = ["Cup", "Pouch", "Pottery", "Other"] as const;
export type CustomOrderProductType = (typeof CUSTOM_ORDER_PRODUCT_TYPES)[number];

export interface CreateCustomOrderInput {
  name: string;
  phone: string;
  product_type: CustomOrderProductType;
  quantity: number;
  colors: string;
  custom_text: string;
  notes: string;
}

export interface CreateCustomOrderResult {
  tracking_code: string;
}

function generateTrackingCode() {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `FN-${code}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const errorRecord = error as Record<string, unknown>;
    const candidates = [
      errorRecord.message,
      errorRecord.error_description,
      errorRecord.details,
      errorRecord.hint,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
      }
    }
  }

  return fallback;
}

function isDuplicateTrackingCodeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorRecord = error as Record<string, unknown>;
  const code = errorRecord.code;
  const message = typeof errorRecord.message === "string" ? errorRecord.message : "";
  const details = typeof errorRecord.details === "string" ? errorRecord.details : "";

  if (code !== "23505") {
    return false;
  }

  const duplicateText = `${message} ${details}`;
  return duplicateText.includes("tracking_code") ||
    duplicateText.includes("custom_orders_tracking_code_key");
}

export async function createCustomOrder(
  input: CreateCustomOrderInput,
): Promise<CreateCustomOrderResult> {
  const payload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    product_type: input.product_type,
    quantity: input.quantity,
    colors: input.colors.trim() || null,
    custom_text: input.custom_text.trim() || null,
    notes: input.notes.trim() || null,
    status: "pending" as CustomOrderStatus,
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const tracking_code = generateTrackingCode();

    const { error } = await supabase
      .from("custom_orders")
      .insert({ ...payload, tracking_code });

    if (!error) {
      return { tracking_code };
    }

    const isDuplicateCode = isDuplicateTrackingCodeError(error);

    if (!isDuplicateCode) {
      console.error("Error creating custom order:", error);
      const message = getErrorMessage(
        error,
        "Submission failed. Please check Supabase table policies for custom_orders.",
      );
      throw new Error(`Failed to submit your request: ${message}`);
    }
  }

  throw new Error("Could not generate a unique tracking code. Please try again.");
}

export async function getCustomOrders(): Promise<CustomOrder[]> {
  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading custom orders:", error);
    throw error;
  }

  return (data ?? []) as CustomOrder[];
}

export async function getCustomOrderByTrackingCode(
  trackingCode: string,
): Promise<CustomOrder | null> {
  const normalizedCode = trackingCode.trim().toUpperCase();

  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .eq("tracking_code", normalizedCode)
    .maybeSingle();

  if (error) {
    console.error("Error finding custom order by tracking code:", error);
    const message = getErrorMessage(
      error,
      "Failed to check order status. Please try again.",
    );
    throw new Error(message);
  }

  return (data as CustomOrder | null) ?? null;
}

export async function deleteCustomOrder(id: string): Promise<void> {
  const { error } = await supabase.from("custom_orders").delete().eq("id", id);

  if (error) {
    console.error("Error deleting custom order:", error);
    const message = getErrorMessage(
      error,
      "Failed to delete order. Please try again.",
    );
    throw new Error(message);
  }
}

export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrderStatus,
): Promise<CustomOrder> {
  const { data, error } = await supabase
    .from("custom_orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating custom order status:", error);
    throw error;
  }

  return data as CustomOrder;
}
