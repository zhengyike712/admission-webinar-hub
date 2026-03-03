// Design: Minimal white, system-ui, stone palette
// Palette: white bg, #111 text, #2563eb accent (blue-600), stone-100 borders
// Font: system-ui for body, no decorative serifs
// Layout: left sidebar filter + right content
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { useBrowsingTracker } from "@/hooks/useBrowsingTracker";
// import AIChatAssistant from "@/components/AIChatAssistant"; // temporarily hidden
import {
  allSchools,
  allSessions,
  schoolsMap,
  DATA_LAST_UPDATED,
  type SessionType,
  type School,
  type Region,
  type Session,
} from "@/data/schools";
import { interviewData, type SchoolInterview } from "@/data/interviews";
import { trpc } from "@/lib/trpc";
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
  Globe,
  Mail,
  UserCheck,
  UserX,
  Info,
  Share2,
  Copy,
  Check,
  Twitter,
} from "lucide-react";

type ViewMode = "sessions" | "schools" | "interviews";
type Lang = "zh" | "en" | "hi";

// ── i18n ─────────────────────────────────────────────────────
const T: Record<Lang, Record<string, string>> = {
  zh: {
    tagline: "全球高校招生公开信息平台",
    heroTitle: "好信息，早知道",
    heroDesc: "汇聚各校招生官（AO）主持的线上宣讲活动，一键直达官方报名入口",
    mission: "",
    tabSessions: "活动日程",
    tabSchools: "学校目录",
    tabInterviews: "面试入口",
    search: "搜索",
    searchPlaceholder: "学校或活动名称",
    schoolType: "学校类型",
    all: "全部",
    national: "综合大学",
    liberal: "文理学院",
    research: "研究型大学",
    comprehensive: "综合类大学",
    sessionType: "活动类型",
    allTypes: "全部类型",
    region: "地区",
    upcoming: "即将开始",
    rolling: "全年开放报名",
    rollingNote: "滚动开放活动全年可选日期，点击报名后可在官网自行选择时间段。",
    register: "入口",
    viewSchedule: "查看日程",
    noFixed: "暂无固定日期活动",
    noMatch: "没有匹配的活动",
    clearFilter: "清除筛选",
    noRolling: "暂无匹配",
    addToCalendar: "添加到日历",
    googleCal: "Google 日历",
    appleCal: "Apple / Outlook (.ics)",
    imminent: "即将开始",
    soon: "本月",
    subscribe: "订阅活动提醒",
    subscribePlaceholder: "输入邮箱，有新活动时通知你",
    subscribeBtn: "订阅",
    subscribeSuccess: "已订阅！发现新活动时将第一时间通知你",
    calSubscribe: "订阅日历",
    calSubscribeNote: "发现新活动时，我们会发邮件通知你。",
    footerBrand: "信息公开是最基本的公平。我们相信，每一个学生——无论来自哪里——都应该能与顶尖院校的招生官面对面地对话。",
    footerRoadmap: "覆盖计划",
    footerUs: "美国本科",
    footerUsLive: "已上线",
    footerUk: "英国本科（Russell Group）",
    footerHk: "香港 / 澳大利亚顶尖院校",
    footerCa: "加拿大本科（U15）",
    footerGrad: "研究生项目",
    footerSoon: "即将",
    footerPlanned: "规划中",
    footerDisclaimer: "所有链接均指向各院校官方招生网站，请以各校官网最新日程为准",
    footerMotto: "教育公平，从信息公开开始",
    regionAll: "全部地区",
    regionUS: "美国",
    regionUK: "英国",
    regionHK: "香港",
    regionAU: "澳大利亚",
    interviewAvailable: "提供面试",
    interviewNotAvailable: "不提供面试",
    interviewTypeLabel: "面试形式",
    interviewTimingLabel: "时间安排",
    interviewMethodSchool: "学校主动联系",
    interviewMethodApplicant: "申请人主动申请",
    interviewMethodRequired: "申请必须",
    interviewGoPortal: "入口",
    interviewLearnMore: "了解详情",
    interviewFilterAll: "全部",
    interviewFilterAvailable: "提供面试",
    interviewFilterNone: "不提供面试",
    interviewFilterNearDeadline: "近期截止（30天内）",
    interviewMethodFilterLabel: "申请方式",
    interviewMethodFilterAll: "全部方式",
    interviewMethodFilterSchool: "学校主动联系",
    interviewMethodFilterApplicant: "学生主动申请",
    interviewMethodFilterRequired: "必须参加",
    interviewSearchPlaceholder: "搜索学校名称或面试类型",
    interviewNote: "面试信息仅供参考，请以各校官网最新政策为准。部分面试名额有限，建议尽早申请。",
    interviewCount: "所学校面试信息",
    interviewDeadlineLabel: "报名截止",
    interviewAddDeadlineCal: "截止日提醒",
    interviewDeadlineGoogleCal: "Google 日历",
    interviewDeadlineICS: "Apple / Outlook (.ics)",
    interviewDeadlineTitle: "面试报名截止",
    onboardingWelcome: "跳过中介，直达招生官",
    onboardingAoTitle: "为什么要直接获取来自大学的一手信息",
    onboardingAo1Label: "招生官亲口回答你的问题",
    onboardingAo1Detail: "每场均由 Admissions Officer 主持，可当场提问、直接了解录取偏好和当年申请季的实际动态，这些信息中介不会告诉你",
    onboardingAo2Label: "获取官网上找不到的信息",
    onboardingAo2Detail: "学校特色、学生生活、社区氛围和当年申请季动态，这些内容只有招生官能告诉你",
    onboardingAo3Label: "建立真实的学校对话记录",
    onboardingAo3Detail: "部分院校会记录出席情况。直接参与官方活动，是向学校传递真实兴趣最直接的方式",
    onboardingF1Title: "覆盖全球顶校",
    onboardingF1Desc: "美国、英国、香港、澳大利亚顶尖院校，持续扩展中",
    onboardingF2Title: "集成到你的工作流",
    onboardingF2Desc: "支持嵌入 Notion / 飞书 / Obsidian，让招生信息成为申请规划的一部分",
    onboardingF3Title: "日历导出 · 支持批量",
    onboardingF3Desc: "勾选多场活动一键批量导出 .ics，或单独添加至 Google / Apple / Outlook",
    onboardingF4Title: "面试入口",
    onboardingF4Desc: "70+ 所美国顶尖院校面试政策，一键直达报名入口，支持截止日期日历提醒",
    onboardingStart: "开始探索",
    onboardingMotto: "好信息，早知道",
    onboardingDismiss: "不再显示",
    mobileFilterBtn: "筛选",
    mobileFilterTitle: "筛选",
    brandName: "景深",
    siteTitle: "景深 · 好信息，早知道",
    siteDesc: "汇聚 70+ 所美国顶尖院校面试政策和招生官线上宣讲活动，一站直达报名入口",
    shareBtn: "分享",
    shareLabel: "分享本站",
    onboardingSubtitle: "你了解顶尖大学招生的第一手窗口",
    footerCopyright: "© 2026 景深。所有信息均来自各校官网。",
    batchSelectedTpl: "已选 {n} 场活动",
    batchClear: "清除选择",
    batchExport: "批量导出日历 (.ics)",
    shareCopyLink: "复制链接",
    shareCopied: "已复制链接",
    shareWeChat: "分享到微信",
    shareTwitter: "分享到 X / Twitter",
    shareWeChatScan: "微信扫一扫分享",
    shareBack: "返回",
    howLabel: "申请方式：",
    interviewStatusLabel: "面试状态",
    interviewTotalTpl: "共 {n} 所学校面试信息",
    offerInterview: "提供面试",
    noInterview: "不提供",
    deadlineSoon: "近期截止",
    noMatchSchool: "没有匹配的学校",
    dataUpdated: "数据最后更新",
    noMatchVisitOfficial: "可直接访问官网查看最新日程",
    expiredHidden: "已结束的活动",
    showExpired: "显示已结束",
    hideExpired: "隐藏已结束",
    footerIntegrationsTitle: "集成",
    footerNotionLink: "Notion 集成",
    footerNotionLinkSub: "嵌入 Info Session 小窗口",
    footerNotionNew: "新",
    notionBannerText: "将景深嵌入你的 Notion 申请追踪页",
    notionBannerCta: "获取 Notion 集成 →",
    onboardingF5Title: "Notion 集成",
    onboardingF5Desc: "将 Info Session 日历嵌入你的申请追踪页，一站管理",
    mobileDesktopTitle: "完整功能需在电脑端使用",
    mobileDesktopDesc: "活动日程、筛选、面试备考、日历导出等功能在电脑上体验最佳。",
    mobileSendTitle: "发送到电脑",
    mobileScanQR: "扫码打开",
    mobileShareBtn: "系统分享",
    mobileEmailBtn: "发送到邮箱",
    mobileEmailPlaceholder: "输入邮箱地址",
    mobileEmailSend: "发送",
    mobileEmailSending: "发送中...",
    mobileEmailSent: "已发送！请检查邮箱",
    mobileEmailError: "发送失败，请重试",
    mobileEmailInvalid: "请输入有效邮箱",
    mobileCopyLink: "复制链接",
    mobileCopied: "已复制",
  },
  en: {
    tagline: "Global University Admissions Info Hub",
    heroTitle: "Admission Virtual Info Sessions",
    heroDesc: "Official virtual events hosted by admissions officers — direct links to registration.",
    mission: "Better info. Earlier.",
    tabSessions: "Events",
    tabSchools: "Schools",
    tabInterviews: "Interviews",
    search: "Search",
    searchPlaceholder: "School or event name",
    schoolType: "School Type",
    all: "All",
    national: "National University",
    liberal: "Liberal Arts College",
    research: "Research University",
    comprehensive: "Comprehensive University",
    sessionType: "Event Type",
    allTypes: "All Types",
    region: "Region",
    upcoming: "Upcoming",
    rolling: "Open Year-Round",
    rollingNote: "Rolling events allow you to pick a date on the school's website.",
    register: "Register",
    viewSchedule: "View Schedule",
    noFixed: "No upcoming scheduled events",
    noMatch: "No matching events",
    clearFilter: "Clear filters",
    noRolling: "No matches",
    addToCalendar: "Add to Calendar",
    googleCal: "Google Calendar",
    appleCal: "Apple / Outlook (.ics)",
    imminent: "Upcoming",
    soon: "This Month",
    subscribe: "Subscribe to Updates",
    subscribePlaceholder: "Enter email to get notified",
    subscribeBtn: "Subscribe",
    subscribeSuccess: "Subscribed! We'll notify you when new events are added.",
    calSubscribe: "Subscribe Calendar",
    calSubscribeNote: "We'll email you when new events are added.",
    footerBrand: "Information equity is the most basic form of fairness. Every student — regardless of where they come from — deserves direct access to admissions officers at top universities.",
    footerRoadmap: "Coverage Roadmap",
    footerUs: "US Undergraduate",
    footerUsLive: "Live",
    footerUk: "UK Undergraduate (Russell Group)",
    footerHk: "Hong Kong / Australia Top Universities",
    footerCa: "Canada Undergraduate (U15)",
    footerGrad: "Graduate Programs",
    footerSoon: "Soon",
    footerPlanned: "Planned",
    footerDisclaimer: "All links point to official university admissions websites. Please verify dates on each school's official site.",
    footerMotto: "Equal access to information, equal access to opportunity.",
    regionAll: "All Regions",
    regionUS: "United States",
    regionUK: "United Kingdom",
    regionHK: "Hong Kong",
    regionAU: "Australia",
    interviewAvailable: "Interview Available",
    interviewNotAvailable: "No Interview",
    interviewTypeLabel: "Interview Type",
    interviewTimingLabel: "Timing",
    interviewMethodSchool: "School contacts applicant",
    interviewMethodApplicant: "Applicant requests",
    interviewMethodRequired: "Required",
    interviewGoPortal: "Portal",
    interviewLearnMore: "Learn More",
    interviewFilterAll: "All",
    interviewFilterAvailable: "Available",
    interviewFilterNone: "Not Available",
    interviewFilterNearDeadline: "Deadline ≤30 Days",
    interviewMethodFilterLabel: "Request Method",
    interviewMethodFilterAll: "All Methods",
    interviewMethodFilterSchool: "School Contacts You",
    interviewMethodFilterApplicant: "You Request",
    interviewMethodFilterRequired: "Required",
    interviewSearchPlaceholder: "Search school name or interview type",
    interviewNote: "Interview information is for reference only. Please verify the latest policies on each school's official website. Some interview slots are limited — apply early.",
    interviewCount: "schools with interview info",
    interviewDeadlineLabel: "Deadline",
    interviewAddDeadlineCal: "Add Deadline",
    interviewDeadlineGoogleCal: "Google Calendar",
    interviewDeadlineICS: "Apple / Outlook (.ics)",
    interviewDeadlineTitle: "Interview Request Deadline",
    onboardingWelcome: "Skip the middleman. Hear it straight from admissions.",
    onboardingAoTitle: "Why Get First-Hand Information Directly from Universities?",
    onboardingAo1Label: "Get Answers Straight from Admissions Officers",
    onboardingAo1Detail: "Every session is AO-hosted. Ask real questions and hear directly about selection criteria and this cycle's trends — things no consultant will tell you",
    onboardingAo2Label: "Access Information You Won't Find on the Website",
    onboardingAo2Detail: "Campus culture, student life, community feel, and real-time application insights — only admissions officers can give you this",
    onboardingAo3Label: "Build a Real Track Record with Schools",
    onboardingAo3Detail: "Some schools track attendance. Engaging directly with official events is the most authentic way to signal genuine interest",
    onboardingF1Title: "Global Coverage",
    onboardingF1Desc: "US, UK, Hong Kong, Australia — and growing",
    onboardingF2Title: "Integrate into Your Workflow",
    onboardingF2Desc: "Embed into Notion / Feishu / Obsidian and make admissions info part of your application planning",
    onboardingF3Title: "Calendar Export · Batch",
    onboardingF3Desc: "Select multiple events and export as one .ics, or add individually to Google / Apple / Outlook",
    onboardingF4Title: "Interview Portal",
    onboardingF4Desc: "70+ US schools' interview policies, direct signup links, and deadline calendar reminders",
    onboardingStart: "Start Exploring",
    onboardingMotto: "Better info. Earlier.",
    onboardingDismiss: "Don't show again",
    mobileFilterBtn: "Filter",
    mobileFilterTitle: "Filter",
    brandName: "AdmitLens",
    siteTitle: "AdmitLens · Know More, Know Earlier",
    siteDesc: "70+ US top university interview policies & info sessions in one place",
    shareBtn: "Share",
    shareLabel: "Share this site",
    onboardingSubtitle: "Your direct window into top university admissions",
    footerCopyright: "© 2026 AdmitLens. All information sourced from official university websites.",
    batchSelectedTpl: "{n} event{plural} selected",
    batchClear: "Clear",
    batchExport: "Export to Calendar (.ics)",
    shareCopyLink: "Copy link",
    shareCopied: "Copied!",
    shareWeChat: "Share to WeChat",
    shareTwitter: "Share to X / Twitter",
    shareWeChatScan: "Scan with WeChat",
    shareBack: "Back",
    howLabel: "How: ",
    interviewStatusLabel: "Status",
    interviewTotalTpl: "{n} schools with interview info",
    offerInterview: "offer interviews",
    noInterview: "no interview",
    deadlineSoon: "deadline soon",
    noMatchSchool: "No matching schools",
    dataUpdated: "Last updated",
    noMatchVisitOfficial: "Visit the school's official website for the latest schedule",
    expiredHidden: "Past events",
    showExpired: "Show past",
    hideExpired: "Hide past",
    footerIntegrationsTitle: "Integrations",
    footerNotionLink: "Notion Integration",
    footerNotionLinkSub: "Embed Info Session widget",
    footerNotionNew: "NEW",
    notionBannerText: "Embed AdmitLens into your Notion application tracker",
    notionBannerCta: "Get Notion Integration →",
    onboardingF5Title: "Notion Integration",
    onboardingF5Desc: "Embed the Info Session calendar into your application tracker",
    mobileDesktopTitle: "Full features available on desktop",
    mobileDesktopDesc: "Session calendar, filters, interview tools, and calendar export are best experienced on desktop.",
    mobileSendTitle: "Send to Computer",
    mobileScanQR: "Scan to open",
    mobileShareBtn: "Share",
    mobileEmailBtn: "Send to Email",
    mobileEmailPlaceholder: "Enter your email address",
    mobileEmailSend: "Send",
    mobileEmailSending: "Sending...",
    mobileEmailSent: "Sent! Check your inbox",
    mobileEmailError: "Failed to send, please retry",
    mobileEmailInvalid: "Please enter a valid email",
    mobileCopyLink: "Copy link",
    mobileCopied: "Copied!",
  },
  hi: {
    tagline: "विश्वविद्यालय प्रवेश सूचना केंद्र",
    heroTitle: "सही जानकारी, सही समय पर",
    heroDesc: "प्रवेश अधिकारियों द्वारा आयोजित ऑनलाइन कार्यक्रम — सीधे रजिस्ट्रेशन लिंक",
    mission: "अच्छी जानकारी। पहले।",
    tabSessions: "कार्यक्रम",
    tabSchools: "विश्वविद्यालय",
    tabInterviews: "इंटरव्यू",
    search: "खोजें",
    searchPlaceholder: "विश्वविद्यालय या कार्यक्रम नाम",
    schoolType: "विश्वविद्यालय प्रकार",
    all: "सभी",
    national: "राष्ट्रीय विश्वविद्यालय",
    liberal: "उदार कला महाविद्यालय",
    research: "शोध विश्वविद्यालय",
    comprehensive: "व्यापक विश्वविद्यालय",
    sessionType: "कार्यक्रम प्रकार",
    allTypes: "सभी प्रकार",
    region: "क्षेत्र",
    upcoming: "आगामी",
    rolling: "साल भर खुला",
    rollingNote: "रोलिंग इवेंट में आप विश्वविद्यालय की वेबसाइट पर तारीख चुन सकते हैं।",
    register: "रजिस्टर",
    viewSchedule: "शेड्यूल देखें",
    noFixed: "कोई निर्धारित कार्यक्रम नहीं",
    noMatch: "कोई मिलान नहीं",
    clearFilter: "फ़िल्टर हटाएं",
    noRolling: "कोई मिलान नहीं",
    addToCalendar: "कैलेंडर में जोड़ें",
    googleCal: "Google कैलेंडर",
    appleCal: "Apple / Outlook (.ics)",
    imminent: "आगामी",
    soon: "इस महीने",
    subscribe: "अपडेट सदस्यता",
    subscribePlaceholder: "सूचना के लिए ईमेल दर्ज करें",
    subscribeBtn: "सदस्यता लें",
    subscribeSuccess: "सदस्यता सफल! नए कार्यक्रम जुड़ने पर सूचित करेंगे।",
    calSubscribe: "कैलेंडर सदस्यता",
    calSubscribeNote: "नए कार्यक्रम जुड़ने पर ईमेल भेजेंगे।",
    footerBrand: "सूचना की समानता सबसे बुनियादी न्याय है। हर छात्र — चाहे कहीं से हो — शीर्ष विश्वविद्यालयों के प्रवेश अधिकारियों तक सीधी पहुंच का अधिकार रखता है।",
    footerRoadmap: "कवरेज रोडमैप",
    footerUs: "अमेरिकी स्नातक",
    footerUsLive: "लाइव",
    footerUk: "यूके स्नातक (Russell Group)",
    footerHk: "हांगकांग / ऑस्ट्रेलिया",
    footerCa: "कनाडा स्नातक (U15)",
    footerGrad: "स्नातकोत्तर कार्यक्रम",
    footerSoon: "जल्द",
    footerPlanned: "योजनाबद्ध",
    footerDisclaimer: "सभी लिंक संबंधित विश्वविद्यालय की अधिकारिक वेबसाइट की ओर इंगित करते हैं। कृपया नवीनतम तारिखें सत्यापित करें।",
    footerMotto: "सूचना तक समान पहुंच, अवसर तक समान पहुंच।",
    regionAll: "सभी क्षेत्र",
    regionUS: "अमेरिका",
    regionUK: "यूनाइटेड किंगडम",
    regionHK: "हांगकांग",
    regionAU: "ऑस्ट्रेलिया",
    interviewAvailable: "इंटरव्यू उपलब्ध",
    interviewNotAvailable: "इंटरव्यू नहीं",
    interviewTypeLabel: "इंटरव्यू प्रकार",
    interviewTimingLabel: "समय",
    interviewMethodSchool: "विश्वविद्यालय संपर्क करता है",
    interviewMethodApplicant: "आवेदक अनुरोध करता है",
    interviewMethodRequired: "अनिवार्य",
    interviewGoPortal: "Portal",
    interviewLearnMore: "अधिक जानें",
    interviewFilterAll: "सभी",
    interviewFilterAvailable: "उपलब्ध",
    interviewFilterNone: "उपलब्ध नहीं",
    interviewFilterNearDeadline: "अंतिम तारीख ≤30 दिन",
    interviewMethodFilterLabel: "अनुरोध विधि",
    interviewMethodFilterAll: "सभी विधि",
    interviewMethodFilterSchool: "विश्वविद्यालय संपर्क करता है",
    interviewMethodFilterApplicant: "आप अनुरोध करते हैं",
    interviewMethodFilterRequired: "अनिवार्य",
    interviewSearchPlaceholder: "विश्वविद्यालय नाम या साक्षात्कार प्रकार खोजें",
    interviewNote: "इंटरव्यू जानकारी केवल संदर्भ के लिए है। कृपया नवीनतम नीतियां सत्यापित करें। कुछ स्लॉट सीमित हैं — जल्द आवेदन करें।",
    interviewCount: "विश्वविद्यालयों की इंटरव्यू जानकारी",
    interviewDeadlineLabel: "अंतिम तारीख",
    interviewAddDeadlineCal: "अंतिम तारीख जोड़ें",
    interviewDeadlineGoogleCal: "Google कैलेंडर",
    interviewDeadlineICS: "Apple / Outlook (.ics)",
    interviewDeadlineTitle: "इंटरव्यू अनुरोध अंतिम तारीख",
    onboardingWelcome: "मध्यस्थ को छोड़ें। सीधे प्रवेश अधिकारियों से सुनें।",
    onboardingAoTitle: "विश्वविद्यालयों से सीधे प्रथमदृष्टि जानकारी क्यों लें?",
    onboardingAo1Label: "प्रवेश अधिकारियों से सीधे जवाब पाएं",
    onboardingAo1Detail: "हर सेशन AO द्वारा होस्ट किया जाता है। सीधे सवाल पूछें और चयन मानदंड जानें — जो कोई कंसल्टेंट नहीं बताएगा",
    onboardingAo2Label: "वेबसाइट पर न मिलने वाली जानकारी पाएं",
    onboardingAo2Detail: "कैंपस संस्कृति, छात्र जीवन और वर्तमान सत्र की जानकारी — केवल प्रवेश अधिकारी ही यह दे सकते हैं",
    onboardingAo3Label: "विश्वविद्यालयों के साथ वास्तविक संपर्क बनाएं",
    onboardingAo3Detail: "कुछ विश्वविद्यालय उपस्थिति रिकॉर्ड करते हैं। सीधे आधिकारिक कार्यक्रमों में भाग लेना वास्तविक रुचि दिखाने का सर्वोत्तम तरीका है",
    onboardingF1Title: "वैश्विक कवरेज",
    onboardingF1Desc: "अमेरिका, यूके, हांगकांग, ऑस्ट्रेलिया — और बढ़ता हुआ",
    onboardingF2Title: "अपने वर्कफ्लो में जोड़ें",
    onboardingF2Desc: "Notion / Feishu / Obsidian में एम्बेड करें और प्रवेश जानकारी को अपनी योजना का हिस्सा बनाएं",
    onboardingF3Title: "कैलेंडर एक्सपोर्ट · बैच",
    onboardingF3Desc: "कई कार्यक्रम चुनें और .ics निर्यात करें, या Google / Apple / Outlook में अलग से जोड़ें",
    onboardingF4Title: "इंटरव्यू पोर्टल",
    onboardingF4Desc: "70+ अमेरिकी विश्वविद्यालयों की इंटरव्यू नीति, सीधे साइनअप लिंक",
    onboardingStart: "अन्वेषण शुरू करें",
    onboardingMotto: "अच्छी जानकारी। पहले।",
    onboardingDismiss: "फिर नहीं दिखाएं",
    mobileFilterBtn: "फ़िल्टर",
    mobileFilterTitle: "फ़िल्टर",
    brandName: "AdmitLens",
    siteTitle: "AdmitLens · अच्छी जानकारी। पहले।",
    siteDesc: "70+ अमेरिकी विश्वविद्यालयों की इंटरव्यू नीति और वर्चुअल इन्फो सेशन एक जगह",
    shareBtn: "शेयर",
    shareLabel: "इस साइट को शेयर करें",
    onboardingSubtitle: "शीर्ष विश्वविद्यालय प्रवेश की सीधी जानकारी",
    footerCopyright: "© 2026 AdmitLens. सभी जानकारी विश्वविद्यालयों की आधिकारिक वेबसाइटों से ली गई है।",
    batchSelectedTpl: "{n} कार्यक्रम चुने गए",
    batchClear: "साफ करें",
    batchExport: "कैलेंडर में निर्यात करें (.ics)",
    shareCopyLink: "लिंक कॉपी करें",
    shareCopied: "कॉपी हो गई!",
    shareWeChat: "WeChat पर शेयर करें",
    shareTwitter: "X / Twitter पर शेयर करें",
    shareWeChatScan: "WeChat से स्कैन करें",
    shareBack: "वापस",
    howLabel: "तरीका: ",
    interviewStatusLabel: "स्थिति",
    interviewTotalTpl: "{n} विश्वविद्यालयों की इंटरव्यू जानकारी",
    offerInterview: "इंटरव्यू उपलब्ध",
    noInterview: "उपलब्ध नहीं",
    deadlineSoon: "अंतिम तारीख नजदीक",
    noMatchSchool: "कोई मिलान वाला विश्वविद्यालय नहीं",
    dataUpdated: "Last updated",
    noMatchVisitOfficial: "Visit the school's official website for the latest schedule",
    expiredHidden: "Past events",
    showExpired: "Show past",
    hideExpired: "Hide past",
    footerIntegrationsTitle: "एकीकरण",
    footerNotionLink: "Notion एकीकरण",
    footerNotionLinkSub: "Info Session विजेट एम्बेड करें",
    footerNotionNew: "नया",
    notionBannerText: "AdmitLens को अपने Notion आवेदन ट्रैकर में एम्बेड करें",
    notionBannerCta: "Notion एकीकरण प्राप्त करें →",
    onboardingF5Title: "Notion एकीकरण",
    onboardingF5Desc: "Info Session कैलेंडर को अपने आवेदन ट्रैकर में एम्बेड करें",
    mobileDesktopTitle: "पूर्ण सुविधाएं डेस्कटॉप पर उपलब्ध",
    mobileDesktopDesc: "कार्यक्रम कैलेंडर, फ़िल्टर, इंटरव्यू टूल्स और कैलेंडर एक्सपोर्ट डेस्कटॉप पर सर्वोत्तम हैं।",
    mobileSendTitle: "कंप्यूटर पर भेजें",
    mobileScanQR: "स्कैन करें",
    mobileShareBtn: "शेयर करें",
    mobileEmailBtn: "ईमेल पर भेजें",
    mobileEmailPlaceholder: "ईमेल पता दर्ज करें",
    mobileEmailSend: "भेजें",
    mobileEmailSending: "भेजा जा रहा है...",
    mobileEmailSent: "भेजा गया! इनबॉक्स जांचें",
    mobileEmailError: "भेजना विफल, पुनः प्रयास करें",
    mobileEmailInvalid: "कृपया वैध ईमेल दर्ज करें",
    mobileCopyLink: "लिंक कॉपी करें",
    mobileCopied: "कॉपी हो गई!",
  },
} as const;

