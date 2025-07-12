import { supabase } from "./client/lib/supabase";

async function setupStorage() {
  try {
    console.log("🗂️  Setting up Supabase storage...");

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError.message);
      console.log(
        "ℹ️  Please create the 'product-images' bucket manually in your Supabase dashboard",
      );
      console.log(
        "ℹ️  Go to Storage > Create bucket > Name: product-images > Make it public",
      );
      return;
    }

    const bucketExists = buckets?.some(
      (bucket) => bucket.name === "product-images",
    );

    if (bucketExists) {
      console.log("✅ Storage bucket 'product-images' already exists!");
    } else {
      console.log("📁 Creating 'product-images' bucket...");

      const { error: createError } = await supabase.storage.createBucket(
        "product-images",
        {
          public: true,
          allowedMimeTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ],
          fileSizeLimit: 5242880, // 5MB
        },
      );

      if (createError) {
        console.error("❌ Error creating bucket:", createError.message);
        console.log(
          "ℹ️  Please create the bucket manually in your Supabase dashboard",
        );
        console.log(
          "ℹ️  Go to Storage > Create bucket > Name: product-images > Make it public",
        );
        return;
      }

      console.log("✅ Storage bucket 'product-images' created successfully!");
    }

    // Test upload functionality
    console.log("🧪 Testing storage functionality...");

    // Create a simple test file
    const testContent = "This is a test file for FunounByFatima storage";
    const testFile = new File([testContent], "test.txt", {
      type: "text/plain",
    });

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload("test/test.txt", testFile);

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError.message);
      return;
    }

    console.log("✅ Upload test successful!");

    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from("product-images")
      .remove(["test/test.txt"]);

    if (deleteError) {
      console.log("⚠️  Test file cleanup failed, but storage is working");
    } else {
      console.log("✅ Test cleanup successful!");
    }

    console.log("🎉 Storage setup complete! You can now:");
    console.log("   • Upload product images through the admin panel");
    console.log("   • Images will be stored securely in Supabase Storage");
    console.log("   • Public URLs will be generated automatically");
    console.log("");
    console.log("🔐 Admin login details:");
    console.log("   • URL: /admin");
    console.log("   • Password: funoun2024");
  } catch (error) {
    console.error("❌ Storage setup failed:", error);
    console.log(
      "ℹ️  Manual setup required - please check your Supabase dashboard",
    );
  }
}

setupStorage();
