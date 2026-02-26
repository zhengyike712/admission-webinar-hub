/**
 * subscribers router
 * ──────────────────────────────────────────────────────────────
 * Handles email subscription management.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { subscribers } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const subscribersRouter = router({
  /**
   * Subscribe an email address.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        regions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .insert(subscribers)
        .values({
          email: input.email,
          regions: input.regions ?? [],
          active: true,
        })
        .onDuplicateKeyUpdate({
          set: {
            active: true,
            regions: input.regions ?? [],
          },
        });

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
});
