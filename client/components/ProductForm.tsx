import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import type { Product } from "@shared/types";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/lib/products";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    description: product?.description || "",
    image_url: product?.image_url || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // If updating an existing product with an image, delete the old one
      if (product?.image_url && formData.image_url) {
        await deleteProductImage(formData.image_url);
      }

      const imageUrl = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));

      toast({
        title: "Image uploaded successfully",
        description: "Your product image has been uploaded.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.image_url) {
      try {
        await deleteProductImage(formData.image_url);
        setFormData((prev) => ({ ...prev, image_url: "" }));

        toast({
          title: "Image removed",
          description: "Product image has been removed.",
        });
      } catch (error) {
        console.error("Error removing image:", error);
        toast({
          title: "Error removing image",
          description: "Failed to remove the image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.description.trim() ||
      !formData.image_url
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload an image.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        price,
        description: formData.description.trim(),
        image_url: formData.image_url,
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Product created",
          description: "Your new product has been added to the catalog.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Save failed",
        description: "Failed to save the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">
          {product ? "Edit Product" : "Add New Product"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Product Image *</Label>
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Product preview"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Uploading image...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your handmade product..."
              rows={4}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={saving || uploading || !formData.image_url}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
