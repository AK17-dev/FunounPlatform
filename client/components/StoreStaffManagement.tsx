import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { StoreMemberRole } from "@shared/types";
import { addStoreMember, AddMemberError, getStoreMembers, removeStoreMember, type StoreMemberWithProfile } from "@/lib/stores";
import { Loader2, Trash2, UserPlus } from "lucide-react";

export function StoreStaffManagement({ storeId }: { storeId?: string | null }) {
  const [members, setMembers] = useState<StoreMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIdInput, setUserIdInput] = useState("");
  const [role, setRole] = useState<StoreMemberRole>("staff");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadMembers = async () => {
    if (!storeId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getStoreMembers(storeId);
      setMembers(data);
    } catch (error) {
      console.error("Error loading store members:", error);
      toast({
        title: "Error loading staff",
        description: "Failed to load staff members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [storeId]);

  const handleAddMember = async () => {
    if (!storeId) {
      return;
    }

    if (!userIdInput.trim()) {
      toast({
        title: "Missing user ID",
        description: "Enter the staff member's user ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await addStoreMember({
        store_id: storeId,
        user_id: userIdInput.trim(),
        role,
      });
      setUserIdInput("");
      toast({
        title: "Staff added",
        description: "The staff member has been added to your store.",
      });
      await loadMembers();
    } catch (error) {
      console.error("Error adding staff member:", error);

      let title = "Failed to add staff";
      let description = "An unexpected error occurred. Please try again.";

      if (error instanceof AddMemberError) {
        switch (error.code) {
          case "INVALID_UUID":
            title = "Invalid User ID format";
            description = error.message;
            break;
          case "USER_NOT_FOUND":
            title = "User not found";
            description = error.message;
            break;
          case "ALREADY_MEMBER":
            title = "Already a member";
            description = error.message;
            break;
          case "RLS_DENIED":
            title = "Permission denied";
            description = error.message;
            break;
          default:
            description = error.message;
        }
      }

      toast({ title, description, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeStoreMember(memberId);
      toast({
        title: "Staff removed",
      });
      await loadMembers();
    } catch (error) {
      console.error("Error removing staff member:", error);
      toast({
        title: "Failed to remove staff",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Store Staff</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!storeId ? (
          <p className="text-muted-foreground">
            Select a store to manage staff members.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="staff-user-id">Staff User ID (UUID)</Label>
                <Input
                  id="staff-user-id"
                  value={userIdInput}
                  onChange={(event) => setUserIdInput(event.target.value)}
                  placeholder="e.g. 3b241101-e2bb-4d5a-a3db-24a0b2f8c3e1"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the Supabase Auth UUID of the staff member. They can find it on their{" "}
                  <strong>Account → Profile → User ID</strong> field.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as StoreMemberRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddMember} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </>
              )}
            </Button>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading staff...
                </div>
              ) : members.length === 0 ? (
                <p className="text-muted-foreground">No staff members yet.</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {member.profile?.full_name || member.profile?.email || member.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/40"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


