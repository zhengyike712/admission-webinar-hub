/**
 * NotionTemplate.tsx
 *
 * Landing page for Notion integration:
 * - Explains how to embed the AdmitLens widget in Notion
 * - Provides a one-click Notion template duplicate link
 * - Shows embed URL builder with live preview
 */

import { useState } from "react";
import { ExternalLink, Copy, Check, BookOpen, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allSchools } from "@/data/schools";

const SITE_ORIGIN = window.location.origin;

// Notion template duplicate URL — replace with your actual published template
const NOTION_TEMPLATE_URL =
  "https://www.notion.so/templates/college-application-tracker";

type Lang = "zh" | "en" | "hi";

const T = {
  zh: {
    heroTitle: "将景深留学嵌入你的 Notion",
    heroDesc:
      "把招生 Info Session 日历直接放进你的申请追踪 Notion 页面，无需切换标签页。",
    step1: "第一步：复制申请追踪模板",
    step1Desc:
      "点击下方按钮，将景深留学官方 Notion 申请追踪模板复制到你的工作区。模板内已预置嵌入小窗口位置。",
    getTemplate: "获取 Notion 模板",
    step2: "第二步：在 Notion 中嵌入小窗口",
    step2Desc:
      "在你的 Notion 页面中输入 /embed，然后粘贴下方生成的链接。小窗口会实时显示即将举行的 Info Session。",
    buildEmbed: "生成嵌入链接",
    school: "学校（可选）",
    allSchools: "全部学校",
    lang: "语言",
    limit: "显示数量",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    embedUrl: "嵌入链接",
    copyLink: "复制链接",
    copied: "已复制！",
    previewTitle: "预览",
    howTitle: "如何在 Notion 中嵌入",
    how1: "在 Notion 页面中输入 /embed",
    how2: "粘贴上方生成的链接",
    how3: "按 Enter 确认，小窗口即刻出现",
    features: "功能特点",
    feat1: "实时显示最新 Info Session 日程",
    feat2: "支持中文、英文、印地语",
    feat3: "浅色/深色主题，适配 Notion 风格",
    feat4: "点击报名直达官方注册页面",
    feat5: "无需登录，即嵌即用",
  },
  en: {
    heroTitle: "Embed AdmitLens in Your Notion",
    heroDesc:
      "Put your college admissions Info Session calendar directly inside your Notion application tracker — no tab switching needed.",
    step1: "Step 1: Get the Application Tracker Template",
    step1Desc:
      "Click below to duplicate the official AdmitLens Notion template into your workspace. The embed widget slot is already set up.",
    getTemplate: "Get Notion Template",
    step2: "Step 2: Embed the Widget in Notion",
    step2Desc:
      "Type /embed in your Notion page, then paste the generated link below. The widget shows upcoming Info Sessions in real time.",
    buildEmbed: "Build Embed Link",
    school: "School (optional)",
    allSchools: "All Schools",
    lang: "Language",
    limit: "Max sessions",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    embedUrl: "Embed URL",
    copyLink: "Copy link",
    copied: "Copied!",
    previewTitle: "Preview",
    howTitle: "How to embed in Notion",
    how1: "Type /embed in a Notion page",
    how2: "Paste the generated link above",
    how3: "Press Enter — the widget appears instantly",
    features: "Features",
    feat1: "Real-time upcoming Info Session schedule",
    feat2: "Supports Chinese, English, and Hindi",
    feat3: "Light/dark theme to match Notion style",
    feat4: "One-click registration to official pages",
    feat5: "No login required — embed and go",
  },
  hi: {
    heroTitle: "AdmitLens को Notion में एम्बेड करें",
    heroDesc:
      "अपने कॉलेज प्रवेश Info Session कैलेंडर को सीधे अपने Notion ट्रैकर में रखें।",
    step1: "चरण 1: एप्लीकेशन ट्रैकर टेम्पलेट प्राप्त करें",
    step1Desc:
      "नीचे क्लिक करके AdmitLens Notion टेम्पलेट को अपने वर्कस्पेस में डुप्लिकेट करें।",
    getTemplate: "Notion टेम्पलेट प्राप्त करें",
    step2: "चरण 2: Notion में विजेट एम्बेड करें",
    step2Desc:
      "अपने Notion पेज में /embed टाइप करें, फिर नीचे जेनरेट किया गया लिंक पेस्ट करें।",
    buildEmbed: "एम्बेड लिंक बनाएं",
    school: "विश्वविद्यालय (वैकल्पिक)",
    allSchools: "सभी विश्वविद्यालय",
    lang: "भाषा",
    limit: "अधिकतम सत्र",
    theme: "थीम",
    light: "हल्का",
    dark: "गहरा",
    embedUrl: "एम्बेड URL",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी हो गया!",
    previewTitle: "पूर्वावलोकन",
    howTitle: "Notion में एम्बेड कैसे करें",
    how1: "Notion पेज में /embed टाइप करें",
    how2: "ऊपर जेनरेट किया गया लिंक पेस्ट करें",
    how3: "Enter दबाएं — विजेट तुरंत दिखेगा",
    features: "विशेषताएं",
    feat1: "रियल-टाइम आगामी Info Session शेड्यूल",
    feat2: "चीनी, अंग्रेजी और हिंदी समर्थन",
    feat3: "Notion स्टाइल के लिए लाइट/डार्क थीम",
    feat4: "आधिकारिक पंजीकरण पेज पर एक-क्लिक",
    feat5: "लॉगिन की आवश्यकता नहीं",
  },
} as const;

