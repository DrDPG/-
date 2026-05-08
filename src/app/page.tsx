"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GENRES = [
  {
    id: "rebirth",
    title: "重生逆袭",
    description: "回到过去，弥补遗憾，改变命运",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-20"></span>
          <span className="relative">⏳</span>
        </span>
      </div>
    ),
    gradient: "from-blue-500 to-cyan-500",
    tags: ["复仇", "弥补遗憾", "预知未来"],
    examples: "重生高考前、重生被退婚当天"
  },
  {
    id: "isekai",
    title: "穿越异世",
    description: "穿越到另一个世界，开启新的人生",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-400 blur-xl opacity-20"></span>
          <span className="relative">🌀</span>
        </span>
      </div>
    ),
    gradient: "from-cyan-500 to-teal-400",
    tags: ["异世界", "魔法", "冒险"],
    examples: "穿越到修仙界、穿越到魔法大陆"
  },
  {
    id: "system",
    title: "系统文",
    description: "获得神秘系统，完成任务变强",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 blur-xl opacity-20"></span>
          <span className="relative">💠</span>
        </span>
      </div>
    ),
    gradient: "from-emerald-500 to-green-400",
    tags: ["系统", "升级", "任务"],
    examples: "神豪系统、签到系统、败家子系统"
  },
  {
    id: "zhailv",
    title: "赘婿翻身",
    description: "从被人看不起到万人敬仰",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 blur-xl opacity-20"></span>
          <span className="relative">👑</span>
        </span>
      </div>
    ),
    gradient: "from-orange-500 to-amber-400",
    tags: ["打脸", "逆袭", "身份揭晓"],
    examples: "豪门赘婿、战神归来"
  },
  {
    id: "urban",
    title: "都市修仙",
    description: "在都市中修炼，扮猪吃虎",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-400 blur-xl opacity-20"></span>
          <span className="relative">⚡</span>
        </span>
      </div>
    ),
    gradient: "from-indigo-500 to-blue-400",
    tags: ["修仙", "都市", "隐世高手"],
    examples: "兵王回归、隐世家族少主"
  },
  {
    id: "apocalypse",
    title: "末世求生",
    description: "在末日世界建立自己的势力",
    icon: (
      <div className="text-5xl">
        <span className="relative inline-block">
          <span className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 blur-xl opacity-20"></span>
          <span className="relative">☢️</span>
        </span>
      </div>
    ),
    gradient: "from-gray-400 to-gray-500",
    tags: ["生存", "基地", "进化"],
    examples: "丧尸末日、全球冰封"
  }
];

export default function Home() {
  const router = useRouter();
  const { user, loading, isGuest, signOut } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const handleSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const handleNext = () => {
    if (selectedGenre) {
      router.push(`/setup?genre=${selectedGenre}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        {/* Header with user menu */}
        <div className="flex items-center justify-between mb-12">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">AI 驱动</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 cursor-pointer text-sm">
                  {user.email?.split("@")[0]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>我的账号</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/library")}>
                    📚 我的作品
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/pricing")}>
                    💎 升级会员
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isGuest ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => router.push("/library")} className="text-gray-600 hover:text-gray-900">
                  📚 我的作品
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/login?redirect=/")} className="border-gray-300 text-gray-600 hover:bg-gray-100">
                  登录
                </Button>
              </div>
            ) : (
              <Button onClick={() => router.push("/auth/login?redirect=/")} className="bg-blue-600 hover:bg-blue-700">
                登录 / 注册
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
            爽文生成器
            <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              {" "}AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-normal">
            选择一个题材，AI将为你生成专属爽文
          </p>
        </div>

        {/* Genre Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {GENRES.map((genre) => (
            <Card
              key={genre.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                selectedGenre === genre.id
                  ? "ring-2 ring-blue-500 shadow-xl shadow-blue-500/10 bg-white"
                  : "hover:shadow-lg bg-white border-gray-200"
              }`}
              onClick={() => handleSelect(genre.id)}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {genre.icon}
                </div>
                <CardTitle className="text-xl text-center text-gray-900">
                  {genre.title}
                </CardTitle>
                <CardDescription className="text-sm text-center text-gray-500">
                  {genre.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {genre.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center">例：{genre.examples}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            disabled={!selectedGenre}
            onClick={handleNext}
            className={`px-12 py-6 text-lg font-medium transition-all h-14 ${
              selectedGenre
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedGenre ? "开始生成我的爽文 →" : "请先选择一个题材"}
          </Button>
          {!selectedGenre && (
            <p className="text-gray-400 mt-4 text-sm">选择上方任意题材开始</p>
          )}
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
          <div className="group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
              ✨
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 text-lg">AI实时生成</h3>
            <p className="text-gray-500">每次生成独一无二的剧情</p>
          </div>
          <div className="group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
              🎮
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 text-lg">你决定走向</h3>
            <p className="text-gray-500">每章3个选项，剧情由你掌控</p>
          </div>
          <div className="group">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              📚
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 text-lg">保存你的故事</h3>
            <p className="text-gray-500">随时回来继续阅读</p>
          </div>
        </div>
      </div>
    </div>
  );
}
