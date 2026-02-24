// ============================================================
// Design Philosophy: Academic Archive × Event Calendar
// - Primary view: Session schedule list (date-sorted events)
// - Secondary view: School directory (browse by school)
// - Parchment bg, deep teal accent, Playfair Display headings
// - Session cards styled like conference program entries
// ============================================================

import { useState, useMemo } from "react";
import {
  schools,
  sessions,
  schoolsMap,
  sessionTypeColors,
  type SessionType,
  type School,
} from "@/data/schools";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  GraduationCap,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Video,
  Building2,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";

const HERO_BG =
  "https://private-us-east-1.manuscdn.com/sessionFile/EeGMS51PkjxqdmDWuPRUyT/sandbox/oTXMxzhYVw1zsbPZvO70up-img-1_1771927859000_na1fn_aGVyby1iZw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRWVHTVM1MVBranhxZG1EV3VQUlV5VC9zYW5kYm94L29UWE14emhZVncxenNiUFp2TzcwdXAtaW1nLTFfMTc3MTkyNzg1OTAwMF9uYTFmbl9hR1Z5YnkxaVp3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iOt~dRNJJt6g2R04Bj0Rm5hC89nKihTTB~JRSwyd1fhpsB43uxS3kYIY3gb6aNb9PI040pbh0aK2tRKajc9v1yR0UHofo3mHIS3vTUOvSydDnhlQP0fhxs-bhGkHJoP3QMKLcWntPq5zqtGYPMORnKtPW-bd-iud-zN02-I~2BlJmvbanoc6A5r1ihv3pS81FdWOjFT0K29hx2nYYeY2~4B0pSfMjaJDURUQ87EO4MCmW~06GrAzrbNZtjMFCX6W7e5ywLTyJq3JEz7Uo~VC3f6XNR1oCocrgQvQt4YSIiP-JonduiTAtBzArI-OsGSYbHq~twVuEwHtzTJfY4~3AQ__";

type ViewMode = "sessions" | "schools";

