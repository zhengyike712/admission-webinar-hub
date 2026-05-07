import "dotenv/config";
import { crawlAllSchools } from "../server/crawler";

console.log("[Manual Crawl] Starting...");
crawlAllSchools()
  .then((results) => {
    const ok = results.filter((r) => r.status === "success").length;
    const partial = results.filter((r) => r.status === "partial").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const updated = results.reduce((s, r) => s + r.sessionsUpdated, 0);
    const jina = results.filter((r) => r.fetchMethod === "jina").length;
    console.log(`\n[Manual Crawl] Done: ${ok} success, ${partial} partial, ${failed} failed`);
    console.log(`[Manual Crawl] ${updated} sessions updated | ${jina}/${results.length} via Jina`);
    console.log("\nPer-school breakdown:");
    results.forEach((r) => {
      const icon = r.status === "success" ? "✓" : r.status === "partial" ? "~" : "✗";
      console.log(`  ${icon} [${r.fetchMethod.toUpperCase()}] ${r.schoolName}: ${r.sessionsUpdated} updated${r.errorMessage ? ` — ${r.errorMessage}` : ""}`);
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Manual Crawl] Fatal error:", err);
    process.exit(1);
  });
