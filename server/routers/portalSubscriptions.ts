/**
 * portalSubscriptions router
 *
 * Handles email subscriptions for decision release notifications.
 * - subscribe: add a subscription for a school/round
 * - unsubscribe: deactivate a subscription by email + schoolId + round
 * - checkNotifications: (internal/cron) scan for due notifications and send emails
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { portalSubscriptions } from "../../drizzle/schema";
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

// Simple in-memory rate limit: max 5 subscriptions per email per hour
const subscribeRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = subscribeRateLimit.get(email);
  if (!entry || now > entry.resetAt) {
    subscribeRateLimit.set(email, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export const portalSubscriptionsRouter = router({
  /**
   * Subscribe to a decision release notification.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(320),
        schoolId: z.number().int().positive(),
        schoolName: z.string().max(256),
        round: z.string().max(32),
        releaseDate: z.string().max(32),
      })
    )
    .mutation(async ({ input }) => {
      if (!checkRateLimit(input.email)) {
        throw new Error("Too many subscriptions. Please try again later.");
      }

      // Check if already subscribed
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(portalSubscriptions)
        .where(
          and(
            eq(portalSubscriptions.email, input.email),
            eq(portalSubscriptions.schoolId, input.schoolId),
            eq(portalSubscriptions.round, input.round)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Re-activate if previously unsubscribed
        if (!existing[0].active) {
          await db
            .update(portalSubscriptions)
            .set({ active: true, notified: false, notifiedAt: null })
            .where(eq(portalSubscriptions.id, existing[0].id));
        }
        return { success: true, alreadyExists: true };
      }

      await db.insert(portalSubscriptions).values({
        email: input.email,
        schoolId: input.schoolId,
        schoolName: input.schoolName,
        round: input.round,
        releaseDate: input.releaseDate,
        notified: false,
        active: true,
      });

      return { success: true, alreadyExists: false };
    }),

  /**
   * Unsubscribe from a decision release notification.
   */
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(320),
        schoolId: z.number().int().positive(),
        round: z.string().max(32),
      })
    )
    .mutation(async ({ input }) => {
      const db2 = await getDb();
      if (!db2) throw new Error("Database not available");
      await db2
        .update(portalSubscriptions)
        .set({ active: false })
        .where(
          and(
            eq(portalSubscriptions.email, input.email),
            eq(portalSubscriptions.schoolId, input.schoolId),
            eq(portalSubscriptions.round, input.round)
          )
        );
      return { success: true };
    }),

  /**
   * Check if an email is subscribed to a specific school/round.
   */
  checkSubscription: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(320),
        schoolId: z.number().int().positive(),
        round: z.string().max(32),
      })
    )
    .query(async ({ input }) => {
      const db3 = await getDb();
      if (!db3) return { subscribed: false };
      const result = await db3
        .select()
        .from(portalSubscriptions)
        .where(
          and(
            eq(portalSubscriptions.email, input.email),
            eq(portalSubscriptions.schoolId, input.schoolId),
            eq(portalSubscriptions.round, input.round),
            eq(portalSubscriptions.active, true)
          )
        )
        .limit(1);
      return { subscribed: result.length > 0 };
    }),

  /**
   * Internal: scan for due notifications and send emails.
   * Called by the scheduler daily.
   */
  processNotifications: publicProcedure.mutation(async () => {
    const db4 = await getDb();
    if (!db4) return { processed: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    // Find active, unnotified subscriptions where releaseDate <= today
    const due = await db4
      .select()
      .from(portalSubscriptions)
      .where(
        and(
          eq(portalSubscriptions.active, true),
          eq(portalSubscriptions.notified, false),
          lte(portalSubscriptions.releaseDate, todayStr)
        )
      );

    if (due.length === 0) return { processed: 0 };

    // Group by email for batching
    const byEmailMap: Record<string, typeof due> = {};
    for (const sub of due) {
      if (!byEmailMap[sub.email]) byEmailMap[sub.email] = [];
      byEmailMap[sub.email].push(sub);
    }

    let processed = 0;

    for (const [email, subs] of Object.entries(byEmailMap)) {
      const schoolList = subs
        .map((s) => `• ${s.schoolName} (${s.round})`)
        .join("\n");

      const content = `你订阅的以下学校申请结果今天应已发布，请前往景深查看各校 Portal：\n\n${schoolList}\n\n前往景深查看：https://www.kollegers.com/portals\n\n如不想继续接收提醒，可忽略此邮件。`;

      // Use notifyOwner as the email channel (sends to platform owner)
      // For user-facing emails, we log the intent and mark as notified
      await notifyOwner({
        title: `[景深] 结果提醒待发送 → ${email}`,
        content: `收件人: ${email}\n\n${content}`,
      });

      // Mark all as notified
      for (const sub of subs) {
        await db4
          .update(portalSubscriptions)
          .set({ notified: true, notifiedAt: new Date() })
          .where(eq(portalSubscriptions.id, sub.id));
        processed++;
      }
    }

    return { processed };
  }),
});
