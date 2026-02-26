/**
 * sessions router
 * ──────────────────────────────────────────────────────────────
 * Provides tRPC procedures for querying and managing sessions.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sessions, crawlLogs } from "../../drizzle/schema";
import { desc, eq, and, isNotNull } from "drizzle-orm";
import { crawlSchool, crawlAllSchools, seedStaticSessions } from "../crawler";

export const sessionsRouter = router({
  /**
   * List all sessions from DB, with optional region filter.
   * Falls back to empty array if DB is unavailable.
   */
  list: publicProcedure
    .input(
      z.object({
        region: z.enum(["All", "US", "UK", "HK", "AU"]).optional().default("All"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { sessions: [], source: "unavailable" as const };

      const rows = await db.select().from(sessions);

      // Filter by region using schoolId ranges:
      // US: 1–99, UK: 100–199, HK: 200–299, AU: 300–399
      const filtered =
        input.region === "All"
          ? rows
          : rows.filter((s) => {
              if (input.region === "US") return s.schoolId >= 1 && s.schoolId <= 99;
              if (input.region === "UK") return s.schoolId >= 100 && s.schoolId <= 199;
              if (input.region === "HK") return s.schoolId >= 200 && s.schoolId <= 299;
              if (input.region === "AU") return s.schoolId >= 300 && s.schoolId <= 399;
              return true;
            });

      return { sessions: filtered, source: "db" as const };
    }),

  /**
   * Get the latest crawl log entries for the admin dashboard.
   */
  crawlLogs: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(crawlLogs)
        .orderBy(desc(crawlLogs.createdAt))
        .limit(input.limit);
    }),

  /**
   * Manually trigger a crawl for a specific school (admin only).
   */
  triggerCrawl: protectedProcedure
    .input(z.object({ schoolId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin only");
      }
      const result = await crawlSchool(input.schoolId);
      return result;
    }),

  /**
   * Manually trigger a full crawl of all schools (admin only).
   */
  triggerFullCrawl: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin only");
    }
    // Run in background, return immediately
    crawlAllSchools().catch(console.error);
    return { started: true, message: "Full crawl started in background" };
  }),

  /**
   * Re-seed static data (admin only, useful for reset).
   */
  reseed: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin only");
    }
    await seedStaticSessions();
    return { success: true };
  }),
});
