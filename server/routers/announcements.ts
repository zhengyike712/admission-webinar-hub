/**
 * announcements.ts
 * tRPC router for site-wide announcement banners.
 * Public: getActive (anyone can read active announcements)
 * Admin: create, update, delete, list (all)
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { announcements } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

/** Reusable admin guard */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

const announcementInput = z.object({
  title: z.string().min(1).max(256),
  content: z.string().min(1),
  link: z.string().url().optional().nullable(),
  linkText: z.string().max(64).optional().nullable(),
  type: z.enum(["info", "success", "warning", "urgent"]).default("info"),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  expiresAt: z.date().optional().nullable(),
});

export const announcementsRouter = router({
  /** Public: returns the single highest-priority active announcement */
  getActive: publicProcedure.query(async () => {
    const now = new Date();
    const rows = await db
      .select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now))
        )
      )
      .orderBy(desc(announcements.priority), desc(announcements.createdAt))
      .limit(5);
    return rows;
  }),

  /** Admin: list all announcements */
  list: adminProcedure.query(async () => {
    return db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }),

  /** Admin: create a new announcement */
  create: adminProcedure.input(announcementInput).mutation(async ({ input }) => {
    const [result] = await db.insert(announcements).values({
      title: input.title,
      content: input.content,
      link: input.link ?? null,
      linkText: input.linkText ?? null,
      type: input.type,
      isActive: input.isActive,
      priority: input.priority,
      expiresAt: input.expiresAt ?? null,
    });
    return { id: (result as any).insertId };
  }),

  /** Admin: update an existing announcement */
  update: adminProcedure
    .input(z.object({ id: z.number().int(), data: announcementInput.partial() }))
    .mutation(async ({ input }) => {
      await db
        .update(announcements)
        .set({
          ...input.data,
          link: input.data.link ?? null,
          linkText: input.data.linkText ?? null,
          expiresAt: input.data.expiresAt ?? null,
        })
        .where(eq(announcements.id, input.id));
      return { success: true };
    }),

  /** Admin: toggle isActive */
  toggleActive: adminProcedure
    .input(z.object({ id: z.number().int(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await db
        .update(announcements)
        .set({ isActive: input.isActive })
        .where(eq(announcements.id, input.id));
      return { success: true };
    }),

  /** Admin: delete an announcement */
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),
});
