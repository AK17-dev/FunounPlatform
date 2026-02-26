import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductManagement } from "@/components/ProductManagement";
import { CustomOrdersManagement } from "@/components/CustomOrdersManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProducts } from "@/lib/products";
import { getCustomOrders } from "@/lib/customOrders";
import { Package, Users, BarChart3, LogOut, Upload, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0);
  const [customOrderCount, setCustomOrderCount] = useState(0);
  const { logout } = useAdmin();

  useEffect(() => {
    const loadStats = async () => {
      const [productsResult, customOrdersResult] = await Promise.allSettled([
        getProducts(),
        getCustomOrders(),
      ]);

      if (productsResult.status === "fulfilled") {
        const products = productsResult.value;
        setProductCount(products.length);
      } else {
        console.error("Error loading product stats:", productsResult.reason);
      }

      if (customOrdersResult.status === "fulfilled") {
        const orders = customOrdersResult.value;
        setCustomOrderCount(orders.length);
      } else {
        console.error("Error loading custom order stats:", customOrdersResult.reason);
      }
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your FunounByFatima product catalog
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="mt-4 sm:mt-0"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold">{productCount}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Custom Orders</p>
                      <p className="text-2xl font-bold">{customOrderCount}</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Images</p>
                      <p className="text-2xl font-bold">{productCount}</p>
                    </div>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-2xl font-bold">Active</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="space-y-6">
              <TabsList>
                <TabsTrigger value="products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="custom-orders">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Custom Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <ProductManagement />
              </TabsContent>

              <TabsContent value="custom-orders">
                <CustomOrdersManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
