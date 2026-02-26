export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export type CustomOrderStatus = "pending" | "accepted" | "rejected" | "ready";

export interface CustomOrder {
  id: string;
  tracking_code: string;
  name: string;
  phone: string;
  product_type: string;
  quantity: number;
  colors: string | null;
  custom_text: string | null;
  notes: string | null;
  status: CustomOrderStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      custom_orders: {
        Row: CustomOrder;
        Insert: Omit<CustomOrder, "id" | "created_at">;
        Update: Partial<Omit<CustomOrder, "id" | "created_at">>;
      };
    };
  };
}
