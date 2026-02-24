// ============================================================
// Design Philosophy: Academic Archive × Editorial
// - Parchment background (#F7F4EF), deep teal accent (#1B4F72)
// - Playfair Display for headings, Source Sans Pro for body
// - Left sidebar filter + right card grid layout
// - Each card has a 3px teal left border (archive folder style)
// - Rank badges styled as ink stamps
// ============================================================

import { useState, useMemo } from "react";
import { schools, type School, type SchoolType } from "@/data/schools";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Youtube, GraduationCap, BookOpen, MapPin, Filter, X } from "lucide-react";

const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/EeGMS51PkjxqdmDWuPRUyT/sandbox/oTXMxzhYVw1zsbPZvO70up-img-1_1771927859000_na1fn_aGVyby1iZw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvRWVHTVM1MVBranhxZG1EV3VQUlV5VC9zYW5kYm94L29UWE14emhZVncxenNiUFp2TzcwdXAtaW1nLTFfMTc3MTkyNzg1OTAwMF9uYTFmbl9hR1Z5YnkxaVp3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iOt~dRNJJt6g2R04Bj0Rm5hC89nKihTTB~JRSwyd1fhpsB43uxS3kYIY3gb6aNb9PI040pbh0aK2tRKajc9v1yR0UHofo3mHIS3vTUOvSydDnhlQP0fhxs-bhGkHJoP3QMKLcWntPq5zqtGYPMORnKtPW-bd-iud-zN02-I~2BlJmvbanoc6A5r1ihv3pS81FdWOjFT0K29hx2nYYeY2~4B0pSfMjaJDURUQ87EO4MCmW~06GrAzrbNZtjMFCX6W7e5ywLTyJq3JEz7Uo~VC3f6XNR1oCocrgQvQt4YSIiP-JonduiTAtBzArI-OsGSYbHq~twVuEwHtzTJfY4~3AQ__";

type FilterType = SchoolType | "All";

