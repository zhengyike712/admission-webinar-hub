/**
 * NotionTemplate.tsx
 *
 * Integration hub for productivity tools:
 * - Notion: iframe embed widget + template
 * - Obsidian: iframe embed via custom HTML note
 * - Anytype: iframe embed via simple object
 * - API: direct JSON API for power users
 */

import { useState } from "react";
import { ExternalLink, Copy, Check, BookOpen, Layers, Zap, Code2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allSchools } from "@/data/schools";

const SITE_ORIGIN = window.location.origin;

const NOTION_TEMPLATE_URL =
  "https://www.notion.so/templates/college-application-tracker";

type Lang = "zh" | "en" | "hi";
type IntegrationTab = "notion" | "obsidian" | "anytype" | "feishu" | "api";

const T = {
  zh: {
    pageTitle: "集成中心",
    pageDesc: "将景深的实时招生数据嵌入你的工作流工具，无需切换标签页。",
    tabNotion: "Notion",
    tabObsidian: "Obsidian",
    tabAnytype: "Anytype",
    tabFeishu: "飞书 / wolai",
    tabApi: "API",
    // Feishu / wolai
    feishuHeroTitle: "在飞书 / wolai 中嵌入景深",
    feishuHeroDesc: "将实时招生 Info Session 数据嵌入飞书多维表格、wolai 或 FlowUs 的页面，无需切换标签页。",
    feishuStep1: "第一步：复制嵌入链接",
    feishuStep1Desc: "使用下方链接生成器，根据你的需求调整语言、学校和显示数量，然后复制生成的链接。",
    feishuStep2Feishu: "飞书文档嵌入方法",
    feishuStep2FeishuDesc: "在飞书文档中，输入 / 打开命令菜单，选择「嵌入网页」，粘贴链接后回车即可。或者在多维表格的「URL」字段中粘贴链接，选择「卡片预览」模式。",
    feishuStep2Wolai: "wolai 嵌入方法",
    feishuStep2WolaiDesc: "在 wolai 页面中，输入 /embed 或点击 + 号选择「嵌入网页」，粘贴链接后确认。wolai 支持完整 iframe 渲染，可以看到实时更新的活动列表。",
    feishuStep2FlowUs: "FlowUs 嵌入方法",
    feishuStep2FlowUsDesc: "在 FlowUs 页面中，输入 /嵌入 或从菜单选择「嵌入」，粘贴链接后确认。FlowUs 同样支持 iframe 嵌入。",
    feishuNote: "提示：飞书文档的「嵌入网页」功能需要在飞书企业版或个人版中开启。如果无法嵌入，可以使用「超链接」功能，将链接添加为卡片形式展示。",
    feishuApiTitle: "进阶：直接调用 API 填充多维表格",
    feishuApiDesc: "如果你使用飞书多维表格管理申请信息，可以通过飞书自动化或脚本定期调用景深 API，将最新活动数据自动写入多维表格。",
    // Notion
    notionHeroTitle: "将景深嵌入你的 Notion",
    notionHeroDesc: "把招生 Info Session 日历直接放进你的申请追踪 Notion 页面，无需切换标签页。",
    step1: "第一步：复制申请追踪模板",
    step1Desc: "点击下方按钮，将景深官方 Notion 申请追踪模板复制到你的工作区。模板内已预置嵌入小窗口位置。",
    getTemplate: "获取 Notion 模板",
    step2: "第二步：在 Notion 中嵌入小窗口",
    step2Desc: "在你的 Notion 页面中输入 /embed，然后粘贴下方生成的链接。小窗口会实时显示即将举行的 Info Session。",
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
    feat3: "浅色/深色主题，适配各工具风格",
    feat4: "点击报名直达官方注册页面",
    feat5: "无需登录，即嵌即用",
    // Obsidian
    obsidianHeroTitle: "在 Obsidian 中嵌入景深",
    obsidianHeroDesc: "通过 Obsidian 的 HTML 代码块，将实时 Info Session 小窗口嵌入你的申请笔记中。",
    obsidianStep1: "第一步：安装 HTML 插件",
    obsidianStep1Desc: "在 Obsidian 社区插件中搜索并安装「HTML Reader」或「Webpage HTML Export」插件，或使用内置的 HTML 代码块（需开启 Restricted Mode 豁免）。",
    obsidianStep2: "第二步：在笔记中粘贴代码",
    obsidianStep2Desc: "在你的申请追踪笔记中，新建一个代码块，语言设为 html，然后粘贴下方代码。保存后即可看到实时小窗口。",
    obsidianCopyCode: "复制代码",
    obsidianNote: "提示：Obsidian 默认不渲染 HTML，需要启用相关插件或使用 Dataview 的 dv.el() 方法。推荐使用「Custom HTML Block」插件。",
    obsidianAltTitle: "备选方案：使用 Dataview 插件",
    obsidianAltDesc: "如果你已安装 Dataview 插件，可以在 dataviewjs 代码块中使用以下代码：",
    // Anytype
    anytypeHeroTitle: "在 Anytype 中嵌入景深",
    anytypeHeroDesc: "通过 Anytype 的书签或嵌入块，将景深的实时数据整合进你的申请追踪对象。",
    anytypeStep1: "第一步：创建嵌入块",
    anytypeStep1Desc: "在 Anytype 的任意对象中，输入 / 打开命令菜单，选择「Embed」或「Bookmark」，然后粘贴下方生成的链接。",
    anytypeStep2: "第二步：调整显示参数",
    anytypeStep2Desc: "使用下方的链接生成器，根据你的需求调整学校、语言和显示数量，然后将生成的链接粘贴到 Anytype 嵌入块中。",
    anytypeNote: "注意：Anytype 的嵌入块支持 iframe，可以完整显示景深小窗口。如果 Embed 块不可用，可以使用 Bookmark 块作为快速访问入口。",
    // API
    apiHeroTitle: "公开 JSON API",
    apiHeroDesc: "直接调用景深的公开 API，将实时数据集成到任何工具或工作流中。",
    apiEndpoint: "API 端点",
    apiParams: "请求参数",
    apiParamSchool: "school（可选）：按学校缩写筛选，如 MIT、Stanford",
    apiParamUpcoming: "upcoming（可选）：仅返回即将举行的活动（true/false）",
    apiParamLimit: "limit（可选）：返回数量上限，默认 20",
    apiExample: "示例请求",
    apiResponse: "响应格式",
    apiCopyUrl: "复制 API 链接",
    apiDocs: "查看完整文档",
    // Shared
    backToHome: "← 返回景深",
    integrationBadge: "集成中心",
  },
  en: {
    pageTitle: "Integration Hub",
    pageDesc: "Embed AdmitLens real-time admissions data into your workflow tools — no tab switching needed.",
    tabNotion: "Notion",
    tabObsidian: "Obsidian",
    tabAnytype: "Anytype",
    tabFeishu: "Feishu / wolai",
    tabApi: "API",
    // Feishu / wolai
    feishuHeroTitle: "Embed AdmitLens in Feishu / wolai",
    feishuHeroDesc: "Embed real-time Info Session data into Feishu Docs, wolai, or FlowUs pages — no tab switching needed.",
    feishuStep1: "Step 1: Copy the Embed Link",
    feishuStep1Desc: "Use the link builder below to customize language, school, and session count, then copy the generated link.",
    feishuStep2Feishu: "Feishu Docs Embed Method",
    feishuStep2FeishuDesc: "In a Feishu Doc, type / to open the command menu, select \"Embed Webpage\", paste the link, and press Enter. Or paste the link in a URL field in Feishu Base and select \"Card Preview\" mode.",
    feishuStep2Wolai: "wolai Embed Method",
    feishuStep2WolaiDesc: "In a wolai page, type /embed or click + and select \"Embed Webpage\", paste the link and confirm. wolai supports full iframe rendering with live updates.",
    feishuStep2FlowUs: "FlowUs Embed Method",
    feishuStep2FlowUsDesc: "In a FlowUs page, type /embed or select \"Embed\" from the menu, paste the link and confirm. FlowUs also supports iframe embedding.",
    feishuNote: "Note: Feishu's \"Embed Webpage\" feature requires Feishu Enterprise or Personal edition. If embedding is unavailable, use the \"Hyperlink\" feature to add the link as a card.",
    feishuApiTitle: "Advanced: Call the API to Populate Feishu Base",
    feishuApiDesc: "If you manage applications in Feishu Base, you can use Feishu Automation or scripts to periodically call the AdmitLens API and write the latest session data directly into your spreadsheet.",
    // Notion
    notionHeroTitle: "Embed AdmitLens in Your Notion",
    notionHeroDesc: "Put your college admissions Info Session calendar directly inside your Notion application tracker.",
    step1: "Step 1: Get the Application Tracker Template",
    step1Desc: "Click below to duplicate the official AdmitLens Notion template into your workspace. The embed widget slot is already set up.",
    getTemplate: "Get Notion Template",
    step2: "Step 2: Embed the Widget in Notion",
    step2Desc: "Type /embed in your Notion page, then paste the generated link below. The widget shows upcoming Info Sessions in real time.",
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
    feat3: "Light/dark theme to match your tool's style",
    feat4: "One-click registration to official pages",
    feat5: "No login required — embed and go",
    // Obsidian
    obsidianHeroTitle: "Embed AdmitLens in Obsidian",
    obsidianHeroDesc: "Use Obsidian's HTML code blocks to embed a live Info Session widget in your application notes.",
    obsidianStep1: "Step 1: Install an HTML Plugin",
    obsidianStep1Desc: "Search for and install the \"HTML Reader\" or \"Custom HTML Block\" plugin in Obsidian's community plugins. This allows rendering HTML iframes inside notes.",
    obsidianStep2: "Step 2: Paste the Code in Your Note",
    obsidianStep2Desc: "In your application tracking note, create a code block with language set to html, then paste the code below. Save to see the live widget.",
    obsidianCopyCode: "Copy Code",
    obsidianNote: "Note: Obsidian doesn't render HTML by default — you need to enable a plugin. We recommend the \"Custom HTML Block\" community plugin.",
    obsidianAltTitle: "Alternative: Using the Dataview Plugin",
    obsidianAltDesc: "If you have the Dataview plugin installed, use this code in a dataviewjs block:",
    // Anytype
    anytypeHeroTitle: "Embed AdmitLens in Anytype",
    anytypeHeroDesc: "Use Anytype's embed or bookmark block to integrate AdmitLens live data into your application tracking objects.",
    anytypeStep1: "Step 1: Create an Embed Block",
    anytypeStep1Desc: "In any Anytype object, type / to open the command menu, select \"Embed\" or \"Bookmark\", then paste the generated link below.",
    anytypeStep2: "Step 2: Adjust Display Parameters",
    anytypeStep2Desc: "Use the link builder below to customize school, language, and session count, then paste the generated link into the Anytype embed block.",
    anytypeNote: "Note: Anytype's embed block supports iframes and will display the full AdmitLens widget. If Embed is unavailable, use Bookmark as a quick-access shortcut.",
    // API
    apiHeroTitle: "Public JSON API",
    apiHeroDesc: "Call the AdmitLens public API directly to integrate real-time data into any tool or workflow.",
    apiEndpoint: "API Endpoint",
    apiParams: "Query Parameters",
    apiParamSchool: "school (optional): Filter by school abbreviation, e.g. MIT, Stanford",
    apiParamUpcoming: "upcoming (optional): Return only upcoming events (true/false)",
    apiParamLimit: "limit (optional): Max results to return, default 20",
    apiExample: "Example Request",
    apiResponse: "Response Format",
    apiCopyUrl: "Copy API URL",
    apiDocs: "View Full Docs",
    // Shared
    backToHome: "← Back to AdmitLens",
    integrationBadge: "Integration Hub",
  },
  hi: {
    pageTitle: "इंटीग्रेशन हब",
    pageDesc: "AdmitLens के रियल-टाइम डेटा को अपने वर्कफ्लो टूल में एम्बेड करें।",
    tabNotion: "Notion",
    tabObsidian: "Obsidian",
    tabAnytype: "Anytype",
    tabFeishu: "Feishu / wolai",
    tabApi: "API",
    // Feishu / wolai
    feishuHeroTitle: "Feishu / wolai में AdmitLens एम्बेड करें",
    feishuHeroDesc: "रियल-टाइम Info Session डेटा को Feishu Docs, wolai, या FlowUs पेज में एम्बेड करें।",
    feishuStep1: "चरण 1: एम्बेड लिंक कॉपी करें",
    feishuStep1Desc: "नीचे के लिंक बिल्डर का उपयोग करके भाषा, स्कूल और सत्र संख्या कस्टमाइज़ करें, फिर लिंक कॉपी करें।",
    feishuStep2Feishu: "Feishu Docs एम्बेड विधि",
    feishuStep2FeishuDesc: "Feishu Doc में / टाइप करें, \"Embed Webpage\" चुनें, लिंक पेस्ट करें और Enter दबाएं।",
    feishuStep2Wolai: "wolai एम्बेड विधि",
    feishuStep2WolaiDesc: "wolai पेज में /embed टाइप करें या + क्लिक करके \"Embed Webpage\" चुनें, लिंक पेस्ट करें।",
    feishuStep2FlowUs: "FlowUs एम्बेड विधि",
    feishuStep2FlowUsDesc: "FlowUs पेज में /embed टाइप करें या मेनू से \"Embed\" चुनें, लिंक पेस्ट करें।",
    feishuNote: "नोट: Feishu की एम्बेड सुविधा के लिए Enterprise या Personal संस्करण आवश्यक है।",
    feishuApiTitle: "उन्नत: Feishu Base में API डेटा भरें",
    feishuApiDesc: "Feishu Automation का उपयोग करके AdmitLens API को नियमित रूप से कॉल करें और नवीनतम सत्र डेटा स्वचालित रूप से लिखें।",
    // Notion
    notionHeroTitle: "AdmitLens को Notion में एम्बेड करें",
    notionHeroDesc: "अपने कॉलेज प्रवेश Info Session कैलेंडर को सीधे अपने Notion ट्रैकर में रखें।",
    step1: "चरण 1: एप्लीकेशन ट्रैकर टेम्पलेट प्राप्त करें",
    step1Desc: "नीचे क्लिक करके AdmitLens Notion टेम्पलेट को अपने वर्कस्पेस में डुप्लिकेट करें।",
    getTemplate: "Notion टेम्पलेट प्राप्त करें",
    step2: "चरण 2: Notion में विजेट एम्बेड करें",
    step2Desc: "अपने Notion पेज में /embed टाइप करें, फिर नीचे जेनरेट किया गया लिंक पेस्ट करें।",
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
    feat3: "लाइट/डार्क थीम",
    feat4: "आधिकारिक पंजीकरण पेज पर एक-क्लिक",
    feat5: "लॉगिन की आवश्यकता नहीं",
    // Obsidian
    obsidianHeroTitle: "Obsidian में AdmitLens एम्बेड करें",
    obsidianHeroDesc: "Obsidian के HTML कोड ब्लॉक का उपयोग करके लाइव Info Session विजेट एम्बेड करें।",
    obsidianStep1: "चरण 1: HTML प्लगइन इंस्टॉल करें",
    obsidianStep1Desc: "Obsidian के कम्युनिटी प्लगइन में \"Custom HTML Block\" खोजें और इंस्टॉल करें।",
    obsidianStep2: "चरण 2: अपने नोट में कोड पेस्ट करें",
    obsidianStep2Desc: "अपने एप्लीकेशन ट्रैकिंग नोट में html कोड ब्लॉक बनाएं और नीचे दिया गया कोड पेस्ट करें।",
    obsidianCopyCode: "कोड कॉपी करें",
    obsidianNote: "नोट: Obsidian डिफ़ॉल्ट रूप से HTML रेंडर नहीं करता — आपको एक प्लगइन सक्षम करना होगा।",
    obsidianAltTitle: "वैकल्पिक: Dataview प्लगइन का उपयोग करें",
    obsidianAltDesc: "यदि आपके पास Dataview प्लगइन है, तो dataviewjs ब्लॉक में यह कोड उपयोग करें:",
    // Anytype
    anytypeHeroTitle: "Anytype में AdmitLens एम्बेड करें",
    anytypeHeroDesc: "Anytype के एम्बेड ब्लॉक का उपयोग करके AdmitLens लाइव डेटा को एकीकृत करें।",
    anytypeStep1: "चरण 1: एम्बेड ब्लॉक बनाएं",
    anytypeStep1Desc: "किसी भी Anytype ऑब्जेक्ट में / टाइप करें, \"Embed\" चुनें और नीचे जेनरेट किया गया लिंक पेस्ट करें।",
    anytypeStep2: "चरण 2: डिस्प्ले पैरामीटर समायोजित करें",
    anytypeStep2Desc: "नीचे के लिंक बिल्डर का उपयोग करके स्कूल, भाषा और सत्र संख्या कस्टमाइज़ करें।",
    anytypeNote: "नोट: Anytype का एम्बेड ब्लॉक iframes को सपोर्ट करता है।",
    // API
    apiHeroTitle: "सार्वजनिक JSON API",
    apiHeroDesc: "AdmitLens के सार्वजनिक API को सीधे कॉल करें और किसी भी टूल में रियल-टाइम डेटा एकीकृत करें।",
    apiEndpoint: "API एंडपॉइंट",
    apiParams: "क्वेरी पैरामीटर",
    apiParamSchool: "school (वैकल्पिक): स्कूल संक्षिप्त नाम से फ़िल्टर करें, जैसे MIT, Stanford",
    apiParamUpcoming: "upcoming (वैकल्पिक): केवल आगामी इवेंट लौटाएं (true/false)",
    apiParamLimit: "limit (वैकल्पिक): अधिकतम परिणाम, डिफ़ॉल्ट 20",
    apiExample: "उदाहरण अनुरोध",
    apiResponse: "प्रतिक्रिया प्रारूप",
    apiCopyUrl: "API URL कॉपी करें",
    apiDocs: "पूर्ण दस्तावेज़ देखें",
    // Shared
    backToHome: "← AdmitLens पर वापस जाएं",
    integrationBadge: "इंटीग्रेशन हब",
  },
} as const;

