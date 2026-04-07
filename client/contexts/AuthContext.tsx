import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile, Store, UserRole } from "@shared/types";
import { getProfile } from "@/lib/profiles";
import { getStoreByOwner, getStoresForMember } from "@/lib/stores";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  stores: Store[];
  activeStore: Store | null;
  activeStoreId: string | null;
  setActiveStoreId: (storeId: string | null) => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshStores: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ACTIVE_STORE_KEY = "funoun_active_store_id";

function readStoredStoreId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACTIVE_STORE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(
    readStoredStoreId(),
  );
  const [loading, setLoading] = useState(true);

  const role = profile?.role ?? null;

  const setActiveStoreId = (storeId: string | null) => {
    setActiveStoreIdState(storeId);
    if (typeof window !== "undefined") {
      if (storeId) {
        window.localStorage.setItem(ACTIVE_STORE_KEY, storeId);
      } else {
        window.localStorage.removeItem(ACTIVE_STORE_KEY);
      }
    }
  };

  const loadStoresForProfile = async (
    profileData: Profile | null,
    userId: string | null,
  ) => {
    if (!profileData || !userId) {
      setStores([]);
      setActiveStoreId(null);
      return;
    }

    if (profileData.role === "owner") {
      const store = await getStoreByOwner(userId);
      const storeList = store ? [store] : [];
      setStores(storeList);
      if (storeList.length > 0) {
        const storedId = readStoredStoreId();
        const nextId =
          storedId && storeList.some((entry) => entry.id === storedId)
            ? storedId
            : storeList[0].id;
        setActiveStoreId(nextId);
      } else {
        setActiveStoreId(null);
      }
      return;
    }

    if (profileData.role === "staff") {
      const memberStores = await getStoresForMember(userId);
      setStores(memberStores);
      if (memberStores.length > 0) {
        const storedId = readStoredStoreId();
        const nextId =
          storedId && memberStores.some((entry) => entry.id === storedId)
            ? storedId
            : memberStores[0].id;
        setActiveStoreId(nextId);
      } else {
        setActiveStoreId(null);
      }
      return;
    }

    setStores([]);
    setActiveStoreId(null);
  };

  const loadUserContext = async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      setStores([]);
      setActiveStoreId(null);
      return;
    }

    try {
      console.log("[AuthContext] loadUserContext start", {
        userId: nextUser.id,
      });

      const profileData = await getProfile(nextUser.id);
      setProfile(profileData);
      console.log("[AuthContext] loadUserContext got profile", {
        userId: nextUser.id,
        role: profileData?.role,
      });

      await loadStoresForProfile(profileData, nextUser.id);

      console.log("[AuthContext] loadUserContext finished stores", {
        userId: nextUser.id,
      });
    } catch (error) {
      console.error("Failed to load user context:", error);
      setStores([]);
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  const refreshStores = async () => {
    if (!user) {
      setStores([]);
      setActiveStoreId(null);
      return;
    }

    await loadStoresForProfile(profile, user.id);
  };

  const signOut = async () => {
    // Clear local state immediately so the UI updates even if Supabase hangs
    setSession(null);
    setUser(null);
    setProfile(null);
    setStores([]);
    setActiveStoreId(null);
    setLoading(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_STORE_KEY);
    }
    supabase.auth.signOut().catch(() => {});
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      console.log("[AuthContext] init start");
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadUserContext(data.session?.user ?? null);

      console.log("[AuthContext] init completed", {
        hasSession: !!data.session,
      });
      setLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        console.log("[AuthContext] auth state change start", {
          hasSession: !!nextSession,
        });
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(true);

        // Cap wait at 12s so "Checking authentication..." never hangs forever
        const loadPromise = loadUserContext(nextSession?.user ?? null);
        const timeoutPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, 12000),
        );
        await Promise.race([loadPromise, timeoutPromise]);
        if (isMounted) setLoading(false);

        console.log("[AuthContext] auth state change finished", {
          hasSession: !!nextSession,
        });
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const activeStore = useMemo(() => {
    if (!activeStoreId) {
      return null;
    }

    return stores.find((store) => store.id === activeStoreId) ?? null;
  }, [activeStoreId, stores]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      role,
      stores,
      activeStore,
      activeStoreId,
      setActiveStoreId,
      loading,
      refreshProfile,
      refreshStores,
      signOut,
    }),
    [
      user,
      session,
      profile,
      role,
      stores,
      activeStore,
      activeStoreId,
      loading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


