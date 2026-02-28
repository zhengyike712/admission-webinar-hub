/**
 * NotionEmbed.tsx
 *
 * A lightweight, iframe-embeddable widget designed to be pasted into Notion
 * via an Embed block. It shows upcoming Info Sessions for a specific school
 * (or all schools) in a compact card format.
 *
 * Usage in Notion:
 *   1. Type /embed in a Notion page
 *   2. Paste: https://<your-domain>/embed?school=MIT&lang=zh
 *
 * Query params:
 *   school  — school ID (optional, shows all if omitted)
 *   lang    — zh | en | hi (default: zh)
 *   limit   — max sessions to show (default: 5)
 *   theme   — light | dark (default: light)
 */

import { useState, useEffect, useMemo } from "react";
import { allSessions, allSchools, schoolsMap } from "@/data/schools";
import { ExternalLink, Calendar, Clock } from "lucide-react";

type Lang = "zh" | "en" | "hi";
type Theme = "light" | "dark";

const T = {
  zh: {
    upcoming: "即将举行",
    register: "报名",
    rolling: "全年开放",
    noEvents: "暂无即将举行的活动",
    allSchools: "所有学校",
    viewAll: "查看全部",
    poweredBy: "景深留学",
    sessions: "场活动",
    dataSource: "数据每日更新 · 直连各校官方 Portal",
  },
  en: {
    upcoming: "Upcoming",
    register: "Register",
    rolling: "Year-round",
    noEvents: "No upcoming events",
    allSchools: "All Schools",
    viewAll: "View all",
    poweredBy: "AdmitLens",
    sessions: "sessions",
    dataSource: "Updated daily · Direct from school portals",
  },
  hi: {
    upcoming: "आगामी",
    register: "पंजीकरण",
    rolling: "वर्ष भर",
    noEvents: "कोई आगामी कार्यक्रम नहीं",
    allSchools: "सभी विश्वविद्यालय",
    viewAll: "सभी देखें",
    poweredBy: "AdmitLens",
    sessions: "कार्यक्रम",
    dataSource: "रोजाना अपडेट · सीधे विश्वविद्यालय पोर्टल से",
  },
} as const;

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    school: p.get("school") || "",
    lang: (p.get("lang") as Lang) || "zh",
    limit: parseInt(p.get("limit") || "5", 10),
    theme: (p.get("theme") as Theme) || "light",
  };
}

function formatDate(dateStr: string, lang: Lang): string {
  const locale = lang === "zh" ? "zh-CN" : lang === "hi" ? "hi-IN" : "en-US";
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

export default function NotionEmbed() {
  const [params] = useState(getParams);
  const { school: schoolId, lang, limit, theme } = params;
  const t = T[lang] || T.zh;

  const isDark = theme === "dark";

  // Filter sessions
  const sessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allSessions
      .filter((s) => {
        if (schoolId) {
    const sid = schoolId.toLowerCase();
    const school = allSchools.find(
      (sc) =>
        String(sc.id) === sid ||
        sc.name.toLowerCase().includes(sid) ||
        sc.shortName?.toLowerCase() === sid
    );
    if (!school) return false;
    if (s.schoolId !== school.id) return false;
        }
        if (s.isRolling) return true;
        if (!s.dates || s.dates.length === 0) return false;
        return s.dates.some((d) => new Date(d + "T00:00:00") >= today);
      })
      .slice(0, limit);
  }, [schoolId, limit]);

  const schoolName = useMemo(() => {
    if (!schoolId) return t.allSchools;
    const sid = schoolId.toLowerCase();
    const school = allSchools.find(
      (sc) =>
        String(sc.id) === sid ||
        sc.name.toLowerCase().includes(sid) ||
        sc.shortName?.toLowerCase() === sid
    );
    return school?.shortName || school?.name || t.allSchools;
  }, [schoolId, t]);

  // Inject minimal CSS reset for iframe context
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e5e7eb";
  const text = isDark ? "#f3f4f6" : "#111827";
  const subtext = isDark ? "#9ca3af" : "#6b7280";
  const cardBg = isDark ? "#242424" : "#f9fafb";
  const accent = "#2563eb";

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: "12px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          paddingBottom: "8px",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: subtext, marginBottom: "2px" }}>
            {t.upcoming}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: text }}>
            {schoolName}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "10px",
              color: subtext,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {t.poweredBy}
            <ExternalLink size={9} />
          </a>
          <span style={{ fontSize: "9px", color: subtext, opacity: 0.7 }}>{t.dataSource}</span>
        </div>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            color: subtext,
            fontSize: "12px",
          }}
        >
          {t.noEvents}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {sessions.map((s) => {
            const school = schoolsMap[s.schoolId];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcomingDates = s.isRolling
              ? []
              : (s.dates || []).filter(
                  (d) => new Date(d + "T00:00:00") >= today
                );
            const nextDate = upcomingDates[0];

            return (
              <div
                key={s.id}
                style={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "6px",
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* School name */}
                  {!schoolId && school && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: accent,
                        fontWeight: 600,
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {school.shortName || school.name}
                    </div>
                  )}
                  {/* Session title */}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.title}
                  </div>
                  {/* Date / rolling */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "3px",
                    }}
                  >
                    {s.isRolling ? (
                      <>
                        <Clock size={9} color={subtext} />
                        <span style={{ fontSize: "10px", color: subtext }}>
                          {t.rolling}
                        </span>
                      </>
                    ) : nextDate ? (
                      <>
                        <Calendar size={9} color={subtext} />
                        <span style={{ fontSize: "10px", color: subtext }}>
                          {formatDate(nextDate, lang)}
                          {s.time && (
                            <span style={{ marginLeft: "4px" }}>{s.time}</span>
                          )}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Register button */}
                <a
                  href={s.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flexShrink: 0,
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#fff",
                    background: accent,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.register}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: view all link */}
      <div
        style={{
          marginTop: "10px",
          textAlign: "center",
          paddingTop: "8px",
          borderTop: `1px solid ${border}`,
        }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "10px",
            color: accent,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          {t.viewAll} →
        </a>
      </div>
    </div>
  );
}
