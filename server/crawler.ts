/**
 * crawler.ts
 * ──────────────────────────────────────────────────────────────
 * Improved crawler with:
 *   - Jina Reader for JS-rendered pages (primary), direct fetch as fallback
 *   - Smart truncation: head + middle + tail sampling (25K chars total)
 *   - Stable session IDs derived from school + title (not LLM-generated)
 *   - Stale session cleanup after each school crawl
 *   - JS shell detection to skip bad LLM calls
 *   - Concurrent batch processing (5 schools at a time)
 *   - Retry with backoff on transient failures
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { crawlLogs, sessions, subscribers } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { allSchools, allSessions } from "../client/src/data/schools";

const CONSECUTIVE_FAIL_ALERT_THRESHOLD = 3;
const CRAWL_CONCURRENCY = 5;
const JINA_READER_BASE = "https://r.jina.ai/";

// ── Crawler LLM (Google Gemini, no Manus dependency) ──────────
// Priority: BUILT_IN_FORGE_API_KEY (Manus/Railway) → GOOGLE_API_KEY (local dev / self-hosted)

async function callLLM(systemPrompt: string, userContent: string, jsonSchema: object): Promise<string> {
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const apiKey = forgeKey || googleKey;
  if (!apiKey) throw new Error("No LLM API key found. Set BUILT_IN_FORGE_API_KEY or GOOGLE_API_KEY.");

  const apiUrl = forgeKey
    ? "https://forge.manus.im/v1/chat/completions"
    : "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_schema", json_schema: { name: "sessions_extraction", strict: true, schema: jsonSchema } },
      max_tokens: 4096,
    }),
  });

  if (!res.ok) throw new Error(`LLM API error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Types ─────────────────────────────────────────────────────

interface ExtractedSession {
  title: string;
  type: string;
  description: string;
  descriptionEn: string;
  dates: string[] | null;
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
  sessionsDeleted: number;
  fetchMethod: "jina" | "direct";
  errorMessage?: string;
}

// ── Stable ID ─────────────────────────────────────────────────
// Deterministic: same event always maps to the same DB row across crawl runs.

function makeSessionId(schoolId: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${schoolId}-${slug}`.slice(0, 127);
}

// ── HTML → plain text ─────────────────────────────────────────

function stripHtml(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<(br|p|div|li|h[1-6]|tr|td|th)[^>]*>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

// ── Smart truncation ──────────────────────────────────────────
// Events often appear in the middle or end of a page.
// Sample head + middle + tail to maximise coverage within token budget.

function smartTruncate(text: string, maxChars = 25000): string {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, 12000);
  const midStart = Math.floor(text.length / 2) - 4000;
  const mid = text.slice(midStart, midStart + 8000);
  const tail = text.slice(-5000);
  return `${head}\n\n[...page middle...]\n\n${mid}\n\n[...page end...]\n\n${tail}`;
}

// ── Fetch with timeout ────────────────────────────────────────

async function fetchRaw(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kollegers-Crawler/2.0; +https://kollegers.com)",
        Accept: "text/html,application/xhtml+xml,text/plain",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ── Page fetcher: Jina Reader → direct fallback ───────────────
// Jina Reader renders JavaScript and returns clean markdown.
// Falls back to direct fetch + HTML stripping if Jina fails or returns too little.

async function fetchPage(url: string): Promise<{ text: string; method: "jina" | "direct" }> {
  // Try Jina Reader first
  try {
    const jinaUrl = `${JINA_READER_BASE}${url}`;
    const raw = await fetchRaw(jinaUrl, 25000);
    if (raw.trim().length > 800) {
      return { text: raw, method: "jina" };
    }
  } catch {
    // Jina failed — fall through to direct
  }

  // Direct fetch + strip HTML
  const html = await fetchRaw(url, 15000);
  const text = stripHtml(html);
  return { text, method: "direct" };
}

// ── Retry wrapper ─────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 3000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// ── LLM extraction ────────────────────────────────────────────

function buildExtractPrompt(): string {
  return `You are an expert at extracting university admissions event information from web pages.
Today's date is ${new Date().toISOString().slice(0, 10)}.

Extract ALL upcoming virtual info sessions, webinars, open days, or admissions events.
Focus only on events scheduled in the future (today or later).
Return a JSON object with a "sessions" array. Each session must have:
- title: exact event title
- type: one of "General Info Session", "Up Close / Specialty", "Multi-College Session", "Regional Session", "Student Forum", "Financial Aid Session", "International Student Session"
- description: 1-2 sentence description in Chinese (简体中文)
- descriptionEn: 1-2 sentence description in English
- dates: array of "YYYY-MM-DD" strings for specific dates, or null if rolling/on-demand
- time: time string like "7:00 PM ET" or "2:00 PM GMT", or null
- duration: like "60 min" or "90 min", or null
- registrationUrl: the direct registration link (use the page URL if no specific link found)
- isRolling: true if the event is on-demand or has no fixed dates, false otherwise

If no upcoming events are found, return {"sessions": []}.
Only return valid JSON, no markdown fences.`;
}

const SESSION_JSON_SCHEMA = {
  type: "object",
  properties: {
    sessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          descriptionEn: { type: "string" },
          dates: { oneOf: [{ type: "array", items: { type: "string" } }, { type: "null" }] },
          time: { oneOf: [{ type: "string" }, { type: "null" }] },
          duration: { oneOf: [{ type: "string" }, { type: "null" }] },
          registrationUrl: { type: "string" },
          isRolling: { type: "boolean" },
        },
        required: ["title", "type", "description", "descriptionEn", "dates", "time", "duration", "registrationUrl", "isRolling"],
        additionalProperties: false,
      },
    },
  },
  required: ["sessions"],
  additionalProperties: false,
};

async function extractSessionsWithAI(
  pageText: string,
  schoolId: number,
  schoolName: string,
  pageUrl: string
): Promise<Array<ExtractedSession & { id: string }>> {
  const truncated = smartTruncate(pageText);
  const userContent = `University: ${schoolName}\nPage URL: ${pageUrl}\n\nPage content:\n${truncated}`;

  const rawContent = await callLLM(buildExtractPrompt(), userContent, SESSION_JSON_SCHEMA);
  if (!rawContent) return [];

  try {
    const parsed = JSON.parse(rawContent);
    return (parsed.sessions || []).map((s: ExtractedSession) => ({
      ...s,
      id: makeSessionId(schoolId, s.title),
    }));
  } catch {
    return [];
  }
}


// ── Upsert sessions to DB ─────────────────────────────────────

async function upsertSessions(
  extracted: Array<ExtractedSession & { id: string }>,
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
          // descriptionEn omitted until migration 0006 is applied
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
            // descriptionEn omitted until migration 0006 is applied
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

// ── Stale session cleanup ─────────────────────────────────────
// After a crawl, delete sessions for this school that:
//   (a) were NOT found in the current crawl, AND
//   (b) have no future dates (i.e. all dates are in the past)
// Rolling sessions are never deleted.

async function cleanupStaleSessions(schoolId: number, foundIds: string[]): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const today = new Date().toISOString().slice(0, 10);

  const existing = await db
    .select({ id: sessions.id, dates: sessions.dates, isRolling: sessions.isRolling })
    .from(sessions)
    .where(eq(sessions.schoolId, schoolId));

  const toDelete = existing
    .filter((s) => {
      if (foundIds.includes(s.id)) return false;
      if (s.isRolling) return false;
      if (!s.dates || (s.dates as string[]).length === 0) return false;
      return (s.dates as string[]).every((d) => d < today);
    })
    .map((s) => s.id);

  if (toDelete.length === 0) return 0;

  for (const id of toDelete) {
    try {
      await db.delete(sessions).where(eq(sessions.id, id));
    } catch (err) {
      console.error(`[Crawler] Failed to delete stale session ${id}:`, err);
    }
  }

  return toDelete.length;
}

// ── Seed static data ──────────────────────────────────────────

export async function seedStaticSessions(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  console.log("[Crawler] Seeding static sessions into DB (INSERT IGNORE)...");
  const now = new Date();
  let inserted = 0;

  for (const s of allSessions) {
    try {
      const result = await db.insert(sessions).ignore().values({
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
      if ((result as { affectedRows?: number }).affectedRows) inserted++;
    } catch (err) {
      console.error(`[Crawler] Failed to seed session ${s.id}:`, err);
    }
  }

  console.log(`[Crawler] Seed complete: ${inserted} new rows inserted (${allSessions.length} total).`);
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
      sessionsDeleted: 0,
      fetchMethod: "direct",
      errorMessage: "School not found in static data",
    };
  }

  const crawlUrl = school.registrationPage;
  console.log(`[Crawler] Crawling ${school.name} → ${crawlUrl}`);

  let rawPageText = "";
  let fetchMethod: "jina" | "direct" = "direct";
  let errorMessage: string | undefined;
  let status: "success" | "failed" | "partial" = "success";
  let sessionsFound = 0;
  let sessionsUpdated = 0;
  let sessionsDeleted = 0;

  try {
    const { text, method } = await withRetry(() => fetchPage(crawlUrl), 2, 4000);
    rawPageText = text;
    fetchMethod = method;

    // Detect JS shell — page rendered to almost nothing
    if (rawPageText.trim().length < 500) {
      status = "partial";
      errorMessage = `JS shell detected via ${method} (${rawPageText.trim().length} chars) — no renderable content`;
    } else {
      const extracted = await extractSessionsWithAI(rawPageText, school.id, school.name, crawlUrl);
      sessionsFound = extracted.length;

      if (extracted.length > 0) {
        sessionsUpdated = await upsertSessions(extracted, school.id, crawlUrl);
        sessionsDeleted = await cleanupStaleSessions(school.id, extracted.map((s) => s.id));
      } else {
        status = "partial";
        errorMessage = `No upcoming events found (${method}, ${rawPageText.length} chars)`;
      }
    }
  } catch (err: unknown) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Crawler] Error crawling ${school.name}:`, errorMessage);
  }

  // ── Consecutive failure tracking ──────────────────────────
  let consecutiveFailures = 0;
  try {
    const db = await getDb();
    if (db) {
      const recentLogs = await db
        .select({ status: crawlLogs.status, consecutiveFailures: crawlLogs.consecutiveFailures })
        .from(crawlLogs)
        .where(eq(crawlLogs.schoolId, school.id))
        .orderBy(desc(crawlLogs.createdAt))
        .limit(1);

      const lastConsecutive = recentLogs[0]?.consecutiveFailures ?? 0;
      consecutiveFailures = status === "failed" ? lastConsecutive + 1 : 0;

      if (consecutiveFailures === CONSECUTIVE_FAIL_ALERT_THRESHOLD) {
        notifyOwner({
          title: `⚠️ Kollegers 爬取告警：${school.name}`,
          content: `${school.name} 已连续 ${consecutiveFailures} 次爬取失败。\n最新错误：${errorMessage ?? "未知"}\n请检查：${crawlUrl}`,
        }).catch(console.error);
      }
    }
  } catch (err) {
    console.error("[Crawler] Failed to compute consecutive failures:", err);
  }

  // ── Write crawl log ───────────────────────────────────────
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
        errorMessage: errorMessage
          ? `[${fetchMethod.toUpperCase()}] ${errorMessage}`.slice(0, 500)
          : undefined,
        rawContent: rawPageText.slice(0, 2000),
      });
    }
  } catch (logErr) {
    console.error("[Crawler] Failed to write crawl log:", logErr);
  }

  console.log(
    `[Crawler] ${school.name}: ${status} via ${fetchMethod} — ` +
    `${sessionsFound} found, ${sessionsUpdated} updated, ${sessionsDeleted} stale deleted`
  );

  return {
    schoolId: school.id,
    schoolName: school.name,
    crawlUrl,
    status,
    sessionsFound,
    sessionsUpdated,
    sessionsDeleted,
    fetchMethod,
    errorMessage,
  };
}

// ── Crawl all schools (concurrent batches) ────────────────────

export async function crawlAllSchools(): Promise<CrawlResult[]> {
  console.log(`[Crawler] Starting full crawl of ${allSchools.length} schools (${CRAWL_CONCURRENCY} concurrent)...`);
  const results: CrawlResult[] = [];

  // Process in batches to balance speed vs. rate limits
  for (let i = 0; i < allSchools.length; i += CRAWL_CONCURRENCY) {
    const batch = allSchools.slice(i, i + CRAWL_CONCURRENCY);
    const batchResults = await Promise.all(batch.map((s) => crawlSchool(s.id)));
    results.push(...batchResults);

    // Brief pause between batches to be polite to both target sites and Jina
    if (i + CRAWL_CONCURRENCY < allSchools.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const partial = results.filter((r) => r.status === "partial").length;
  const jinaCount = results.filter((r) => r.fetchMethod === "jina").length;
  const totalUpdated = results.reduce((sum, r) => sum + r.sessionsUpdated, 0);
  const totalDeleted = results.reduce((sum, r) => sum + r.sessionsDeleted, 0);

  console.log(
    `[Crawler] Full crawl done: ${succeeded} success, ${partial} partial, ${failed} failed | ` +
    `${jinaCount}/${allSchools.length} via Jina | ` +
    `${totalUpdated} sessions updated, ${totalDeleted} stale deleted`
  );

  // ── Notify subscribers ────────────────────────────────────
  if (totalUpdated > 0) {
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

          await notifyOwner({
            title: `📅 Kollegers 有新活动，已通知 ${activeSubscribers.length} 位订阅者`,
            content: `本次爬取共更新 ${totalUpdated} 场活动，院校：${successSchools || "无"}。\n订阅者（${activeSubscribers.length} 人）：${activeSubscribers.slice(0, 10).map((s) => s.email).join("、")}${activeSubscribers.length > 10 ? " ...等" : ""}`,
          });
        }
      }
    } catch (notifyErr) {
      console.error("[Crawler] Failed to notify subscribers:", notifyErr);
    }
  }

  return results;
}
