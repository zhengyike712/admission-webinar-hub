// Design: Minimal — white background, clean typography, no decorative elements
// Palette: white bg, #111 text, #2563eb accent (blue-600), stone-100 borders
// Font: system-ui for body, no decorative serifs
// Layout: left sidebar filter + right content grid

import { useState, useMemo, useRef, useEffect } from "react";
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
  CalendarPlus,
  ChevronDown,
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

// ── Timezone conversion ─────────────────────────────────────
// Detect a friendly label for the user's local timezone
function getLocalTzLabel(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes("Shanghai") || tz.includes("Chongqing") || tz.includes("Beijing")) return "北京时间";
  if (tz.includes("Hong_Kong")) return "香港时间";
  if (tz.includes("Taipei")) return "台北时间";
  if (tz.includes("Singapore")) return "新加坡时间";
  if (tz.includes("Tokyo") || tz.includes("Seoul")) return "东京/首尔时间";
  if (tz.includes("London")) return "伦敦时间";
  if (tz.includes("Paris") || tz.includes("Berlin")) return "欧洲中部时间";
  // Generic: show short timezone abbreviation
  const abbr = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value || "当地";
  return `当地时间 (${abbr})`;
}

const LOCAL_TZ_LABEL = getLocalTzLabel();

// Parse a time string like "7:00 PM ET" or "8:00 PM ET / 7:00 PM CT"
// and return the equivalent local time string.
function convertToLocalTime(timeStr: string, referenceDate?: string): string | null {
  // Only handle strings that contain a parseable ET/CT/PT time
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(ET|CT|PT|MT)/i);
  if (!match) return null;

  const [, hourStr, minuteStr, ampm, tz] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

  // UTC offset for each zone (standard time; ET = UTC-5, CT = UTC-6, PT = UTC-8)
  // We use a fixed reference date to determine DST: use the session date if available
  const tzMap: Record<string, string> = {
    ET: "America/New_York",
    CT: "America/Chicago",
    MT: "America/Denver",
    PT: "America/Los_Angeles",
  };
  const ianaZone = tzMap[tz.toUpperCase()] || "America/New_York";

  try {
    // Build a UTC date by interpreting the time in the source timezone
    const dateStr = referenceDate || new Date().toISOString().slice(0, 10);
    // Use Intl to get the UTC offset for that timezone on that date
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // Create a Date at noon UTC on the reference date, then adjust
    const baseDate = new Date(`${dateStr}T12:00:00Z`);
    // Get what time it is in the source timezone at noon UTC
    const parts = formatter.formatToParts(baseDate);
    const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
    // UTC offset in hours: 12 (UTC noon) - tzHour
    const utcOffset = 12 - tzHour;
    // Build the event time in UTC
    const eventUtc = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
    eventUtc.setHours(eventUtc.getHours() + utcOffset);

    // Format in user's local timezone
    const localStr = eventUtc.toLocaleTimeString(navigator.language || "zh-CN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Detect if user is in a non-ET timezone to avoid redundant display
    const userTzOffset = -new Date().getTimezoneOffset() / 60;
    const sourceTzOffset = -utcOffset;
    if (Math.abs(userTzOffset - sourceTzOffset) < 0.5) return null; // same zone, skip

    return localStr;
  } catch {
    return null;
  }
}

// ── Calendar helpers ─────────────────────────────────────────
// Parse "7:00 PM ET" on a given date string into a UTC Date
function parseEventDateTime(dateStr: string, timeStr: string): Date | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(ET|CT|PT|MT)/i);
  if (!match) return null;
  const [, hourStr, minuteStr, ampm, tz] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  const tzMap: Record<string, string> = {
    ET: "America/New_York",
    CT: "America/Chicago",
    MT: "America/Denver",
    PT: "America/Los_Angeles",
  };
  const ianaZone = tzMap[tz.toUpperCase()] || "America/New_York";
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const baseDate = new Date(`${dateStr}T12:00:00Z`);
    const parts = formatter.formatToParts(baseDate);
    const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
    const utcOffset = 12 - tzHour;
    const eventUtc = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
    eventUtc.setHours(eventUtc.getHours() + utcOffset);
    return eventUtc;
  } catch {
    return null;
  }
}

