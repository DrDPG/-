import { NextRequest, NextResponse } from "next/server";
import { checkDailyLimit, incrementChapterCount, createStory, saveChapter } from "@/lib/supabase";

// ================= 配置区域 =================
// 在这里设置你的 API Key
// 推荐：DeepSeek（便宜）或 Claude（高质量）
type ApiProvider = "deepseek" | "claude" | "openai";
const API_PROVIDER: ApiProvider = "deepseek"; // 可选: "deepseek", "claude", "openai"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// ===========================================

interface StorySettings {
  genre: string;
  name: string;
  gender: "male" | "female";
  goldenFinger: string;
  identity: string;
  personality: string[];
}

interface GenerateRequest {
  settings: StorySettings;
  previousChapters?: Array<{ content: string; choices: string[]; chapterNumber: number; summary?: string }>;
  selectedChoice?: number;
  chapterNumber: number;
  isFirstChapter?: boolean;
  userId?: string;
  storyId?: string;
  customPlot?: string;
}

const GENRE_PROMPTS: Record<string, string> = {
  rebirth: "重生逆袭爽文",
  isekai: "穿越异世爽文",
  system: "系统文爽文",
  zhailv: "赘婿翻身爽文",
  urban: "都市修仙爽文",
  apocalypse: "末世求生爽文"
};

function buildPrompt(req: GenerateRequest): string {
  const { settings, previousChapters, selectedChoice, chapterNumber, isFirstChapter, customPlot } = req;

  const genrePrompt = GENRE_PROMPTS[settings.genre] || "爽文";
  const personalityDesc = settings.personality.join("、");

  // 添加随机种子提示，确保每次生成不同
  const randomSeed = Math.random().toString(36).substring(7);
  const timestamp = Date.now();

  if (isFirstChapter) {
    // 第一章：开局设定
    return `[生成ID: ${randomSeed}-${timestamp}]

你是一位专业的网文作家。请根据以下设定，写一个${genrePrompt}的第一章（约2000字）：

【主角设定】
- 姓名：${settings.name}
- 性别：${settings.gender === "male" ? "男" : "女"}
- 金手指：${settings.goldenFinger}
- 初始身份：${settings.identity}
- 性格：${personalityDesc}

【写作要求】
1. 开局要有冲突或悬念，快速吸引读者
2. 突出主角的${settings.goldenFinger}觉醒或展现
3. 体现主角${personalityDesc}的性格特点
4. 语言风格：网文爽文风格，节奏紧凑，爽点密集
5. 结尾留悬念，让读者想知道接下来会发生什么
6. **重要**：请创造独特的剧情，不要套用模板

请按照以下格式输出：
第一行：【章节标题】一个吸引人的章节标题（4-8字）
然后换行，输出小说正文内容（不要加"第一章"等标题）。
正文结束后，换行，然后生成3个不同的"接下来可能发生的剧情选项"，每个选项约15-20字，严格用"【选项1】"、"【选项2】"、"【选项3】"标记。`;
  } else {
    // 后续章节：根据用户选择或自定义剧情继续
    const lastChapter = previousChapters![previousChapters!.length - 1];

    // 获取最近一章的关键内容
    const recentContent = lastChapter.content.slice(-800);

    // 构建故事摘要，保持连贯性
    let storySummary = "";
    if (previousChapters && previousChapters.length > 1) {
      const summaries = previousChapters
        .slice(0, -1)  // 排除当前最后一章
        .map((ch, idx) => `第${idx + 1}章：${ch.summary || ch.content.slice(0, 100)}...`)
        .join("\n");
      storySummary = `【故事前情提要】\n${summaries}\n\n`;
    }

    let plotInstruction = "";
    if (customPlot) {
      // 用户自定义剧情
      plotInstruction = `【读者自定义剧情走向】
${customPlot}

【本章创作要求】
1. **按读者要求**：根据读者自定义的剧情走向"${customPlot}"来创作本章
2. **自然衔接**：从前章结尾自然过渡到读者指定的剧情`;
    } else {
      // 使用预设选项
      const selectedChoiceText = lastChapter.choices[selectedChoice!];
      plotInstruction = `【读者选择的剧情走向】
选项${selectedChoice! + 1}：${selectedChoiceText}

【本章创作要求】
1. **直接承接**：从读者选择的"${selectedChoiceText}"这个剧情点开始`;
    }

    return `[生成ID: ${randomSeed}-${timestamp} | 章节: ${chapterNumber}]

你是一位专业的网文作家。正在创作${settings.name}的${genrePrompt}，这是第${chapterNumber}章。

${storySummary}
【主角设定（必须保持一致）】
- 姓名：${settings.name}
- 性别：${settings.gender === "male" ? "男" : "女"}
- 金手指：${settings.goldenFinger}
- 初始身份：${settings.identity}
- 性格：${settings.personality.join("、")}

【前章结尾回顾】
${recentContent}

${plotInstruction}
2. **新冲突**：引入新的冲突、人物或机遇，推动剧情发展
3. **能力展现**：让主角的${settings.goldenFinger}在本章有新的展现或突破
4. **节奏控制**：爽文风格，节奏紧凑，有高潮点
5. **章节长度**：1500-2000字左右
6. **结尾悬念**：留下吸引读者的悬念
7. **避免重复**：不要重复前几章已经写过的情节
8. **保持连贯**：确保人物性格、能力设定与前文一致

请按照以下格式输出：
第一行：【章节标题】一个吸引人的章节标题（4-8字）
然后换行，输出小说正文内容（不要加"第X章"等标题）。
正文结束后，换行，然后生成3个**不同类型**的剧情选项（如：继续当前剧情、突发新事件、开启新线索），每个选项约15-20字，严格用"【选项1】"、"【选项2】"、"【选项3】"标记。`;
  }
}

