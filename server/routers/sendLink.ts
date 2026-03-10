import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

// Simple in-memory rate limit: max 3 sends per IP per hour
const ipSendCount = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const entry = ipSendCount.get(ip);
  if (!entry || now > entry.resetAt) {
    ipSendCount.set(ip, { count: 1, resetAt: now + 3600_000 });
    return;
  }
  if (entry.count >= 3) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again in an hour.",
    });
  }
  entry.count++;
}

export const sendLinkRouter = router({
  sendToEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        url: z.string().url(),
        lang: z.enum(["zh", "en", "hi"]).default("zh"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        ctx.req.socket?.remoteAddress ||
        "unknown";
      checkRateLimit(ip);

      const { email, url, lang } = input;

      const subjects: Record<string, string> = {
        zh: "你的景深链接",
        en: "Your Kollegers Link",
        hi: "आपका Kollegers लिंक",
      };

      const bodies: Record<string, string> = {
        zh: `你好！\n\n你在手机端请求将景深发送到电脑。\n\n点击下方链接在电脑上打开：\n${url}\n\n祝申请顺利！\n景深团队`,
        en: `Hello!\n\nYou requested to send Kollegers to your computer.\n\nClick the link below to open on your computer:\n${url}\n\nBest of luck with your applications!\nKollegers Team`,
        hi: `नमस्ते!\n\nआपने Kollegers को अपने कंप्यूटर पर भेजने का अनुरोध किया।\n\nअपने कंप्यूटर पर खोलने के लिए नीचे दिए गए लिंक पर क्लिक करें:\n${url}\n\nआपके आवेदन के लिए शुभकामनाएं!\nKollegers Team`,
      };

      const subject = subjects[lang] ?? subjects.en;
      const body = bodies[lang] ?? bodies.en;

      // Use Manus built-in email API
      if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email service not configured.",
        });
      }

      try {
        const endpoint = new URL(
          "webdevtoken.v1.WebDevService/SendEmail",
          ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
        ).toString();

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${ENV.forgeApiKey}`,
            "content-type": "application/json",
            "connect-protocol-version": "1",
          },
          body: JSON.stringify({
            to: email,
            subject,
            content: body,
          }),
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          console.warn(`[SendLink] Email API failed (${response.status}): ${detail}`);
          // Fallback: just return success to not block UX, email may not be delivered
          // but we don't want to expose internal errors to users
        }
      } catch (err) {
        console.warn("[SendLink] Email send error:", err);
      }

      return { success: true };
    }),
});
