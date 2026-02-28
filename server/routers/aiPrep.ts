/**
 * aiPrep router
 * ──────────────────────────────────────────────────────────────
 * Generates AI-powered pre-session briefings for students.
 * Free tier: 3 generations per IP per day.
 * Pro tier: unlimited (future).
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

// In-memory rate limiter: ip -> { count, resetAt }
// Simple approach; replace with Redis for production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const FREE_LIMIT = 3;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + dayMs;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: FREE_LIMIT - 1, resetAt };
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: FREE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export const aiPrepRouter = router({
  /**
   * Generate a pre-session briefing for a given session.
   * Rate-limited to FREE_LIMIT calls per IP per day.
   */
  generate: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        schoolName: z.string(),
        sessionTitle: z.string(),
        sessionType: z.string(),
        sessionDescription: z.string().optional(),
        lang: z.enum(["zh", "en", "hi"]).default("zh"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get client IP
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        ctx.req.socket?.remoteAddress ||
        "unknown";

      const rateCheck = checkRateLimit(ip);

      if (!rateCheck.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: JSON.stringify({
            reason: "rate_limit",
            resetAt: rateCheck.resetAt,
            limit: FREE_LIMIT,
          }),
        });
      }

      const { schoolName, sessionTitle, sessionType, sessionDescription, lang } = input;

      const systemPrompt =
        lang === "zh"
          ? `你是一位专业的美国本科留学顾问，帮助中国学生为即将参加的大学招生宣讲会（Info Session）做准备。
请用中文回复，语言简洁专业，适合高中生阅读。`
          : lang === "hi"
          ? `You are a professional US college admissions counselor helping students prepare for upcoming info sessions.
Please reply in Hindi. Keep the language clear and suitable for high school students.`
          : `You are a professional US college admissions counselor helping students prepare for upcoming info sessions.
Please reply in English. Keep the language clear and suitable for high school students.`;

      const userPrompt =
        lang === "zh"
          ? `请为以下招生宣讲会生成一份预习材料：

学校：${schoolName}
活动名称：${sessionTitle}
活动类型：${sessionType}
活动描述：${sessionDescription || "（暂无描述）"}

请按以下结构输出，每部分不超过3-5条，语言简洁：

## 这场活动通常会讲什么
（列出3-4个核心话题）

## 建议提问清单
（列出4-5个适合在Q&A环节提出的问题，优先考虑国际生关心的话题）

## 关键词汇表
（列出5-8个招生术语，格式：英文术语 — 中文解释，一句话说明含义）`
          : `Please generate a pre-session briefing for the following admissions info session:

School: ${schoolName}
Event: ${sessionTitle}
Type: ${sessionType}
Description: ${sessionDescription || "(no description available)"}

Please structure your response as follows (keep each section concise, 3-5 items):

## What This Session Typically Covers
(List 3-4 core topics)

## Suggested Questions to Ask
(List 4-5 questions suitable for the Q&A, prioritizing international student concerns)

## Key Vocabulary
(List 5-8 admissions terms with brief explanations)`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices?.[0]?.message?.content || "";

      return {
        content,
        remaining: rateCheck.remaining,
        limit: FREE_LIMIT,
        sessionId: input.sessionId,
      };
    }),

  /**
   * Check remaining quota for current IP without consuming a call.
   */
  quota: publicProcedure.query(({ ctx }) => {
    const ip =
      (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      ctx.req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      return { remaining: FREE_LIMIT, limit: FREE_LIMIT, resetAt: null };
    }

    return {
      remaining: Math.max(0, FREE_LIMIT - entry.count),
      limit: FREE_LIMIT,
      resetAt: entry.resetAt,
    };
  }),
});
