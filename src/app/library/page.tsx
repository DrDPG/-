"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase, getUserStories } from "@/lib/supabase";

const GENRE_NAMES: Record<string, string> = {
  rebirth: "重生逆袭",
  isekai: "穿越异世",
  system: "系统文",
  zhailv: "赘婿翻身",
  urban: "都市修仙",
  apocalypse: "末世求生"
};

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStories();
    } else if (!authLoading) {
      // 未登录，重定向到登录页
      router.push("/auth/login?redirect=/library");
    }
  }, [user, authLoading]);

  const loadStories = async () => {
    if (!user) return;

    try {
      const data = await getUserStories(user.id);
      setStories(data || []);
    } catch (error) {
      console.error("加载故事失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (storyId: string) => {
    router.push(`/read?storyId=${storyId}`);
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm("确定要删除这个故事吗？")) return;

    try {
      const sb = supabase;
      if (!sb) {
        alert("删除功能需要配置数据库");
        return;
      }
      await sb.from("stories").delete().eq("id", storyId);
      setStories(stories.filter(s => s.id !== storyId));
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的作品</h1>
            <p className="text-gray-500">共 {stories.length} 部作品</p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + 创作新作品
          </Button>
        </div>

        {stories.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                还没有作品
              </h3>
              <p className="text-gray-500 mb-6">
                开始创作你的第一部爽文吧！
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                开始创作
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleContinue(story.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {GENRE_NAMES[story.genre] || story.genre}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {story.chapters?.length || 0} 章
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    主角：{story.protagonist_name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinue(story.id);
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      继续阅读
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(story.id);
                    }}
                    className="w-full mt-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    删除作品
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>提示：游客模式的作品不会保存到云端，建议注册登录</p>
        </div>
      </div>
    </div>
  );
}