function parseResponse(content: string, chapterNumber: number): { content: string; choices: string[]; title: string } {
  // 提取标题 - 支持多种格式
  let title = `第${chapterNumber}章`;
  const titlePatterns = [
    /【章节标题】\s*([^\n]+)/,
    /【标题】\s*([^\n]+)/,
    /章节[标题名称]?\s*[:：]\s*([^\n]+)/,
    /第[一二三四五六七八九十\d]+章\s*([^\n]+)/,
    /^([^\n]{2,10})\n/  // 第一行短文本作为标题
  ];

  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length < 20) {
      title = match[1].trim();
      break;
    }
  }

  // 如果还是默认标题，尝试生成更吸引人的标题
  if (title === `第${chapterNumber}章`) {
    const titlePrefixes = ["风云突变", "新的征程", "意外之喜", "绝地反击", "锋芒毕露", "暗流涌动", "破局", "觉醒", "逆袭"];
    const randomPrefix = titlePrefixes[chapterNumber % titlePrefixes.length];
    title = `${randomPrefix}（第${chapterNumber}章）`;
  }

  // 提取选项
  const choices: string[] = [];
  const choiceRegex = /【选项[1234123456789]】\s*([^\n]+)/g;
  let match;
  while ((match = choiceRegex.exec(content)) !== null) {
    choices.push(match[1].trim());
  }

  // 移除标题和选项部分，只保留故事内容
  let storyContent = content;

  // 移除标题行
  for (const pattern of titlePatterns) {
    const titleMatch = storyContent.match(pattern);
    if (titleMatch) {
      storyContent = storyContent.replace(pattern, "").trim();
      break;
    }
  }

  // 移除选项部分
  const optionIndex = storyContent.indexOf("【选项");
  if (optionIndex !== -1) {
    storyContent = storyContent.slice(0, optionIndex).trim();
  }

  // 清理内容
  storyContent = storyContent
    .replace(/【章节标题】.*?\n/g, "")
    .replace(/【标题】.*?\n/g, "")
    .replace(/第\d+章[^\n]*/g, "")
    .trim();

  // 生成简单摘要（取前150字）
  const summary = storyContent.slice(0, 150).trim();

  return {
    title,
    content: storyContent || content, // 如果清理后为空，使用原文
    choices: choices.length >= 3 ? choices.slice(0, 3) : generateDefaultChoices(),
    summary
  };
}

function generateDefaultChoices(): string[] {
  return [
    "继续当前剧情，看主角如何应对",
    "突然出现新的变故",
    "主角开启新的能力/获得新机遇"
  ];
}

async function callDeepSeek(prompt: string): Promise<string> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一位专业的网文作家，擅长写作各种类型的爽文，文笔流畅，节奏紧凑。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.9
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: "你是一位专业的网文作家，擅长写作各种类型的爽文，文笔流畅，节奏紧凑。",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一位专业的网文作家，擅长写作各种类型的爽文，文笔流畅，节奏紧凑。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.9
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateStory(req: GenerateRequest): Promise<{ content: string; choices: string[]; title: string; summary?: string }> {
  const prompt = buildPrompt(req);

  let content: string;

  switch (API_PROVIDER) {
    case "deepseek":
      if (!DEEPSEEK_API_KEY) {
        return getMockResponse(req);
      }
      content = await callDeepSeek(prompt);
      break;
    case "claude":
      if (!CLAUDE_API_KEY) {
        return getMockResponse(req);
      }
      content = await callClaude(prompt);
      break;
    case "openai":
      if (!OPENAI_API_KEY) {
        return getMockResponse(req);
      }
      content = await callOpenAI(prompt);
      break;
    default:
      return getMockResponse(req);
  }

  return parseResponse(content, req.chapterNumber);
}

