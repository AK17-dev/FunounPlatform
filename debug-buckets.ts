import { supabase } from "./client/lib/supabase";

async function debugBuckets() {
  try {
    console.log("🔍 Checking Supabase storage buckets...");

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Error:", error.message);
      console.log("ℹ️  This might be a permissions issue.");
      console.log(
        "ℹ️  Please make sure your bucket is public and RLS is configured correctly.",
      );
      return;
    }

    console.log("📋 Found buckets:");
    buckets?.forEach((bucket, index) => {
      console.log(
        `${index + 1}. ${bucket.name} (${bucket.public ? "public" : "private"})`,
      );
    });

    if (!buckets || buckets.length === 0) {
      console.log("   No buckets found");
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugBuckets();
