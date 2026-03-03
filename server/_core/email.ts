/**
 * email.ts — Transactional email helper using nodemailer.
 *
 * Configure SMTP credentials via environment variables:
 *   EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASS
 *   EMAIL_FROM  (e.g. "景深 <noreply@admissionhub.com>")
 *
 * If credentials are not set, sendEmail() logs a warning and returns false
 * so the rest of the subscription flow is unaffected.
 */

import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransport() {
  const host = process.env.EMAIL_SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SMTP_PORT ?? "465", 10);
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    console.warn("[Email] SMTP not configured — skipping email to", opts.to);
    return false;
  }

  const from =
    process.env.EMAIL_FROM ?? process.env.EMAIL_SMTP_USER ?? "景深 <noreply@jingshen.app>";

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    console.log("[Email] Sent to", opts.to, "—", opts.subject);
    return true;
  } catch (err) {
    console.error("[Email] Failed to send to", opts.to, err);
    return false;
  }
}

/**
 * Build the HTML body for a subscription confirmation email.
 */
export function buildSubscribeConfirmationEmail(opts: {
  unsubscribeUrl: string;
  lang?: "zh" | "en" | "hi";
}): { subject: string; html: string; text: string } {
  const { unsubscribeUrl, lang = "zh" } = opts;

  if (lang === "en") {
    return {
      subject: "You're subscribed to Jingshen activity alerts",
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e7e5e4;max-width:480px;width:100%;">
        <tr><td style="padding:32px 32px 0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="8" stroke="#111" stroke-width="1.2"/>
              <circle cx="9" cy="9" r="4.5" stroke="#111" stroke-width="1.2"/>
              <circle cx="9" cy="9" r="1.5" fill="#111"/>
            </svg>
            <span style="font-size:14px;font-weight:700;color:#111;">Jingshen · 景深</span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px;">Subscription confirmed ✓</h1>
          <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0 0 16px;">
            You'll receive an email when new admission virtual info sessions are added — typically 3–7 days before the event.
          </p>
          <p style="font-size:14px;color:#57534e;line-height:1.6;margin:0 0 24px;">
            We only send when there's something worth knowing. No spam, no weekly digests.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:0 0 24px;">
          <p style="font-size:11px;color:#a8a29e;margin:0;">
            Don't want these emails?
            <a href="${unsubscribeUrl}" style="color:#78716c;text-decoration:underline;">Unsubscribe in one click</a>.
            No account needed.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      text: `Subscription confirmed.\n\nYou'll receive an email when new admission virtual info sessions are added.\n\nUnsubscribe: ${unsubscribeUrl}`,
    };
  }

  // Default: Chinese
  return {
    subject: "已订阅景深活动提醒",
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e7e5e4;max-width:480px;width:100%;">
        <tr><td style="padding:32px 32px 0;">
          <div style="margin-bottom:24px;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:6px;">
              <circle cx="9" cy="9" r="8" stroke="#111" stroke-width="1.2"/>
              <circle cx="9" cy="9" r="4.5" stroke="#111" stroke-width="1.2"/>
              <circle cx="9" cy="9" r="1.5" fill="#111"/>
            </svg>
            <span style="font-size:14px;font-weight:700;color:#111;vertical-align:middle;">景深</span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px;">订阅成功 ✓</h1>
          <p style="font-size:14px;color:#57534e;line-height:1.8;margin:0 0 16px;">
            当有新的招生 Virtual Info Session 活动时，我们会提前 3–7 天发邮件通知你。
          </p>
          <p style="font-size:14px;color:#57534e;line-height:1.8;margin:0 0 24px;">
            我们只在有值得关注的活动时才发送，不会有周报或无关推送。
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;">
          <hr style="border:none;border-top:1px solid #e7e5e4;margin:0 0 24px;">
          <p style="font-size:11px;color:#a8a29e;margin:0;">
            不想再收到提醒？
            <a href="${unsubscribeUrl}" style="color:#78716c;text-decoration:underline;">一键退订</a>，无需登录。
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `订阅成功。\n\n当有新的招生 Virtual Info Session 活动时，我们会提前通知你。\n\n退订链接：${unsubscribeUrl}`,
  };
}
