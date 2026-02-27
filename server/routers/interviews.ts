/**
 * interviews router
 * ──────────────────────────────────────────────────────────────
 * tRPC procedures for interview deadline verification.
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { interviewVerifications } from "../../drizzle/schema";
import { desc } from "drizzle-orm";
import {
  verifySchoolDeadline,
  verifyAllDeadlines,
} from "../interviewCrawler";

export const interviewsRouter = router({
  /**
   * Get all verification results (public — shows status to users).
   */
  verifications: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(interviewVerifications)
      .orderBy(desc(interviewVerifications.lastVerifiedAt));
  }),

  /**
   * Trigger verification for a single school (admin only).
   */
  verifyOne: protectedProcedure
    .input(z.object({ schoolId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin only");
      }
      const result = await verifySchoolDeadline(input.schoolId);
      return result;
    }),

  /**
   * Trigger full verification of all schools with deadlines (admin only).
   * Runs in background, returns immediately.
   */
  verifyAll: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin only");
    }
    // Run in background
    verifyAllDeadlines().catch(console.error);
    return {
      started: true,
      message: `Starting verification of all ${20} schools with deadlines...`,
    };
  }),
});
