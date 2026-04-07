export type UserRole = "super_admin" | "owner" | "staff" | "client";
export type AccountStatus = "active" | "pending" | "suspended";
export type StoreStatus = "pending" | "active" | "suspended";
export type StoreMemberRole = "admin" | "staff";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  status: AccountStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logo_url?: string | null;
  status: StoreStatus;
  created_at?: string;
  updated_at?: string;
}

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  role: StoreMemberRole;
  created_at?: string;
}

export interface Category {
  id: string;
  store_id?: string | null;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  store_id?: string | null;
  category_id?: string | null;
  discount_percentage?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  store_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string | null;
  quantity: number;
  unit_price: number;
  discount_percentage?: number | null;
  total_price: number;
  custom_text?: string | null;
  created_at?: string;
}

export interface ProductWithRelations extends Product {
  store?: Store | null;
  category?: Category | null;
  is_favorite?: boolean;
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

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithProfile extends Review {
  display_name: string;
}

export interface ProductRating {
  product_id: string;
  average_rating: number;
  total_reviews: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "created_at" | "updated_at">>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, "created_at" | "updated_at">;
        Update: Partial<Omit<Store, "created_at" | "updated_at">>;
      };
      store_members: {
        Row: StoreMember;
        Insert: Omit<StoreMember, "created_at">;
        Update: Partial<Omit<StoreMember, "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "created_at">;
        Update: Partial<Omit<Category, "created_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: Partial<Omit<Favorite, "id" | "created_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at">;
        Update: Partial<Omit<OrderItem, "id" | "created_at">>;
      };
      custom_orders: {
        Row: CustomOrder;
        Insert: Omit<CustomOrder, "id" | "created_at">;
        Update: Partial<Omit<CustomOrder, "id" | "created_at">>;
      };
    };
  };
}


