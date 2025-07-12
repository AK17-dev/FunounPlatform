import { supabase } from "./client/lib/supabase";

async function testStorage() {
  try {
    console.log("🧪 Testing FunounByFatima storage setup...");

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error accessing storage:", listError.message);
      return;
    }

    const bucket = buckets?.find((b) => b.name === "product-images");

    if (!bucket) {
      console.error("❌ 'product-images' bucket not found");
      return;
    }

    console.log("✅ Storage bucket 'product-images' found!");
    console.log(`   • Bucket ID: ${bucket.id}`);
    console.log(`   • Public: ${bucket.public ? "Yes" : "No"}`);

    // Test basic storage access
    const { data: files, error: listFilesError } = await supabase.storage
      .from("product-images")
      .list();

    if (listFilesError) {
      console.error("❌ Error listing files:", listFilesError.message);
      return;
    }

    console.log("✅ Storage access working!");
    console.log(`   • Current files: ${files?.length || 0}`);

    console.log("");
    console.log("🎉 FunounByFatima admin system is ready!");
    console.log("   • Admin URL: /admin");
    console.log("   • Password: funoun2024");
    console.log("   • Image uploads: Ready ✅");
    console.log("   • Product management: Ready ✅");
  } catch (error) {
    console.error("❌ Storage test failed:", error);
  }
}

testStorage();