// ── Shared Embed URL Builder ─────────────────────────────────
function EmbedBuilder({ t, lang }: { t: typeof T[Lang]; lang: Lang }) {
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
    <div className="border border-stone-200 rounded-lg p-5 bg-stone-50 space-y-4">
      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">{t.buildEmbed}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-stone-500 block mb-1">{t.school}</label>
          <select value={school} onChange={(e) => setSchool(e.target.value)} className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800">
            <option value="">{t.allSchools}</option>
            {allSchools.map((s) => (
              <option key={s.id} value={s.shortName || s.name}>{s.shortName || s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">{t.lang}</label>
          <select value={embedLang} onChange={(e) => setEmbedLang(e.target.value as Lang)} className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800">
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">{t.limit}</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800">
            {[3, 5, 8, 10].map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-500 block mb-1">{t.theme}</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")} className="w-full text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-800">
            <option value="light">{t.light}</option>
            <option value="dark">{t.dark}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-500 block mb-1">{t.embedUrl}</label>
        <div className="flex gap-2">
          <input readOnly value={embedUrl} className="flex-1 text-xs border border-stone-200 rounded px-2 py-1.5 bg-white text-stone-700 font-mono" />
          <Button size="sm" variant="outline" onClick={copyUrl} className="gap-1 shrink-0">
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? t.copied : t.copyLink}
          </Button>
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-500 block mb-2">{t.previewTitle}</label>
        <div className="border border-stone-200 rounded overflow-hidden" style={{ height: "320px" }}>
          <iframe key={embedUrl} src={embedUrl} style={{ width: "100%", height: "100%", border: "none" }} title="AdmitLens Widget Preview" />
        </div>
      </div>
    </div>
  );
}

// ── Code Block with Copy ─────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="relative">
      <pre className="bg-stone-900 text-stone-100 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 flex items-center gap-1 text-[10px] bg-stone-700 hover:bg-stone-600 text-stone-200 px-2 py-1 rounded transition-colors"
      >
        {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
        {copied ? "Copied!" : label}
      </button>
    </div>
  );
}

