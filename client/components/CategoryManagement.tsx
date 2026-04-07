import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/types";
import { createCategory, deleteCategory, getCategories } from "@/lib/categories";
import { Globe, Trash2 } from "lucide-react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function CategoryManagement({ storeId }: { storeId?: string | null }) {
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [globalCategories, setGlobalCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      setLoading(true);

      // Always load global (platform-wide) categories
      const globalData = await getCategories();
      setGlobalCategories(globalData.filter((cat) => !cat.store_id));

      // Load store-specific categories if a store is selected
      if (storeId) {
        const storeData = await getCategories(storeId);
        setStoreCategories(storeData.filter((cat) => cat.store_id === storeId));
      } else {
        setStoreCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error loading categories",
        description: "Unable to load categories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [storeId]);

  const handleCreate = async () => {
    if (!storeId) return;
    if (!name.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const slug = slugify(name);
      await createCategory({ name: name.trim(), slug, store_id: storeId });
      setName("");
      await loadCategories();
      toast({
        title: "Category created",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Create failed",
        description: "Unable to create category.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      await loadCategories();
      toast({
        title: "Category deleted",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Delete failed",
        description: "Unable to delete category.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform-wide global categories (read-only) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Platform Categories
            </h3>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : globalCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No global categories found.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {globalCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            These categories are available to all stores and can be assigned to your products.
          </p>
        </div>

        <hr className="border-border/50" />

        {/* Store-specific categories */}
        {!storeId ? (
          <p className="text-muted-foreground">Select a store to manage custom categories.</p>
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Your Store Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="categoryName">Category name</Label>
                  <Input
                    id="categoryName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g., Ceramics"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Add Category"}
                  </Button>
                </div>
              </div>

              {loading ? (
                <p className="text-muted-foreground text-sm">Loading categories...</p>
              ) : storeCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">No custom categories yet. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {storeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.slug}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
