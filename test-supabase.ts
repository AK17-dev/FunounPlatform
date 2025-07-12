import { supabase } from "./client/lib/supabase";

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("products")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return;
    }

    console.log("✅ Supabase connection successful!");
    console.log(`📦 Found ${data} products in database`);

    // Test fetching products
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .limit(3);

    if (fetchError) {
      console.error("❌ Error fetching products:", fetchError.message);
      return;
    }

    console.log("📋 Sample products:");
    products?.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testConnection();
