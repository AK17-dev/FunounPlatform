import { supabase } from "./supabase";
import type { Product, ProductWithRelations } from "@shared/types";

export interface ProductFilters {
  search?: string;
  categoryId?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  storeId?: string | null;
  sort?: "newest" | "price_asc" | "price_desc" | "discount_desc";
  onlyDiscounted?: boolean;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductWithRelations[]> {
  console.log("[Products] getProducts start", filters);
  let query = supabase
    .from("products")
    .select("*, store:stores(id, name, status), category:categories(id, name, slug)");

  if (filters.storeId) {
    query = query.eq("store_id", filters.storeId);
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.onlyDiscounted) {
    query = query.gt("discount_percentage", 0);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "discount_desc":
      query = query.order("discount_percentage", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  console.log("[Products] getProducts response", {
    hasData: !!data,
    error,
  });

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return (data ?? []) as ProductWithRelations[];
}

export async function getProductById(
  id: string,
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores(id, name, status), category:categories(id, name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product:", error);
    throw error;
  }

  return (data as ProductWithRelations | null) ?? null;
}

export async function getProductsByIds(
  ids: string[],
): Promise<ProductWithRelations[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, store:stores(id, name, status), category:categories(id, name, slug)")
    .in("id", ids);

  if (error) {
    console.error("Error fetching products by ids:", error);
    throw error;
  }

  return (data ?? []) as ProductWithRelations[];
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(product: Product): Promise<void> {
  if (product.image_url) {
    await deleteProductImage(product.image_url);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", product.id);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function uploadProductImage(
  file: File,
  storeId?: string | null,
): Promise<string> {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      "File size too large. Please upload an image smaller than 5MB.",
    );
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = storeId ? `${storeId}/${fileName}` : `product-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const marker = "/storage/v1/object/public/product-images/";
    const fullPath = url.pathname.split(marker)[1];

    if (!fullPath) {
      console.warn("Invalid image URL format:", imageUrl);
      return;
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove([fullPath]);

    if (error) {
      console.error("Error deleting image:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in deleteProductImage:", error);
  }
}


