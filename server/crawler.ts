/**
 * crawler.ts
 * ──────────────────────────────────────────────────────────────
 * Core crawler service for fetching university admissions event pages
 * and using AI to extract structured session data.
 *
 * Flow:
 *   1. Fetch HTML from each school's registration page
 *   2. Strip HTML → plain text (keep dates, headings, links)
 *   3. Call LLM to extract structured event data
 *   4. Upsert into `sessions` table
 *   5. Write a row to `crawl_logs`
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { crawlLogs, sessions, subscribers } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { allSchools, allSessions } from "../client/src/data/schools";

// Threshold: alert owner after this many consecutive failures for one school
const CONSECUTIVE_FAIL_ALERT_THRESHOLD = 3;

// ── Types ─────────────────────────────────────────────────────

interface ExtractedSession {
  id: string;
  title: string;
  type: string;
  description: string;
  dates: string[] | null; // YYYY-MM-DD
  time: string | null;
  duration: string | null;
  registrationUrl: string;
  isRolling: boolean;
}

interface CrawlResult {
  schoolId: number;
  schoolName: string;
  crawlUrl: string;
  status: "success" | "failed" | "partial";
  sessionsFound: number;
  sessionsUpdated: number;
  errorMessage?: string;
}

// ── HTML → plain text ─────────────────────────────────────────

function stripHtml(html: string): string {
  // Remove script/style blocks
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Replace block tags with newlines
  text = text.replace(/<(br|p|div|li|h[1-6]|tr|td|th)[^>]*>/gi, "\n");
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Collapse whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

// ── Fetch with timeout ────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AdmitLens-Crawler/1.0; +https://admitlens.manus.space)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ── LLM extraction ────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `You are an expert at extracting university admissions event information from web pages.
Today's date is ${new Date().toISOString().slice(0, 10)}.

Extract ALL upcoming virtual info sessions, webinars, open days, or admissions events from the provided page text.
Focus only on events scheduled in the future (today or later).
Return a JSON object with a "sessions" array. Each session must have:
- id: a short slug like "oxford-info-2026-03" (school-type-year-month)
- title: event title (string)
- type: one of "General Info Session", "Up Close / Specialty", "Multi-College Session", "Regional Session", "Student Forum", "Financial Aid Session", "International Student Session"
- description: 1-2 sentence description in Chinese (简体中文)
- dates: array of "YYYY-MM-DD" strings for specific dates, or null if rolling/on-demand
- time: time string like "7:00 PM ET" or "2:00 PM GMT" or null
- duration: like "60 min" or "90 min" or null
- registrationUrl: the direct URL to register (use the page URL if no specific link found)
- isRolling: true if the event is on-demand or rolling (no fixed dates), false otherwise

If no upcoming events are found, return {"sessions": []}.
Only return valid JSON, no markdown fences.`;

async function extractSessionsWithAI(
  pageText: string,
  schoolId: number,
  schoolName: string,
  pageUrl: string
): Promise<ExtractedSession[]> {
  const truncated = pageText.slice(0, 8000); // keep within context limits

  const response = await invokeLLM({
    messages: [
      { role: "system", content: EXTRACT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `University: ${schoolName}\nPage URL: ${pageUrl}\n\nPage content:\n${truncated}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sessions_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            sessions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  dates: {
                    oneOf: [
                      { type: "array", items: { type: "string" } },
                      { type: "null" },
                    ],
                  },
                  time: { oneOf: [{ type: "string" }, { type: "null" }] },
                  duration: { oneOf: [{ type: "string" }, { type: "null" }] },
                  registrationUrl: { type: "string" },
                  isRolling: { type: "boolean" },
                },
                required: [
                  "id",
                  "title",
                  "type",
                  "description",
                  "dates",
                  "time",
                  "duration",
                  "registrationUrl",
                  "isRolling",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["sessions"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices?.[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : null;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    return (parsed.sessions || []).map((s: ExtractedSession) => ({
      ...s,
      id: `${schoolId}-${s.id}`.slice(0, 127), // ensure unique per school
    }));
  } catch {
    return [];
  }
}

// ── Upsert sessions to DB ─────────────────────────────────────

async function upsertSessions(
  extracted: ExtractedSession[],
  schoolId: number,
  crawlUrl: string
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let updated = 0;
  const now = new Date();

  for (const s of extracted) {
    try {
      await db
        .insert(sessions)
        .values({
          id: s.id,
          schoolId,
          title: s.title,
          type: s.type,
          description: s.description,
          dates: s.dates,
          time: s.time ?? undefined,
          duration: s.duration ?? undefined,
          registrationUrl: s.registrationUrl,
          isRolling: s.isRolling,
          lastCrawledAt: now,
          crawlSourceUrl: crawlUrl,
        })
        .onDuplicateKeyUpdate({
          set: {
            title: s.title,
            type: s.type,
            description: s.description,
            dates: s.dates,
            time: s.time ?? undefined,
            duration: s.duration ?? undefined,
            registrationUrl: s.registrationUrl,
            isRolling: s.isRolling,
            lastCrawledAt: now,
            crawlSourceUrl: crawlUrl,
          },
        });
      updated++;
    } catch (err) {
      console.error(`[Crawler] Failed to upsert session ${s.id}:`, err);
    }
  }

  return updated;
}

// ── Seed static data on first run ─────────────────────────────

export async function seedStaticSessions(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select({ id: sessions.id }).from(sessions).limit(1);
  if (existing.length > 0) {
    console.log("[Crawler] Sessions table already seeded, skipping.");
    return;
  }

  console.log("[Crawler] Seeding static sessions into DB...");
  const now = new Date();

  for (const s of allSessions) {
    try {
      await db.insert(sessions).ignore().values({
        id: s.id,
        schoolId: s.schoolId,
        title: s.title,
        type: s.type,
        description: s.description,
        dates: s.dates,
        time: s.time,
        duration: s.duration,
        registrationUrl: s.registrationUrl,
        isRolling: s.isRolling ?? false,
        lastCrawledAt: now,
        crawlSourceUrl: null,
      });
    } catch (err) {
      console.error(`[Crawler] Failed to seed session ${s.id}:`, err);
    }
  }

  console.log(`[Crawler] Seeded ${allSessions.length} static sessions.`);
}

// ── Crawl a single school ─────────────────────────────────────

export async function crawlSchool(schoolId: number): Promise<CrawlResult> {
  const school = allSchools.find((s) => s.id === schoolId);
  if (!school) {
    return {
      schoolId,
      schoolName: "Unknown",
      crawlUrl: "",
      status: "failed",
      sessionsFound: 0,
      sessionsUpdated: 0,
      errorMessage: "School not found in static data",
    };
  }

  const crawlUrl = school.registrationPage;
  console.log(`[Crawler] Crawling ${school.name} → ${crawlUrl}`);

  let rawHtml = "";
  let errorMessage: string | undefined;
  let status: "success" | "failed" | "partial" = "success";
  let sessionsFound = 0;
  let sessionsUpdated = 0;

  try {
    rawHtml = await fetchWithTimeout(crawlUrl);
    const pageText = stripHtml(rawHtml);
    const extracted = await extractSessionsWithAI(
      pageText,
      school.id,
      school.name,
      crawlUrl
    );

    sessionsFound = extracted.length;

    if (extracted.length > 0) {
      sessionsUpdated = await upsertSessions(extracted, school.id, crawlUrl);
    } else {
      status = "partial";
      errorMessage = "No upcoming events found on page";
    }
  } catch (err: unknown) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Crawler] Error crawling ${school.name}:`, errorMessage);
  }

  // ── Compute consecutive failures ────────────────────────────
  let consecutiveFailures = 0;
  try {
    const db = await getDb();
    if (db) {
      // Get the last N logs for this school to count consecutive failures
      const recentLogs = await db
        .select({ status: crawlLogs.status, consecutiveFailures: crawlLogs.consecutiveFailures })
        .from(crawlLogs)
        .where(eq(crawlLogs.schoolId, school.id))
        .orderBy(desc(crawlLogs.createdAt))
        .limit(1);

      const lastConsecutive = recentLogs[0]?.consecutiveFailures ?? 0;
      if (status === "failed") {
        consecutiveFailures = lastConsecutive + 1;
      } else {
        consecutiveFailures = 0; // reset on success/partial
      }

      // Alert owner if threshold reached
      if (consecutiveFailures === CONSECUTIVE_FAIL_ALERT_THRESHOLD) {
        notifyOwner({
          title: `⚠️ AdmitLens 爬取告警：${school.name}`,
          content: `${school.name} 已连续 ${consecutiveFailures} 次爬取失败。\n最新错误：${errorMessage ?? "未知错误"}\n请检查官网链接是否已变更：${crawlUrl}`,
        }).catch(console.error);
        console.warn(`[Crawler] ALERT: ${school.name} has failed ${consecutiveFailures} times consecutively`);
      }
    }
  } catch (err) {
    console.error("[Crawler] Failed to compute consecutive failures:", err);
  }

  // ── Write crawl log ───────────────────────────────────────────
  try {
    const db = await getDb();
    if (db) {
      await db.insert(crawlLogs).values({
        schoolId: school.id,
        schoolName: school.name,
        crawlUrl,
        status,
        sessionsFound,
        sessionsUpdated,
        consecutiveFailures,
        errorMessage,
        rawContent: rawHtml.slice(0, 2000), // store first 2KB for debugging
      });
    }
  } catch (logErr) {
    console.error("[Crawler] Failed to write crawl log:", logErr);
  }

  return {
    schoolId: school.id,
    schoolName: school.name,
    crawlUrl,
    status,
    sessionsFound,
    sessionsUpdated,
    errorMessage,
  };
}

// ── Crawl all schools ─────────────────────────────────────────

export async function crawlAllSchools(): Promise<CrawlResult[]> {
  console.log(`[Crawler] Starting full crawl of ${allSchools.length} schools...`);
  const results: CrawlResult[] = [];

  // Process schools sequentially to avoid rate limiting
  for (const school of allSchools) {
    const result = await crawlSchool(school.id);
    results.push(result);

    // Polite delay between requests: 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const partial = results.filter((r) => r.status === "partial").length;
  const totalNew = results.reduce((sum, r) => sum + r.sessionsUpdated, 0);

  console.log(
    `[Crawler] Full crawl complete: ${succeeded} success, ${partial} partial, ${failed} failed, ${totalNew} sessions updated`
  );

  // ── Notify subscribers if new sessions were found ───────────────────
  if (totalNew > 0) {
    try {
      const db = await getDb();
      if (db) {
        const activeSubscribers = await db
          .select({ email: subscribers.email })
          .from(subscribers)
          .where(eq(subscribers.active, true));

        if (activeSubscribers.length > 0) {
          const successSchools = results
            .filter((r) => r.status === "success" && r.sessionsUpdated > 0)
            .map((r) => r.schoolName)
            .join("、");

          // Notify owner with subscriber summary (Manus notification is owner-only)
          await notifyOwner({
            title: `📅 AdmitLens 有新活动，已通知 ${activeSubscribers.length} 位订阅者`,
            content: `本次爬取共更新 ${totalNew} 场活动，涉及院校：${successSchools || "无"}。\n订阅者列表（${activeSubscribers.length} 人）：${activeSubscribers.slice(0, 10).map((s) => s.email).join("、")}${activeSubscribers.length > 10 ? " ...等" : ""}`,
          });
          console.log(`[Crawler] Notified owner about ${activeSubscribers.length} subscribers with new sessions`);
        }
      }
    } catch (notifyErr) {
      console.error("[Crawler] Failed to notify subscribers:", notifyErr);
    }
  }

  return results;
}
