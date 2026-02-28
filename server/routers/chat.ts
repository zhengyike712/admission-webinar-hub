import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { chatSessions, chatMessages } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const chatRouter = router({
  /**
   * Upsert a chat session with the latest browsing profile.
   * Works for both authenticated and anonymous users.
   * Anonymous users pass a client-generated sessionId stored in localStorage.
   */
  upsertSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1).max(64),
        browsingProfile: z.object({
          schoolTypes: z.record(z.string(), z.number()),
          regions: z.record(z.string(), z.number()),
          sessionTypes: z.record(z.string(), z.number()),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id ?? null;
      const db = await getDb();
      if (!db) return { ok: false };
      await db
        .insert(chatSessions)
        .values({
          id: input.sessionId,
          userId,
          browsingProfile: input.browsingProfile,
        })
        .onDuplicateKeyUpdate({
          set: {
            browsingProfile: input.browsingProfile,
            ...(userId !== null ? { userId } : {}),
          },
        });
      return { ok: true };
    }),

  /**
   * Append messages to a session (batch insert).
   */
  saveMessages: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1).max(64),
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      if (input.messages.length === 0) return { ok: true };
      const db = await getDb();
      if (!db) return { ok: false };
      await db.insert(chatMessages).values(
        input.messages.map((m) => ({
          sessionId: input.sessionId,
          role: m.role,
          content: m.content,
        }))
      );
      return { ok: true };
    }),

  /**
   * Fetch all messages for a session (for logged-in users to restore history).
   */
  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string().min(1).max(64) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(asc(chatMessages.createdAt));
      return rows;
    }),

  /**
   * Delete all messages in a session (clear chat history).
   */
  clearMessages: publicProcedure
    .input(z.object({ sessionId: z.string().min(1).max(64) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { ok: false };
      await db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId));
      return { ok: true };
    }),
});
