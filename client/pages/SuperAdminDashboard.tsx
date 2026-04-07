import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AccountStatus, StoreStatus, UserRole, Profile } from "@shared/types";
import { getAllStores, updateStoreStatus, type StoreWithOwner } from "@/lib/stores";
import { getAllProfiles, setProfileRole, setProfileStatus } from "@/lib/profiles";
import { ProductManagement } from "@/components/ProductManagement";
import { StoreSelector } from "@/components/StoreSelector";
import { Shield, Store, Users, Package } from "lucide-react";

const STORE_STATUSES: StoreStatus[] = ["pending", "active", "suspended"];
const USER_ROLES: UserRole[] = ["client", "staff", "owner", "super_admin"];
const USER_STATUSES: AccountStatus[] = ["active", "pending", "suspended"];

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreWithOwner[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const data = await getAllStores();
      setStores(data);
      if (!activeStoreId && data.length > 0) {
        setActiveStoreId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      toast({
        title: "Error loading stores",
        description: "Unable to load stores.",
        variant: "destructive",
      });
    } finally {
      setLoadingStores(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error loading users",
        description: "Unable to load user profiles.",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadStores();
    loadProfiles();
  }, []);

  const handleStoreStatusChange = async (storeId: string, status: StoreStatus) => {
    try {
      await updateStoreStatus(storeId, status);
      await loadStores();
      toast({
        title: "Store updated",
        description: "Store status has been updated.",
      });
    } catch (error) {
      console.error("Error updating store status:", error);
      toast({
        title: "Update failed",
        description: "Unable to update store status.",
        variant: "destructive",
      });
    }
  };

  const handleUserRoleChange = async (userId: string, role: UserRole) => {
    try {
      await setProfileRole(userId, role);
      await loadProfiles();
      toast({
        title: "User updated",
        description: "User role has been updated.",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Update failed",
        description: "Unable to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleUserStatusChange = async (userId: string, status: AccountStatus) => {
    try {
      await setProfileStatus(userId, status);
      await loadProfiles();
      toast({
        title: "User updated",
        description: "User status has been updated.",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Update failed",
        description: "Unable to update user status.",
        variant: "destructive",
      });
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
                Super Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage stores, users, and marketplace catalog.
              </p>
            </div>
            <StoreSelector
              stores={stores}
              activeStoreId={activeStoreId}
              onChange={setActiveStoreId}
            />
          </div>

          <Tabs defaultValue="stores" className="space-y-6">
            <TabsList>
              <TabsTrigger value="stores">
                <Store className="h-4 w-4 mr-2" />
                Stores
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="overview">
                <Shield className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stores">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingStores ? (
                    <p className="text-muted-foreground">Loading stores...</p>
                  ) : stores.length === 0 ? (
                    <p className="text-muted-foreground">No stores found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Store</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map((store) => (
                          <TableRow key={store.id}>
                            <TableCell>
                              <p className="font-medium">{store.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {store.slug ?? store.id}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p>{store.owner?.full_name || store.owner?.email || "-"}</p>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={store.status}
                                onValueChange={(value) =>
                                  handleStoreStatusChange(store.id, value as StoreStatus)
                                }
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STORE_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      <span className="capitalize">{status}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProfiles ? (
                    <p className="text-muted-foreground">Loading users...</p>
                  ) : profiles.length === 0 ? (
                    <p className="text-muted-foreground">No users found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <p className="font-medium">
                                {user.full_name || user.email || user.id}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value) =>
                                  handleUserRoleChange(user.id, value as UserRole)
                                }
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {USER_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      <span className="capitalize">{role.replace("_", " ")}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.status}
                                onValueChange={(value) =>
                                  handleUserStatusChange(user.id, value as AccountStatus)
                                }
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {USER_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      <span className="capitalize">{status}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement storeId={activeStoreId} />
            </TabsContent>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Platform Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Total stores: {stores.length}</p>
                  <p>Total users: {profiles.length}</p>
                  <p>Selected store: {stores.find((store) => store.id === activeStoreId)?.name ?? "-"}</p>
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


