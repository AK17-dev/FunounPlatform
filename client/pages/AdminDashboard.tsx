import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Upload,
  Users,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  return (
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
                Manage your handmade product catalog
              </p>
            </div>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
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
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Images</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitors</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Management */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-medium mb-2">
                  No products yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your catalog by adding your first handmade
                  product.
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add products
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit details
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload images
                  </Badge>
                  <Badge variant="outline">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete products
                  </Badge>
                </div>
                <div className="mt-8">
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
