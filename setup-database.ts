import { supabase } from "./client/lib/supabase";

async function setupDatabase() {
  try {
    console.log("🚀 Setting up Supabase database...");

    // Create products table
    console.log("📋 Creating products table...");
    const { error: tableError } = await supabase.rpc("sql", {
      query: `
        CREATE TABLE IF NOT EXISTS public.products (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          price NUMERIC NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    });

    if (tableError) {
      console.log("⚠️ Table creation via RPC failed, trying direct SQL...");
    }

    // Insert sample products
    console.log("📦 Adding sample products...");
    const sampleProducts = [
      {
        name: "Handmade Ceramic Mug",
        price: 28.99,
        description:
          "Beautiful handcrafted ceramic mug with unique glaze patterns. Perfect for your morning coffee or tea. Each piece is unique and made with love by local artisans.",
        image_url:
          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=800&fit=crop&auto=format",
      },
      {
        name: "Artisan Leather Handbag",
        price: 149.99,
        description:
          "Genuine leather handbag crafted using traditional techniques. Features hand-stitched details and antique brass hardware. Spacious interior perfect for daily use.",
        image_url:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
      },
      {
        name: "Hand-thrown Clay Bowl",
        price: 45.0,
        description:
          "Rustic clay bowl perfect for serving or as a decorative piece. Each bowl is unique with natural variations in the clay and glaze. Food-safe and dishwasher friendly.",
        image_url:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format",
      },
      {
        name: "Woven Basket Set",
        price: 85.5,
        description:
          "Set of three woven baskets in graduated sizes. Made from sustainable materials using traditional weaving techniques. Perfect for storage or home decoration.",
        image_url:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&auto=format",
      },
      {
        name: "Ceramic Tea Set",
        price: 120.0,
        description:
          "Complete tea set including teapot and four cups. Hand-painted with delicate floral patterns. Perfect for afternoon tea or special occasions.",
        image_url:
          "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=800&h=800&fit=crop&auto=format",
      },
      {
        name: "Handwoven Scarf",
        price: 65.0,
        description:
          "Soft merino wool scarf in earth tones. Hand-woven on traditional looms with intricate patterns. Lightweight yet warm, perfect for any season.",
        image_url:
          "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=800&fit=crop&auto=format",
      },
    ];

    const { data, error: insertError } = await supabase
      .from("products")
      .insert(sampleProducts)
      .select();

    if (insertError) {
      console.error("❌ Error inserting sample products:", insertError.message);
      console.log("ℹ️  This might mean the products table doesn't exist yet.");
      console.log(
        "ℹ️  Please create the table manually in your Supabase dashboard using the SQL from setup-supabase.sql",
      );
      return;
    }

    console.log("✅ Database setup complete!");
    console.log(`📦 Added ${data?.length || 0} sample products`);

    // Test the setup
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("name, price")
      .limit(3);

    if (!fetchError && products) {
      console.log("🎉 Sample products:");
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price}`);
      });
    }
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setupDatabase();
