/**
 * interviewCrawler.ts
 * ──────────────────────────────────────────────────────────────
 * Deadline verification crawler for interview portal data.
 *
 * Flow:
 *   1. For each school with a known deadline in the static data,
 *      fetch the school's interview portal page
 *   2. Strip HTML → plain text
 *   3. Call LLM to extract the interview request deadline
 *   4. Compare with static data; mark as "ok", "changed", or "not_found"
 *   5. Upsert into `interview_verifications` table
 *   6. Notify owner if any deadlines have changed
 */

import { getDb } from "./db";
import { interviewVerifications } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { interviewData } from "../client/src/data/interviews";

// Only verify schools that have a deadline (applicant_requests method)
const SCHOOLS_WITH_DEADLINES = interviewData.filter(
  (s) => s.available && s.requestMethod === "applicant_requests" && s.deadline
);

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

// ── Fetch with timeout ────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JingShenBot/1.0; +https://www.kollegers.com)",
      },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── LLM deadline extraction ───────────────────────────────────

interface DeadlineExtraction {
  deadline: string | null; // YYYY-MM-DD or null
  rawText: string | null;  // Raw text mentioning the deadline
  confidence: "high" | "medium" | "low" | "not_found";
}

async function extractDeadlineWithLLM(
  pageText: string,
  schoolName: string,
  staticDeadline: string
): Promise<DeadlineExtraction> {
  const truncated = pageText.slice(0, 6000);
  const prompt = `You are analyzing a university admissions interview page for ${schoolName}.

The page content is:
---
${truncated}
---

The current static deadline we have on record is: ${staticDeadline}

Please extract the interview REQUEST deadline (the date by which students must submit their interview request). 
This is different from the application deadline — it's specifically when students need to request/sign up for an interview.

Return JSON with:
- deadline: ISO date string (YYYY-MM-DD) if found, null otherwise
- rawText: the exact text from the page mentioning the deadline (max 200 chars), null if not found
- confidence: "high" if you found a clear date, "medium" if somewhat ambiguous, "low" if inferred, "not_found" if no deadline mentioned`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You extract structured data from university admissions pages. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "deadline_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              deadline: { type: ["string", "null"], description: "ISO date YYYY-MM-DD or null" },
              rawText: { type: ["string", "null"], description: "Raw text mentioning the deadline" },
              confidence: { type: "string", enum: ["high", "medium", "low", "not_found"] },
            },
            required: ["deadline", "rawText", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) return { deadline: null, rawText: null, confidence: "not_found" };
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    return JSON.parse(content) as DeadlineExtraction;
  } catch {
    return { deadline: null, rawText: null, confidence: "not_found" };
  }
}

// ── Verify a single school ────────────────────────────────────

export interface VerificationResult {
  id: string;
  schoolName: string;
  staticDeadline: string;
  verifiedDeadline: string | null;
  rawDeadlineText: string | null;
  status: "ok" | "changed" | "not_found" | "error";
  matches: boolean | null;
  errorMessage?: string;
}

