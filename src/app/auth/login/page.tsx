"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const sb = supabase;
      if (!sb) {
        setError("请先配置 Supabase");
        return;
      }

      if (isSignUp) {
        // 注册
        const { data, error: signUpError } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // 注册成功，自动登录
          router.push(redirectTo);
        }
      } else {
        // 登录
        const { error: signInError } = await sb.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    // 游客模式，暂时使用本地存储
    localStorage.setItem("guest_mode", "true");
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            爽文生成器 <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-gray-500">
            {isSignUp ? "创建账号开始创作" : "登录继续你的创作"}
          </p>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {isSignUp ? "注册账号" : "登录"}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {isSignUp ? "填写信息创建新账号" : "输入你的账号信息"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    昵称
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="请输入昵称"
                    required
                    className="border-gray-300"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  邮箱
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="border-gray-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  密码
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="border-gray-300"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "处理中..." : isSignUp ? "注册" : "登录"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGuest}
                className="w-full mt-4 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                游客模式体验（每日3章）
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {isSignUp ? "已有账号？" : "还没有账号？"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
              >
                {isSignUp ? "立即登录" : "立即注册"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-6">
          注册即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}
