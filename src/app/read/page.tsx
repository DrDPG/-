"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from "next/navigation";

interface Chapter {
  title: string;
  content: string;
  choices: string[];
  chapterNumber: number;
  summary?: string; // 章节剧情摘要，用于保持连贯性
}

interface StorySettings {
  genre: string;
  name: string;
  gender: "male" | "female";
  goldenFinger: string;
  identity: string;
  personality: string[];
}

const GENRE_NAMES: Record<string, string> = {
  rebirth: "重生逆袭",
  isekai: "穿越异世",
  system: "系统文",
  zhailv: "赘婿翻身",
  urban: "都市修仙",
  apocalypse: "末世求生"
};

function ReadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPlot, setCustomPlot] = useState("");

  useEffect(() => {
    const settingsParam = searchParams.get("settings");
    if (settingsParam) {
      try {
        const parsedSettings = JSON.parse(decodeURIComponent(settingsParam));
        setSettings(parsedSettings);
        generateFirstChapter(parsedSettings);
      } catch (e) {
        setError("设置参数错误，请重新开始");
      }
    } else {
      setError("缺少设置参数，请重新开始");
    }
  }, [searchParams]);

  useEffect(() => {
    if (chapters.length > 0 && currentChapterIndex !== chapters.length - 1) {
      if (currentChapterIndex === chapters.length - 2 || currentChapterIndex === 0) {
        setCurrentChapterIndex(chapters.length - 1);
      }
    }
  }, [chapters.length]);

  // 当添加新章节后，自动滚动到顶部
  useEffect(() => {
    if (chapters.length > 1 && !isLoading) {
      // 找到章节内容区域的滚动容器
      const chapterContent = document.getElementById('chapter-content');
      if (chapterContent) {
        const scrollArea = chapterContent.closest('[data-slot="scroll-area-viewport"]');
        if (scrollArea) {
          scrollArea.scrollTop = 0;
        }
      }
    }
  }, [chapters.length, isLoading]);

  const generateFirstChapter = async (storySettings: StorySettings) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);

    // 模拟进度动画
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return Math.min(95, prev + Math.random() * 10);
      });
    }, 500);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: storySettings,
          chapterNumber: 1,
          isFirstChapter: true
        })
      });

      if (!response.ok) {
        throw new Error("生成失败，请重试");
      }

      const data = await response.json();

      // 使用 API 返回的章节号，或者默认为 1
      const apiChapterNumber = data.chapterNumber || 1;
      const fallbackTitle = data.title || "第一章 重生";

      setChapters([
        {
          title: fallbackTitle,
          content: data.content,
          choices: data.choices || [],
          chapterNumber: apiChapterNumber,
          summary: data.summary
        }
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setIsLoading(false);
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);

    // 记录当前章节号，避免竞态条件
    const currentChapterCount = chapters.length;

    // 模拟进度动画
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return Math.min(95, prev + Math.random() * 10);
      });
    }, 500);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          previousChapters: chapters,
          selectedChoice: choiceIndex,
          chapterNumber: currentChapterCount + 1
        })
      });

      if (!response.ok) {
        throw new Error("生成失败，请重试");
      }

      const data = await response.json();

      // 使用 API 返回的章节号，或者使用本地计算的章节号
      const apiChapterNumber = data.chapterNumber || currentChapterCount + 1;
      const fallbackTitle = data.title || `第${apiChapterNumber}章`;

      const newChapter: Chapter = {
        title: fallbackTitle,
        content: data.content,
        choices: data.choices || [],
        chapterNumber: apiChapterNumber,
        summary: data.summary
      };
      setChapters([...chapters, newChapter]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setIsLoading(false);
    }
  };

  // 敏感词过滤（简单版）
  const containsSensitiveContent = (text: string): boolean => {
    const sensitiveWords = [
      // 色情相关
      "性交", "做爱", "淫乱", "裸体", "色情",
      // 暴力相关
      "杀人", "砍杀", "血腥", "恐怖袭击",
      // 政治相关
      // (可根据需要添加)
    ];
    return sensitiveWords.some(word => text.includes(word));
  };

  const handleCustomPlot = async () => {
    if (!customPlot.trim()) {
      alert("请输入自定义剧情");
      return;
    }

    if (customPlot.length < 5) {
      alert("剧情描述至少5个字");
      return;
    }

    if (customPlot.length > 200) {
      alert("剧情描述不能超过200字");
      return;
    }

    // 敏感词检测
    if (containsSensitiveContent(customPlot)) {
      alert("您的输入包含敏感内容，请重新输入");
      return;
    }

    // 检查会员状态（简单实现，实际应该从后端验证）
    const premiumStatus = localStorage.getItem("is_premium");
    if (premiumStatus !== "super") {
      if (confirm("自定义剧情是超级会员专属功能\n\n升级超级会员解锁：\n• 自定义剧情走向\n• 优先客服支持\n• 更多高级功能\n\n现在升级？")) {
        // 跳转到付费页面
        window.location.href = "/pricing";
      }
      return;
    }

    // 检查每日自定义次数
    const today = new Date().toISOString().split('T')[0];
    const customUsed = parseInt(localStorage.getItem(`custom_plot_${today}`) || '0');
    if (customUsed >= 5) {
      alert("今日自定义剧情次数已用完（5次/天），明天再试试吧");
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);

    // 记录当前章节号，避免竞态条件
    const currentChapterCount = chapters.length;

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings,
          previousChapters: chapters,
          chapterNumber: currentChapterCount + 1,
          customPlot: customPlot.trim()
        })
      });

      if (!response.ok) {
        throw new Error("生成失败，请重试");
      }

      // 记录使用次数
      localStorage.setItem(`custom_plot_${today}`, String(customUsed + 1));

      const data = await response.json();

      // 使用 API 返回的章节号，或者使用本地计算的章节号
      const apiChapterNumber = data.chapterNumber || currentChapterCount + 1;
      const fallbackTitle = data.title || `第${apiChapterNumber}章`;

      const newChapter: Chapter = {
        title: fallbackTitle,
        content: data.content,
        choices: data.choices || [],
        chapterNumber: apiChapterNumber,
        summary: data.summary
      };
      setChapters([...chapters, newChapter]);
      setCustomPlot("");
      setShowCustomInput(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setIsLoading(false);
    }
  };

  const handleChapterClick = (index: number) => {
    setCurrentChapterIndex(index);
  };

  const handleRestart = () => {
    router.push("/");
  };

  const currentChapter = chapters[currentChapterIndex];
  const isLatestChapter = currentChapterIndex === chapters.length - 1;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRestart} variant="outline" className="border-gray-300 text-gray-600 hover:text-gray-900">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-3 w-18 h-18 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{animationDirection: "reverse"}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <p className="text-gray-900 text-xl font-medium mb-2">正在生成你的专属故事...</p>
          <p className="text-gray-500 text-sm mb-6">
            {loadingProgress < 30 ? "AI正在构思精彩的开局..." :
             loadingProgress < 60 ? "正在编织剧情冲突..." :
             loadingProgress < 90 ? "正在完善章节细节..." :
             "即将完成..."}
          </p>
          <div className="mt-6 w-72 mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{width: `${Math.min(loadingProgress, 100)}%`}}
              >
                <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(Math.min(loadingProgress, 100))}%</p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                style={{animationDelay: `${i * 0.1}s`, animationDuration: "0.6s"}}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleRestart}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            ← 返回首页
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-white">
              {GENRE_NAMES[settings.genre] || settings.genre}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-white">
              {chapters.length} 章
            </Badge>
          </div>
        </div>

        {/* Story Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            《{settings.name}的{GENRE_NAMES[settings.genre]}之路》
          </h1>
          <p className="text-gray-500 text-sm">
            主角：{settings.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 章节导航 */}
          <Card className="bg-white border-gray-200 shadow-sm lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <h3 className="text-gray-900 font-semibold mb-3 text-sm">章节目录</h3>
              <ScrollArea className="h-[55vh]">
                <div className="space-y-1">
                  {chapters.map((chapter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChapterClick(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                        currentChapterIndex === idx
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-gray-400 mr-2">{idx + 1}.</span>
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 章节内容 */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-gray-200 shadow-sm mb-5">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {currentChapter.title}
                  </h2>
                  {chapters.length > 1 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
                        disabled={currentChapterIndex === 0}
                        className="border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40"
                      >
                        上一章
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40"
                      >
                        下一章
                      </Button>
                    </div>
                  )}
                </div>

                <ScrollArea className="h-[50vh]">
                  <div id="chapter-content" className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {currentChapter.content}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Choices - 只在最新章节显示 */}
            {isLatestChapter && currentChapter.choices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-gray-900 font-semibold text-center mb-4 text-sm">
                  选择接下来的剧情走向
                </h3>
                {currentChapter.choices.map((choice, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleChoice(idx)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 px-6 bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                  >
                    <span className="flex items-start gap-3">
                      <Badge variant="outline" className="border-gray-300 text-gray-500 shrink-0">
                        {idx + 1}
                      </Badge>
                      <span>{choice}</span>
                    </span>
                  </Button>
                ))}

                {/* 自定义剧情按钮 */}
                {!showCustomInput ? (
                  <Button
                    onClick={() => setShowCustomInput(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full justify-center text-center h-auto py-3 px-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">✍️</span>
                      <span>自定义剧情走向</span>
                      <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-600 border-amber-300 text-xs">
                        超级会员
                      </Badge>
                    </span>
                  </Button>
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <span>✍️</span>
                        <span>自定义剧情走向</span>
                      </h4>
                      <p className="text-xs text-amber-700 mb-3">
                        描述你想要的剧情发展，AI将根据你的设定生成下一章（5-200字）
                      </p>
                      <textarea
                        value={customPlot}
                        onChange={(e) => setCustomPlot(e.target.value)}
                        placeholder="例如：主角突然觉醒了新的能力，发现敌人的真正身份是..."
                        className="w-full p-3 border border-amber-300 rounded-lg text-sm text-gray-700 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        rows={3}
                        maxLength={200}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-amber-600">
                          {customPlot.length}/200
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowCustomInput(false);
                              setCustomPlot("");
                            }}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                          >
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleCustomPlot}
                            disabled={isLoading || !customPlot.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            生成章节
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{animationDirection: "reverse"}}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                </div>
                <p className="text-gray-900 mt-6 font-medium">AI正在为你创作下一章...</p>
                <p className="text-gray-500 text-sm mt-2">预计需要10-30秒</p>
                <div className="mt-4 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                      style={{animationDelay: `${i * 0.15}s`, animationDuration: "1s"}}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* 非最新章节提示 */}
            {!isLatestChapter && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  这是历史章节，回到最新章节可继续剧情
                </p>
                <Button
                  onClick={() => setCurrentChapterIndex(chapters.length - 1)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700"
                >
                  跳到最新章节
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          已生成 {chapters.length} 章 | 当前阅读第 {currentChapterIndex + 1} 章
        </div>
      </div>
    </div>
  );
}

export default function ReadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">加载中...</div>
      </div>
    }>
      <ReadContent />
    </Suspense>
  );
}
