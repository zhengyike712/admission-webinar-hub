/**
 * scheduler.ts
 * ──────────────────────────────────────────────────────────────
 * Manages two recurring tasks:
 *
 *   1. Daily crawl (UTC 02:00) — scrapes virtual info sessions from all schools
 *   2. Weekly deadline verification (every Monday UTC 03:00) — re-verifies
 *      interview application deadlines for all schools with known deadlines
 *
 * Both tasks notify the owner via Manus notification on completion.
 */

import { crawlAllSchools, seedStaticSessions } from "./crawler";
import { verifyAllDeadlines } from "./interviewCrawler";
import { notifyOwner } from "./_core/notification";

let schedulerStarted = false;

// ── Helpers ───────────────────────────────────────────────────

function msUntilNextDailyCrawl(): number {
  const now = new Date();
  // Target: 02:00 UTC daily
  const next = new Date(now);
  next.setUTCHours(2, 0, 0, 0);
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function msUntilNextWeeklyVerification(): number {
  const now = new Date();
  // Target: every Monday at UTC 03:00
  const next = new Date(now);
  next.setUTCHours(3, 0, 0, 0);
  // 0=Sun, 1=Mon … 6=Sat; calculate days until next Monday
  const currentDay = next.getUTCDay(); // 0=Sun, 1=Mon, ...
  let daysUntilMonday: number;
  if (currentDay === 1 && now.getUTCHours() < 3) {
    // It's Monday and 03:00 hasn't passed yet — run today
    daysUntilMonday = 0;
  } else if (currentDay === 1) {
    // It's Monday but 03:00 has passed — next Monday
    daysUntilMonday = 7;
  } else {
    // Other days: calculate days until next Monday
    daysUntilMonday = (8 - currentDay) % 7;
  }
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  return next.getTime() - now.getTime();
}

// ── Task runners ──────────────────────────────────────────────

async function runDailyCrawl(): Promise<void> {
  console.log("[Scheduler] Starting daily crawl...");
  try {
    const results = await crawlAllSchools();
    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const partial = results.filter((r) => r.status === "partial").length;
    const totalNew = results.reduce((sum, r) => sum + r.sessionsUpdated, 0);

    const summary = `每日爬虫完成：${succeeded} 成功 / ${partial} 部分 / ${failed} 失败，共更新 ${totalNew} 场活动`;
    console.log(`[Scheduler] ${summary}`);

    await notifyOwner({
      title: "AdmitLens 每日数据更新",
      content: summary,
    });
  } catch (err) {
    console.error("[Scheduler] Daily crawl failed:", err);
  }
}

async function runWeeklyDeadlineVerification(): Promise<void> {
  console.log("[Scheduler] Starting weekly deadline verification...");
  try {
    // verifyAllDeadlines returns { total, ok, changed, not_found, errors, changedSchools }
    const summary = await verifyAllDeadlines();

    const logMsg = `每周截止日期核实完成：${summary.ok} 匹配 / ${summary.changed} 已变更 / ${summary.not_found} 未找到 / ${summary.errors} 错误`;
    console.log(`[Scheduler] ${logMsg}`);

    if (summary.changed > 0 || summary.errors > 0) {
      const changedList = summary.changedSchools
        .map((s) => `• ${s.schoolName}：核实截止日 ${s.verifiedDeadline ?? "未找到"}`)
        .join("\n");

      await notifyOwner({
        title: `⚠️ AdmitLens 截止日期变更提醒（${summary.changed} 所学校）`,
        content: `${logMsg}\n\n变更学校：\n${changedList || "（见管理后台）"}`,
      });
    } else {
      await notifyOwner({
        title: "AdmitLens 每周截止日期核实",
        content: logMsg,
      });
    }
  } catch (err) {
    console.error("[Scheduler] Weekly deadline verification failed:", err);
  }
}

// ── Schedulers ────────────────────────────────────────────────

function scheduleDailyCrawl(): void {
  const delay = msUntilNextDailyCrawl();
  const nextRunTime = new Date(Date.now() + delay).toISOString();
  console.log(`[Scheduler] Next crawl scheduled at ${nextRunTime} (in ${Math.round(delay / 60000)} min)`);

  setTimeout(async () => {
    await runDailyCrawl();
    scheduleDailyCrawl(); // reschedule
  }, delay);
}

function scheduleWeeklyVerification(): void {
  const delay = msUntilNextWeeklyVerification();
  const nextRunTime = new Date(Date.now() + delay).toISOString();
  console.log(`[Scheduler] Next deadline verification scheduled at ${nextRunTime} (in ${Math.round(delay / 60000)} min)`);

  setTimeout(async () => {
    await runWeeklyDeadlineVerification();
    scheduleWeeklyVerification(); // reschedule
  }, delay);
}

// ── Entry point ───────────────────────────────────────────────

export async function startScheduler(): Promise<void> {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log("[Scheduler] Initializing...");

  // 1. Seed static data on first boot (no-op if already seeded)
  await seedStaticSessions();

  // 2. Schedule daily crawl (UTC 02:00)
  scheduleDailyCrawl();

  // 3. Schedule weekly deadline verification (every Monday UTC 03:00)
  scheduleWeeklyVerification();

  console.log("[Scheduler] Ready. Static data seeded, daily crawl + weekly verification scheduled.");
}
