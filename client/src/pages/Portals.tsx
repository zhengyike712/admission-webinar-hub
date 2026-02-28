// Design: Minimal white, system-ui, stone palette — consistent with Home.tsx
// Layout: search + filter bar on top, card grid below

import { useState, useMemo } from "react";
import { ExternalLink, Search, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { schoolPortals, ROUND_COLORS, ROUND_LABELS_ZH, type SchoolPortal, type DecisionRound } from "@/data/portals";

type Lang = "zh" | "en" | "hi";

const T = {
  zh: {
    pageTitle: "申请结果 Portal",
    pageDesc: "汇聚各大学申请结果查询入口，一键直达官方 Portal，掌握结果发布时间",
    search: "搜索学校",
    searchPlaceholder: "学校名称…",
    filterRound: "申请轮次",
    allRounds: "全部轮次",
    filterStatus: "结果状态",
    allStatus: "全部",
    released: "已出结果",
    pending: "待出结果",
    openPortal: "查询结果",
    noMatch: "没有匹配的学校",
    clearFilter: "清除筛选",
    decisionDates: "结果发布时间",
    releasedBadge: "已出",
    pendingBadge: "待出",
    schools: "所学校",
    backToHome: "← 返回主页",
    notesLabel: "备注",
  },
  en: {
    pageTitle: "Applicant Portals",
    pageDesc: "Direct links to university applicant portals and decision release dates — all in one place",
    search: "Search",
    searchPlaceholder: "School name…",
    filterRound: "Round",
    allRounds: "All Rounds",
    filterStatus: "Status",
    allStatus: "All",
    released: "Released",
    pending: "Pending",
    openPortal: "Check Status",
    noMatch: "No matching schools",
    clearFilter: "Clear filters",
    decisionDates: "Decision Dates",
    releasedBadge: "Released",
    pendingBadge: "Pending",
    schools: "schools",
    backToHome: "← Back to Home",
    notesLabel: "Notes",
  },
  hi: {
    pageTitle: "आवेदन पोर्टल",
    pageDesc: "विश्वविद्यालय आवेदन पोर्टल और निर्णय तिथियाँ — एक ही जगह",
    search: "खोजें",
    searchPlaceholder: "विश्वविद्यालय का नाम…",
    filterRound: "राउंड",
    allRounds: "सभी राउंड",
    filterStatus: "स्थिति",
    allStatus: "सभी",
    released: "जारी",
    pending: "प्रतीक्षित",
    openPortal: "स्थिति जांचें",
    noMatch: "कोई मेल नहीं",
    clearFilter: "फ़िल्टर साफ़ करें",
    decisionDates: "निर्णय तिथियाँ",
    releasedBadge: "जारी",
    pendingBadge: "प्रतीक्षित",
    schools: "विश्वविद्यालय",
    backToHome: "← मुख्य पृष्ठ",
    notesLabel: "नोट्स",
  },
} as const;

const ROUND_OPTIONS: DecisionRound[] = ["ED", "ED2", "EA", "SCEA", "REA", "RD"];

function PortalCard({ portal, lang }: { portal: SchoolPortal; lang: Lang }) {
  const t = T[lang];
  const [expanded, setExpanded] = useState(false);

  const hasReleased = portal.decisionDates.some((d) => d.released);
  const allReleased = portal.decisionDates.every((d) => d.released);
  const pendingDates = portal.decisionDates.filter((d) => !d.released);

  const notes = lang === "zh" ? portal.notesZh : portal.notes;

  return (
    <div className="bg-white border border-stone-200 hover:border-stone-400 transition-colors duration-150 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 leading-tight">
            {portal.shortName || portal.name}
          </h3>
          {portal.shortName && (
            <p className="text-[11px] text-stone-400 mt-0.5 truncate">{portal.name}</p>
          )}
        </div>
        {/* Status badge */}
        <span
          className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 border ${
            allReleased
              ? "bg-green-50 text-green-700 border-green-200"
              : hasReleased
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-stone-50 text-stone-500 border-stone-200"
          }`}
        >
          {allReleased ? t.releasedBadge : hasReleased ? "部分已出" : t.pendingBadge}
        </span>
      </div>

      {/* Next pending decision */}
      {pendingDates.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
          <Clock size={11} className="text-blue-400 flex-shrink-0" />
          <span className="font-medium text-stone-700">
            {pendingDates[0].labelZh || pendingDates[0].label}
          </span>
          <span>·</span>
          <span>{lang === "zh" ? pendingDates[0].dateZh : pendingDates[0].date}</span>
        </div>
      )}

      {/* Decision dates (expandable) */}
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {t.decisionDates} ({portal.decisionDates.length})
        </button>
        {expanded && (
          <div className="mt-2 flex flex-col gap-1.5">
            {portal.decisionDates.map((dd) => (
              <div key={dd.round} className="flex items-center gap-2">
                {dd.released ? (
                  <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={11} className="text-stone-300 flex-shrink-0" />
                )}
                <span
                  className={`text-[10px] font-medium px-1 py-0.5 border ${ROUND_COLORS[dd.round]}`}
                >
                  {lang === "zh" ? ROUND_LABELS_ZH[dd.round] : dd.round}
                </span>
                <span className="text-[11px] text-stone-500">
                  {lang === "zh" ? dd.dateZh : dd.date}
                </span>
                {dd.released && (
                  <span className="text-[10px] text-green-600 font-medium">✓</span>
                )}
              </div>
            ))}
            {notes && (
              <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                {t.notesLabel}: {notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <a
        href={portal.portalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-700 transition-colors duration-150 mt-auto"
      >
        <ExternalLink size={11} />
        {t.openPortal}
      </a>
    </div>
  );
}

export default function Portals() {
  const [lang, setLang] = useState<Lang>("zh");
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState<DecisionRound | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "released" | "pending">("");

  const t = T[lang];

  const filtered = useMemo(() => {
    return schoolPortals.filter((portal) => {
      // Search
      const q = search.toLowerCase();
      if (
        q &&
        !portal.name.toLowerCase().includes(q) &&
        !(portal.shortName?.toLowerCase().includes(q))
      ) {
        return false;
      }
      // Round filter
      if (roundFilter && !portal.decisionDates.some((d) => d.round === roundFilter)) {
        return false;
      }
      // Status filter
      if (statusFilter === "released" && !portal.decisionDates.some((d) => d.released)) {
        return false;
      }
      if (statusFilter === "pending" && !portal.decisionDates.some((d) => !d.released)) {
        return false;
      }
      return true;
    });
  }, [search, roundFilter, statusFilter]);

  const hasFilters = search || roundFilter || statusFilter;

  return (
    <div className="min-h-screen bg-white font-[system-ui,sans-serif]">
      {/* Top bar */}
      <div className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a href="/" className="text-xs text-stone-400 hover:text-stone-700 transition-colors whitespace-nowrap">
            {t.backToHome}
          </a>
          {/* Lang switcher */}
          <div className="flex items-center gap-1">
            {(["zh", "en", "hi"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-[11px] px-2 py-0.5 border transition-colors ${
                  lang === l
                    ? "bg-stone-900 text-white border-stone-900"
                    : "text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
              >
                {l === "zh" ? "中文" : l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{t.pageTitle}</h1>
        <p className="text-sm text-stone-500 mt-1 max-w-xl">{t.pageDesc}</p>
      </div>

      {/* Filter bar */}
      <div className="max-w-5xl mx-auto px-4 pb-4 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 focus:border-stone-400 focus:outline-none bg-white"
          />
        </div>

        {/* Round filter */}
        <select
          value={roundFilter}
          onChange={(e) => setRoundFilter(e.target.value as DecisionRound | "")}
          className="text-xs border border-stone-200 px-2 py-1.5 focus:outline-none focus:border-stone-400 bg-white text-stone-700"
        >
          <option value="">{t.allRounds}</option>
          {ROUND_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {lang === "zh" ? ROUND_LABELS_ZH[r] : r}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "released" | "pending")}
          className="text-xs border border-stone-200 px-2 py-1.5 focus:outline-none focus:border-stone-400 bg-white text-stone-700"
        >
          <option value="">{t.allStatus}</option>
          <option value="released">{t.released}</option>
          <option value="pending">{t.pending}</option>
        </select>

        {/* Count + clear */}
        <span className="text-xs text-stone-400 ml-auto">
          {filtered.length} {t.schools}
        </span>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setRoundFilter(""); setStatusFilter(""); }}
            className="text-xs text-stone-400 hover:text-stone-700 underline transition-colors"
          >
            {t.clearFilter}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm">{t.noMatch}</p>
            <button
              onClick={() => { setSearch(""); setRoundFilter(""); setStatusFilter(""); }}
              className="mt-2 text-xs underline hover:text-stone-700 transition-colors"
            >
              {t.clearFilter}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((portal) => (
              <PortalCard key={portal.schoolId} portal={portal} lang={lang} />
            ))}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-stone-100 bg-stone-50 py-4">
        <p className="max-w-5xl mx-auto px-4 text-[11px] text-stone-400 text-center">
          {lang === "zh"
            ? "所有链接均指向各院校官方申请者门户，结果发布时间为预估，请以各校官网最新公告为准。"
            : lang === "en"
            ? "All links point to official university applicant portals. Decision dates are estimates — please verify on each school's official website."
            : "सभी लिंक आधिकारिक विश्वविद्यालय पोर्टल पर जाते हैं। तिथियाँ अनुमानित हैं।"}
        </p>
      </div>
    </div>
  );
}
