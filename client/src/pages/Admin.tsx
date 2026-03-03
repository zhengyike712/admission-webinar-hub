/**
 * Admin page — /admin
 * ──────────────────────────────────────────────────────────────
 * Shows crawl logs, allows manual crawl triggers, lists subscribers,
 * and provides interview deadline verification panel.
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
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

// ── Status badge (crawl logs) ─────────────────────────────────
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

// ── Verification status badge ─────────────────────────────────
function VerifyBadge({ status }: { status: "ok" | "changed" | "not_found" | "error" }) {
  if (status === "ok")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 font-medium">
        <CheckCircle size={9} /> 匹配
      </span>
    );
  if (status === "changed")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 font-medium">
        <AlertCircle size={9} /> 已变更
      </span>
    );
  if (status === "not_found")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
        <Clock size={9} /> 未找到
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 border border-stone-200 font-medium">
      <XCircle size={9} /> 错误
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

// ── Interview Verification Row ────────────────────────────────
function VerifyRow({ row, onVerifyOne }: {
  row: {
    id: string;
    schoolName: string;
    portalUrl: string;
    verifiedDeadline: string | null;
    rawDeadlineText: string | null;
    matches: boolean | null;
    status: "ok" | "changed" | "not_found" | "error";
    errorMessage: string | null;
    rawContent: string | null;
    lastVerifiedAt: Date;
  };
  onVerifyOne: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(row.lastVerifiedAt);

  return (
    <>
      <tr
        className={`border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors ${
          row.status === "changed" ? "bg-red-50/30" : ""
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-2 text-xs font-medium text-stone-800">{row.schoolName}</td>
        <td className="px-3 py-2">
          <VerifyBadge status={row.status} />
        </td>
        <td className="px-3 py-2 text-[11px] text-stone-500 font-mono">{row.verifiedDeadline ?? "—"}</td>
        <td className="px-3 py-2 text-[11px] text-stone-400 whitespace-nowrap">
          {date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}{" "}
          {date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </td>
        <td className="px-3 py-2 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); onVerifyOne(row.id); }}
            className="text-[10px] text-stone-400 hover:text-stone-700 transition-colors px-1.5 py-0.5 border border-stone-200 hover:border-stone-400"
          >
            重新核实
          </button>
        </td>
        <td className="px-3 py-2 text-stone-400 text-center">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-stone-50 border-b border-stone-100">
          <td colSpan={6} className="px-4 py-3">
            <div className="space-y-2">
              <div className="text-[11px]">
                <span className="text-stone-400 mr-2">Portal:</span>
                <a
                  href={row.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.portalUrl} <ExternalLink size={9} />
                </a>
              </div>
              {row.rawDeadlineText && (
                <div className="text-[11px]">
                  <span className="text-stone-400 mr-2">原文:</span>
                  <span className="text-stone-600 italic">"{row.rawDeadlineText}"</span>
                </div>
              )}
              {row.errorMessage && (
                <div className="text-[11px]">
                  <span className="text-red-500 mr-2">错误:</span>
                  <span className="text-stone-600 font-mono">{row.errorMessage}</span>
                </div>
              )}
              {row.rawContent && (
                <details className="text-[10px]">
                  <summary className="text-stone-400 cursor-pointer hover:text-stone-600">
                    查看页面原始内容
                  </summary>
                  <pre className="mt-1 p-2 bg-white border border-stone-200 overflow-x-auto text-stone-500 whitespace-pre-wrap max-h-40">
                    {row.rawContent}
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
  const [activeTab, setActiveTab] = useState<"logs" | "subscribers" | "interviews">("logs");

  const { data: logsData, refetch: refetchLogs, isFetching: logsFetching } =
    trpc.sessions.crawlLogs.useQuery({ limit: 100 });

  const { data: subscribersData, refetch: refetchSubs } =
    trpc.subscribers.adminStats.useQuery(
      undefined,
      { enabled: user?.role === "admin" }
    );

  const { data: verificationsData, refetch: refetchVerifications, isFetching: verifyFetching } =
    trpc.interviews.verifications.useQuery(undefined, {
      enabled: user?.role === "admin",
    });

  const triggerFull = trpc.sessions.triggerFullCrawl.useMutation({
    onSuccess: () => {
      setTimeout(() => refetchLogs(), 2000);
    },
  });

  const verifyAll = trpc.interviews.verifyAll.useMutation({
    onSuccess: () => {
      setTimeout(() => refetchVerifications(), 5000);
    },
  });

  const verifyOne = trpc.interviews.verifyOne.useMutation({
    onSuccess: () => {
      setTimeout(() => refetchVerifications(), 3000);
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
  const subs = subscribersData?.list ?? [];
  const subsActive = subscribersData?.active ?? 0;
  const subsInactive = subscribersData?.inactive ?? 0;
  const subsTotal = subscribersData?.total ?? 0;
  const regionBreakdown = subscribersData?.regionBreakdown ?? [];
  const verifications = (verificationsData ?? []) as Array<{
    id: string;
    schoolName: string;
    portalUrl: string;
    verifiedDeadline: string | null;
    rawDeadlineText: string | null;
    matches: boolean | null;
    status: "ok" | "changed" | "not_found" | "error";
    errorMessage: string | null;
    rawContent: string | null;
    lastVerifiedAt: Date;
  }>;

  // Stats
  const totalLogs = logs.length;
  const successCount = logs.filter((l) => l.status === "success").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const alertCount = logs.filter((l) => l.consecutiveFailures >= 3).length;

  // Interview verification stats
  const verifyOk = verifications.filter((v) => v.status === "ok").length;
  const verifyChanged = verifications.filter((v) => v.status === "changed").length;

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
            onClick={() => { refetchLogs(); refetchSubs(); refetchVerifications(); }}
            disabled={logsFetching || verifyFetching}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-500 text-xs hover:border-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={(logsFetching || verifyFetching) ? "animate-spin" : ""} />
            刷新
          </button>
          {triggerFull.isSuccess && (
            <span className="text-[11px] text-green-600">✓ 爬取任务已在后台启动</span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 mb-4">
          <div className="flex">
            {([
              { key: "logs", label: `爬取日志 (${totalLogs})` },
              { key: "interviews", label: `面试截止核实 (${verifications.length})${verifyChanged > 0 ? ` ⚠️${verifyChanged}` : ""}` },
              { key: "subscribers", label: `订阅者 (${subsActive})` },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}
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

        {/* Interview Deadline Verification tab */}
        {activeTab === "interviews" && (
          <div>
            {/* Summary + action */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <CheckCircle size={11} className="text-green-600" />
                  匹配 {verifyOk}
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle size={11} className="text-red-500" />
                  变更 {verifyChanged}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-yellow-600" />
                  未找到 {verifications.filter((v) => v.status === "not_found").length}
                </span>
              </div>
              <button
                onClick={() => verifyAll.mutate()}
                disabled={verifyAll.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {verifyAll.isPending ? (
                  <RefreshCw size={11} className="animate-spin" />
                ) : (
                  <ShieldCheck size={11} />
                )}
                {verifyAll.isPending ? "核实中（后台运行）..." : "全量核实截止日期"}
              </button>
            </div>

            {verifyAll.isSuccess && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-[11px] text-blue-700">
                ✓ 核实任务已在后台启动（约需 2-3 分钟），完成后如有变更将通过 Manus 通知推送给管理员。
              </div>
            )}

            {verifications.length === 0 ? (
              <div className="py-12 text-center">
                <ShieldCheck size={32} className="mx-auto text-stone-200 mb-3" />
                <p className="text-stone-400 text-sm mb-1">尚未运行截止日期核实</p>
                <p className="text-stone-300 text-[11px]">
                  点击「全量核实截止日期」开始核实 20 所学校的面试申请截止日期。
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200">
                      {["学校", "状态", "核实截止日", "最后核实时间", "操作", ""].map((h) => (
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
                    {verifications.map((row) => (
                      <VerifyRow
                        key={row.id}
                        row={row}
                        onVerifyOne={(id) => verifyOne.mutate({ schoolId: id })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Subscribers tab */}
        {activeTab === "subscribers" && (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "活跃订阅", value: subsActive, color: "text-green-700" },
                { label: "已退订", value: subsInactive, color: "text-stone-400" },
                { label: "累计总数", value: subsTotal, color: "text-stone-900" },
              ].map((s) => (
                <div key={s.label} className="border border-stone-100 p-3">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Region breakdown */}
            {regionBreakdown.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2">地区分布（活跃订阅者）</h3>
                <div className="flex flex-wrap gap-2">
                  {regionBreakdown.map(({ region, count }) => {
                    const pct = subsActive > 0 ? Math.round((count / subsActive) * 100) : 0;
                    return (
                      <div key={region} className="flex items-center gap-2 border border-stone-100 px-3 py-1.5">
                        <span className="text-xs text-stone-700 font-medium">{region}</span>
                        <span className="text-[11px] text-stone-400">{count} 人</span>
                        <span className="text-[10px] text-stone-300">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                {/* Bar chart */}
                <div className="mt-3 space-y-1.5">
                  {regionBreakdown.map(({ region, count }) => {
                    const pct = subsActive > 0 ? (count / subsActive) * 100 : 0;
                    return (
                      <div key={region} className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-500 w-16 shrink-0 text-right">{region}</span>
                        <div className="flex-1 bg-stone-100 h-1.5">
                          <div
                            className="bg-stone-800 h-1.5 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-stone-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscriber list */}
            {subs.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">暂无订阅者</div>
            ) : (
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2">订阅者列表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200">
                        {["邮箱", "状态", "感兴趣地区", "订阅时间"].map((h) => (
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
                        <tr key={sub.id} className={`border-b border-stone-100 hover:bg-stone-50 ${!sub.active ? "opacity-40" : ""}`}>
                          <td className="px-3 py-2 text-xs text-stone-700 font-mono">{sub.email}</td>
                          <td className="px-3 py-2">
                            {sub.active ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200">
                                <CheckCircle size={8} /> 活跃
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-400 border border-stone-200">
                                <XCircle size={8} /> 已退订
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-stone-400">
                            {sub.regions?.join("、") || "—"}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-stone-400">
                            {new Date(sub.createdAt).toLocaleDateString("zh-CN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