function SchoolCard({ school }: { school: School }) {
  const isNational = school.type === "National University";
  const rankLabel = isNational ? `#${school.rank}` : `LAC #${school.rank}`;

  return (
    <div className="school-card group relative bg-white border border-stone-200 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-teal-700 group-hover:bg-amber-500 transition-colors duration-300" />

      <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-[15px] font-bold text-stone-800 leading-snug group-hover:text-teal-800 transition-colors">
              {school.shortName || school.name}
            </h3>
            {school.shortName && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">{school.name}</p>
            )}
          </div>
          {/* Rank badge */}
          <span className="shrink-0 inline-flex items-center justify-center min-w-[44px] h-[22px] px-2 text-[11px] font-bold border border-teal-700 text-teal-700 rounded-sm font-mono tracking-wide">
            {rankLabel}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-stone-400 mb-2">
          <MapPin size={10} />
          <span>{school.location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 leading-relaxed mb-3 flex-1 line-clamp-2">
          {school.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {school.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-stone-100">
          <a
            href={school.webinarPlaylist}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-sm transition-colors"
          >
            <Youtube size={12} />
            招生视频
          </a>
          <a
            href={school.admissionPage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-1.5 border border-stone-200 hover:border-teal-600 hover:text-teal-700 text-stone-500 text-xs rounded-sm transition-colors"
          >
            <ExternalLink size={11} />
            官网
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const popularTags = ["Ivy League", "No Loan Policy", "STEM", "Pre-Med", "Women's College", "Public", "CS", "Business", "Engineering", "Research"];

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchTag = !tagFilter || s.tags.includes(tagFilter);
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.shortName?.toLowerCase().includes(q) ?? false) ||
        s.location.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q));
      return matchType && matchTag && matchSearch;
    });
  }, [search, typeFilter, tagFilter]);

  const nationalCount = filtered.filter((s) => s.type === "National University").length;
  const liberalArtsCount = filtered.filter((s) => s.type === "Liberal Arts College").length;

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#F7F4EF]/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-teal-700" size={20} />
            <span className="font-serif text-lg font-bold text-stone-800 tracking-tight">
              Admit<span className="text-teal-700">Lens</span>
            </span>
            <span className="hidden sm:inline text-xs text-stone-400 ml-1 border-l border-stone-200 pl-2">
              美国本科招生 Webinar 导航
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="hidden sm:inline">收录 <strong className="text-stone-700">80</strong> 所顶尖院校</span>
            <button
              className="sm:hidden flex items-center gap-1 text-teal-700"
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
        className="relative h-52 sm:h-64 overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-[#F7F4EF]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-2 font-medium">
            US News Top 50 综合大学 · Top 30 文理学院
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight drop-shadow">
            美国顶尖大学招生 Webinar
          </h1>
          <p className="text-stone-200 text-sm max-w-md">
            汇聚各校官方 YouTube 招生频道，一站直达第一手信息
          </p>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed sm:static inset-0 z-40 sm:z-auto
            w-64 shrink-0
            bg-[#F7F4EF] sm:bg-transparent
            border-r border-stone-200 sm:border-0
            overflow-y-auto sm:overflow-visible
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
            pt-14 sm:pt-0 px-4 sm:px-0
          `}
        >
          {/* Mobile close */}
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
                搜索学校
              </label>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  placeholder="学校名称、地点..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm bg-white border-stone-200 rounded-sm focus-visible:ring-teal-600"
                />
              </div>
            </div>

            {/* Type filter */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 block">
                学校类型
              </label>
              <div className="space-y-1">
                {(["All", "National University", "Liberal Arts College"] as FilterType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2 ${
                      typeFilter === t
                        ? "bg-teal-700 text-white"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {t === "All" && <GraduationCap size={13} />}
                    {t === "National University" && <BookOpen size={13} />}
                    {t === "Liberal Arts College" && <BookOpen size={13} />}
                    <span>
                      {t === "All" ? "全部院校" : t === "National University" ? "综合大学" : "文理学院"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 block">
                特色标签
              </label>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-sm border transition-colors ${
                      tagFilter === tag
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-stone-200 text-stone-500 hover:border-teal-600 hover:text-teal-700 bg-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {tagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="mt-2 text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
                >
                  <X size={10} /> 清除标签筛选
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="border-t border-stone-200 pt-4 space-y-1">
              <div className="flex justify-between text-xs text-stone-500">
                <span>综合大学</span>
                <span className="font-medium text-stone-700">{nationalCount} 所</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>文理学院</span>
                <span className="font-medium text-stone-700">{liberalArtsCount} 所</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-stone-700 pt-1 border-t border-stone-100">
                <span>共计</span>
                <span>{filtered.length} 所</span>
              </div>
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

        {/* ── Card Grid ── */}
        <main className="flex-1 min-w-0">
          {/* Section headers */}
          {(typeFilter === "All" || typeFilter === "National University") && nationalCount > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-stone-200" />
                <div className="flex items-center gap-2 text-teal-700">
                  <BookOpen size={14} />
                  <h2 className="font-serif text-sm font-bold uppercase tracking-widest">
                    综合大学 · National Universities
                  </h2>
                </div>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered
                  .filter((s) => s.type === "National University")
                  .sort((a, b) => a.rank - b.rank)
                  .map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
              </div>
            </section>
          )}

          {(typeFilter === "All" || typeFilter === "Liberal Arts College") && liberalArtsCount > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-stone-200" />
                <div className="flex items-center gap-2 text-teal-700">
                  <GraduationCap size={14} />
                  <h2 className="font-serif text-sm font-bold uppercase tracking-widest">
                    文理学院 · Liberal Arts Colleges
                  </h2>
                </div>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered
                  .filter((s) => s.type === "Liberal Arts College")
                  .sort((a, b) => a.rank - b.rank)
                  .map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400">
              <Search size={32} className="mb-3 opacity-40" />
              <p className="text-sm">没有找到匹配的学校</p>
              <button
                onClick={() => { setSearch(""); setTypeFilter("All"); setTagFilter(null); }}
                className="mt-3 text-xs text-teal-600 hover:underline"
              >
                清除所有筛选条件
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <GraduationCap size={13} className="text-teal-700" />
            <span className="font-serif font-bold text-stone-600">AdmitLens</span>
            <span>· 美国本科招生 Webinar 导航</span>
          </div>
          <p>所有视频链接均指向各大学官方 YouTube 频道，数据仅供参考</p>
        </div>
      </footer>
    </div>
  );
}