// ── Session Card ──────────────────────────────────────────────
function SessionCard({ session }: { session: (typeof sessions)[0] }) {
  const school = schoolsMap[session.schoolId];
  const typeStyle =
    sessionTypeColors[session.type] || "bg-stone-100 text-stone-700 border-stone-200";
  const isMulti = session.type === "Multi-College Session";

  return (
    <div className="group bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Top accent bar using school color */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: school?.color || "#1B4F72" }}
      />

      <div className="p-4 flex flex-col flex-1">
        {/* School name + type badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: school?.color || "#1B4F72" }}
            />
            <span className="text-xs font-semibold text-stone-500 truncate">
              {school?.shortName || school?.name}
            </span>
            {school && (
              <span className="text-[10px] text-stone-300 shrink-0">
                {school.type === "National University"
                  ? `#${school.rank}`
                  : `LAC #${school.rank}`}
              </span>
            )}
          </div>
          <span
            className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm border font-medium ${typeStyle}`}
          >
            {session.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[14px] font-bold text-stone-800 leading-snug mb-2 group-hover:text-teal-800 transition-colors">
          {session.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {session.description}
        </p>

        {/* Partner schools for multi-college */}
        {isMulti && session.partnerSchools && (
          <div className="flex flex-wrap gap-1 mb-2">
            {session.partnerSchools.map((p) => (
              <span
                key={p}
                className="text-[10px] px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded-sm border border-violet-100"
              >
                + {p}
              </span>
            ))}
          </div>
        )}

        {/* Date / time info */}
        <div className="space-y-1 mb-3">
          {session.isRolling ? (
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <RefreshCw size={11} className="text-teal-600" />
              <span className="text-teal-700 font-medium">滚动开放报名</span>
              <span className="text-stone-400">— 可选择任意可用日期</span>
            </div>
          ) : session.dates ? (
            <div className="flex items-start gap-1.5 text-xs text-stone-500">
              <Calendar size={11} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="flex flex-wrap gap-1">
                {session.dates.map((d) => (
                  <span
                    key={d}
                    className="bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded-sm font-mono text-[10px]"
                  >
                    {new Date(d + "T00:00:00").toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {session.time && (
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
              <Clock size={11} />
              <span>{session.time}</span>
              {session.duration && (
                <>
                  <span className="text-stone-200">·</span>
                  <span>{session.duration}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={session.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-sm transition-colors"
        >
          <Video size={12} />
          前往报名
          <ChevronRight size={11} />
        </a>
      </div>
    </div>
  );
}

// ── School Card (directory view) ──────────────────────────────
function SchoolCard({ school }: { school: School }) {
  const schoolSessions = sessions.filter((s) => s.schoolId === school.id);
  const isNational = school.type === "National University";

  return (
    <div className="group bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: school.color }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-[14px] font-bold text-stone-800 leading-snug group-hover:text-teal-800 transition-colors">
            {school.shortName || school.name}
          </h3>
          <span className="shrink-0 text-[11px] font-mono font-bold border px-1.5 py-0.5 rounded-sm text-stone-500 border-stone-200">
            {isNational ? `#${school.rank}` : `LAC #${school.rank}`}
          </span>
        </div>
        {school.shortName && (
          <p className="text-[11px] text-stone-400 mb-1 truncate">{school.name}</p>
        )}
        <div className="flex items-center gap-1 text-[11px] text-stone-400 mb-2">
          <MapPin size={10} />
          <span>{school.location}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {school.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Session count */}
        <div className="flex items-center gap-1 text-[11px] text-teal-700 mb-3">
          <Video size={11} />
          <span>{schoolSessions.length} 场活动可报名</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <a
            href={school.registrationPage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-sm transition-colors"
          >
            <Calendar size={11} />
            查看日程
          </a>
          <a
            href={school.admissionPage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 border border-stone-200 hover:border-teal-500 text-stone-500 hover:text-teal-700 text-xs rounded-sm transition-colors"
          >
            <ExternalLink size={11} />
          </a>
        </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#F7F4EF]/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-teal-700" size={20} />
            <span className="font-serif text-lg font-bold text-stone-800">
              Admit<span className="text-teal-700">Lens</span>
            </span>
            <span className="hidden sm:inline text-xs text-stone-400 ml-1 border-l border-stone-200 pl-2">
              美国本科招生 Virtual Info Session 导航
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-stone-400">
              收录 <strong className="text-stone-700">80</strong> 所院校
            </span>
            <button
              className="sm:hidden text-teal-700 flex items-center gap-1 text-xs"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Filter size={14} />
              筛选
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="relative h-48 sm:h-60 overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/65 via-stone-900/40 to-[#F7F4EF]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-2 font-medium">
            US News Top 50 综合大学 · Top 30 文理学院
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow">
            招生 Virtual Info Session
          </h1>
          <p className="text-stone-200 text-sm max-w-lg">
            汇聚各校招生官（AO）主持的线上宣讲活动，按日程整理，一键直达报名入口
          </p>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-center gap-1 bg-stone-100 rounded-sm p-1 w-fit">
          <button
            onClick={() => setView("sessions")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-sm font-medium transition-colors ${
              view === "sessions"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Calendar size={14} />
            活动日程
          </button>
          <button
            onClick={() => setView("schools")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-sm font-medium transition-colors ${
              view === "schools"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Building2 size={14} />
            学校目录
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex gap-6">
        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed sm:static inset-0 z-40 sm:z-auto
            w-60 shrink-0
            bg-[#F7F4EF] sm:bg-transparent
            border-r border-stone-200 sm:border-0
            overflow-y-auto
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            pt-16 sm:pt-0 px-4 sm:px-0
          `}
        >
          <button
            className="sm:hidden absolute top-4 right-4 text-stone-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>

          <div className="sticky top-20 space-y-5">
            {/* Search */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 block">
                搜索
              </label>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <Input
                  placeholder="学校名称、活动类型..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white border-stone-200 rounded-sm focus-visible:ring-teal-600"
                />
              </div>
            </div>

            {/* School type */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 block">
                学校类型
              </label>
              <div className="space-y-0.5">
                {(
                  [
                    "All",
                    "National University",
                    "Liberal Arts College",
                  ] as const
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSchoolTypeFilter(t)}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                      schoolTypeFilter === t
                        ? "bg-teal-700 text-white"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {t === "All" ? (
                      <GraduationCap size={12} />
                    ) : (
                      <BookOpen size={12} />
                    )}
                    {t === "All"
                      ? "全部院校"
                      : t === "National University"
                      ? "综合大学"
                      : "文理学院"}
                  </button>
                ))}
              </div>
            </div>

            {/* Session type filter (only in sessions view) */}
            {view === "sessions" && (
              <div>
                <label className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 block">
                  活动类型
                </label>
                <div className="space-y-0.5">
                  {sessionTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`w-full text-left text-xs px-3 py-1.5 rounded-sm transition-colors ${
                        typeFilter === t
                          ? "bg-teal-700 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {t === "All" ? "全部类型" : t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="border-t border-stone-200 pt-4 space-y-1 text-xs">
              {view === "sessions" ? (
                <>
                  <div className="flex justify-between text-stone-500">
                    <span>滚动报名</span>
                    <span className="font-medium text-stone-700">
                      {filteredSessions.filter((s) => s.isRolling).length} 场
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>固定日期</span>
                    <span className="font-medium text-stone-700">
                      {filteredSessions.filter((s) => !s.isRolling).length} 场
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-stone-700 pt-1 border-t border-stone-100">
                    <span>共计</span>
                    <span>{filteredSessions.length} 场活动</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-medium text-stone-700">
                  <span>共计</span>
                  <span>{filteredSchools.length} 所学校</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {view === "sessions" ? (
            <>
              {/* Rolling sessions banner */}
              {filteredSessions.some((s) => s.isRolling) && (
                <div className="mb-4 p-3 bg-teal-50 border border-teal-100 rounded-sm flex items-start gap-2">
                  <RefreshCw size={14} className="text-teal-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-teal-800">
                    <strong>滚动开放报名</strong>的活动可全年随时选择日期注册，点击"前往报名"后在各校官网日历中选择可用时段。
                  </p>
                </div>
              )}

              {/* Rolling sessions */}
              {filteredSessions.filter((s) => s.isRolling).length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-stone-200" />
                    <div className="flex items-center gap-2 text-teal-700">
                      <RefreshCw size={13} />
                      <h2 className="font-serif text-xs font-bold uppercase tracking-widest">
                        滚动开放报名 · Rolling Registration
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredSessions
                      .filter((s) => s.isRolling)
                      .map((s) => (
                        <SessionCard key={s.id} session={s} />
                      ))}
                  </div>
                </section>
              )}

              {/* Scheduled sessions */}
              {filteredSessions.filter((s) => !s.isRolling).length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-stone-200" />
                    <div className="flex items-center gap-2 text-amber-700">
                      <Calendar size={13} />
                      <h2 className="font-serif text-xs font-bold uppercase tracking-widest">
                        固定日期活动 · Scheduled Events
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredSessions
                      .filter((s) => !s.isRolling)
                      .map((s) => (
                        <SessionCard key={s.id} session={s} />
                      ))}
                  </div>
                </section>
              )}

              {filteredSessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                  <Search size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">没有找到匹配的活动</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("All");
                      setSchoolTypeFilter("All");
                    }}
                    className="mt-3 text-xs text-teal-600 hover:underline"
                  >
                    清除筛选条件
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Schools view */
            <>
              {/* National Universities */}
              {filteredSchools.filter((s) => s.type === "National University")
                .length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-stone-200" />
                    <div className="flex items-center gap-2 text-teal-700">
                      <BookOpen size={13} />
                      <h2 className="font-serif text-xs font-bold uppercase tracking-widest">
                        综合大学 · National Universities
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredSchools
                      .filter((s) => s.type === "National University")
                      .sort((a, b) => a.rank - b.rank)
                      .map((s) => (
                        <SchoolCard key={s.id} school={s} />
                      ))}
                  </div>
                </section>
              )}

              {/* Liberal Arts Colleges */}
              {filteredSchools.filter((s) => s.type === "Liberal Arts College")
                .length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-stone-200" />
                    <div className="flex items-center gap-2 text-teal-700">
                      <GraduationCap size={13} />
                      <h2 className="font-serif text-xs font-bold uppercase tracking-widest">
                        文理学院 · Liberal Arts Colleges
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredSchools
                      .filter((s) => s.type === "Liberal Arts College")
                      .sort((a, b) => a.rank - b.rank)
                      .map((s) => (
                        <SchoolCard key={s.id} school={s} />
                      ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <GraduationCap size={13} className="text-teal-700" />
            <span className="font-serif font-bold text-stone-600">AdmitLens</span>
            <span>· 美国本科招生 Virtual Info Session 导航</span>
          </div>
          <p>所有报名链接均指向各大学官方招生网站，请以各校官网最新日程为准</p>
        </div>
      </footer>
    </div>
  );
}
