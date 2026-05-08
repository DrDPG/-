"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 如果没有配置 Supabase，直接设置为游客模式
    if (!supabase) {
      const guestMode = localStorage.getItem("guest_mode");
      setIsGuest(guestMode === "true" || !guestMode); // 默认游客模式
      setLoading(false);
      return;
    }

    // 检查会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 检查游客模式
    if (typeof window !== "undefined") {
      const guestMode = localStorage.getItem("guest_mode");
      setIsGuest(guestMode === "true");
    }

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && !isGuest) {
        // 用户退出登录，清除游客模式
        localStorage.removeItem("guest_mode");
        setIsGuest(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isGuest]);

  const signIn = async (email: string, password: string) => {
    const sb = supabase;
    if (!sb) throw new Error("请先配置 Supabase");
    const { error } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const sb = supabase;
    if (!sb) throw new Error("请先配置 Supabase");
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("guest_mode");
    setIsGuest(false);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest: isGuest || !supabase, // 如果没有 Supabase，默认游客模式
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
