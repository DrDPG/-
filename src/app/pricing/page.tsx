"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePurchase = (planId: string, price: number) => {
    if (!user) {
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    // 简单版：显示付款指引
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      alert(`付款指引：\n\n金额：¥${plan.price}\n\n请通过以下方式付款：\n1. 微信：扫描下方二维码\n2. 支付宝：扫描下方二维码\n\n付款后请截图发送给客服，备注你的邮箱：${user.email}\n\n我们将在核实后立即为你开通会员！`);
    }
  };

  const plans = [
    {
      id: "free",
      name: "免费版",
      price: 0,
      duration: "永久",
      features: [
        "每天可生成 3 章",
        "所有题材可选",
        "基础角色设定",
        "作品不保存"
      ],
      cta: "当前方案",
      popular: false
    },
    {
      id: "monthly",
      name: "月卡会员",
      price: 29,
      duration: "1个月",
      originalPrice: 49,
      features: [
        "无限生成章节",
        "所有题材可选",
        "完整角色设定",
        "作品云端保存",
        "优先客服支持",
        "无广告体验"
      ],
      cta: "立即开通",
      popular: false
    },
    {
      id: "super",
      name: "超级会员",
      price: 49,
      duration: "1个月",
      originalPrice: 79,
      features: [
        "无限生成章节",
        "自定义剧情走向",
        "每日5次自定义次数",
        "作品云端保存",
        "完整角色设定",
        "优先客服支持",
        "无广告体验",
        "专属客服通道"
      ],
      cta: "最受欢迎",
      popular: true
    },
    {
      id: "yearly",
      name: "年卡会员",
      price: 199,
      duration: "1年",
      originalPrice: 588,
      features: [
        "无限生成章节",
        "作品云端保存",
        "完整角色设定",
        "优先客服支持",
        "无广告体验",
        "节省 ¥389"
      ],
      cta: "最划算",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 mb-6 hover:bg-gray-100"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            选择你的会员方案
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            解锁无限创作可能，让AI为你生成专属爽文
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white ${
                plan.popular
                  ? "border-2 border-blue-500 shadow-xl shadow-blue-500/10 scale-105"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">
                    最受欢迎
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {plan.duration}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ¥{plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ¥{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      约 ¥{(plan.price / (plan.duration === "1年" ? 365 : 30)).toFixed(1)}/天
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => plan.price > 0 && handlePurchase(plan.id, plan.price)}
                  disabled={plan.price === 0}
                  className={`w-full h-12 text-base ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : plan.price === 0
                      ? "bg-gray-100 text-gray-600 cursor-default"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <Card className="max-w-3xl mx-auto bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-gray-900">付款方式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">💚 微信支付</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-gray-400 text-sm">微信收款码</span>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    扫码付款后截图联系客服
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">💙 支付宝</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-gray-400 text-sm">支付宝收款码</span>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    扫码付款后截图联系客服
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>客服联系方式：</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                微信：添加客服微信 xxxxxx，发送付款截图和注册邮箱
              </p>
              <p className="text-sm text-gray-600 mt-1">
                邮箱：发送付款截图到 support@example.com
              </p>
              <p className="text-sm text-gray-500 mt-2">
                * 我们将在收到付款后 30 分钟内为你开通会员
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            常见问题
          </h2>
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  免费版和会员版有什么区别？
                </h3>
                <p className="text-gray-600 text-sm">
                  免费版每天可以生成 3 章，适合体验。会员版可以无限生成章节，并且作品会保存到云端，随时可以继续阅读。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  付款后多久开通会员？
                </h3>
                <p className="text-gray-600 text-sm">
                  付款截图发送给客服后，我们通常在 30 分钟内为你开通会员。最迟不超过 24 小时。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  可以退款吗？
                </h3>
                <p className="text-gray-600 text-sm">
                  开通会员后 7 天内，如果对服务不满意，可以申请全额退款。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
