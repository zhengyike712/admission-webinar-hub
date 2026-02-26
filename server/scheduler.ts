/**
 * scheduler.ts
 * ──────────────────────────────────────────────────────────────
 * Runs the crawler on a daily schedule.
 * Called once at server startup; uses setInterval to re-run every 24h.
 *
 * Schedule: every day at UTC 02:00 (Beijing time 10:00)
 */

import { crawlAllSchools, seedStaticSessions } from "./crawler";
import { notifyOwner } from "./_core/notification";

let schedulerStarted = false;

function msUntilNextRun(): number {
  const now = new Date();
  // Target: 02:00 UTC daily
  const next = new Date(now);
  next.setUTCHours(2, 0, 0, 0);
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function runCrawl(): Promise<void> {
  console.log("[Scheduler] Starting scheduled crawl...");
  try {
    const results = await crawlAllSchools();
    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const partial = results.filter((r) => r.status === "partial").length;
    const totalNew = results.reduce((sum, r) => sum + r.sessionsUpdated, 0);

    const summary = `每日爬虫完成：${succeeded} 成功 / ${partial} 部分 / ${failed} 失败，共更新 ${totalNew} 场活动`;
    console.log(`[Scheduler] ${summary}`);

    // Notify owner via Manus notification
    await notifyOwner({
      title: "AdmitLens 每日数据更新",
      content: summary,
    });
  } catch (err) {
    console.error("[Scheduler] Crawl run failed:", err);
  }
}

function scheduleNextRun(): void {
  const delay = msUntilNextRun();
  const nextRunTime = new Date(Date.now() + delay).toISOString();
  console.log(`[Scheduler] Next crawl scheduled at ${nextRunTime} (in ${Math.round(delay / 60000)} min)`);

  setTimeout(async () => {
    await runCrawl();
    scheduleNextRun(); // schedule the next one
  }, delay);
}

export async function startScheduler(): Promise<void> {
  if (schedulerStarted) return;
  schedulerStarted = true;

  console.log("[Scheduler] Initializing...");

  // 1. Seed static data on first boot (no-op if already seeded)
  await seedStaticSessions();

  // 2. Schedule daily crawl
  scheduleNextRun();

  console.log("[Scheduler] Ready. Static data seeded, daily crawl scheduled.");
}
