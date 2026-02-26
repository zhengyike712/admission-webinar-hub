/**
 * Admin page — /admin
 * ──────────────────────────────────────────────────────────────
 * Shows crawl logs, allows manual crawl triggers, and lists subscribers.
 * Only accessible to admin users (enforced on both frontend and backend).
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: "success" | "failed" | "partial" }) {
  if (status === "success")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 font-medium">
        <CheckCircle size={9} /> 成功
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 font-medium">
        <XCircle size={9} /> 失败
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
      <AlertCircle size={9} /> 部分
    </span>
  );
}

// ── Log row (expandable) ──────────────────────────────────────
function LogRow({ log }: { log: {
  id: number;
  schoolId: number;
  schoolName: string;
  crawlUrl: string;
  status: "success" | "failed" | "partial";
  sessionsFound: number;
  sessionsUpdated: number;
  consecutiveFailures: number;
  errorMessage: string | null;
  rawContent: string | null;
  createdAt: Date;
}}) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(log.createdAt);

  return (
    <>
      <tr
        className={`border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors ${
          log.consecutiveFailures >= 3 ? "bg-red-50/50" : ""
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-2 text-[11px] text-stone-500 whitespace-nowrap">
          {date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}{" "}
          {date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="px-3 py-2 text-xs font-medium text-stone-800">{log.schoolName}</td>
        <td className="px-3 py-2">
          <StatusBadge status={log.status} />
        </td>
        <td className="px-3 py-2 text-[11px] text-stone-500 text-center">{log.sessionsFound}</td>
        <td className="px-3 py-2 text-[11px] text-stone-500 text-center">{log.sessionsUpdated}</td>
        <td className="px-3 py-2 text-center">
          {log.consecutiveFailures > 0 && (
            <span className={`text-[10px] font-bold px-1 ${
              log.consecutiveFailures >= 3 ? "text-red-600" : "text-orange-500"
            }`}>
              ×{log.consecutiveFailures}
            </span>
          )}
        </td>
        <td className="px-3 py-2 text-stone-400 text-center">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-stone-50 border-b border-stone-100">
          <td colSpan={7} className="px-4 py-3">
            <div className="space-y-2">
              <div className="text-[11px]">
                <span className="text-stone-400 mr-2">URL:</span>
                <a
                  href={log.crawlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {log.crawlUrl}
                </a>
              </div>
              {log.errorMessage && (
                <div className="text-[11px]">
                  <span className="text-red-500 mr-2">错误:</span>
                  <span className="text-stone-600 font-mono">{log.errorMessage}</span>
                </div>
              )}
              {log.rawContent && (
                <details className="text-[10px]">
                  <summary className="text-stone-400 cursor-pointer hover:text-stone-600">
                    查看原始内容（前 2KB）
                  </summary>
                  <pre className="mt-1 p-2 bg-white border border-stone-200 overflow-x-auto text-stone-500 whitespace-pre-wrap max-h-40">
                    {log.rawContent}
                  </pre>
                </details>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Admin Page ───────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"logs" | "subscribers">("logs");

  const { data: logsData, refetch: refetchLogs, isFetching: logsFetching } =
    trpc.sessions.crawlLogs.useQuery({ limit: 100 });

  const { data: subscribersData, refetch: refetchSubs } =
    trpc.subscribers.list.useQuery(
      { limit: 200 },
      { enabled: user?.role === "admin" }
    );

  const triggerFull = trpc.sessions.triggerFullCrawl.useMutation({
    onSuccess: () => {
      setTimeout(() => refetchLogs(), 2000);
    },
  });

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-stone-500">请先登录</p>
        <a
          href={getLoginUrl()}
          className="px-4 py-2 bg-stone-900 text-white text-sm hover:bg-stone-700 transition-colors"
        >
          登录
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-stone-500">无访问权限（仅管理员）</p>
        <Link href="/" className="text-xs text-stone-400 hover:text-stone-700 underline">
          返回首页
        </Link>
      </div>
    );
  }

  const logs = logsData ?? [];
  const subs = subscribersData ?? [];

  // Stats
  const totalLogs = logs.length;
  const successCount = logs.filter((l) => l.status === "success").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const alertCount = logs.filter((l) => l.consecutiveFailures >= 3).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-stone-200 sticky top-0 z-50 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors">
              <ArrowLeft size={14} />
              <span className="text-xs">返回</span>
            </Link>
            <div className="w-px h-4 bg-stone-200" />
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-stone-500" />
              <span className="text-sm font-semibold text-stone-900">管理后台</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">{user.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-stone-900 text-white">admin</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "爬取记录", value: totalLogs, color: "text-stone-900" },
            { label: "成功", value: successCount, color: "text-green-700" },
            { label: "失败", value: failedCount, color: "text-red-600" },
            { label: "告警学校", value: alertCount, color: alertCount > 0 ? "text-red-600" : "text-stone-400" },
          ].map((stat) => (
            <div key={stat.label} className="border border-stone-100 p-3">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-stone-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => triggerFull.mutate()}
            disabled={triggerFull.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {triggerFull.isPending ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {triggerFull.isPending ? "爬取中..." : "立即全量爬取"}
          </button>
          <button
            onClick={() => { refetchLogs(); refetchSubs(); }}
            disabled={logsFetching}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-500 text-xs hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={logsFetching ? "animate-spin" : ""} />
            刷新
          </button>
          {triggerFull.isSuccess && (
            <span className="text-[11px] text-green-600">✓ 爬取任务已在后台启动</span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 mb-4">
          <div className="flex">
            {(["logs", "subscribers"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab === "logs" ? `爬取日志 (${totalLogs})` : `订阅者 (${subs.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Logs tab */}
        {activeTab === "logs" && (
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                暂无爬取记录。点击「立即全量爬取」开始第一次爬取。
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200">
                    {["时间", "学校", "状态", "发现", "更新", "连失", ""].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone-400 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <LogRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Subscribers tab */}
        {activeTab === "subscribers" && (
          <div>
            {subs.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                暂无订阅者
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200">
                      {["邮箱", "感兴趣地区", "订阅时间"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-[10px] uppercase tracking-widest text-stone-400 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((sub) => (
                      <tr key={sub.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-3 py-2 text-xs text-stone-700">{sub.email}</td>
                        <td className="px-3 py-2 text-[11px] text-stone-400">
                          {(sub.regions as string[] | null)?.join("、") || "全部"}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-stone-400">
                          {new Date(sub.createdAt).toLocaleDateString("zh-CN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
