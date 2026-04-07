import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getOrdersForUser } from "@/lib/orders";
import { getFavorites } from "@/lib/favorites";
import { getProductsByIds } from "@/lib/products";
import { updateProfile } from "@/lib/profiles";
import type { OrderWithItems } from "@/lib/orders";
import type { ProductWithRelations } from "@shared/types";
import { Loader2, Package, ShoppingBag, UserCircle } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function Account() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [favorites, setFavorites] = useState<ProductWithRelations[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [name, setName] = useState(profile?.full_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        setLoadingOrders(true);
        const data = await getOrdersForUser(user.id);
        setOrders(data);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      try {
        setLoadingFavorites(true);
        const favs = await getFavorites();
        const productIds = favs.map((fav) => fav.product_id);
        const products = await getProductsByIds(productIds);
        setFavorites(products);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    try {
      setSavingProfile(true);
      await updateProfile(user.id, { full_name: name.trim() });
      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                My Account
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your profile, favorites, and orders.
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Package className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email ?? ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={profile?.id ?? ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>Role: {profile?.role ?? "-"}</span>
                    <span>Status: {profile?.status ?? "-"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleProfileSave} disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/update-password">Change Password</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-border/60 rounded-xl p-4 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-medium">Order {order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              Status: {order.status}
                            </p>
                          </div>
                            <p className="text-sm font-semibold">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <img
                                  src={item.product_image_url ?? ""}
                                  alt={item.product_name}
                                  className="h-10 w-10 rounded-md object-cover bg-muted"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty {item.quantity} • {formatPrice(item.unit_price)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold">
                                  {formatPrice(item.total_price)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Favorite Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingFavorites ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading favorites...
                    </div>
                  ) : favorites.length === 0 ? (
                    <p className="text-muted-foreground">
                      You have no favorites yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-40 w-full object-cover"
                          />
                          <div className="p-3 space-y-1">
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}


