/**
 * subscribers router
 * ──────────────────────────────────────────────────────────────
 * Handles email subscription management.
 */

import crypto from "crypto";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { subscribers } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendEmail, buildSubscribeConfirmationEmail } from "../_core/email";

export const subscribersRouter = router({
  /**
   * Subscribe an email address.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        regions: z.array(z.string()).optional(),
        origin: z.string().optional(),
        lang: z.enum(["zh", "en", "hi"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Generate a unique unsubscribe token
      const unsubscribeToken = crypto.randomBytes(32).toString("hex");

      await db
        .insert(subscribers)
        .values({
          email: input.email,
          regions: input.regions ?? [],
          active: true,
          unsubscribeToken,
        })
        .onDuplicateKeyUpdate({
          set: {
            active: true,
            regions: input.regions ?? [],
            // Keep existing token if already set, only set on first subscribe
          },
        });

      // Fetch the stored token (may differ if this is a re-subscribe)
      const [row] = await db
        .select({ unsubscribeToken: subscribers.unsubscribeToken })
        .from(subscribers)
        .where(eq(subscribers.email, input.email))
        .limit(1);

      const token = row?.unsubscribeToken ?? unsubscribeToken;
      const origin = input.origin ?? "https://www.kollegers.com";
      const unsubscribeUrl = `${origin}/unsubscribe?token=${token}`;

      // Send confirmation email (fire-and-forget)
      const emailContent = buildSubscribeConfirmationEmail({
        unsubscribeUrl,
        lang: (input.lang as "zh" | "en" | "hi") ?? "zh",
      });
      sendEmail({
        to: input.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }).catch(() => {/* ignore email errors */});

      // Notify owner of new subscriber (fire-and-forget)
      notifyOwner({
        title: "新订阅者",
        content: `📬 ${input.email} 订阅了活动提醒${input.regions && input.regions.length > 0 ? `，关注地区：${input.regions.join(", ")}` : ""}`,
      }).catch(() => {/* ignore notification errors */});

      return { success: true };
    }),

  /**
   * Unsubscribe an email address.
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(subscribers)
        .set({ active: false })
        .where(eq(subscribers.email, input.email));

      return { success: true };
    }),

  /**
   * Unsubscribe by token — used in one-click unsubscribe links from emails.
   * No authentication required; the token acts as a bearer credential.
   */
  unsubscribeByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [row] = await db
        .select({ id: subscribers.id, email: subscribers.email, active: subscribers.active })
        .from(subscribers)
        .where(eq(subscribers.unsubscribeToken, input.token))
        .limit(1);

      if (!row) {
        // Token not found — return success anyway to avoid enumeration
        return { success: true, alreadyUnsubscribed: true };
      }

      if (!row.active) {
        return { success: true, alreadyUnsubscribed: true };
      }

      await db
        .update(subscribers)
        .set({ active: false })
        .where(eq(subscribers.id, row.id));

      return { success: true, alreadyUnsubscribed: false, email: row.email };
    }),

  /**
   * List all active subscribers (admin only).
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(500).default(200) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(subscribers)
        .where(eq(subscribers.active, true))
        .orderBy(desc(subscribers.createdAt))
        .limit(input.limit);
    }),

  /**
   * Get subscriber count (public, for display).
   */
  count: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0 };

    const rows = await db
      .select({ id: subscribers.id })
      .from(subscribers)
      .where(eq(subscribers.active, true));

    return { count: rows.length };
  }),

  /**
   * Full subscriber stats for admin dashboard.
   * Returns totals, region breakdown, and full list.
   */
  adminStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admin only");
    const db = await getDb();
    if (!db) return { total: 0, active: 0, inactive: 0, regionBreakdown: [], list: [] };

    const all = await db
      .select()
      .from(subscribers)
      .orderBy(desc(subscribers.createdAt));

    const active = all.filter((s) => s.active);
    const inactive = all.filter((s) => !s.active);

    // Build region breakdown from active subscribers
    const regionMap = new Map<string, number>();
    for (const sub of active) {
      const regions = (sub.regions as string[] | null) ?? [];
      if (regions.length === 0) {
        regionMap.set("未指定", (regionMap.get("未指定") ?? 0) + 1);
      } else {
        for (const r of regions) {
          regionMap.set(r, (regionMap.get(r) ?? 0) + 1);
        }
      }
    }

    const regionBreakdown = Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: all.length,
      active: active.length,
      inactive: inactive.length,
      regionBreakdown,
      list: all.map((s) => ({
        id: s.id,
        email: s.email,
        active: s.active,
        regions: (s.regions as string[] | null) ?? [],
        createdAt: s.createdAt,
      })),
    };
  }),
});
