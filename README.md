# Funoun / فنون — Project Summary

**Funoun** (فنون, Arabic for "Arts") is a **handmade artisan marketplace** — an e-commerce platform where independent artisans and store owners can showcase and sell handcrafted products to customers.

---

## 🎯 What It Does

A multi-vendor marketplace connecting **artisans/crafters** with **customers** who appreciate handmade goods. Think of it as an Etsy-like platform tailored for the Arabic-speaking market.

---

## 👥 User Roles & Access

| Role | Access | Capabilities |
|------|--------|--------------|
| **Customer** | Public pages + Account | Browse, purchase, cart, favorites, reviews, custom orders, order tracking |
| **Store Owner** | `/dashboard` | Manage products, orders, categories, staff, custom order requests |
| **Store Staff** | `/dashboard` | Help manage store operations (limited by owner) |
| **Super Admin** | `/admin` | Platform-wide administration and oversight |

---

## 🛒 Core Features

### For Customers
- **Product Catalog** — Browse handmade products with filtering and categories
- **Product Details** — View product info, images, and customer reviews/ratings
- **Shopping Cart** — Add/remove items, checkout flow
- **Custom Orders** — Request bespoke handmade items from artisans
- **Order Tracking** — Track order status
- **Favorites** — Save liked products
- **Reviews & Ratings** — Leave star ratings and written reviews
- **Auth** — Register, login, password reset/recovery

### For Store Owners & Staff
- **Product Management** — CRUD products with image uploads
- **Category Management** — Organize inventory by categories
- **Order Management** — View and process incoming orders
- **Custom Orders Management** — Handle bespoke order requests
- **Staff Management** — Add/remove store staff members
- **Store Selector** — Switch between multiple stores

### For Super Admins
- **Platform Dashboard** — Oversee all stores and users

---

## 🏗️ Tech Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React SPA)            │
│  React 18 + React Router 6 + TypeScript     │
│  TailwindCSS 3 + Radix UI + Framer Motion   │
│  TanStack React Query                       │
├─────────────────────────────────────────────┤
│              Backend (Supabase)              │
│  Auth · Database (Postgres) · Storage       │
│  Row Level Security (RLS)                   │
└─────────────────────────────────────────────┘
```

- **Frontend**: Pure client-side SPA — talks directly to Supabase (no backend server needed)
- **Database**: Supabase (PostgreSQL) with RLS policies for security
- **Storage**: Supabase Storage for product images
- **Auth**: Supabase Auth with role-based access control
- **Hosting**: Netlify (static site deployment)

---

## ✨ UI/UX Highlights

- **Animated 3D Hero Bird** (React Three Fiber) on the landing page
- **Typewriter text effect** on hero section
- **Scroll-triggered reveal animations** throughout
- **Skeleton loading screens** for smooth UX
- **Page transition animations** (Framer Motion AnimatePresence)
- **Floating particles** background effect
- **Right sidebar navigation** with role-based links
- **Arabic/English** bilingual branding (فنون / Funoun)

---

## 📁 Key File Structure

| Directory | Purpose |
|-----------|---------|
| `client/pages/` | 15 page components (Home, Cart, Dashboard, Admin, etc.) |
| `client/components/` | 23 reusable components (ProductCard, ReviewForm, Hero, etc.) |
| `client/lib/` | Supabase service modules (auth, products, orders, reviews, etc.) |
| `client/contexts/` | React contexts (Auth, Cart, Admin) |
| `client/components/ui/` | Radix-based UI component library |
| `client/components/skeletons/` | Loading skeleton components |

---

## 🔑 Service Modules (`client/lib/`)

| Module | Handles |
|--------|---------|
| `auth.ts` | Authentication flows |
| `products.ts` | Product CRUD operations |
| `orders.ts` | Order processing |
| `customOrders.ts` | Custom/bespoke orders |
| `reviews.ts` | Product reviews & ratings |
| `favorites.ts` | User favorites/wishlists |
| `categories.ts` | Product categories |
| `stores.ts` | Store management & staff |
| `profiles.ts` | User profiles |
| `supabase.ts` | Supabase client initialization |