function toICSDatetime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(".000", "");
}

function buildICS(title: string, description: string, url: string, dates: string[], timeStr: string, durationMin: number): string {
  const events = dates.map((dateStr) => {
    const start = parseEventDateTime(dateStr, timeStr);
    if (!start) return "";
    const end = new Date(start.getTime() + durationMin * 60000);
    return [
      "BEGIN:VEVENT",
      `DTSTART:${toICSDatetime(start)}`,
      `DTEND:${toICSDatetime(end)}`,
      `SUMMARY:${title.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${description.replace(/,/g, "\\,")}\\n\\n报名链接: ${url}`,
      `URL:${url}`,
      `UID:${dateStr}-${title.replace(/\s+/g, "-").toLowerCase()}@admitlens`,
      "END:VEVENT",
    ].join("\r\n");
  }).filter(Boolean);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AdmitLens//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
}

function parseDurationMinutes(durationStr?: string): number {
  if (!durationStr) return 60;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

function buildGoogleCalendarUrl(title: string, description: string, url: string, dateStr: string, timeStr: string, durationMin: number): string {
  const start = parseEventDateTime(dateStr, timeStr);
  if (!start) return "";
  const end = new Date(start.getTime() + durationMin * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `${description}\n\n报名链接: ${url}`,
    location: url,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── Add to Calendar dropdown ──────────────────────────────
function AddToCalendarButton({ session, school }: { session: (typeof sessions)[0]; school: ReturnType<typeof Object.values<(typeof sessions)[0]>> | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session.dates || session.dates.length === 0 || session.isRolling) return null;
  if (!session.time || !session.time.match(/(ET|CT|PT|MT)/i)) return null;

  const durationMin = parseDurationMinutes(session.duration);
  const schoolName = typeof school === "object" && school !== null && "name" in school
    ? (school as { name: string }).name
    : "";
  const title = `${schoolName ? schoolName + " - " : ""}${session.title}`;
  const description = session.description;
  const url = session.registrationUrl;

  function downloadICS() {
    const ics = buildICS(title, description, url, session.dates!, session.time!, durationMin);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_").slice(0, 40)}.ics`;
    link.click();
    setOpen(false);
  }

  // For Google Calendar, use the first upcoming date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDates = session.dates.filter((d) => new Date(d + "T00:00:00") >= today);
  const firstDate = upcomingDates[0] || session.dates[0];
  const googleUrl = buildGoogleCalendarUrl(title, description, url, firstDate, session.time, durationMin);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1.5 w-full py-2 border border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700 text-xs font-medium transition-colors duration-150"
      >
        <CalendarPlus size={11} />
        添加到日历
        <ChevronDown size={10} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-200 shadow-md z-20 overflow-hidden">
          <button
            onClick={() => { window.open(googleUrl, "_blank"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-red-500 w-4">G</span>
            Google 日历
          </button>
          <div className="h-px bg-stone-100" />
          <button
            onClick={downloadICS}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-blue-500 w-4">↓</span>
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

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
          <div className="flex items-start gap-1.5 text-xs text-stone-400">
            <Clock size={10} className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span>{session.time}</span>
              {(() => {
                const refDate = session.dates?.[0] ?? undefined;
                const local = convertToLocalTime(session.time, refDate);
                return local ? (
                  <span className="text-blue-500 font-medium">
                    {LOCAL_TZ_LABEL} {local}
                  </span>
                ) : null;
              })()}
              {session.duration && <span className="text-stone-300">时长 {session.duration}</span>}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-2 mt-auto">
        {!session.isRolling && session.dates && session.dates.length > 0 && (
          <AddToCalendarButton session={session} school={school as any} />
        )}
        <a
          href={session.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white text-xs font-medium transition-colors duration-150"
        >
          前往报名
          <ArrowUpRight size={12} />
        </a>
      </div>
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
