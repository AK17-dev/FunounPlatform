import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      "[ProtectedRoute] effect",
      JSON.stringify(
        {
          loading,
          hasUser: !!user,
          hasProfile: !!profile,
          roles,
        },
        null,
        2,
      ),
    );
    if (loading) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7842/ingest/1a3ed2c8-d9a2-4159-b74e-6fc8b4fc5b0c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "33c6c1",
          },
          body: JSON.stringify({
            sessionId: "33c6c1",
            runId: "pre-fix",
            hypothesisId: "H4",
            location: "ProtectedRoute.tsx:useEffect:loadingEarlyReturn",
            message: "ProtectedRoute loading early-return",
            data: {},
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (roles && !profile) {
      navigate("/account", { replace: true });
      return;
    }

    if (roles && profile && !roles.includes(profile.role)) {
      navigate("/account", { replace: true });
    }
  }, [loading, user, profile, roles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (roles && !profile) {
    return null;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}