export default function NotionTemplate() {
  const urlLang = (new URLSearchParams(window.location.search).get("lang") as Lang) || "zh";
  const [lang] = useState<Lang>(urlLang);
  const t = T[lang] || T.zh;
  const [activeTab, setActiveTab] = useState<IntegrationTab>("notion");

  const embedUrl = `${SITE_ORIGIN}/embed?lang=${lang}&limit=5&theme=light`;
  const apiUrl = `${SITE_ORIGIN}/api/public/sessions?upcoming=true&limit=5`;

  const obsidianHtmlCode = `<iframe
  src="${embedUrl}"
  width="100%"
  height="400"
  frameborder="0"
  style="border-radius:8px;border:1px solid #e5e5e5;"
  title="AdmitLens Info Sessions"
></iframe>`;

  const obsidianDataviewCode = `\`\`\`dataviewjs
const container = dv.el("div", "", {cls: "admitlens-widget"});
container.innerHTML = \`<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" style="border-radius:8px;border:1px solid #e5e5e5;" title="AdmitLens Info Sessions"></iframe>\`;
\`\`\``;

  const apiResponseExample = `{
  "sessions": [
    {
      "id": "mit-general-info",
      "schoolId": "mit",
      "schoolName": "MIT",
      "title": "MIT Undergraduate Admissions Info Session",
      "type": "General Info Session",
      "dates": ["2026-03-15", "2026-04-05"],
      "time": "2:00 PM ET",
      "duration": "60 min",
      "registrationUrl": "https://mitadmissions.org/...",
      "isRolling": false
    }
  ],
  "total": 1,
  "updatedAt": "2026-02-28T03:00:00Z"
}`;

  const tabs: { id: IntegrationTab; label: string; icon: React.ReactNode }[] = [
    { id: "notion", label: t.tabNotion, icon: <Layers size={14} /> },
    { id: "obsidian", label: t.tabObsidian, icon: <BookOpen size={14} /> },
    { id: "anytype", label: t.tabAnytype, icon: <FileText size={14} /> },
    { id: "feishu", label: t.tabFeishu, icon: <Zap size={14} /> },
    { id: "api", label: t.tabApi, icon: <Code2 size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-stone-800 hover:text-blue-600 transition-colors">
          {t.backToHome}
        </a>
        <span className="text-xs text-stone-400">{t.integrationBadge}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Zap size={12} />
            {t.integrationBadge}
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">{t.pageTitle}</h1>
          <p className="text-stone-500 text-base max-w-xl mx-auto">{t.pageDesc}</p>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-stone-200 mb-8 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Notion Tab ── */}
        {activeTab === "notion" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.notionHeroTitle}</h2>
              <p className="text-stone-500 text-sm">{t.notionHeroDesc}</p>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-semibold text-stone-800">{t.step1}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.step1Desc}</p>
              <div className="ml-8">
                <a href={NOTION_TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    <BookOpen size={14} />
                    {t.getTemplate}
                    <ExternalLink size={12} />
                  </Button>
                </a>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-semibold text-stone-800">{t.step2}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.step2Desc}</p>
              <div className="ml-8">
                <EmbedBuilder t={t} lang={lang} />
              </div>
            </section>

            <section>
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
        )}

        {/* ── Obsidian Tab ── */}
        {activeTab === "obsidian" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.obsidianHeroTitle}</h2>
              <p className="text-stone-500 text-sm">{t.obsidianHeroDesc}</p>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-semibold text-stone-800">{t.obsidianStep1}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.obsidianStep1Desc}</p>
              <div className="ml-8">
                <a href="https://obsidian.md/plugins?search=html" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink size={14} />
                    {lang === "zh" ? "浏览 Obsidian 插件" : lang === "hi" ? "Obsidian प्लगइन देखें" : "Browse Obsidian Plugins"}
                  </Button>
                </a>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-semibold text-stone-800">{t.obsidianStep2}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.obsidianStep2Desc}</p>
              <div className="ml-8">
                <CodeBlock code={obsidianHtmlCode} label={t.obsidianCopyCode} />
              </div>
            </section>

            <section className="border border-amber-100 rounded-lg p-4 bg-amber-50">
              <p className="text-sm text-amber-800">{t.obsidianNote}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-800 mb-3">{t.obsidianAltTitle}</h2>
              <p className="text-sm text-stone-500 mb-4">{t.obsidianAltDesc}</p>
              <CodeBlock code={obsidianDataviewCode} label={t.obsidianCopyCode} />
            </section>
          </div>
        )}

        {/* ── Feishu / wolai Tab ── */}
        {activeTab === "feishu" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.feishuHeroTitle}</h2>
              <p className="text-stone-500 text-sm">{t.feishuHeroDesc}</p>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-semibold text-stone-800">{t.feishuStep1}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.feishuStep1Desc}</p>
              <div className="ml-8">
                <EmbedBuilder t={t} lang={lang} />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-semibold text-stone-800">
                  {lang === "zh" ? "选择你的工具" : lang === "hi" ? "अपना टूल चुनें" : "Choose Your Tool"}
                </h2>
              </div>
              <div className="ml-8 space-y-4">
                {/* Feishu */}
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                      {lang === "zh" ? "飞书文档" : "Feishu Docs"}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">{t.feishuStep2FeishuDesc}</p>
                </div>
                {/* wolai */}
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">wolai</span>
                  </div>
                  <p className="text-sm text-stone-600">{t.feishuStep2WolaiDesc}</p>
                </div>
                {/* FlowUs */}
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">FlowUs</span>
                  </div>
                  <p className="text-sm text-stone-600">{t.feishuStep2FlowUsDesc}</p>
                </div>
              </div>
            </section>

            <section className="border border-sky-100 rounded-lg p-4 bg-sky-50">
              <p className="text-sm text-sky-800">{t.feishuNote}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-800 mb-2">{t.feishuApiTitle}</h2>
              <p className="text-sm text-stone-500 mb-4">{t.feishuApiDesc}</p>
              <CodeBlock code={`GET ${SITE_ORIGIN}/api/public/sessions?upcoming=true&limit=10&lang=${lang}`} label={lang === "zh" ? "复制 API 链接" : "Copy API URL"} />
              <div className="mt-3">
                <a href="/api-docs" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  {lang === "zh" ? "查看完整 API 文档" : lang === "hi" ? "पूर्ण दस्तावेज़ देखें" : "View Full API Docs"}
                  <ExternalLink size={13} />
                </a>
              </div>
            </section>
          </div>
        )}

        {/* ── Anytype Tab ── */}
        {activeTab === "anytype" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.anytypeHeroTitle}</h2>
              <p className="text-stone-500 text-sm">{t.anytypeHeroDesc}</p>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-semibold text-stone-800">{t.anytypeStep1}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.anytypeStep1Desc}</p>
              <div className="ml-8">
                <a href="https://anytype.io" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink size={14} />
                    {lang === "zh" ? "了解 Anytype" : lang === "hi" ? "Anytype के बारे में जानें" : "Learn about Anytype"}
                  </Button>
                </a>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-semibold text-stone-800">{t.anytypeStep2}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4 ml-8">{t.anytypeStep2Desc}</p>
              <div className="ml-8">
                <EmbedBuilder t={t} lang={lang} />
              </div>
            </section>

            <section className="border border-teal-100 rounded-lg p-4 bg-teal-50">
              <p className="text-sm text-teal-800">{t.anytypeNote}</p>
            </section>
          </div>
        )}

        {/* ── API Tab ── */}
        {activeTab === "api" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.apiHeroTitle}</h2>
              <p className="text-stone-500 text-sm">{t.apiHeroDesc}</p>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">{t.apiEndpoint}</h3>
              <CodeBlock code={`GET ${SITE_ORIGIN}/api/public/sessions`} label={t.apiCopyUrl} />
            </section>

            <section>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">{t.apiParams}</h3>
              <div className="space-y-2">
                {[t.apiParamSchool, t.apiParamUpcoming, t.apiParamLimit].map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-blue-500 font-mono text-xs mt-0.5">•</span>
                    {p}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">{t.apiExample}</h3>
              <CodeBlock code={apiUrl} label={t.apiCopyUrl} />
            </section>

            <section>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">{t.apiResponse}</h3>
              <CodeBlock code={apiResponseExample} label="Copy" />
            </section>

            <div className="flex gap-3">
              <a href="/api-docs" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                {t.apiDocs}
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