const SESSION_TYPE_LABELS_ZH: Record<SessionType, string> = {
  "General Info Session": "综合宣讲",
  "Up Close / Specialty": "专题深度",
  "Multi-College Session": "多校联合",
  "Regional Session": "地区专场",
  "Student Forum": "学生论坛",
  "Financial Aid Session": "奖学金",
  "International Student Session": "国际生专场",
};

// ── Timezone conversion ─────────────────────────────────────
function getLocalTzLabel(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes("Shanghai") || tz.includes("Chongqing") || tz.includes("Beijing")) return "北京时间";
  if (tz.includes("Hong_Kong")) return "香港时间";
  if (tz.includes("Taipei")) return "台北时间";
  if (tz.includes("Singapore")) return "新加坡时间";
  if (tz.includes("Tokyo") || tz.includes("Seoul")) return "东京/首尔时间";
  if (tz.includes("London")) return "London time";
  if (tz.includes("Paris") || tz.includes("Berlin")) return "CET";
  const abbr = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value || "Local";
  return `Local (${abbr})`;
}

const LOCAL_TZ_LABEL = getLocalTzLabel();

function convertToLocalTime(timeStr: string, referenceDate?: string): string | null {
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
    const dateStr = referenceDate || new Date().toISOString().slice(0, 10);
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
    const localStr = eventUtc.toLocaleTimeString(navigator.language || "zh-CN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const userTzOffset = -new Date().getTimezoneOffset() / 60;
    const sourceTzOffset = -utcOffset;
    if (Math.abs(userTzOffset - sourceTzOffset) < 0.5) return null;
    return localStr;
  } catch {
    return null;
  }
}

