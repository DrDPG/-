"use client";

import { useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";

const GENRE_CONFIG: Record<string, any> = {
  rebirth: {
    title: "重生逆袭",
    goldenFingers: [
      { id: "memory", name: "前世记忆", desc: "保留前世所有记忆和经验" },
      { id: "future", name: "预知未来", desc: "能预知接下来发生的事情" },
      { id: "system", name: "复仇系统", desc: "每复仇一次获得奖励" },
      { id: "investment", name: "投资眼光", desc: "知道所有未来的投资机会" }
    ],
    identities: [
      { id: "student", name: "高三学生", desc: "重生回高考前三个月" },
      { id: "divorced", name: "被退婚当天", desc: "未婚妻当众退婚，受尽屈辱" },
      { id: "failed", name: "创业失败者", desc: "公司破产，负债累累" },
      { id: "wasted", name: "碌碌无为者", desc: "活到80岁一事无成" }
    ]
  },
  isekai: {
    title: "穿越异世",
    goldenFingers: [
      { id: "cheat", name: "外挂系统", desc: "游戏面板，可以查看属性和任务" },
      { id: "mage", name: "全系亲和", desc: "所有魔法元素都亲和" },
      { id: "summon", name: "召唤能力", desc: "可以召唤前世物品" },
      { id: "level", name: "等级压制", desc: "打怪升级，战力暴涨" }
    ],
    identities: [
      { id: "noble", name: "贵族少爷", desc: "穿越成异世界贵族" },
      { id: "commoner", name: "平民少年", desc: "出身卑微但有天赋" },
      { id: "villain", name: "反派角色", desc: "穿成书中的反派" },
      { id: "monster", name: "异兽化身", desc: "穿越成为魔物" }
    ]
  },
  system: {
    title: "系统文",
    goldenFingers: [
      { id: "tycoon", name: "神豪系统", desc: "每天获得100万，花钱更多返利" },
      { id: "checkin", name: "签到系统", desc: "每天签到获得神级奖励" },
      { id: "skill", name: "技能系统", desc: "完成任务获得满级技能" },
      { id: "shop", name: "万界商城", desc: "可以购买万界任何商品" }
    ],
    identities: [
      { id: "poor", name: "穷困潦倒", desc: "负债几十万，走投无路" },
      { id: "loser", name: "公司底层", desc: "被上司压榨，工资微薄" },
      { id: "betrayed", name: "被兄弟背叛", desc: "创业成果被合伙人夺走" },
      { id: "unemployed", name: "刚被裁员", desc: "35岁中年失业" }
    ]
  },
  zhailv: {
    title: "赘婿翻身",
    goldenFingers: [
      { id: "identity", name: "神级身份", desc: "真实身份是全球首富/战神" },
      { id: "master", name: "绝世医术", desc: "能治好任何人的病" },
      { id: "protect", name: "贴身保护", desc: "众多美女想要保护自己" },
      { id: "wealth", name: "无限黑卡", desc: "金钱无穷无尽" }
    ],
    identities: [
      { id: "useless", name: "废物赘婿", desc: "被岳母看不起，妻子冷漠" },
      { id: "driver", name: "全职司机", desc: "给美女总裁当专职司机" },
      { id: "security", name: "保安", desc: "在别墅小区当保安" },
      { id: "delivery", name: "外卖小哥", desc: "送外卖被美女羞辱" }
    ]
  },
  urban: {
    title: "都市修仙",
    goldenFingers: [
      { id: "immortal", name: "仙人传承", desc: "获得上古仙人记忆" },
      { id: "artifact", name: "神器认主", desc: "上古神器自动认主" },
      { id: "bloodline", name: "神级血脉", desc: "觉醒上古神兽血脉" },
      { id: "technique", name: "修仙功法", desc: "拥有完整的修仙功法" }
    ],
    identities: [
      { id: "bodyguard", name: "保镖", desc: "给大小姐当贴身保镖" },
      { id: "doctor", name: "小医生", desc: "医院里的实习生" },
      { id: "student", name: "大学生", desc: "普通的大学生活" },
      { id: "returnee", name: "都市归来", desc: "山上修炼十年下山" }
    ]
  },
  apocalypse: {
    title: "末世求生",
    goldenFingers: [
      { id: "space", name: "随身空间", desc: "无限空间的随身仓库" },
      { id: "farm", name: "末日农场", desc: "可以在空间里种田养殖" },
      { id: "evolve", name: "无限进化", desc: "杀丧尸可以无限变强" },
      { id: "summon", name: "召唤军队", desc: "可以召唤现代军队" }
    ],
    identities: [
      { id: "home", name: "在家", desc: "末世爆发时正在家里" },
      { id: "mall", name: "商场", desc: "末世爆发时正在购物" },
      { id: "prepared", name: "有准备者", desc: "提前知道末世来临" },
      { id: "bunker", name: "避难所", desc: "拥有豪华避难所" }
    ]
  }
};

const personalities = [
  { id: "cool", name: "冷静", icon: "😐" },
  { id: "impulsive", name: "冲动", icon: "😤" },
  { id: "scheming", name: "腹黑", icon: "😏" },
  { id: "honest", name: "正直", icon: "😇" },
  { id: "lazy", name: "慵懒", icon: "😴" },
  { id: "diligent", name: "勤奋", icon: "💪" }
];

// 随机姓名生成
const maleSurnames = ["林", "萧", "叶", "楚", "顾", "陆", "沈", "江", "苏", "洛", "白", "秦", "墨", "夜", "风", "云", "雷", "陈", "李", "王", "张", "刘", "赵", "黄"];
const maleNames = ["凡", "尘", "天", "风", "云", "炎", "昊", "宇", "轩", "逸", "然", "轩", "辰", "墨", "夜", "白", "修", "澜", "澈", "翊", "霖", "绝", "霸道", "无双", "破天"];

const femaleSurnames = ["苏", "林", "叶", "萧", "洛", "白", "江", "沈", "秦", "楚", "顾", "陆", "夏", "慕", "安"];
const femaleNames = ["晴", "雪", "月", "婉", "清", "瑶", "曦", "璃", "浅", "墨", "染", "嫣", "然", "语", "萱", "梦", "璃", "影", "凝", "紫", "蝶", "灵", "雪", "初"];

function generateRandomName(gender: "male" | "female"): string {
  if (gender === "male") {
    const surname = maleSurnames[Math.floor(Math.random() * maleSurnames.length)];
    const name = maleNames[Math.floor(Math.random() * maleNames.length)];
    if (Math.random() > 0.5) {
      const secondChar = maleNames[Math.floor(Math.random() * maleNames.length)];
      return surname + name + secondChar;
    }
    return surname + name;
  } else {
    const surname = femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];
    const name = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    if (Math.random() > 0.5) {
      const secondChar = femaleNames[Math.floor(Math.random() * femaleNames.length)];
      return surname + name + secondChar;
    }
    return surname + name;
  }
}

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre") || "rebirth";

  const config = GENRE_CONFIG[genre] || GENRE_CONFIG.rebirth;

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [goldenFinger, setGoldenFinger] = useState<string>("");
  const [identity, setIdentity] = useState<string>("");
  const [personality, setPersonality] = useState<string[]>([]);

  const togglePersonality = (id: string) => {
    if (personality.includes(id)) {
      setPersonality(personality.filter((p) => p !== id));
    } else if (personality.length < 3) {
      setPersonality([...personality, id]);
    }
  };

  const handleStart = () => {
    const goldenFingerName = config.goldenFingers.find((gf: any) => gf.id === goldenFinger)?.name || goldenFinger;
    const identityName = config.identities.find((ident: any) => ident.id === identity)?.name || identity;
    const personalityNames = personality.map((pId) => personalities.find((p) => p.id === pId)?.name || pId);

    const settings = {
      genre,
      name: name || (gender === "male" ? "林凡" : "苏晴"),
      gender,
      goldenFinger: goldenFingerName,
      identity: identityName,
      personality: personalityNames
    };
    router.push(`/read?settings=${encodeURIComponent(JSON.stringify(settings))}`);
  };

  const isReady = name && goldenFinger && identity && personality.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 mb-6 hover:bg-gray-100"
          >
            ← 返回
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            创建你的 {config.title} 角色
          </h1>
          <p className="text-gray-500">设定你的主角，开启爽文之旅</p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">主角姓名</CardTitle>
              <CardDescription className="text-gray-500">
                留空将使用随机姓名
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="点击右侧按钮随机生成"
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  onClick={() => setName(generateRandomName(gender))}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  title="随机生成姓名"
                >
                  🎲
                </Button>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2.5 px-5 rounded-lg border transition-all font-medium text-sm ${
                    gender === "male"
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  🚹 男主角
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2.5 px-5 rounded-lg border transition-all font-medium text-sm ${
                    gender === "female"
                      ? "bg-pink-500 border-pink-500 text-white shadow-md"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  🚺 女主角
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Golden Finger */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <span className="text-xl">💠</span>
                选择金手指
              </CardTitle>
              <CardDescription className="text-gray-500">
                主角的特殊能力，选一个
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {config.goldenFingers.map((gf: any) => (
                  <div
                    key={gf.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      goldenFinger === gf.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setGoldenFinger(gf.id)}
                  >
                    <div className="font-semibold text-gray-900">{gf.name}</div>
                    <div className="text-sm text-gray-500">{gf.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Identity */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <span className="text-xl">🎭</span>
                选择初始身份
              </CardTitle>
              <CardDescription className="text-gray-500">
                主角的故事起点，选一个
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {config.identities.map((ident: any) => (
                  <div
                    key={ident.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      identity === ident.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setIdentity(ident.id)}
                  >
                    <div className="font-semibold text-gray-900">{ident.name}</div>
                    <div className="text-sm text-gray-500">{ident.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <span className="text-xl">🧠</span>
                选择性格（最多3个）
              </CardTitle>
              <CardDescription className="text-gray-500">
                已选 {personality.length}/3
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {personalities.map((p) => (
                  <Badge
                    key={p.id}
                    variant={personality.includes(p.id) ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                      personality.includes(p.id)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => togglePersonality(p.id)}
                  >
                    {p.icon} {p.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center pt-4">
            <Button
              size="lg"
              disabled={!isReady}
              onClick={handleStart}
              className={`px-16 py-6 text-lg font-medium transition-all h-14 ${
                isReady
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isReady ? "🚀 开始生成爽文" : "请完成所有设定"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">加载中...</div>
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}
