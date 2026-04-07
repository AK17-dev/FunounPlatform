import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setInvalidLink(false);
      }
    });

    // Fallback check in case the session is already available
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Session check failed:", error);
        setInvalidLink(true);
        return;
      }

      if (data.session) {
        setReady(true);
      } else {
        // give the recovery event a moment to fire
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (!mounted) return;

          if (retry.session) {
            setReady(true);
          } else {
            setInvalidLink(true);
          }
        }, 1000);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (!ready) {
      toast({
        title: "Invalid or expired reset link",
        description: "Please request a new password reset email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await updatePassword(password);

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Password update failed:", error);
      toast({
        title: "Update failed",
        description: "Unable to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md handmade-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl">Update Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a new password for your account
            </p>
          </CardHeader>
          <CardContent>
            {invalidLink ? (
              <div className="mb-4 rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
                This reset link is invalid or expired. Please request a new one.
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !ready}>
                  {loading ? "Updating..." : ready ? "Update Password" : "Preparing reset..."}
                </Button>
              </form>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}