import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createStore, CreateStoreError } from "@/lib/stores";
import { ProductManagement } from "@/components/ProductManagement";
import { OrdersManagement } from "@/components/OrdersManagement";
import { StoreStaffManagement } from "@/components/StoreStaffManagement";
import { StoreSelector } from "@/components/StoreSelector";
import { CategoryManagement } from "@/components/CategoryManagement";
import { Building2, ClipboardList, Package, Users } from "lucide-react";

export default function OwnerDashboard() {
  const {
    profile,
    stores,
    activeStore,
    activeStoreId,
    setActiveStoreId,
    refreshStores,
  } = useAuth();
  const { toast } = useToast();
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      return;
    }

    if (!storeName.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter a store name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingStore(true);
      const created = await createStore({
        name: storeName.trim(),
        slug: storeSlug.trim() || undefined,
      });
      setStoreName("");
      setStoreSlug("");
      setActiveStoreId(created.id);
      await refreshStores();
      toast({
        title: "Store created",
        description: "Your store has been created and is pending approval.",
      });
    } catch (error) {
      console.error("Error creating store:", error);

      let title = "Create failed";
      let description = "An unexpected error occurred. Please try again.";

      if (error instanceof CreateStoreError) {
        switch (error.code) {
          case "NOT_AUTHENTICATED":
            title = "Not signed in";
            description = error.message;
            break;
          case "PERMISSION_DENIED":
            title = "Permission denied";
            description = error.message;
            break;
          case "SLUG_TAKEN":
            title = "Duplicate store";
            description = error.message;
            break;
          case "MISSING_PROFILE":
            title = "Profile not found";
            description = error.message;
            break;
          default:
            description = error.message;
        }
      }

      toast({ title, description, variant: "destructive" });
    } finally {
      setCreatingStore(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Store Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your products, orders, and staff.
              </p>
            </div>
            <StoreSelector
              stores={stores}
              activeStoreId={activeStoreId}
              onChange={setActiveStoreId}
            />
          </div>

          {profile?.role === "owner" && stores.length === 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif">Create Your Store</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStore} className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(event) => setStoreName(event.target.value)}
                      placeholder="e.g., Funoun Studio"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeSlug">Store Slug (optional)</Label>
                    <Input
                      id="storeSlug"
                      value={storeSlug}
                      onChange={(event) => setStoreSlug(event.target.value)}
                      placeholder="funoun-studio"
                    />
                  </div>
                  <Button type="submit" disabled={creatingStore}>
                    {creatingStore ? "Creating..." : "Create Store"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeStore && activeStore.status !== "active" && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="py-4 text-sm text-amber-900">
                Your store status is <strong>{activeStore.status}</strong>. Orders
                and products may be hidden until approval.
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ClipboardList className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="staff">
                <Users className="h-4 w-4 mr-2" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="store">
                <Building2 className="h-4 w-4 mr-2" />
                Store
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductManagement storeId={activeStoreId} />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManagement storeId={activeStoreId} />
            </TabsContent>

            <TabsContent value="staff">
              <StoreStaffManagement storeId={activeStoreId} />
            </TabsContent>

            <TabsContent value="store">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Store Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Name: {activeStore?.name ?? "-"}</p>
                  <p>Status: {activeStore?.status ?? "-"}</p>
                  <p>Slug: {activeStore?.slug ?? "-"}</p>
                </CardContent>
              </Card>
              <div className="mt-6">
                <CategoryManagement storeId={activeStoreId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}