export default function NotionTemplate() {
  const urlLang = (new URLSearchParams(window.location.search).get("lang") as Lang) || "zh";
  const [lang] = useState<Lang>(urlLang);
  const t = T[lang] || T.zh;

  const [school, setSchool] = useState("");
  const [embedLang, setEmbedLang] = useState<Lang>(lang);
  const [limit, setLimit] = useState(5);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const embedUrl = `${SITE_ORIGIN}/embed?lang=${embedLang}&limit=${limit}&theme=${theme}${school ? `&school=${encodeURIComponent(school)}` : ""}`;

  function copyUrl() {
    navigator.clipboard.writeText(embedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-stone-800 hover:text-blue-600 transition-colors">
          ← {lang === "zh" ? "返回景深留学" : lang === "hi" ? "← वापस जाएं" : "← Back to AdmitLens"}
        </a>
        <span className="text-xs text-stone-400">Notion Integration</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Layers size={12} />
            Notion Widget
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">{t.heroTitle}</h1>
          <p className="text-stone-500 text-base max-w-xl mx-auto">{t.heroDesc}</p>
        </div>

        {/* Step 1: Template */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="text-base font-semibold text-stone-800">{t.step1}</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4 ml-8">{t.step1Desc}</p>
          <div className="ml-8">
            <a
              href={NOTION_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                <BookOpen size={14} />
                {t.getTemplate}
                <ExternalLink size={12} />
              </Button>
            </a>
          </div>
        </section>

        {/* Step 2: Embed builder */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-base font-semibold text-stone-800">{t.step2}</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4 ml-8">{t.step2Desc}</p>

          {/* Builder form */}
          <div className="ml-8 border border-stone-200 rounded-lg p-5 bg-stone-50 space-y-4">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{t.buildEmbed}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* School */}
              <div>
                <label className="text-xs text-stone-500 block mb-1">{t.school}</label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800"
                >
                  <option value="">{t.allSchools}</option>
                  {allSchools.map((s) => (
                    <option key={s.id} value={s.shortName || s.name}>
                      {s.shortName || s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs text-stone-500 block mb-1">{t.lang}</label>
                <select
                  value={embedLang}
                  onChange={(e) => setEmbedLang(e.target.value as Lang)}
                  className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              {/* Limit */}
              <div>
                <label className="text-xs text-stone-500 block mb-1">{t.limit}</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800"
                >
                  {[3, 5, 8, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="text-xs text-stone-500 block mb-1">{t.theme}</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                  className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800"
                >
                  <option value="light">{t.light}</option>
                  <option value="dark">{t.dark}</option>
                </select>
              </div>
            </div>

            {/* Generated URL */}
            <div>
              <label className="text-xs text-stone-500 block mb-1">{t.embedUrl}</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={embedUrl}
                  className="flex-1 text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-700 font-mono"
                />
                <Button size="sm" variant="outline" onClick={copyUrl} className="gap-1 shrink-0">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t.copied : t.copyLink}
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <div>
              <label className="text-xs text-stone-500 block mb-2">{t.previewTitle}</label>
              <div className="border border-stone-200 rounded overflow-hidden" style={{ height: "320px" }}>
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="AdmitLens Notion Widget Preview"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <Zap size={15} className="text-amber-500" />
            {t.howTitle}
          </h2>
          <ol className="space-y-2 ml-5">
            {[t.how1, t.how2, t.how3].map((step, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                <span className="text-xs font-bold text-blue-600 mt-0.5 shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="border border-stone-200 rounded-lg p-5 bg-stone-50">
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">{t.features}</h2>
          <ul className="space-y-2">
            {[t.feat1, t.feat2, t.feat3, t.feat4, t.feat5].map((f, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-center gap-2">
                <Check size={12} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
