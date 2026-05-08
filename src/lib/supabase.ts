import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查是否配置了有效的 Supabase
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseAnonKey;

export const supabase = isValidUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 数据库类型定义
export interface Story {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  protagonist_name: string;
  gender: string;
  golden_finger: string;
  identity: string;
  personality: string[];
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string;
  content: string;
  choices: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  daily_chapters_used: number;
  daily_chapters_limit: number;
  last_chapter_date: string;
  created_at: string;
  updated_at: string;
}

// 用户操作函数
export async function getUserProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // 用户不存在，创建默认配置
    return await createUserProfile(userId);
  }

  return data;
}

export async function createUserProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      is_premium: false,
      daily_chapters_used: 0,
      daily_chapters_limit: 3,
      last_chapter_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  return data;
}

export async function checkDailyLimit(userId: string): Promise<{ canGenerate: boolean; remaining: number; isPremium: boolean }> {
  if (!supabase) {
    // 游客模式：默认每天3章
    const used = parseInt(localStorage.getItem(`guest_chapters_${new Date().toISOString().split('T')[0]}`) || '0');
    return { canGenerate: used < 3, remaining: Math.max(0, 3 - used), isPremium: false };
  }

  const profile = await getUserProfile(userId);
  if (!profile) return { canGenerate: false, remaining: 0, isPremium: false };

  const today = new Date().toISOString().split('T')[0];
  const isPremium = profile.is_premium && new Date(profile.premium_expires_at || '') > new Date();

  // 如果是新的一天，重置次数
  if (profile.last_chapter_date !== today) {
    await supabase
      .from('user_profiles')
      .update({ daily_chapters_used: 0, last_chapter_date: today })
      .eq('user_id', userId);
    profile.daily_chapters_used = 0;
  }

  if (isPremium) {
    return { canGenerate: true, remaining: -1, isPremium: true };
  }

  const remaining = profile.daily_chapters_limit - profile.daily_chapters_used;
  return {
    canGenerate: remaining > 0,
    remaining,
    isPremium: false
  };
}

export async function incrementChapterCount(userId: string): Promise<void> {
  if (!supabase) {
    // 游客模式：记录本地次数
    const today = new Date().toISOString().split('T')[0];
    const key = `guest_chapters_${today}`;
    const used = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(used + 1));
    return;
  }

  // 先获取当前值
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('daily_chapters_used')
    .eq('user_id', userId)
    .single();

  if (profile) {
    await supabase
      .from('user_profiles')
      .update({ daily_chapters_used: (profile.daily_chapters_used || 0) + 1 })
      .eq('user_id', userId);
  }
}

export async function createStory(story: Omit<Story, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('stories')
    .insert(story)
    .select()
    .single();

  return data;
}

export async function saveChapter(chapter: Omit<Chapter, 'id' | 'created_at'>) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('chapters')
    .insert(chapter)
    .select()
    .single();

  return data;
}

export async function getUserStories(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('stories')
    .select('*, chapters(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data;
}

export async function getStoryChapters(storyId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('chapter_number', { ascending: true });

  return data;
}