// ── Calendar helpers ─────────────────────────────────────────
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
      `DESCRIPTION:${description.replace(/,/g, "\\,")}\\n\\nRegister: ${url}`,
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
    details: `${description}\n\nRegister: ${url}`,
    location: url,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ── Add to Calendar dropdown ──────────────────────────────
function AddToCalendarButton({ session, school, compact, t }: {
  session: (typeof allSessions)[0];
  school: School | undefined;
  compact?: boolean;
  t: typeof T["zh"];
}) {
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
  const schoolName = school?.name || "";
  const title = `${schoolName ? schoolName + " - " : ""}${session.title}`;
  const url = session.registrationUrl;

  function downloadICS() {
    const ics = buildICS(title, session.description, url, session.dates!, session.time!, durationMin);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_").slice(0, 40)}.ics`;
    link.click();
    setOpen(false);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDates = session.dates.filter((d) => new Date(d + "T00:00:00") >= today);
  const firstDate = upcomingDates[0] || session.dates[0];
  const googleUrl = buildGoogleCalendarUrl(title, session.description, url, firstDate, session.time, durationMin);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={compact
          ? "flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-700 transition-colors"
          : "flex items-center justify-center gap-1.5 w-full py-2 border border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700 text-xs font-medium transition-colors duration-150"
        }
      >
        <CalendarPlus size={compact ? 10 : 11} />
        {!compact && <>{t.addToCalendar}</>}
        <ChevronDown size={compact ? 9 : 10} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-200 shadow-md z-20 overflow-hidden min-w-[140px]">
          <button
            onClick={() => { window.open(googleUrl, "_blank"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-red-500 w-4">G</span>
            {t.googleCal}
          </button>
          <div className="h-px bg-stone-100" />
          <button
            onClick={downloadICS}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-blue-500 w-4">↓</span>
            {t.appleCal}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Urgency helpers ─────────────────────────────────────────
function getUrgency(session: (typeof allSessions)[0]): "imminent" | "soon" | null {
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

function getNextDate(session: (typeof allSessions)[0]): Date | null {
  if (session.isRolling || !session.dates || session.dates.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = session.dates
    .map((d) => new Date(d + "T00:00:00"))
    .filter((d) => d >= today)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] ?? null;
}

function isExpiredSession(session: (typeof allSessions)[0]): boolean {
  if (session.isRolling || !session.dates || session.dates.length === 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasUpcoming = session.dates.some((d) => new Date(d + "T00:00:00") >= today);
  return !hasUpcoming;
}

// ── Session Card (scheduled / fixed-date) ────────────────────
function ScheduledSessionCard({ session, t, isSelected, onToggle, lang, onView }: { session: (typeof allSessions)[0]; t: typeof T["zh"]; isSelected?: boolean; onToggle?: (id: string) => void; lang?: Lang; onView?: (school: School | undefined) => void }) {
  const school = schoolsMap[session.schoolId];
  const urgency = getUrgency(session);
  const nextDate = getNextDate(session);
  const expired = isExpiredSession(session);
  const localTime = session.time ? convertToLocalTime(session.time, session.dates?.[0]) : null;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b border-stone-100 last:border-b-0 ${
      expired ? "opacity-40" : ""
    }`}>
      {/* Row — always visible */}
      <div className="flex items-center gap-2 py-2 px-1">
        {/* Checkbox */}
        {onToggle && (
          <div
            className="shrink-0 flex items-center justify-center w-5 cursor-pointer"
            onClick={(e) => { e.preventDefault(); onToggle(session.id); }}
          >
            <div className={`w-3.5 h-3.5 border-2 flex items-center justify-center transition-colors ${
              isSelected ? "bg-blue-600 border-blue-600" : "border-stone-300 bg-white"
            }`}>
              {isSelected && (
                <svg viewBox="0 0 10 8" className="w-2 h-1.5 fill-none stroke-white stroke-2">
                  <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Date badge */}
        {nextDate && (
          <span className={`shrink-0 text-[11px] font-bold w-8 text-center leading-none ${
            urgency === "imminent" ? "text-red-500" :
            urgency === "soon" ? "text-orange-500" :
            "text-stone-400"
          }`}>
            {nextDate.getDate()}
            <span className="block text-[9px] font-normal">
              {nextDate.toLocaleDateString("en", { month: "short" })}
            </span>
          </span>
        )}

        {/* Expand button: school + title */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          <span
            className="shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: school?.color || "#2563eb" }}
          />
          <span className="text-xs text-stone-800 font-medium min-w-0 flex items-baseline gap-1 overflow-hidden">
            <span className="text-stone-500 shrink-0">{school?.shortName || school?.name}</span>
            <span className="truncate text-stone-700">{session.title}</span>
          </span>
          {urgency === "imminent" && (
            <span className="shrink-0 text-[9px] px-1 py-0.5 bg-red-500 text-white font-semibold rounded-sm animate-pulse">{t.imminent}</span>
          )}
          {urgency === "soon" && (
            <span className="shrink-0 text-[9px] px-1 py-0.5 bg-orange-100 text-orange-600 font-semibold rounded-sm border border-orange-200">{t.soon}</span>
          )}
          <ChevronDown
            size={12}
            className={`shrink-0 text-stone-300 transition-transform duration-150 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Register CTA — always visible */}
        <a
          href={session.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { e.stopPropagation(); onView?.(school); }}
          className="shrink-0 flex items-center gap-0.5 text-[11px] px-2 py-0.5 border border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors duration-150"
        >
          {t.register}
          <ArrowUpRight size={10} />
        </a>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-stone-50 bg-stone-50/60">
          {/* Time */}
          {session.time && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-2">
              <Clock size={9} />
              <span>{session.time}</span>
              {localTime && (
                <span className="text-blue-500 font-medium">· {LOCAL_TZ_LABEL} {localTime}</span>
              )}
            </div>
          )}

          {/* Calendar */}
          <div className="flex items-center gap-3 flex-wrap">
            <AddToCalendarButton session={session} school={school} compact t={t} />
          </div>

          {/* Description */}
          {session.description && (
            <p className="mt-2 text-[11px] text-stone-500 leading-relaxed">{session.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
// ── Rolling Entry Roww ────────────────────────────────────────
function RollingRow({ session, t }: { session: (typeof allSessions)[0]; t: typeof T["zh"] }) {
  const school = schoolsMap[session.schoolId];
  return (
    <div className="flex items-center gap-2 py-2 border-b border-stone-100 last:border-0">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: school?.color || "#2563eb" }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-stone-700 truncate">
          {school?.shortName || school?.name}
          {school?.region && school.region !== "US" && (
            <span className="ml-1 text-[9px] text-stone-400">{school.region}</span>
          )}
        </div>
        <div className="text-[10px] text-stone-400 truncate">{session.title}</div>
      </div>
      <a
        href={session.registrationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-[10px] text-stone-500 hover:text-stone-900 underline underline-offset-2 transition-colors"
      >
        {t.register}
      </a>
    </div>
  );
}

// ── School Card ───────────────────────────────────────────────
function SchoolCard({ school, t, rankMode = 'usnews' }: { school: School; t: typeof T["zh"]; rankMode?: 'usnews' | 'qs' }) {
  const [expanded, setExpanded] = useState(false);
  const schoolSessions = allSessions.filter((s) => s.schoolId === school.id);

  return (
    <div className="border-b border-stone-100 last:border-b-0">
      {/* Row — always visible */}
      <div className="flex items-center gap-2 py-2 px-1">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          <span
            className="shrink-0 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: school.color }}
          />
          <span className="text-xs text-stone-800 font-medium truncate min-w-0">
            {school.shortName || school.name}
          </span>
          {rankMode === 'qs' && school.qsRank ? (
            <span className="shrink-0 text-[10px] text-stone-400 font-mono">QS#{school.qsRank}</span>
          ) : (
            <span className="shrink-0 text-[10px] text-stone-400 font-mono">#{school.rank}</span>
          )}
          {school.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="hidden sm:inline text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded shrink-0">
              {tag}
            </span>
          ))}
          <ChevronDown
            size={12}
            className={`shrink-0 text-stone-300 transition-transform duration-150 ml-auto ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {/* View schedule CTA — always visible */}
        <a
          href={school.registrationPage}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-0.5 text-[11px] px-2 py-0.5 border border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors duration-150"
        >
          {t.viewSchedule}
          <ArrowUpRight size={10} />
        </a>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-stone-50 bg-stone-50/60">
          {school.shortName && (
            <p className="text-[11px] text-stone-400 mb-1">{school.name}</p>
          )}
          <p className="text-[11px] text-stone-400 mb-2">{school.location}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {school.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-stone-400 mb-2">
            {schoolSessions.length} {t.tabSessions === "Events" ? "events" : "场活动可报名"}
          </div>
          <a
            href={school.admissionPage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
          >
            <Globe size={10} />
            {t.tabSessions === "Events" ? "Admissions page" : "招生官网"}
          </a>
        </div>
      )}
    </div>
  );
}

// ── Interview Prep Tools ──────────────────────────────────────
const PREP_TOOLS: Record<string, { name: string; url: string; desc_zh: string; desc_en: string; color: string }[]> = {
  default: [
    { name: "Interview Warmup", url: "https://grow.google/certificates/interview-warmup/", desc_zh: "Google 官方面试练习工具，适合 behavioral 问题", desc_en: "Google's official practice tool, great for behavioral questions", color: "#4285F4" },
    { name: "Yoodli", url: "https://app.yoodli.ai", desc_zh: "AI 实时反馈语言表达和流畅度", desc_en: "AI-powered speech coach with real-time feedback", color: "#7C3AED" },
    { name: "Speeko", url: "https://www.speeko.co", desc_zh: "Public speaking 训练，提升表达自信", desc_en: "Public speaking trainer to build confidence", color: "#059669" },
  ],
  technical: [
    { name: "Pramp", url: "https://www.pramp.com", desc_zh: "免费 peer-to-peer 技术面试练习", desc_en: "Free peer-to-peer technical interview practice", color: "#2563EB" },
    { name: "Interview Warmup", url: "https://grow.google/certificates/interview-warmup/", desc_zh: "Google 官方面试练习工具", desc_en: "Google's official interview practice tool", color: "#4285F4" },
    { name: "LeetCode", url: "https://leetcode.com", desc_zh: "算法题练习，适合技术面试备考", desc_en: "Algorithm practice for technical interviews", color: "#F97316" },
  ],
};

const SCHOOL_PREP_STYLE: Record<string, "technical" | "default"> = {
  "MIT": "technical",
  "Caltech": "technical",
  "Carnegie Mellon": "technical",
  "Georgia Tech": "technical",
};

function InterviewPrepTools({ school, lang, t }: { school: SchoolInterview; lang: Lang; t: typeof T["zh"] }) {
  const [open, setOpen] = useState(false);
  const style = SCHOOL_PREP_STYLE[school.shortName || school.schoolName] || "default";
  const tools = PREP_TOOLS[style];
  return (
    <div className="mt-3 border-t border-stone-100 pt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[10px] text-stone-400 hover:text-blue-600 transition-colors w-full text-left"
      >
        <span className="text-[9px]">✦</span>
        <span>{lang === "en" ? "Interview Prep Tools" : "备考工具"}</span>
        <ChevronDown size={9} className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 border border-stone-100 hover:border-stone-300 bg-stone-50 hover:bg-white transition-colors group"
            >
              <span
                className="shrink-0 w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold text-white mt-0.5"
                style={{ backgroundColor: tool.color }}
              >
                {tool.name[0]}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-stone-800">{tool.name}</span>
                  <ExternalLink size={8} className="text-stone-300 group-hover:text-stone-500 shrink-0" />
                </div>
                <p className="text-[10px] text-stone-400 leading-snug">
                  {lang === "en" ? tool.desc_en : tool.desc_zh}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Interview Card ──────────────────────────────────────────────
function buildInterviewDeadlineICS(school: SchoolInterview, titleLabel: string): string {
  const deadline = school.deadline!;
  // All-day event on the deadline date
  const dateCompact = deadline.replace(/-/g, "");
  const title = `${titleLabel}: ${school.shortName || school.schoolName}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AdmitLens//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dateCompact}`,
    `DTEND;VALUE=DATE:${dateCompact}`,
    `SUMMARY:${title.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${school.portalUrl}`,
    `URL:${school.portalUrl}`,
    `UID:interview-deadline-${school.id}@admitlens`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function buildInterviewDeadlineGoogleUrl(school: SchoolInterview, titleLabel: string): string {
  const deadline = school.deadline!;
  const dateCompact = deadline.replace(/-/g, "");
  const title = `${titleLabel}: ${school.shortName || school.schoolName}`;
  // For all-day events Google Calendar uses YYYYMMDD/YYYYMMDD (same day)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateCompact}/${dateCompact}`,
    details: school.portalUrl,
    location: school.portalUrl,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function InterviewDeadlineCalButton({ school, t }: { school: SchoolInterview; t: typeof T["zh"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function downloadICS() {
    const ics = buildInterviewDeadlineICS(school, t.interviewDeadlineTitle);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interview-deadline-${school.id}.ics`;
    link.click();
    setOpen(false);
  }

  const googleUrl = buildInterviewDeadlineGoogleUrl(school, t.interviewDeadlineTitle);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-800 border border-amber-200 hover:border-amber-400 bg-amber-50 px-1.5 py-0.5 transition-colors"
        title={t.interviewAddDeadlineCal}
      >
        <CalendarPlus size={9} />
        {t.interviewAddDeadlineCal}
        <ChevronDown size={8} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-stone-200 shadow-md z-20 overflow-hidden min-w-[160px]">
          <button
            onClick={() => { window.open(googleUrl, "_blank"); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-red-500 w-4">G</span>
            {t.interviewDeadlineGoogleCal}
          </button>
          <div className="h-px bg-stone-100" />
          <button
            onClick={downloadICS}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="text-[11px] font-semibold text-blue-500 w-4">↓</span>
            {t.interviewDeadlineICS}
          </button>
        </div>
      )}
    </div>
  );
}

function InterviewCard({ school, t, lang, onTypeClick }: { school: SchoolInterview; t: typeof T["zh"]; lang: Lang; onTypeClick?: (type: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const methodLabel = {
    school_contacts: t.interviewMethodSchool,
    applicant_requests: t.interviewMethodApplicant,
    required: t.interviewMethodRequired,
    none: "",
  }[school.requestMethod];

  const notes = lang === "zh" ? school.notesZh : school.notesEn;
  const localeLang = lang === "zh" ? "zh-CN" : lang === "hi" ? "hi-IN" : "en-US";
  const deadlineDisplay = school.deadline
    ? new Date(school.deadline + "T12:00:00Z").toLocaleDateString(localeLang, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const deadlineUrgent = school.deadline
    ? (() => {
        const diff = new Date(school.deadline + "T12:00:00Z").getTime() - Date.now();
        return diff > 0 && diff < 30 * 86400000;
      })()
    : false;

  const hasDetails = !!(notes || (school.available && school.portalUrl && school.portalUrl !== "N/A") || (!school.available && school.portalUrl && school.portalUrl !== "N/A") || (school.available && school.requestMethod === "applicant_requests" && deadlineDisplay) || (school.available && school.timing && school.timing !== "N/A") || school.available);

  return (
    <div className={`border-b border-stone-100 last:border-b-0 ${
      school.available ? "" : "opacity-50"
    }`}>
      {/* Row — always visible */}
      <div className="flex items-center gap-2 py-2 px-1">
        {/* Left: clickable expand area */}
        <button
          onClick={() => hasDetails && setExpanded(v => !v)}
          className={`flex items-center gap-2.5 min-w-0 flex-1 text-left transition-colors duration-100 ${
            hasDetails ? "hover:opacity-70 cursor-pointer" : "cursor-default"
          }`}
        >
          {/* Status dot */}
          <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${
            school.available ? "bg-green-500" : "bg-stone-300"
          }`} />

          {/* School name */}
          <span className="text-sm text-stone-800 font-medium truncate min-w-0">
            {school.shortName || school.schoolName}
          </span>

          {/* Types — hidden on very small screens, clickable to filter */}
          {school.available && school.types.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 shrink-0">
              {school.types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  onClick={onTypeClick ? (e) => { e.stopPropagation(); onTypeClick(type); } : undefined}
                  className={`text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded ${
                    onTypeClick ? "hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer" : ""
                  }`}
                >
                  {type}
                </span>
              ))}
              {school.types.length > 2 && (
                <span className="text-[10px] text-stone-400">+{school.types.length - 2}</span>
              )}
            </span>
          )}

          {/* Deadline urgent badge */}
          {deadlineUrgent && (
            <span className="shrink-0 text-[10px] text-red-600 font-medium">⚠ {deadlineDisplay}</span>
          )}

          {/* Expand chevron */}
          {hasDetails && (
            <ChevronDown
              size={13}
              className={`shrink-0 text-stone-300 transition-transform duration-150 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Right: portal link — always visible */}
        {school.portalUrl && school.portalUrl !== "N/A" && (
          <a
            href={school.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`shrink-0 flex items-center gap-0.5 text-[11px] px-2 py-0.5 border transition-colors duration-150 ${
              school.available
                ? "border-stone-300 text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-500"
            }`}
          >
            {school.available ? t.interviewGoPortal : t.interviewLearnMore}
            <ArrowUpRight size={10} />
          </a>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 pt-0.5 border-t border-stone-50 bg-stone-50/60">
          {/* Method + Timing */}
          {school.available && (methodLabel || (school.timing && school.timing !== "N/A")) && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-2 mt-2">
              {methodLabel && (
                <span className="text-[11px] text-stone-500">
                  <span className="text-stone-400">{t.howLabel}</span>{methodLabel}
                </span>
              )}
              {school.timing && school.timing !== "N/A" && (
                <span className="text-[11px] text-stone-500">{school.timing}</span>
              )}
            </div>
          )}

          {/* Deadline */}
          {school.available && school.requestMethod === "applicant_requests" && deadlineDisplay && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 border ${
                deadlineUrgent
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <Clock size={9} />
                <span className="font-medium">{t.interviewDeadlineLabel}:</span>
                <span>{deadlineDisplay}</span>
                {deadlineUrgent && <span className="ml-0.5 font-semibold">⚠</span>}
              </span>
              <InterviewDeadlineCalButton school={school} t={t} />
            </div>
          )}

          {/* Notes */}
          {notes && (
            <p className="text-[11px] text-stone-400 leading-relaxed mb-2">{notes}</p>
          )}

          {/* Prep Tools */}
          {school.available && <InterviewPrepTools school={school} lang={lang} t={t} />}
        </div>
      )}
    </div>
  );
}
// ── InterviewGroup ───────────────────────────────────────────────
function InterviewGroup({
  method, label, accent, group, t, lang, defaultCollapsed, limitCount, onTypeClick,
}: {
  method: string;
  label: string;
  accent: string;
  group: SchoolInterview[];
  t: typeof T["zh"];
  lang: Lang;
  defaultCollapsed?: boolean;
  limitCount?: number;
  onTypeClick?: (type: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(!!defaultCollapsed);
  const [expanded, setExpanded] = useState(false);

  const displayGroup = (!limitCount || expanded) ? group : group.slice(0, limitCount);
  const hasMore = !!limitCount && group.length > limitCount;

  return (
    <section key={method}>
      <button
        onClick={() => setCollapsed(v => !v)}
        className="flex items-center gap-3 mb-3 w-full text-left group"
      >
        <span className={`text-[11px] uppercase tracking-widest font-semibold ${accent}`}>{label}</span>
        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">{group.length}</span>
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-[10px] text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {collapsed
            ? (lang === "zh" ? "展开 ▼" : lang === "hi" ? "विस्तार ▼" : "Show ▼")
            : (lang === "zh" ? "收起 ▲" : lang === "hi" ? "छुपाएं ▲" : "Hide ▲")}
        </span>
      </button>
      {!collapsed && (
        <>
          <div className="border border-stone-100 divide-y-0">
            {displayGroup.map((s) => <InterviewCard key={s.id} school={s} t={t} lang={lang} onTypeClick={onTypeClick} />)}
          </div>
          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-3 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-4 py-1.5 rounded-full transition-colors"
            >
              {lang === "zh"
                ? `展开全部 ${group.length} 所…`
                : lang === "hi"
                ? `सभी ${group.length} दिखाएं…`
                : `Show all ${group.length}…`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

// ── Onboarding Modal ──────────────────────────────────────────────────────────
function OnboardingModal({ t, lang }: { t: typeof T["zh"]; lang: Lang }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("admitlens_onboarded");
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem("admitlens_onboarded", "1");
    setVisible(false);
  }, []);

  if (!visible) return null;

  const aoCard = {
    icon: "🎓",
    title: t.onboardingAoTitle,
    points: [
      { label: t.onboardingAo1Label, detail: t.onboardingAo1Detail },
      { label: t.onboardingAo2Label, detail: t.onboardingAo2Detail },
      { label: t.onboardingAo3Label, detail: t.onboardingAo3Detail },
    ]
  };

  const features = [
    { icon: "🌍", title: t.onboardingF1Title, desc: t.onboardingF1Desc },
    { icon: "📅", title: t.onboardingF3Title, desc: t.onboardingF3Desc },
    { icon: "🤝", title: t.onboardingF4Title, desc: t.onboardingF4Desc },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border border-stone-200 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="#111" strokeWidth="1.2" />
                  <circle cx="9" cy="9" r="4.5" stroke="#111" strokeWidth="1.2" />
                  <circle cx="9" cy="9" r="1.5" fill="#111" />
                </svg>
                <span className="text-sm font-bold text-stone-900">{t.brandName}</span>
              </div>
              <p className="text-xs text-stone-400">
                {t.onboardingSubtitle}
              </p>
            </div>
            <button onClick={dismiss} className="text-stone-300 hover:text-stone-600 transition-colors mt-0.5">
              <X size={14} />
            </button>
          </div>
          {/* AO Card — full width */}
          <div className="border border-stone-900 bg-stone-50 p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">{aoCard.icon}</span>
              <span className="text-xs font-bold text-stone-900">{aoCard.title}</span>
            </div>
            <div className="space-y-2">
              {aoCard.points.map((p) => (
                <div key={p.label} className="flex gap-2">
                  <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-900 inline-block" />
                  <div>
                    <span className="text-[11px] font-semibold text-stone-800">{p.label}</span>
                    <span className="text-[11px] text-stone-400"> — {p.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Feature cards — 2x2 grid + optional 5th card */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {features.map((f) => {
              const inner = (
                <>
                  {'platformIcons' in f && f.platformIcons ? (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div title="Notion" className="w-4 h-4 rounded bg-stone-900 flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" /><path d="M8 8h8M8 12h5M8 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                      </div>
                      <div title="飞书" className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 4L4 8l8 4 8-4-8-4z" fill="white" /><path d="M4 12l8 4 8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      </div>
                      <div title="Obsidian" className="w-4 h-4 rounded bg-purple-700 flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke="white" strokeWidth="2" fill="none" /><circle cx="12" cy="12" r="3" fill="white" /></svg>
                      </div>
                      <div title="Anytype" className="w-4 h-4 rounded bg-teal-600 flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" fill="white" /><rect x="13" y="4" width="7" height="7" rx="1" fill="white" opacity="0.6" /><rect x="4" y="13" width="7" height="7" rx="1" fill="white" opacity="0.6" /></svg>
                      </div>
                      <div title="wolai" className="w-4 h-4 rounded bg-violet-600 flex items-center justify-center">
                        <span className="text-white font-bold" style={{fontSize: "7px", lineHeight: 1}}>W</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-base mb-1">{f.icon}</div>
                  )}
                  <div className="text-[11px] font-semibold text-stone-900 mb-0.5 leading-tight">{f.title}</div>
                  <div className="text-[10px] text-stone-400 leading-relaxed">{f.desc}</div>
                  {'href' in f && <div className="text-[10px] text-stone-500 font-medium mt-1">了解更多 →</div>}
                </>
              );
              return 'href' in f ? (
                <a
                  key={f.title}
                  href={(f as {href: string}).href}
                  className="border border-stone-200 bg-stone-50 p-2.5 hover:border-stone-400 hover:bg-white transition-colors col-span-2"
                >
                  {inner}
                </a>
              ) : (
                <div key={f.title} className="border border-stone-100 p-2.5 hover:border-stone-300 transition-colors">
                  {inner}
                </div>
              );
            })}
          </div>
          <button
            onClick={dismiss}
            className="w-full py-2.5 bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            {t.onboardingStart}
          </button>
          <p className="text-center text-[10px] text-stone-300 mt-2">
            {t.onboardingMotto}
          </p>
          <div className="text-center mt-2">
            <button
              onClick={dismiss}
              className="text-[10px] text-stone-300 hover:text-stone-500 underline underline-offset-2 transition-colors"
            >
              {t.onboardingDismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Share Button ────────────────────────────────────────────
function ShareButton({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const siteUrl = window.location.origin;
  const siteTitle = t.siteTitle;
  const siteDesc = t.siteDesc;

  // 检测是否支持 Web Share API
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowQR(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShareClick() {
    // 移动端：优先调用系统原生分享菜单
    if (canNativeShare) {
      try {
        await navigator.share({
          title: siteTitle,
          text: siteDesc,
          url: siteUrl,
        });
        return;
      } catch (err) {
        // 用户取消分享或不支持，降级到自定义下拉菜单
        if ((err as Error).name === "AbortError") return;
      }
    }
    // 桌面端：展开自定义下拉菜单
    setOpen(v => !v);
    setShowQR(false);
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(siteTitle)}&url=${encodeURIComponent(siteUrl)}`;
  const wechatQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleShareClick}
        className="flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 px-2.5 py-1 hover:border-stone-400 bg-white"
        title={t.shareLabel}
      >
        <Share2 size={11} />
        <span className="hidden sm:inline">{t.shareBtn}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 shadow-lg z-50 w-48 overflow-hidden">
          {!showQR ? (
            <>
              {/* Copy link */}
              <button
                onClick={copyLink}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copied ? t.shareCopied : t.shareCopyLink}</span>
              </button>
              <div className="h-px bg-stone-100" />
              {/* WeChat QR */}
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <span className="text-[11px] font-bold text-green-600 w-3.5">微</span>
                <span>{t.shareWeChat}</span>
              </button>
              <div className="h-px bg-stone-100" />
              {/* Twitter/X */}
              <button
                onClick={() => { window.open(twitterUrl, "_blank"); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Twitter size={13} className="text-stone-500" />
                <span>{t.shareTwitter}</span>
              </button>
            </>
          ) : (
            <div className="p-3 flex flex-col items-center gap-2">
              <p className="text-[10px] text-stone-500">{t.shareWeChatScan}</p>
              <img
                src={wechatQRUrl}
                alt="WeChat QR Code"
                className="w-32 h-32 border border-stone-100"
              />
              <p className="text-[9px] text-stone-400 break-all text-center">{siteUrl}</p>
              <button
                onClick={() => setShowQR(false)}
                className="text-[10px] text-stone-400 hover:text-stone-600 mt-1"
              >
                {t.shareBack}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [view, setView] = useState<ViewMode>("interviews");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SessionType | "All">("All");
  const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("jingshen_lang");
    if (saved === "zh" || saved === "en" || saved === "hi") return saved;
    return "zh";
  });
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewFilter, setInterviewFilter] = useState<"all" | "available" | "none" | "near_deadline">("all");
  const [interviewMethodFilter, setInterviewMethodFilter] = useState<"all" | "school_contacts" | "applicant_requests" | "required">("all");
  const [showExpiredSessions, setShowExpiredSessions] = useState(false);
  const { profile: browsingProfile, trackSchoolType, trackRegion, trackSessionType } = useBrowsingTracker();
  const [showIntegrationHub, setShowIntegrationHub] = useState(false);
  // Rank mode: 'usnews' | 'qs'
  const [rankMode, setRankMode] = useState<'usnews' | 'qs'>('usnews');
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  // Subscribe panel state (navbar bell icon)
  const [showSubscribePanel, setShowSubscribePanel] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeSubmitted, setSubscribeSubmitted] = useState(false);
  const subscribePanelRef = useRef<HTMLDivElement>(null);
  const subscribeMutation = trpc.subscribers.subscribe.useMutation({
    onSuccess: () => setSubscribeSubmitted(true),
  });
  // Close subscribe panel on outside click
  useEffect(() => {
    if (!showSubscribePanel) return;
    function handleOutsideClick(e: MouseEvent) {
      if (subscribePanelRef.current && !subscribePanelRef.current.contains(e.target as Node)) {
        setShowSubscribePanel(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSubscribePanel]);
  // Mobile "Send to Desktop" state
  const [mobileQRDataUrl, setMobileQRDataUrl] = useState<string | null>(null);
  const [mobileEmailInput, setMobileEmailInput] = useState("");
  const [mobileEmailStatus, setMobileEmailStatus] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");
  const [mobileLinkCopied, setMobileLinkCopied] = useState(false);
  const sendLinkMutation = trpc.sendLink.sendToEmail.useMutation({
    onSuccess: () => setMobileEmailStatus("sent"),
    onError: () => setMobileEmailStatus("error"),
  });
   const t = T[lang] as typeof T["zh"];
  // ── document.title、html lang 、meta description 随语言切换动态更新 ──
  useEffect(() => {
    // 更新标题栏标题
    document.title = t.siteTitle;
    // 更新 <html lang>，让屏幕阅读器和搜索引擎正确识别当前语言
    const langMap: Record<Lang, string> = { zh: "zh-CN", en: "en", hi: "hi" };
    document.documentElement.lang = langMap[lang];
    // 更新 <meta name="description">
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.siteDesc);
    // 更新 og:description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t.siteDesc);
    // 更新 og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t.siteTitle);
    // 更新 og:locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", langMap[lang] === "zh-CN" ? "zh_CN" : langMap[lang] === "en" ? "en_US" : "hi_IN");
    // 更新 twitter:title 和 twitter:description
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", t.siteTitle);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", t.siteDesc);
  }, [lang, t.siteTitle, t.siteDesc]);

  // Generate QR code for current URL on mount (for mobile "Send to Desktop" feature)
  useEffect(() => {
    const url = window.location.href;
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#111111', light: '#ffffff' } })
      .then((dataUrl) => setMobileQRDataUrl(dataUrl))
      .catch(() => {});
  }, []);

  // Fetch sessions from DB (falls back to static data if unavailable)
  const { data: dbData } = trpc.sessions.list.useQuery(
    { region: "All" },
    { staleTime: 5 * 60 * 1000 } // re-fetch every 5 min
  );

  // Merge DB sessions with static data: DB takes priority, static fills gaps
  const activeSessions = useMemo<Session[]>(() => {
    if (dbData?.sessions && dbData.sessions.length > 0) {
      // Map DB rows to Session shape
      return dbData.sessions.map((row) => ({
        id: row.id,
        schoolId: row.schoolId,
        title: row.title,
        type: row.type as Session["type"],
        description: row.description,
        dates: row.dates as string[] | null,
        time: row.time ?? undefined,
        duration: row.duration ?? undefined,
        registrationUrl: row.registrationUrl,
        isRolling: row.isRolling,
        partnerSchools: (row.partnerSchools as string[]) ?? undefined,
      }));
    }
    // Fallback to static data
    return allSessions;
  }, [dbData]);

  function toggleSelect(id: string) {
    setSelectedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedSessions(new Set());
  }

  function exportBatchICS() {
    const events: string[] = [];
    for (const id of Array.from(selectedSessions)) {
      const session = activeSessions.find((s) => s.id === id);
      if (!session || session.isRolling || !session.dates || !session.time) continue;
      if (!session.time.match(/(ET|CT|PT|MT)/i)) continue;
      const school = schoolsMap[session.schoolId];
      const title = `${school?.name ? school.name + " - " : ""}${session.title}`;
      const durationMin = parseDurationMinutes(session.duration);
      for (const dateStr of session.dates) {
        const start = parseEventDateTime(dateStr, session.time);
        if (!start) continue;
        const end = new Date(start.getTime() + durationMin * 60000);
        events.push([
          "BEGIN:VEVENT",
          `DTSTART:${toICSDatetime(start)}`,
          `DTEND:${toICSDatetime(end)}`,
          `SUMMARY:${title.replace(/,/g, "\\,")}`,
          `DESCRIPTION:Register: ${session.registrationUrl}`,
          `URL:${session.registrationUrl}`,
          `UID:${dateStr}-${id}@admitlens`,
          "END:VEVENT",
        ].join("\r\n"));
      }
    }
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AdmitLens//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "admitlens-events.ics";
    link.click();
  }

  const sessionTypes: (SessionType | "All")[] = [
    "All",
    "General Info Session",
    "Up Close / Specialty",
    "Multi-College Session",
    "Regional Session",
    "Student Forum",
    "Financial Aid Session",
  ];

  const regionOptions: { value: Region | "All"; label: string }[] = [
    { value: "All", label: t.regionAll },
    { value: "US", label: t.regionUS },
    { value: "UK", label: t.regionUK },
    { value: "HK", label: t.regionHK },
    { value: "AU", label: t.regionAU },
  ];

  const filteredSessions = useMemo(() => {
    return activeSessions.filter((s) => {
      const school = schoolsMap[s.schoolId];
      const matchType = typeFilter === "All" || s.type === typeFilter;
      const matchRegion = regionFilter === "All" || school?.region === regionFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        school?.name.toLowerCase().includes(q) ||
        (school?.shortName?.toLowerCase().includes(q) ?? false) ||
        s.description.toLowerCase().includes(q);
      return matchType && matchRegion && matchSearch;
    });
  }, [activeSessions, search, typeFilter, regionFilter]);

  const filteredSchools = useMemo(() => {
    return allSchools.filter((s) => {
      const matchRegion = regionFilter === "All" || s.region === regionFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.shortName?.toLowerCase().includes(q) ?? false) ||
        s.location.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchRegion && matchSearch;
    });
  }, [search, regionFilter]);

  const filteredInterviews = useMemo(() => {
    return interviewData.filter((s) => {
      const isNearDeadline = s.deadline
        ? (() => {
            const diff = new Date(s.deadline + "T12:00:00Z").getTime() - Date.now();
            return diff > 0 && diff < 30 * 86400000;
          })()
        : false;
      const matchFilter =
        interviewFilter === "all" ||
        (interviewFilter === "available" && s.available) ||
        (interviewFilter === "none" && !s.available) ||
        (interviewFilter === "near_deadline" && isNearDeadline);
      const matchMethod =
        interviewMethodFilter === "all" ||
        s.requestMethod === interviewMethodFilter;
      const matchRegionInterview =
        regionFilter === "All" || s.region === regionFilter;
      const q = interviewSearch.toLowerCase();
      const matchSearch =
        !q ||
        s.schoolName.toLowerCase().includes(q) ||
        (s.shortName?.toLowerCase().includes(q) ?? false) ||
        s.types.some(type => type.toLowerCase().includes(q));
      return matchFilter && matchMethod && matchRegionInterview && matchSearch;
    });
  }, [interviewSearch, interviewFilter, interviewMethodFilter, regionFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Integration Hub Modal ── */}
      {showIntegrationHub && (() => {
        const zh = lang === "zh";
        const hi = lang === "hi";
        const platforms = [
          {
            id: "notion",
            name: "Notion",
            color: "bg-stone-900",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" /><path d="M8 8h8M8 12h5M8 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>,
            desc: zh ? "模板 + 嵌入小窗口" : "Template + embed widget",
            detail: {
              title: zh ? "Notion 集成指南" : "Notion Integration Guide",
              steps: zh
                ? [
                    "复制下方嵌入代码，粘贴到 Notion 页面的 /embed 块",
                    "或使用模板包：在模板库搜索 \"AdmitLens\" 即可获取预设申请追踪页",
                    "嵌入小窗口支持实时筛选，无需手动更新",
                  ]
                : [
                    "Copy the embed code below and paste into a Notion /embed block",
                    "Or use our template: search \"AdmitLens\" in Notion template gallery",
                    "The embed widget supports real-time filtering, no manual updates needed",
                  ],
              code: `<iframe src="https://admissionhub-f6apvxhh.manus.space/embed" width="100%" height="600" frameborder="0"></iframe>`,
              externalHref: "/notion-template#notion",
            },
          },
          {
            id: "feishu",
            name: zh ? "飞书" : "Feishu",
            color: "bg-sky-500",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 4L4 8l8 4 8-4-8-4z" fill="white" /><path d="M4 12l8 4 8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>,
            desc: zh ? "文档嵌入 + 多维表格" : "Doc embed + database",
            detail: {
              title: zh ? "飞书集成指南" : "Feishu Integration Guide",
              steps: zh
                ? [
                    "在飞书文档中输入 /网页嵌入，粘贴下方链接",
                    "或在多维表格中创建「网页」列，填入各活动的报名链接",
                    "进阶：使用飞书自动化定期调用 API 刷新多维表格数据",
                  ]
                : [
                    "In Feishu doc, type /webpage and paste the link below",
                    "Or create a URL column in Feishu Base, fill in each session's registration link",
                    "Advanced: use Feishu automation to call the API and refresh data periodically",
                  ],
              code: `https://admissionhub-f6apvxhh.manus.space/embed`,
              externalHref: "/notion-template#feishu",
            },
          },
          {
            id: "obsidian",
            name: "Obsidian",
            color: "bg-purple-700",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke="white" strokeWidth="2" fill="none" /><circle cx="12" cy="12" r="3" fill="white" /></svg>,
            desc: zh ? "HTML 代码块 + Dataview" : "HTML block + Dataview",
            detail: {
              title: zh ? "Obsidian 集成指南" : "Obsidian Integration Guide",
              steps: zh
                ? [
                    "安装 Custom HTML 插件，将下方代码粘贴到 HTML 代码块",
                    "或安装 Dataview 插件，使用 dataviewjs 调用 API 动态渲染列表",
                    "嵌入方式支持实时筛选和搜索",
                  ]
                : [
                    "Install Custom HTML plugin, paste the code below into an HTML block",
                    "Or install Dataview plugin, use dataviewjs to call the API and render dynamically",
                    "The embed supports real-time filtering and search",
                  ],
              code: `<iframe src="https://admissionhub-f6apvxhh.manus.space/embed" width="100%" height="500" style="border:none;"></iframe>`,
              externalHref: "/notion-template#obsidian",
            },
          },
          {
            id: "anytype",
            name: "Anytype",
            color: "bg-teal-600",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" fill="white" /><rect x="13" y="4" width="7" height="7" rx="1" fill="white" opacity="0.6" /><rect x="4" y="13" width="7" height="7" rx="1" fill="white" opacity="0.6" /></svg>,
            desc: zh ? "嵌入块 + 链接生成" : "Embed block + link gen",
            detail: {
              title: zh ? "Anytype 集成指南" : "Anytype Integration Guide",
              steps: zh
                ? [
                    "在 Anytype 中创建新对象，添加 Bookmark 块并粘贴下方链接",
                    "或使用 Web 嵌入块，将活动页面嵌入到你的申请追踪对象中",
                    "建议为每所目标学校创建独立对象，包含报名链接字段",
                  ]
                : [
                    "In Anytype, create a new object, add a Bookmark block and paste the link below",
                    "Or use a Web embed block to embed the session page into your application tracker object",
                    "Recommended: create one object per target school with a registration link field",
                  ],
              code: `https://admissionhub-f6apvxhh.manus.space`,
              externalHref: "/notion-template#anytype",
            },
          },
          {
            id: "wolai",
            name: "wolai",
            color: "bg-violet-600",
            icon: <span className="text-white font-bold" style={{fontSize: "7px", lineHeight: 1}}>W</span>,
            desc: zh ? "内嵌入 + API 填充" : "Inline embed + API fill",
            detail: {
              title: zh ? "wolai 集成指南" : "wolai Integration Guide",
              steps: zh
                ? [
                    "在 wolai 页面输入 /嵌入网页，粘贴下方链接",
                    "或在数据表中添加网址列，填入各活动的报名地址",
                    "进阶：使用 wolai API + 自动化定期同步最新活动数据",
                  ]
                : [
                    "In wolai, type /embed webpage and paste the link below",
                    "Or add a URL column in a wolai database, fill in each session's registration link",
                    "Advanced: use wolai API + automation to sync latest session data periodically",
                  ],
              code: `https://admissionhub-f6apvxhh.manus.space/embed`,
              externalHref: "/notion-template#wolai",
            },
          },
          {
            id: "claude",
            name: "Claude",
            color: "bg-orange-500",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/></svg>,
            desc: zh ? "MCP Server · tool_use API" : "MCP Server · tool_use API",
            detail: {
              title: zh ? "Claude 工具集成" : "Claude Tool Integration",
              steps: zh
                ? [
                    "方式一（Claude.ai Projects）：在 Claude.ai 创建 Project，进入 Settings → Tools，添加 MCP Server URL",
                    "方式二（Claude API）：在 API 请求中传入 tools 参数，直接引用 openapi.json 中的工具定义",
                    "方式三（Claude Desktop）：在 claude_desktop_config.json 中添加 MCP server 配置",
                    "所有方式均无需 API Key，免费使用",
                  ]
                : [
                    "Option 1 (Claude.ai Projects): Create a Project, go to Settings → Tools, add the MCP Server URL",
                    "Option 2 (Claude API): Pass the tools parameter in API requests, referencing tool definitions from openapi.json",
                    "Option 3 (Claude Desktop): Add MCP server config to claude_desktop_config.json",
                    "No API key required for all methods — free to use",
                  ],
              code: zh
                ? `# 方式一：Claude.ai Projects MCP 配置
# 在 Settings → Tools 中添加：
MCP Server URL: https://admissionhub-f6apvxhh.manus.space/mcp

# 方式二：Claude Desktop (claude_desktop_config.json)
{
  "mcpServers": {
    "admitlens": {
      "command": "npx",
      "args": ["-y", "@admitlens/mcp-server"],
      "env": {}
    }
  }
}

# 方式三：Claude API tool_use (Python)
import anthropic, requests

# 从 openapi.json 自动加载工具定义
schema = requests.get("https://admissionhub-f6apvxhh.manus.space/openapi.json").json()

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    tools=[{
        "name": "getSessions",
        "description": "Find upcoming university admissions info sessions",
        "input_schema": {
            "type": "object",
            "properties": {
                "school": {"type": "string", "description": "School name, e.g. MIT"},
                "upcoming": {"type": "boolean"},
                "limit": {"type": "integer"}
            }
        }
    }],
    messages=[{"role": "user", "content": "Find MIT info sessions"}]
)`
                : `# Option 1: Claude.ai Projects MCP Config
# In Settings → Tools, add:
MCP Server URL: https://admissionhub-f6apvxhh.manus.space/mcp

# Option 2: Claude Desktop (claude_desktop_config.json)
{
  "mcpServers": {
    "admitlens": {
      "command": "npx",
      "args": ["-y", "@admitlens/mcp-server"],
      "env": {}
    }
  }
}

# Option 3: Claude API tool_use (Python)
import anthropic, requests

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1024,
    tools=[{
        "name": "getSessions",
        "description": "Find upcoming university admissions info sessions",
        "input_schema": {
            "type": "object",
            "properties": {
                "school": {"type": "string"},
                "upcoming": {"type": "boolean"},
                "limit": {"type": "integer"}
            }
        }
    }],
    messages=[{"role": "user", "content": "Find MIT info sessions"}]
)`,
              externalHref: "https://admissionhub-f6apvxhh.manus.space/openapi.json",
            },
          },
          {
            id: "chrome",
            name: "Chrome",
            color: "bg-yellow-500",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white" /><path d="M12 8a4 4 0 014 4h6a10 10 0 10-10 10V12" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>,
            desc: zh ? "浏览器扩展 · 即将上线" : "Browser extension · Coming soon",
            detail: {
              title: zh ? "Chrome 扩展（即将上线）" : "Chrome Extension (Coming Soon)",
              steps: zh
                ? [
                    "在任意网页上唤起景深侧边栏，无需切换标签页",
                    "浏览学校官网时自动识别并匹配对应的 Info Session 和面试信息",
                    "AI 跨页面跨标签页跟随分析，自动记笔并同步到 Notion/飞书",
                    "支持在 ChatGPT / Perplexity 等 AI 工具内直接唤起景深数据面板",
                  ]
                : [
                    "Summon AdmitLens sidebar on any webpage, no tab switching needed",
                    "Auto-detect and match Info Sessions and interview info when browsing school sites",
                    "AI cross-page analysis, auto note-taking synced to Notion/Feishu",
                    "Invoke AdmitLens data panel directly inside ChatGPT / Perplexity",
                  ],
              code: `// 即将上线，欢迎预登记体验
// Coming soon — join the waitlist below`,
              externalHref: "/#waitlist",
            },
          },
          {
            id: "api",
            name: "API",
            color: "bg-stone-700",
            icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            desc: zh ? "REST API 直接集成" : "REST API direct access",
            detail: {
              title: zh ? "REST API 文档" : "REST API Docs",
              steps: zh
                ? [
                    "GET /api/sessions — 获取所有活动，支持 school/type/region 筛选",
                    "GET /api/schools — 获取学校列表及基本信息",
                    "免费 tier 每天 100 次调用，无需登录。查看完整文档→",
                  ]
                : [
                    "GET /api/sessions — List all sessions, supports school/type/region filters",
                    "GET /api/schools — List schools with basic info",
                    "Free tier: 100 calls/day, no login required. See full docs →",
                  ],
              code: `fetch('https://admissionhub-f6apvxhh.manus.space/api/sessions?school=MIT')
  .then(r => r.json())
  .then(data => console.log(data))`,
              externalHref: "/api-docs",
            },
          },
        ];
        const active = activeIntegration ? platforms.find(p => p.id === activeIntegration) : null;
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowIntegrationHub(false); setActiveIntegration(null); } }}
          >
            <div className="bg-white border border-stone-200 shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200 flex flex-col" style={{maxHeight: '88vh'}}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2">
                  {active && (
                    <button
                      onClick={() => setActiveIntegration(null)}
                      className="text-stone-400 hover:text-stone-700 transition-colors mr-1"
                      aria-label="Back"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  )}
                  <span className="text-sm font-bold text-stone-900">
                    {active ? active.detail.title : (zh ? "集成中心" : hi ? "इंटीग्रेशन हब" : "Integration Hub")}
                  </span>
                  {!active && <span className="text-[9px] font-bold bg-stone-900 text-white px-1.5 py-0.5">{zh ? "新" : hi ? "नया" : "NEW"}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {active && (
                    <a
                      href={active.detail.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-stone-400 hover:text-stone-700 border border-stone-200 hover:border-stone-400 px-2.5 py-1 transition-colors"
                    >
                      {zh ? "在新标签页打开 ↗" : "Open in new tab ↗"}
                    </a>
                  )}
                  <button
                    onClick={() => { setShowIntegrationHub(false); setActiveIntegration(null); }}
                    className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
              {/* Body */}
              <div className="overflow-y-auto flex-1">
                {!active ? (
                  /* Platform list */
                  <div className="divide-y divide-stone-50">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveIntegration(p.id)}
                        className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-stone-50 transition-colors group text-left"
                      >
                        <div className={`w-8 h-8 rounded ${p.color} flex items-center justify-center shrink-0`}>
                          {p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-stone-800">{p.name}</div>
                          <div className="text-[11px] text-stone-400">{p.desc}</div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-stone-300 group-hover:text-stone-600 shrink-0 transition-colors"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Detail panel */
                  <div className="px-5 py-4 space-y-4">
                    {/* Steps */}
                    <div className="space-y-2">
                      {active.detail.steps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                          <p className="text-xs text-stone-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    {/* Code block */}
                    <div className="bg-stone-950 rounded p-3 relative group">
                      <pre className="text-[11px] text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">{active.detail.code}</pre>
                      <button
                        onClick={() => { navigator.clipboard.writeText(active.detail.code); }}
                        className="absolute top-2 right-2 text-[10px] text-stone-500 hover:text-stone-300 border border-stone-700 hover:border-stone-500 px-2 py-0.5 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {zh ? "复制" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-5 py-3 border-t border-stone-50 shrink-0">
                <p className="text-[10px] text-stone-400 text-center">
                  {zh ? "所有集成均免费使用。" : hi ? "सभी इंटीग्रेशन मुफ़्त हैं।" : "All integrations are free to use."}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Nav ── */}
      <header className="border-b border-stone-200 sticky top-0 z-50 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="9" cy="9" r="8" stroke="#111" strokeWidth="1.2" />
              <circle cx="9" cy="9" r="4.5" stroke="#111" strokeWidth="1.2" />
              <circle cx="9" cy="9" r="1.5" fill="#111" />
            </svg>
            <span className="text-sm font-bold tracking-tight text-stone-900">{t.brandName}</span>
            <span className="hidden sm:block text-xs text-stone-400">{t.tagline}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center border border-stone-200 bg-white overflow-hidden">
              {(["zh", "en", "hi"] as Lang[]).map((l, i) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); localStorage.setItem("jingshen_lang", l); }}
                  className={`px-2 py-1 text-[11px] transition-colors ${
                    i > 0 ? "border-l border-stone-200" : ""
                  } ${
                    lang === l
                      ? "bg-stone-900 text-white font-semibold"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                  }`}
                  title={l === "zh" ? "中文" : l === "en" ? "English" : "हिन्दी"}
                >
                  {l === "zh" ? "中" : l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
            {/* Subscribe bell button */}
            <div className="relative" ref={subscribePanelRef}>
              <button
                onClick={() => setShowSubscribePanel(v => !v)}
                title={lang === "zh" ? t.subscribe : "Subscribe to updates"}
                className={`flex items-center justify-center w-7 h-7 border transition-colors ${
                  subscribeSubmitted
                    ? "border-green-400 text-green-600 bg-green-50"
                    : showSubscribePanel
                    ? "border-stone-900 text-stone-900 bg-stone-50"
                    : "border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800"
                }`}
              >
                {subscribeSubmitted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
              {/* Subscribe dropdown panel */}
              {showSubscribePanel && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-stone-200 shadow-lg z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 pt-4 pb-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-stone-900">
                        {lang === "zh" ? t.subscribe : lang === "hi" ? "नए कार्यक्रम की सूचना" : t.subscribe}
                      </span>
                      <button
                        onClick={() => setShowSubscribePanel(false)}
                        className="text-stone-300 hover:text-stone-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 mb-3">{t.calSubscribeNote}</p>
                  </div>
                  <div className="px-4 pb-4">
                    {subscribeSubmitted ? (
                      <div className="flex items-center gap-2 text-xs text-stone-500 py-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                        {t.subscribeSuccess}
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!subscribeEmail.includes("@")) return;
                          subscribeMutation.mutate({
                            email: subscribeEmail,
                            origin: window.location.origin,
                            lang,
                          });
                        }}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <Mail size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-300" />
                          <input
                            type="email"
                            value={subscribeEmail}
                            onChange={(e) => setSubscribeEmail(e.target.value)}
                            placeholder={t.subscribePlaceholder}
                            className="w-full pl-7 pr-3 py-1.5 text-xs border border-stone-200 focus:border-stone-900 outline-none transition-colors"
                            autoFocus
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-stone-900 text-white text-xs font-medium hover:bg-stone-700 transition-colors whitespace-nowrap"
                        >
                          {t.subscribeBtn}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Share button */}
            <ShareButton lang={lang} />
            <button
              className="sm:hidden text-stone-500"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="border-b border-stone-100 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-6">
          {/* Left: headline */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2 leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-xs text-stone-400 tracking-wide italic">
              {t.mission}
            </p>
          </div>
          {/* Right: Integration Hub card */}
          <button
            onClick={() => setShowIntegrationHub(true)}
            className="group hidden sm:flex shrink-0 flex-col gap-2 border border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm transition-all px-4 py-3 w-56 text-left"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-stone-700 uppercase tracking-wide">
                {lang === "zh" ? "集成中心" : lang === "hi" ? "इंटीग्रेशन हब" : "Integration Hub"}
              </span>
              <span className="ml-auto text-[9px] font-bold bg-stone-900 text-white px-1 py-0.5 leading-none">{t.footerNotionNew}</span>
            </div>
            {/* Platform favicons row */}
            <div className="flex items-center gap-2">
              {/* Notion */}
              <div title="Notion" className="w-5 h-5 rounded bg-stone-900 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" />
                  <path d="M8 8h8M8 12h5M8 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              {/* Feishu */}
              <div title="飞书" className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4L4 8l8 4 8-4-8-4z" fill="white" />
                  <path d="M4 12l8 4 8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4 16l8 4 8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>
              {/* Obsidian */}
              <div title="Obsidian" className="w-5 h-5 rounded bg-purple-700 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
              {/* Anytype */}
              <div title="Anytype" className="w-5 h-5 rounded bg-teal-600 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="1" fill="white" />
                  <rect x="13" y="4" width="7" height="7" rx="1" fill="white" opacity="0.6" />
                  <rect x="4" y="13" width="7" height="7" rx="1" fill="white" opacity="0.6" />
                  <rect x="13" y="13" width="7" height="7" rx="1" fill="white" opacity="0.3" />
                </svg>
              </div>
              {/* wolai */}
              <div title="wolai" className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold" style={{fontSize: "8px", lineHeight: 1}}>W</span>
              </div>
              <span className="text-[10px] text-stone-400 ml-auto group-hover:text-stone-600 transition-colors">
                {lang === "zh" ? "查看全部 →" : lang === "hi" ? "सभी देखें →" : "View all →"}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-snug">
              {lang === "zh" ? "将实时活动数据嵌入你的申请追踪工具" : lang === "hi" ? "रियल-टाइम डेटा अपने टूल में एम्बेड करें" : "Embed live session data into your tracker"}
            </p>
          </button>
        </div>
      </div>
      {/* ── This Week Banner (desktop only) ── */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in7Days = new Date(today.getTime() + 7 * 86400000);
        const thisWeekSessions = allSessions
          .filter(s => !s.isRolling && s.dates && s.dates.length > 0)
          .flatMap(s => (s.dates || []).map(d => ({ session: s, date: d })))
          .filter(({ date }) => {
            const d = new Date(date + "T00:00:00");
            return d >= today && d <= in7Days;
          })
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 4);
        if (thisWeekSessions.length === 0) return null;
        return (
          <div className="hidden sm:block bg-amber-50 border-b border-amber-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
              <span className="shrink-0 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                {lang === "zh" ? "本周活动" : lang === "hi" ? "इस सप्ताह" : "This Week"}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {thisWeekSessions.map(({ session, date }) => {
                  const school = schoolsMap[session.schoolId];
                  const d = new Date(date + "T00:00:00");
                  const dayLabel = d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", weekday: "short" });
                  const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                  const urgency = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : null;
                  return (
                    <a
                      key={`${session.schoolId}-${date}`}
                      href={session.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all text-xs text-stone-700 whitespace-nowrap group"
                    >
                      {urgency && (
                        <span className={`text-[9px] font-bold px-1 py-0.5 leading-none ${
                          urgency === "today" ? "bg-red-500 text-white" : "bg-amber-400 text-white"
                        }`}>
                          {urgency === "today"
                            ? (lang === "zh" ? "今天" : lang === "hi" ? "आज" : "TODAY")
                            : (lang === "zh" ? "明天" : lang === "hi" ? "कल" : "TMR")}
                        </span>
                      )}
                      <span className="font-medium text-stone-500 text-[10px]">{dayLabel}</span>
                      <span className="font-semibold">{school?.shortName || school?.name || ""}</span>
                      <span className="text-stone-400 text-[10px] group-hover:text-amber-600 transition-colors">↗</span>
                    </a>
                  );
                })}
                {allSessions
                  .filter(s => !s.isRolling && s.dates && s.dates.length > 0)
                  .flatMap(s => (s.dates || []).map(d => ({ session: s, date: d })))
                  .filter(({ date }) => { const d = new Date(date + "T00:00:00"); return d >= today && d <= in7Days; })
                  .length > 4 && (
                  <span className="text-[10px] text-amber-600 font-medium">
                    +{allSessions
                      .filter(s => !s.isRolling && s.dates && s.dates.length > 0)
                      .flatMap(s => (s.dates || []).map(d => ({ session: s, date: d })))
                      .filter(({ date }) => { const d = new Date(date + "T00:00:00"); return d >= today && d <= in7Days; })
                      .length - 4}
                    {lang === "zh" ? " 场" : " more"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Mobile-only: Simplified Landing ── */}
      <div className="sm:hidden flex flex-col min-h-[calc(100vh-56px)] bg-white">
        {/* Feature cards */}
        <div className="px-4 pt-6 pb-4 space-y-3">
          {/* Mobile: This Week / Today mini banner */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const in7Days = new Date(today.getTime() + 7 * 86400000);
            const upcoming = allSessions
              .filter(s => !s.isRolling && s.dates && s.dates.length > 0)
              .flatMap(s => (s.dates || []).map(d => ({ session: s, date: d })))
              .filter(({ date }) => { const d = new Date(date + "T00:00:00"); return d >= today && d <= in7Days; })
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 3);
            if (upcoming.length === 0) return null;
            const todayCount = upcoming.filter(({ date }) => new Date(date + "T00:00:00").getTime() === today.getTime()).length;
            return (
              <div className="bg-amber-50 border border-amber-200 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {todayCount > 0
                      ? (lang === "zh" ? `今日 ${todayCount} 场活动` : lang === "hi" ? `आज ${todayCount} इवेंट` : `${todayCount} event${todayCount > 1 ? "s" : ""} today`)
                      : (lang === "zh" ? "本周活动" : lang === "hi" ? "इस सप्ताह" : "This Week")}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {upcoming.map(({ session, date }) => {
                    const school = schoolsMap[session.schoolId];
                    const d = new Date(date + "T00:00:00");
                    const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                    const dayLabel = diffDays === 0
                      ? (lang === "zh" ? "今天" : lang === "hi" ? "आज" : "Today")
                      : diffDays === 1
                      ? (lang === "zh" ? "明天" : lang === "hi" ? "कल" : "Tomorrow")
                      : d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", weekday: "short" });
                    return (
                      <a
                        key={`mob-${session.schoolId}-${date}`}
                        href={session.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-stone-700"
                      >
                        <span className={`shrink-0 text-[9px] font-bold px-1 py-0.5 leading-none ${
                          diffDays === 0 ? "bg-red-500 text-white" : "bg-amber-400 text-white"
                        }`}>{dayLabel}</span>
                        <span className="font-semibold truncate">{school?.shortName || school?.name || ""}</span>
                        <span className="text-stone-400 shrink-0">↗</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          {/* AO intro card */}
          <div className="border border-stone-900 bg-stone-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎓</span>
              <span className="text-sm font-bold text-stone-900">{t.onboardingAoTitle}</span>
            </div>
            <div className="space-y-2">
              {[
                { label: t.onboardingAo1Label, detail: t.onboardingAo1Detail },
                { label: t.onboardingAo2Label, detail: t.onboardingAo2Detail },
                { label: t.onboardingAo3Label, detail: t.onboardingAo3Detail },
              ].map((p) => (
                <div key={p.label} className="flex gap-2">
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-900 inline-block" />
                  <div>
                    <span className="text-xs font-semibold text-stone-800">{p.label}</span>
                    <span className="text-xs text-stone-400"> — {p.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-stone-100 p-3">
              <div className="text-base mb-1">🌍</div>
              <div className="text-xs font-semibold text-stone-900 mb-0.5">{t.onboardingF1Title}</div>
              <div className="text-[10px] text-stone-400 leading-relaxed">{t.onboardingF1Desc}</div>
            </div>

            <div className="border border-stone-100 p-3">
              <div className="text-base mb-1">📅</div>
              <div className="text-xs font-semibold text-stone-900 mb-0.5">{t.onboardingF3Title}</div>
              <div className="text-[10px] text-stone-400 leading-relaxed">{t.onboardingF3Desc}</div>
            </div>
            <div className="border border-stone-100 p-3">
              <div className="text-base mb-1">🤝</div>
              <div className="text-xs font-semibold text-stone-900 mb-0.5">{t.onboardingF4Title}</div>
              <div className="text-[10px] text-stone-400 leading-relaxed">{t.onboardingF4Desc}</div>
            </div>
          </div>
          {/* Integration Hub shortcut */}
          <button
            onClick={() => setShowIntegrationHub(true)}
            className="w-full border border-stone-200 bg-stone-50 p-3 text-left hover:border-stone-400 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <div title="Notion" className="w-4 h-4 rounded bg-stone-900 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" /><path d="M8 8h8M8 12h5M8 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div title="飞书" className="w-4 h-4 rounded bg-sky-500 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 4L4 8l8 4 8-4-8-4z" fill="white" /><path d="M4 12l8 4 8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </div>
                <div title="Obsidian" className="w-4 h-4 rounded bg-purple-700 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke="white" strokeWidth="2" fill="none" /><circle cx="12" cy="12" r="3" fill="white" /></svg>
                </div>
                <div title="Anytype" className="w-4 h-4 rounded bg-teal-600 flex items-center justify-center">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" fill="white" /><rect x="13" y="4" width="7" height="7" rx="1" fill="white" opacity="0.6" /></svg>
                </div>
                <div title="wolai" className="w-4 h-4 rounded bg-violet-600 flex items-center justify-center">
                  <span className="text-white font-bold" style={{fontSize: "7px", lineHeight: 1}}>W</span>
                </div>
              </div>
              <span className="ml-auto text-[9px] font-bold bg-stone-900 text-white px-1 py-0.5 leading-none">{t.footerNotionNew}</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 mb-0.5">
              {lang === "zh" ? "集成中心" : "Integration Hub"}
            </div>
            <div className="text-[10px] text-stone-400">
              {lang === "zh" ? "嵌入 Notion / 飞书 / Obsidian 等工具" : "Embed into Notion, Feishu, Obsidian & more"}
            </div>
          </button>
        </div>
        {/* Desktop CTA - Send to Desktop */}
        <div className="mx-4 mb-6 border border-stone-200 bg-stone-50 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-stone-500 shrink-0">
              <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 22h8M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <div className="text-xs font-semibold text-stone-800">{t.mobileDesktopTitle}</div>
              <div className="text-[10px] text-stone-400 leading-relaxed">{t.mobileDesktopDesc}</div>
            </div>
          </div>

          {/* QR Code section */}
          <div className="mb-3">
            <div className="text-[10px] text-stone-500 font-medium mb-2">{t.mobileSendTitle}</div>
            <div className="flex items-start gap-3">
              {/* QR Code */}
              <div className="shrink-0">
                {mobileQRDataUrl ? (
                  <img src={mobileQRDataUrl} alt="QR Code" className="w-[90px] h-[90px] border border-stone-200" />
                ) : (
                  <div className="w-[90px] h-[90px] border border-stone-200 bg-stone-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-stone-300">
                      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="15" y="15" width="2" height="2" fill="currentColor" />
                    </svg>
                  </div>
                )}
                <div className="text-[9px] text-stone-400 text-center mt-1">{t.mobileScanQR}</div>
              </div>

              {/* Action buttons */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Web Share API button */}
                {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: t.siteTitle,
                          text: t.siteDesc,
                          url: window.location.href,
                        });
                      } catch {}
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-stone-700 border border-stone-300 px-2.5 py-1.5 hover:border-stone-500 hover:bg-white transition-colors w-full justify-center"
                  >
                    <Share2 size={10} />
                    {t.mobileShareBtn}
                  </button>
                )}

                {/* Copy link button */}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href).then(() => {
                      setMobileLinkCopied(true);
                      setTimeout(() => setMobileLinkCopied(false), 2000);
                    });
                  }}
                  className="flex items-center gap-1.5 text-[10px] text-stone-700 border border-stone-300 px-2.5 py-1.5 hover:border-stone-500 hover:bg-white transition-colors w-full justify-center"
                >
                  {mobileLinkCopied ? <Check size={10} className="text-green-600" /> : <Copy size={10} />}
                  {mobileLinkCopied ? t.mobileCopied : t.mobileCopyLink}
                </button>
              </div>
            </div>
          </div>

          {/* Email section */}
          <div className="border-t border-stone-200 pt-3">
            <div className="text-[10px] text-stone-500 font-medium mb-1.5">{t.mobileEmailBtn}</div>
            {mobileEmailStatus === "sent" ? (
              <div className="flex items-center gap-1.5 text-[10px] text-green-700 bg-green-50 border border-green-200 px-2.5 py-2">
                <Check size={10} />
                {t.mobileEmailSent}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={mobileEmailInput}
                  onChange={(e) => { setMobileEmailInput(e.target.value); setMobileEmailStatus("idle"); }}
                  placeholder={t.mobileEmailPlaceholder}
                  className="flex-1 text-[10px] border border-stone-200 px-2.5 py-1.5 outline-none focus:border-stone-500 bg-white min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const email = mobileEmailInput.trim();
                      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setMobileEmailStatus("invalid"); return; }
                      setMobileEmailStatus("sending");
                      sendLinkMutation.mutate({ email, url: window.location.href, lang });
                    }
                  }}
                />
                <button
                  disabled={mobileEmailStatus === "sending"}
                  onClick={() => {
                    const email = mobileEmailInput.trim();
                    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setMobileEmailStatus("invalid"); return; }
                    setMobileEmailStatus("sending");
                    sendLinkMutation.mutate({ email, url: window.location.href, lang });
                  }}
                  className="shrink-0 text-[10px] bg-stone-900 text-white px-3 py-1.5 hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                  {mobileEmailStatus === "sending" ? t.mobileEmailSending : t.mobileEmailSend}
                </button>
              </div>
            )}
            {(mobileEmailStatus === "error" || mobileEmailStatus === "invalid") && (
              <div className="mt-1 text-[9px] text-red-500">
                {mobileEmailStatus === "invalid" ? t.mobileEmailInvalid : t.mobileEmailError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div className="hidden sm:block border-b border-stone-200 bg-white sticky top-12 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex">
            <button
              onClick={() => setView("interviews")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "interviews"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.tabInterviews}
            </button>
            <button
              onClick={() => setView("sessions")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "sessions"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.tabSessions}
            </button>
            <button
              onClick={() => setView("schools")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "schools"
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.tabSchools}
            </button>
            {/* Portals link */}
            <div className="ml-auto flex items-center gap-4">
              {/* Data last updated */}
              <span className="hidden lg:block text-[10px] text-stone-300 select-none">
                {t.dataUpdated} {DATA_LAST_UPDATED}
              </span>
              <a
                href="/portals"
                className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
              >
                {lang === "zh" ? "Applicant Portal 入口" : lang === "hi" ? "Applicant Portal" : "Applicant Portals"}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* ── Mobile Filter Bar ── */}
      <div className="hidden border-b border-stone-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs text-stone-600 border border-stone-200 px-3 py-1.5 hover:border-stone-400 hover:text-stone-900 transition-colors"
          >
            <SlidersHorizontal size={12} />
            <span>{t.mobileFilterBtn}</span>
          </button>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="hidden sm:flex max-w-6xl mx-auto px-4 sm:px-6 py-6 gap-8">

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
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <span className="text-sm font-medium text-stone-900">{t.mobileFilterTitle}</span>
            <button onClick={() => setMobileFilterOpen(false)}>
              <X size={16} className="text-stone-400" />
            </button>
          </div>

          <div className="sticky top-28 space-y-6">
            {/* Search */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                {t.search}
              </label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-300" />
                <Input
                  placeholder={view === "interviews" ? t.interviewSearchPlaceholder : t.searchPlaceholder}
                  value={view === "interviews" ? interviewSearch : search}
                  onChange={(e) => view === "interviews" ? setInterviewSearch(e.target.value) : setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-900"
                />
              </div>
              {/* Hot suggestions */}
              {(() => {
                const hotSchools = [
                  "MIT", "Stanford", "Harvard", "Yale", "Princeton",
                  "CMU", "Cornell", "NYU", "UCLA", "UC Berkeley",
                ];
                const currentVal = view === "interviews" ? interviewSearch : search;
                if (currentVal) return null;
                return (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hotSchools.map((name) => (
                      <button
                        key={name}
                        onClick={() => view === "interviews" ? setInterviewSearch(name) : setSearch(name)}
                        className="text-[10px] px-1.5 py-0.5 border border-stone-200 text-stone-400 hover:border-stone-500 hover:text-stone-700 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Region filter */}
            <div>
              <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                {t.region}
              </label>
              <div className="space-y-0.5">
                {regionOptions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setRegionFilter(r.value); if (r.value !== "All") trackRegion(r.value); }}
                    className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                      regionFilter === r.value
                        ? "bg-stone-900 text-white"
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview filter */}
            {view === "interviews" && (
              <div className="space-y-4">
                {/* Status filter */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                    {t.interviewStatusLabel}
                  </label>
                  <div className="space-y-0.5">
                    {([
                      { value: "all" as const, label: t.interviewFilterAll },
                      { value: "available" as const, label: t.interviewFilterAvailable },
                      { value: "near_deadline" as const, label: t.interviewFilterNearDeadline },
                      { value: "none" as const, label: t.interviewFilterNone },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setInterviewFilter(opt.value)}
                        className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                          interviewFilter === opt.value
                            ? "bg-stone-900 text-white"
                            : "text-stone-500 hover:bg-stone-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method filter */}
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                    {t.interviewMethodFilterLabel}
                  </label>
                  <div className="space-y-0.5">
                    {([
                      { value: "all" as const, label: t.interviewMethodFilterAll },
                      { value: "school_contacts" as const, label: t.interviewMethodFilterSchool },
                      { value: "applicant_requests" as const, label: t.interviewMethodFilterApplicant },
                      { value: "required" as const, label: t.interviewMethodFilterRequired },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setInterviewMethodFilter(opt.value)}
                        className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                          interviewMethodFilter === opt.value
                            ? "bg-stone-900 text-white"
                            : "text-stone-500 hover:bg-stone-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Session type */}
            {view === "sessions" && (
              <div>
                <label className="text-[11px] uppercase tracking-widest text-stone-400 block mb-2">
                  {t.sessionType}
                </label>
                <div className="space-y-0.5">
                  {sessionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => { setTypeFilter(type); if (type !== "All") trackSessionType(type); }}
                      className={`w-full text-left text-xs px-2 py-1.5 transition-colors ${
                        typeFilter === type
                          ? "bg-stone-900 text-white"
                          : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {type === "All"
                        ? t.allTypes
                        : lang === "zh"
                        ? SESSION_TYPE_LABELS_ZH[type as SessionType]
                        : type}
                    </button>
                  ))}
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
            <div className="flex gap-6">
              {/* Left: scheduled sessions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">{t.upcoming}</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                {/* Batch selection bar */}
                {selectedSessions.size > 0 && (
                  <div className="flex items-center justify-between gap-3 mb-2 px-3 py-2 bg-stone-900 text-white">
                    <span className="text-xs font-medium">
                      {t.batchSelectedTpl
                        .replace("{n}", String(selectedSessions.size))
                        .replace("{plural}", selectedSessions.size > 1 ? "s" : "")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={clearSelection}
                        className="text-[11px] text-stone-400 hover:text-white transition-colors"
                      >
                        {t.batchClear}
                      </button>
                      <button
                        onClick={exportBatchICS}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white text-stone-900 font-semibold hover:bg-stone-100 transition-colors"
                      >
                        <CalendarPlus size={11} />
                        {t.batchExport}
                      </button>
                    </div>
                  </div>
                )}
{(() => {
                  const nonRolling = filteredSessions.filter((s) => !s.isRolling);
                  const activeSessions = nonRolling.filter(s => !isExpiredSession(s)).sort((a, b) => {
                    const da = getNextDate(a);
                    const db = getNextDate(b);
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    return da.getTime() - db.getTime();
                  });
                  const expiredSessions = nonRolling.filter(s => isExpiredSession(s)).sort((a, b) => {
                    const da = getNextDate(a);
                    const db = getNextDate(b);
                    if (!da && !db) return 0;
                    if (!da) return 1;
                    if (!db) return -1;
                    return db.getTime() - da.getTime(); // most recent first
                  });
                  return (
                    <>
                      {activeSessions.length > 0 ? (
                        <div className="border border-stone-100">
                          {activeSessions.map((s) => <ScheduledSessionCard key={s.id} session={s} t={t} lang={lang} isSelected={selectedSessions.has(s.id)} onToggle={toggleSelect} onView={(school) => { if (school?.type) trackSchoolType(school.type); if (school?.region) trackRegion(school.region); if (s.type) trackSessionType(s.type); }} />)}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-stone-400">
                          <p className="text-xs">{t.noFixed}</p>
                        </div>
                      )}
                      {expiredSessions.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setShowExpiredSessions(v => !v)}
                            className="flex items-center gap-2 text-[11px] text-stone-300 hover:text-stone-500 transition-colors w-full py-2"
                          >
                            <div className="flex-1 h-px bg-stone-100" />
                            <span>{showExpiredSessions ? t.hideExpired : t.showExpired} ({expiredSessions.length})</span>
                            <div className="flex-1 h-px bg-stone-100" />
                          </button>
                          {showExpiredSessions && (
                            <div className="border border-stone-100 opacity-50">
                              {expiredSessions.map((s) => <ScheduledSessionCard key={s.id} session={s} t={t} lang={lang} isSelected={selectedSessions.has(s.id)} onToggle={toggleSelect} onView={(school) => { if (school?.type) trackSchoolType(school.type); if (school?.region) trackRegion(school.region); if (s.type) trackSessionType(s.type); }} />)}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
                {filteredSessions.length === 0 && (
                  <div className="py-10 text-center text-stone-400">
                    <p className="text-xs mb-2">{t.noMatch}</p>
                    {/* Try to find a matching school to link to */}
                    {(() => {
                      const q = search.trim().toLowerCase();
                      const matchedSchool = q ? allSchools.find(s =>
                        s.name.toLowerCase().includes(q) ||
                        (s.shortName && s.shortName.toLowerCase().includes(q))
                      ) : null;
                      return matchedSchool ? (
                        <a
                          href={matchedSchool.registrationPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2 mb-2"
                        >
                          {matchedSchool.name} &mdash; {t.noMatchVisitOfficial}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      ) : null;
                    })()}
                    <div>
                      <button
                        onClick={() => { setSearch(""); setTypeFilter("All"); setRegionFilter("All"); }}
                        className="text-xs underline underline-offset-2 hover:text-stone-600"
                      >
                        {t.clearFilter}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: rolling sessions */}
              <div className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-28">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw size={10} className="text-stone-400" />
                    <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">{t.rolling}</span>
                  </div>
                  <div className="border border-stone-100 px-3 py-1">
                    {filteredSessions.filter((s) => s.isRolling).length > 0 ? (
                      filteredSessions.filter((s) => s.isRolling).map((s) => (
                        <RollingRow key={s.id} session={s} t={t} />
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-300 py-3 text-center">{t.noRolling}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-300 mt-2 leading-relaxed">{t.rollingNote}</p>
                </div>
              </div>
            </div>
          ) : view === "interviews" ? (
            <div>
              {/* Cards: grouped by request method when no method filter active, else flat */}
              {(() => {
                const isFiltered = interviewFilter !== "all" || interviewMethodFilter !== "all" || interviewSearch.trim() !== "";
                if (isFiltered) {
                  // Flat view when filters are active
                  const sorted = [...filteredInterviews].sort((a, b) => {
                    if (a.available && !b.available) return -1;
                    if (!a.available && b.available) return 1;
                    return a.rank - b.rank;
                  });
                  return sorted.length === 0 ? (
                    <div className="py-10 text-center text-stone-400">
                      <p className="text-xs mb-2">{t.noMatchSchool}</p>
                      {(() => {
                        const q = interviewSearch.trim().toLowerCase();
                        const matchedSchool = q ? allSchools.find(s =>
                          s.name.toLowerCase().includes(q) ||
                          (s.shortName && s.shortName.toLowerCase().includes(q))
                        ) : null;
                        return matchedSchool ? (
                          <a
                            href={matchedSchool.admissionPage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
                          >
                            {matchedSchool.name} &mdash; {t.noMatchVisitOfficial}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="border border-stone-100">
                      {sorted.map((s) => <InterviewCard key={s.id} school={s} t={t} lang={lang} onTypeClick={(type) => setInterviewSearch(type)} />)}
                    </div>
                  );
                }
                // Grouped view: applicant_requests → school_contacts → required → none
                // "none" and "school_contacts" default collapsed; "applicant_requests" shows 8 with expand
                const groups: { method: string; label: string; accent: string; defaultCollapsed?: boolean; limitCount?: number }[] = [
                  { method: "applicant_requests", label: t.interviewMethodFilterApplicant, accent: "text-amber-600", limitCount: 8 },
                  { method: "school_contacts",    label: t.interviewMethodFilterSchool,    accent: "text-blue-600", defaultCollapsed: true },
                  { method: "required",            label: t.interviewMethodFilterRequired,  accent: "text-red-600" },
                  // "none" group hidden — not actionable for users
                ];
                return (
                  <div className="space-y-8">
                    {groups.map(({ method, label, accent, defaultCollapsed, limitCount }) => {
                      const group = filteredInterviews
                        .filter(s => s.requestMethod === method)
                        .sort((a, b) => a.rank - b.rank);
                      if (group.length === 0) return null;
                      return (
                        <InterviewGroup
                          key={method}
                          method={method}
                          label={label}
                          accent={accent}
                          group={group}
                          t={t}
                          lang={lang}
                          defaultCollapsed={defaultCollapsed}
                          limitCount={limitCount}
                          onTypeClick={(type) => setInterviewSearch(type)}
                        />
                      );
                    })}
                    {filteredInterviews.length === 0 && (
                      <div className="py-12 text-center text-stone-400">
                        <p className="text-xs">{t.noMatchSchool}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Disclaimer */}
              <div className="mt-6 p-3 bg-stone-50 border border-stone-100 flex gap-2">
                <Info size={12} className="text-stone-300 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-400 leading-relaxed">{t.interviewNote}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rank mode toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium shrink-0">
                  {lang === "zh" ? "排名来源" : "Rank by"}
                </span>
                <div className="flex border border-stone-200 overflow-hidden">
                  <button
                    onClick={() => setRankMode('usnews')}
                    className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      rankMode === 'usnews'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    USNews
                  </button>
                  <button
                    onClick={() => setRankMode('qs')}
                    className={`px-2.5 py-1 text-[10px] font-medium transition-colors border-l border-stone-200 ${
                      rankMode === 'qs'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    QS World
                  </button>
                </div>
                <span className="text-[10px] text-stone-300">
                  {rankMode === 'usnews'
                    ? (lang === "zh" ? "US News 2026 美国大学排名" : "US News 2026 National Rankings")
                    : (lang === "zh" ? "QS 世界大学排名 2026" : "QS World University Rankings 2026")}
                </span>
              </div>
              {/* Group schools by region */}
              {(["US", "UK", "HK", "AU"] as Region[]).map((region) => {
                const regionSchools = filteredSchools.filter((s) => s.region === region);
                if (regionSchools.length === 0) return null;
                const regionLabel = regionOptions.find(r => r.value === region)?.label || region;
                const sortedRegionSchools = [...regionSchools].sort((a, b) => {
                  if (rankMode === 'qs') {
                    const qa = a.qsRank ?? 9999;
                    const qb = b.qsRank ?? 9999;
                    return qa - qb;
                  }
                  return a.rank - b.rank;
                });
                return (
                  <section key={region}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] uppercase tracking-widest text-stone-400 font-medium">
                        {regionLabel}
                      </span>
                      <div className="flex-1 h-px bg-stone-100" />
                    </div>
                    <div className="border border-stone-100">
                      {sortedRegionSchools.map((s) => (
                        <SchoolCard key={s.id} school={s} t={t} rankMode={rankMode} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-100 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-6">
            {/* Brand */}
            <div className="shrink-0 max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="9" cy="9" r="8" stroke="#111" strokeWidth="1.2" />
                  <circle cx="9" cy="9" r="4.5" stroke="#111" strokeWidth="1.2" />
                  <circle cx="9" cy="9" r="1.5" fill="#111" />
                </svg>
                <div className="text-sm font-bold text-stone-900">{t.brandName}</div>
              </div>
              <div className="text-[11px] text-stone-400 leading-relaxed">
                {t.footerBrand}
              </div>
            </div>
            {/* Roadmap */}
            <div>
              <div className="text-[11px] uppercase tracking-widest text-stone-400 mb-2">{t.footerRoadmap}</div>
              <div className="space-y-1.5">
                {([
                  { label: t.footerUs, status: t.footerUsLive, state: "live" as const },
                  { label: t.footerUk, status: t.footerUsLive, state: "live" as const },
                  { label: t.footerHk, status: t.footerUsLive, state: "live" as const },
                  { label: t.footerCa, status: t.footerSoon, state: "soon" as const },
                  { label: t.footerGrad, status: t.footerPlanned, state: "planned" as const },
                ] as { label: string; status: string; state: "live" | "soon" | "planned" }[]).map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.state === "live" ? "bg-stone-900" :
                      item.state === "soon" ? "bg-stone-300" :
                      "border border-dashed border-stone-300"
                    }`} />
                    <span className={item.state === "live" ? "text-stone-700" : "text-stone-400"}>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 ${
                      item.state === "live" ? "bg-stone-900 text-white" :
                      item.state === "soon" ? "bg-stone-100 text-stone-500 border border-stone-200" :
                      "border border-dashed border-stone-200 text-stone-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <div className="border-t border-stone-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-stone-400">
            <span>{t.footerDisclaimer}</span>
            <span className="text-stone-300">{t.footerMotto}</span>
          </div>
          <div className="mt-3 text-[10px] text-stone-300 text-center sm:text-left">
            {t.footerCopyright}
          </div>
        </div>
      </footer>

      {/* AIChatAssistant temporarily hidden — re-enable when ready
      <AIChatAssistant browsingProfile={browsingProfile} lang={lang} />
      */}

      {/* ── Onboarding Modal ── */}
      <OnboardingModal t={t} lang={lang} />

      {/* ── Batch Export Bar ── */}
      {selectedSessions.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {t.batchSelectedTpl
              .replace("{n}", String(selectedSessions.size))
              .replace("{plural}", selectedSessions.size > 1 ? "s" : "")}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="text-xs text-stone-400 hover:text-white transition-colors"
            >
              {t.batchClear}
            </button>
            <button
              onClick={exportBatchICS}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              <CalendarPlus size={12} />
              {t.batchExport}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
