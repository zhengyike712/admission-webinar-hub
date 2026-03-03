/**
 * Unsubscribe page — handles one-click unsubscribe links from confirmation emails.
 * URL format: /unsubscribe?token=<hex_token>
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

type Status = "loading" | "success" | "already" | "invalid" | "error";

export default function Unsubscribe() {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);

  const unsubscribeMutation = trpc.subscribers.unsubscribeByToken.useMutation({
    onSuccess: (data) => {
      if (data.alreadyUnsubscribed) {
        setStatus("already");
      } else {
        setStatus("success");
        if (data.email) setEmail(data.email);
      }
    },
    onError: () => setStatus("error"),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token || token.length < 8) {
      setStatus("invalid");
      return;
    }
    unsubscribeMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white border border-stone-200 p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#111" strokeWidth="1.2" />
            <circle cx="9" cy="9" r="4.5" stroke="#111" strokeWidth="1.2" />
            <circle cx="9" cy="9" r="1.5" fill="#111" />
          </svg>
          <span className="text-sm font-bold text-stone-900">景深</span>
        </div>

        {status === "loading" && (
          <div>
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
            <p className="text-sm text-stone-500">正在处理退订请求…</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="w-10 h-10 bg-stone-100 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-900 mb-2">已退订</h1>
            {email && (
              <p className="text-sm text-stone-500 mb-4">
                <span className="font-medium text-stone-700">{email}</span> 已从活动提醒列表中移除。
              </p>
            )}
            <p className="text-sm text-stone-400 mb-6">
              你不会再收到来自景深的活动提醒邮件。如果改变主意，随时可以重新订阅。
            </p>
            <a
              href="/"
              className="inline-block text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors"
            >
              返回首页
            </a>
          </div>
        )}

        {status === "already" && (
          <div>
            <div className="w-10 h-10 bg-stone-100 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#78716c" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-900 mb-2">已经退订过了</h1>
            <p className="text-sm text-stone-500 mb-6">
              这个邮箱地址已经不在订阅列表中了。
            </p>
            <a
              href="/"
              className="inline-block text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors"
            >
              返回首页
            </a>
          </div>
        )}

        {status === "invalid" && (
          <div>
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-900 mb-2">链接无效</h1>
            <p className="text-sm text-stone-500 mb-6">
              退订链接无效或已过期。如需退订，请直接回复邮件告知我们。
            </p>
            <a
              href="/"
              className="inline-block text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors"
            >
              返回首页
            </a>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="1.5" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-900 mb-2">出了点问题</h1>
            <p className="text-sm text-stone-500 mb-6">
              退订请求失败，请稍后重试，或直接回复邮件告知我们。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors mr-4"
            >
              重试
            </button>
            <a
              href="/"
              className="inline-block text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800 transition-colors"
            >
              返回首页
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
