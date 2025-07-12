import { supabase } from "./client/lib/supabase";

async function testUpload() {
  try {
    console.log("🧪 Testing direct image upload to product-images bucket...");

    // Create a simple test file
    const testContent = "FunounByFatima test image data";
    const testFile = new File([testContent], "test-image.txt", {
      type: "text/plain",
    });

    // Try to upload
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(`test/test-${Date.now()}.txt`, testFile);

    if (error) {
      console.error("❌ Upload failed:", error.message);
      console.log("");
      console.log("🔧 Possible solutions:");
      console.log("1. Make sure the bucket is public");
      console.log("2. Check RLS policies on storage.objects");
      console.log("3. Verify bucket permissions in Supabase dashboard");
      return;
    }

    console.log("✅ Upload successful!");
    console.log(`   • File path: ${data.path}`);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    console.log(`   • Public URL: ${urlData.publicUrl}`);

    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from("product-images")
      .remove([data.path]);

    if (deleteError) {
      console.log("⚠️  Cleanup failed, but upload works!");
    } else {
      console.log("✅ Cleanup successful!");
    }

    console.log("");
    console.log("🎉 Image upload is working!");
    console.log("   • Your admin panel is ready to use");
    console.log("   • Go to /admin (password: funoun2024)");
    console.log("   • You can now add products with images");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testUpload();
