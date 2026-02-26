// Design: Minimal — white background, clean typography, no decorative elements
// Palette: white bg, #111 text, #2563eb accent (blue-600), stone-100 borders
// Font: system-ui for body, no decorative serifs
// Layout: left sidebar filter + right content grid

import { useState, useMemo } from "react";
import {
  schools,
  sessions,
  schoolsMap,
  type SessionType,
  type School,
} from "@/data/schools";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Calendar,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  X,
  ArrowUpRight,
} from "lucide-react";

type ViewMode = "sessions" | "schools";

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  "General Info Session": "综合宣讲",
  "Up Close / Specialty": "专题深度",
  "Multi-College Session": "多校联合",
  "Regional Session": "地区专场",
  "Student Forum": "学生论坛",
  "Financial Aid Session": "奖学金",
  "International Student Session": "国际生专场",
};

// ── Urgency helpers ─────────────────────────────────────────
function getUrgency(session: (typeof sessions)[0]): "imminent" | "soon" | null {
  if (session.isRolling || !session.dates || session.dates.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = session.dates
    .map((d) => new Date(d + "T00:00:00"))
    .filter((d) => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());
  if (upcoming.length === 0) return null;
  const diffDays = Math.ceil((upcoming[0].getTime() - today.getTime()) / 86400000);
  if (diffDays <= 7) return "imminent";
  if (diffDays <= 30) return "soon";
  return null;
}

function getNextDate(session: (typeof sessions)[0]): Date | null {
  if (session.isRolling || !session.dates || session.dates.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = session.dates
    .map((d) => new Date(d + "T00:00:00"))
    .filter((d) => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] ?? null;
}

// ── Session Card ──────────────────────────────────────────────
function SessionCard({ session }: { session: (typeof sessions)[0] }) {
  const school = schoolsMap[session.schoolId];
  const urgency = getUrgency(session);

  return (
    <div className={`bg-white border p-4 transition-colors duration-150 flex flex-col gap-3 relative ${
      urgency === "imminent"
        ? "border-red-400 hover:border-red-500"
        : urgency === "soon"
        ? "border-orange-300 hover:border-orange-400"
        : "border-stone-200 hover:border-stone-400"
    }`}>
      {/* Urgency badge */}
      {urgency === "imminent" && (
        <div className="absolute -top-px left-0 right-0 h-0.5 bg-red-500" />
      )}
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: school?.color || "#2563eb" }}
            />
            <span className="text-xs text-stone-500 font-medium truncate">
              {school?.shortName || school?.name}
              {school && (
                <span className="text-stone-300 ml-1">
                  #{school.rank}
                </span>
              )}
            </span>
            {urgency === "imminent" && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-500 text-white font-semibold rounded-sm animate-pulse">
                <span className="inline-block w-1 h-1 rounded-full bg-white" />
                即将开始
              </span>
            )}
            {urgency === "soon" && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 font-semibold rounded-sm border border-orange-200">
                本月
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-stone-900 leading-snug">
            {session.title}
          </h3>
        </div>
        <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded font-medium whitespace-nowrap">
          {SESSION_TYPE_LABELS[session.type] || session.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
        {session.description}
      </p>

      {/* Partner schools */}
      {session.partnerSchools && session.partnerSchools.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {session.partnerSchools.map((p) => (
            <span key={p} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Date / time */}
      <div className="space-y-1">
        {session.isRolling ? (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <RefreshCw size={10} />
            <span>滚动开放，可选任意可用日期</span>
          </div>
        ) : session.dates && session.dates.length > 0 ? (
          <div className="flex items-start gap-1.5 text-xs text-stone-400">
            <Calendar size={10} className="mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {session.dates.map((d) => (
                <span key={d} className="font-mono text-stone-600">
                  {new Date(d + "T00:00:00").toLocaleDateString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {session.time && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Clock size={10} />
            <span>{session.time}</span>
            {session.duration && <span>· {session.duration}</span>}
          </div>
        )}
      </div>

      {/* CTA */}
      <a
        href={session.registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white text-xs font-medium transition-colors duration-150 mt-auto"
      >
        前往报名
        <ArrowUpRight size={12} />
      </a>
    </div>
  );
}

// ── School Card ───────────────────────────────────────────────
function SchoolCard({ school }: { school: School }) {
  const schoolSessions = sessions.filter((s) => s.schoolId === school.id);

  return (
    <div className="bg-white border border-stone-200 p-4 hover:border-stone-400 transition-colors duration-150">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: school.color }}
            />
            <h3 className="text-sm font-semibold text-stone-900 truncate">
              {school.shortName || school.name}
            </h3>
          </div>
          {school.shortName && (
            <p className="text-[11px] text-stone-400 truncate pl-3">{school.name}</p>
          )}
        </div>
        <span className="shrink-0 text-xs font-mono text-stone-400">
          #{school.rank}
        </span>
      </div>

      <p className="text-[11px] text-stone-400 mb-3 pl-3">{school.location}</p>

      <div className="flex flex-wrap gap-1 mb-3 pl-3">
        {school.tags.slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded">
            {t}
          </span>
        ))}
      </div>

      <div className="text-[11px] text-stone-400 mb-3 pl-3">
        {schoolSessions.length} 场活动可报名
      </div>

      <div className="flex gap-2 pl-3">
        <a
          href={school.registrationPage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white text-xs font-medium transition-colors duration-150"
        >
          查看日程
        </a>
        <a
          href={school.admissionPage}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-2.5 py-1.5 border border-stone-200 text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-colors duration-150"
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState<ViewMode>("sessions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SessionType | "All">("All");
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<
    "All" | "National University" | "Liberal Arts College"
  >("All");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sessionTypes: (SessionType | "All")[] = [
    "All",
    "General Info Session",
    "Up Close / Specialty",
    "Multi-College Session",
    "Regional Session",
    "Student Forum",
    "Financial Aid Session",
  ];

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const school = schoolsMap[s.schoolId];
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchSchoolType =
        schoolTypeFilter === "All" || school?.type === schoolTypeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        school?.name.toLowerCase().includes(q) ||
        (school?.shortName?.toLowerCase().includes(q) ?? false) ||
        s.description.toLowerCase().includes(q);
      return matchType && matchSchoolType && matchSearch;
    });
  }, [search, typeFilter, schoolTypeFilter]);

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchType =
        schoolTypeFilter === "All" || s.type === schoolTypeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.shortName?.toLowerCase().includes(q) ?? false) ||
        s.location.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [search, schoolTypeFilter]);

  const rollingCount = filteredSessions.filter((s) => s.isRolling).length;
  const scheduledCount = filteredSessions.filter((s) => !s.isRolling).length;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <header className="border-b border-stone-200 sticky top-0 z-50 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-stone-900">AdmitLens</span>
            <span className="hidden sm:block text-xs text-stone-400">美国本科招生 Virtual Info Session</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-400">80 所院校</span>
            <button
              className="sm:hidden text-stone-500"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero — minimal text only ── */}
      <div className="border-b border-stone-100 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">
            US News Top 50 综合大学 · Top 30 文理学院
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
            招生 Virtual Info Session
          </h1>
          <p className="text-sm text-stone-500">
            汇聚各校招生官（AO）主持的线上宣讲活动，一键直达官方报名入口
          </p>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div className="border-b border-stone-200 bg-white sticky top-12 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex">
            <button
              onClick={() => setView("sessions")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "sessions"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              活动日程
            </button>
            <button
              onClick={() => setView("schools")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "schools"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              学校目录
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-8">

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed sm:static inset-0 z-50 sm:z-auto
            w-56 shrink-0
            bg-white sm:bg-transparent
            overflow-y-auto
            transition-transform duration-200
            ${mobileFilterOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            pt-4 sm:pt-0 px-4 sm:px-0
          `}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <span className="text-sm font-medium text-stone-900">筛选</span>
            <button onClick={() => setMobileFilterOpen(false)}>
              <X size={16} className="text-stone-400" />
            </button>
          </div>

          <div className="sticky top-28 space-y-6">
            {/* Search */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                搜索
              </label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-300" />
                <Input
                  placeholder="学校或活动名称"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-900"
                />
              </div>
            </div>

            {/* School type */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                学校类型
              </label>
              <div className="space-y-0.5">
                {(["All", "National University", "Liberal Arts College"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSchoolTypeFilter(t)}
                    className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                      schoolTypeFilter === t
                        ? "bg-stone-900 text-white"
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    {t === "All" ? "全部" : t === "National University" ? "综合大学" : "文理学院"}
                  </button>
                ))}
              </div>
            </div>

            {/* Session type */}
            {view === "sessions" && (
              <div>
                <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                  活动类型
                </label>
                <div className="space-y-0.5">
                  {sessionTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                        typeFilter === t
                          ? "bg-stone-900 text-white"
                          : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {t === "All" ? "全部类型" : SESSION_TYPE_LABELS[t as SessionType]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {view === "sessions" && (
              <div className="border-t border-stone-100 pt-4 space-y-1.5 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>滚动报名</span>
                  <span className="text-stone-700 font-medium">{rollingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>固定日期</span>
                  <span className="text-stone-700 font-medium">{scheduledCount}</span>
                </div>
                <div className="flex justify-between font-medium text-stone-700 pt-1 border-t border-stone-100">
                  <span>合计</span>
                  <span>{filteredSessions.length} 场</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileFilterOpen && (
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/20"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {view === "sessions" ? (
            <div className="space-y-6">
              {/* Rolling */}
              {filteredSessions.filter((s) => s.isRolling).length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">
                      滚动开放报名
                    </span>
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[11px] text-stone-300">
                      {filteredSessions.filter((s) => s.isRolling).length} 场
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSessions.filter((s) => s.isRolling).map((s) => (
                      <SessionCard key={s.id} session={s} />
                    ))}
                  </div>
                </section>
              )}

              {/* Scheduled */}
              {filteredSessions.filter((s) => !s.isRolling).length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">
                      固定日期活动
                    </span>
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[11px] text-stone-300">
                      {filteredSessions.filter((s) => !s.isRolling).length} 场
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSessions
                      .filter((s) => !s.isRolling)
                      .slice()
                      .sort((a, b) => {
                        const da = getNextDate(a);
                        const db = getNextDate(b);
                        if (!da && !db) return 0;
                        if (!da) return 1;
                        if (!db) return -1;
                        return da.getTime() - db.getTime();
                      })
                      .map((s) => (
                        <SessionCard key={s.id} session={s} />
                      ))}
                  </div>
                </section>
              )}

              {filteredSessions.length === 0 && (
                <div className="py-20 text-center text-stone-400">
                  <p className="text-sm mb-2">没有匹配的活动</p>
                  <button
                    onClick={() => { setSearch(""); setTypeFilter("All"); setSchoolTypeFilter("All"); }}
                    className="text-xs underline underline-offset-2 hover:text-stone-600"
                  >
                    清除筛选
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* National Universities */}
              {filteredSchools.filter((s) => s.type === "National University").length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">
                      综合大学
                    </span>
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[11px] text-stone-300">
                      {filteredSchools.filter((s) => s.type === "National University").length} 所
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSchools
                      .filter((s) => s.type === "National University")
                      .sort((a, b) => a.rank - b.rank)
                      .map((s) => <SchoolCard key={s.id} school={s} />)}
                  </div>
                </section>
              )}

              {/* Liberal Arts Colleges */}
              {filteredSchools.filter((s) => s.type === "Liberal Arts College").length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">
                      文理学院
                    </span>
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[11px] text-stone-300">
                      {filteredSchools.filter((s) => s.type === "Liberal Arts College").length} 所
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSchools
                      .filter((s) => s.type === "Liberal Arts College")
                      .sort((a, b) => a.rank - b.rank)
                      .map((s) => <SchoolCard key={s.id} school={s} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-100 mt-8 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <span className="font-medium text-stone-600">AdmitLens</span>
          <span>所有链接均指向各大学官方招生网站，请以各校官网最新日程为准</span>
        </div>
      </footer>
    </div>
  );
}