// 模拟响应（用于测试）
function getMockResponse(req: GenerateRequest): { content: string; choices: string[]; title: string; summary?: string } {
  const { settings, chapterNumber } = req;

  if (chapterNumber === 1) {
    return {
      title: "第一章 重生归来",
      content: `${settings.name}猛地睁开眼睛，映入眼帘的是熟悉而陌生的天花板。

空气中弥漫着淡淡的粉笔灰味道，窗外传来知了的叫声。${settings.name}愣住了——这不是二十年前的教室吗？

他猛地坐起身，低头看向自己的双手。年轻、修长、没有岁月留下的痕迹。这是...真的回去了？

"喂，${settings.name}，发什么呆呢？老师来了！"同桌用手肘捅了捅${settings.name}。

${settings.name}转过头，看到那张久违的年轻脸庞，眼泪差点掉下来。这是死党小明，当年因为车祸去世的兄弟。

一切都还来得及。

讲台上，数学老师老王正在讲解一道压轴题。${settings.name}眯起眼睛——这道题，他太熟悉了，这就是当年改变他命运的那道题。

那时候，他因为这道题没做出来，与名校失之交臂，人生轨迹彻底改变。

但现在不同了。

${settings.name}闭上眼睛，深吸一口气。前世的记忆如潮水般涌来——股票走势、彩票号码、未来趋势...这些记忆清晰得就像昨天发生的一样。

更让${settings.name}惊喜的是，他感觉到脑海中似乎有什么东西在觉醒——那是一种玄妙的感觉，仿佛整个世界的数据都在向他汇聚。

这就是传说中的${settings.goldenFinger}吗？

老王的声音在讲台上响起："这道题，谁能上来解一下？"

全班鸦雀无声。

${settings.name}笑了。这一世，他要拿回属于自己的一切。

他缓缓举起手。

"老师，我来。"

那一刻，整个教室都安静了。没有人注意到，${settings.name}的眼睛里闪烁着前所未有的光芒。

这是新生的开始，也是传奇的序章。`,
      summary: `${settings.name}重生回到学生时代，发现自己拥有${settings.goldenFinger}，决心改变命运。`,
      choices: [
        `${settings.name}完美解答题目，震惊全班同学`,
        `突然脑海中响起神秘系统的提示音`,
        `放学路上遇到改变命运的关键人物`
      ]
    };
  }

  return {
    title: `第${chapterNumber}章 新的征程`,
    content: `第${chapterNumber}章内容继续发展...

${settings.name}站在命运的十字路口，前世的记忆与今生的新机遇交织在一起。他清楚地知道，接下来的每一个选择，都将影响未来的走向。

那种被称为"${settings.goldenFinger}"的能力，正在${settings.name}的体内蠢蠢欲动。他能感觉到，一股前所未有的力量正在觉醒。

"是时候做出改变了。"

${settings.name}握紧拳头，眼神坚定地望向远方。

一切，才刚刚开始。`,
    summary: `${settings.name}面临新的选择，${settings.goldenFinger}能力逐渐觉醒。`,
    choices: [
      `${settings.name}决定利用前世知识赚取第一桶金`,
      `专注于修炼${settings.goldenFinger}能力`,
      `寻找前世帮助过自己的人报恩`
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const req: GenerateRequest = await request.json();

    // 验证必要参数
    if (!req.settings || !req.settings.genre || !req.settings.name) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 检查用户次数限制（如果有 userId）
    if (req.userId) {
      const limitCheck = await checkDailyLimit(req.userId);
      if (!limitCheck.canGenerate) {
        return NextResponse.json(
          {
            error: "limit_reached",
            message: `今日免费次数已用完，剩余 ${limitCheck.remaining} 次`,
            remaining: limitCheck.remaining,
            isPremium: limitCheck.isPremium
          },
          { status: 429 }
        );
      }
    }

    // 生成故事内容
    const result = await generateStory(req);

    // 保存故事和章节（如果有 userId）
    if (req.userId) {
      try {
        let storyId = req.storyId;

        // 如果是第一章且没有 storyId，创建新故事
        if (req.isFirstChapter && !storyId) {
          const newStory = await createStory({
            user_id: req.userId,
            title: `${req.settings.name}的${req.settings.genre}之路`,
            genre: req.settings.genre,
            protagonist_name: req.settings.name,
            gender: req.settings.gender,
            golden_finger: req.settings.goldenFinger,
            identity: req.settings.identity,
            personality: req.settings.personality
          });
          storyId = newStory?.id;
        }

        // 保存章节
        if (storyId) {
          await saveChapter({
            story_id: storyId,
            chapter_number: req.chapterNumber,
            title: result.title,
            content: result.content,
            choices: result.choices
          });

          // 增加用户今日使用次数
          await incrementChapterCount(req.userId);

          // 返回 storyId 和 chapterNumber 以便前端保存
          return NextResponse.json({
            ...result,
            chapterNumber: req.chapterNumber,
            storyId
          });
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // 数据库保存失败，但仍返回生成的内容
      }
    }

    return NextResponse.json({
      ...result,
      chapterNumber: req.chapterNumber
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error: "生成失败",
        message: error instanceof Error ? error.message : "未知错误"
      },
      { status: 500 }
    );
  }
}