export async function verifySchoolDeadline(schoolId: string): Promise<VerificationResult> {
  const school = SCHOOLS_WITH_DEADLINES.find((s) => s.id === schoolId);
  if (!school || !school.deadline) {
    return {
      id: schoolId,
      schoolName: schoolId,
      staticDeadline: "",
      verifiedDeadline: null,
      rawDeadlineText: null,
      status: "error",
      matches: null,
      errorMessage: "School not found or has no deadline",
    };
  }

  const db = await getDb();

  try {
    // Fetch the portal page
    const html = await fetchWithTimeout(school.portalUrl);
    const text = stripHtml(html);
    const rawContent = text.slice(0, 3000);

    // Extract deadline with LLM
    const extraction = await extractDeadlineWithLLM(text, school.schoolName, school.deadline);

    // Determine status
    let status: "ok" | "changed" | "not_found" | "error" = "not_found";
    let matches: boolean | null = null;

    if (extraction.confidence !== "not_found" && extraction.deadline) {
      matches = extraction.deadline === school.deadline;
      status = matches ? "ok" : "changed";
    }

    const result: VerificationResult = {
      id: school.id,
      schoolName: school.schoolName,
      staticDeadline: school.deadline,
      verifiedDeadline: extraction.deadline,
      rawDeadlineText: extraction.rawText,
      status,
      matches,
    };

    // Upsert into DB
    if (db) {
      await db
        .insert(interviewVerifications)
        .values({
          id: school.id,
          schoolName: school.schoolName,
          portalUrl: school.portalUrl,
          verifiedDeadline: extraction.deadline ?? undefined,
          rawDeadlineText: extraction.rawText ?? undefined,
          matches: matches ?? undefined,
          status,
          rawContent,
          lastVerifiedAt: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            verifiedDeadline: extraction.deadline ?? undefined,
            rawDeadlineText: extraction.rawText ?? undefined,
            matches: matches ?? undefined,
            status,
            rawContent,
            lastVerifiedAt: new Date(),
          },
        });
    }

    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const result: VerificationResult = {
      id: school.id,
      schoolName: school.schoolName,
      staticDeadline: school.deadline,
      verifiedDeadline: null,
      rawDeadlineText: null,
      status: "error",
      matches: null,
      errorMessage,
    };

    // Upsert error state into DB
    if (db) {
      await db
        .insert(interviewVerifications)
        .values({
          id: school.id,
          schoolName: school.schoolName,
          portalUrl: school.portalUrl,
          status: "error",
          errorMessage,
          lastVerifiedAt: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            status: "error",
            errorMessage,
            lastVerifiedAt: new Date(),
          },
        });
    }

    return result;
  }
}

// ── Verify all schools with deadlines ────────────────────────

export async function verifyAllDeadlines(): Promise<{
  total: number;
  ok: number;
  changed: number;
  not_found: number;
  errors: number;
  changedSchools: VerificationResult[];
}> {
  const results: VerificationResult[] = [];

  // Process sequentially to avoid rate limiting
  for (const school of SCHOOLS_WITH_DEADLINES) {
    console.log(`[InterviewCrawler] Verifying ${school.schoolName}...`);
    const result = await verifySchoolDeadline(school.id);
    results.push(result);
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 1500));
  }

  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    changed: results.filter((r) => r.status === "changed").length,
    not_found: results.filter((r) => r.status === "not_found").length,
    errors: results.filter((r) => r.status === "error").length,
    changedSchools: results.filter((r) => r.status === "changed"),
  };

  // Notify owner if any deadlines have changed
  if (summary.changed > 0) {
    const changedList = summary.changedSchools
      .map(
        (s) =>
          `• ${s.schoolName}: static=${s.staticDeadline}, found=${s.verifiedDeadline ?? "N/A"}\n  Raw: ${s.rawDeadlineText ?? "N/A"}`
      )
      .join("\n");

    await notifyOwner({
      title: `⚠️ 面试截止日期变更提醒 (${summary.changed} 所学校)`,
      content: `以下学校的面试申请截止日期与静态数据不符，请及时更新 interviews.ts：\n\n${changedList}\n\n验证摘要：共 ${summary.total} 所，匹配 ${summary.ok}，变更 ${summary.changed}，未找到 ${summary.not_found}，错误 ${summary.errors}`,
    });
  }

  console.log(
    `[InterviewCrawler] Done. Total=${summary.total} OK=${summary.ok} Changed=${summary.changed} NotFound=${summary.not_found} Errors=${summary.errors}`
  );

  return summary;
}

// ── Get all verification results from DB ─────────────────────

export async function getVerificationResults() {
  const db = await getDb();
  if (!db) return [];
  const { interviewVerifications: iv } = await import("../drizzle/schema");
  return db.select().from(iv).orderBy(iv.lastVerifiedAt);
}
