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
    let mounted = true;

    // 超时保护：3秒后强制加载完成
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
        setIsGuest(true);
      }
    }, 3000);

    // 如果没有配置 Supabase，直接设置为游客模式
    if (!supabase) {
      if (typeof window !== "undefined") {
        const guestMode = localStorage.getItem("guest_mode");
        setIsGuest(guestMode === "true" || !guestMode);
      } else {
        setIsGuest(true);
      }
      setLoading(false);
      clearTimeout(timeoutId);
      return;
    }

    // 检查会话
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      })
      .catch(() => {
        // 出错时也设置为游客模式
        if (mounted) {
          setIsGuest(true);
          setLoading(false);
          clearTimeout(timeoutId);
        }
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
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

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
