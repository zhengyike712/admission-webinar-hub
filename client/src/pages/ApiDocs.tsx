/**
 * ApiDocs.tsx
 *
 * Public API documentation page for AdmitLens (景深).
 * Documents the /api/public/sessions endpoint with examples,
 * parameters, response schema, and integration guides.
 */

import { useState } from "react";
import { Copy, Check, ExternalLink, Code2, Globe, Zap, Database } from "lucide-react";

const SITE_ORIGIN = window.location.origin;

type Lang = "zh" | "en";

const T = {
  zh: {
    backToHome: "← 返回景深",
    badge: "开发者文档",
    pageTitle: "公开 API 文档",
    pageDesc: "景深提供免费、开放的 JSON API，供开发者、研究者和工具集成者直接获取实时招生活动数据。无需注册，无需 API Key。",
    baseUrl: "基础 URL",
    endpoint: "端点",
    method: "方法",
    auth: "认证",
    authNone: "无需认证（完全公开）",
    cors: "CORS",
    corsEnabled: "已开放（允许所有来源）",
    rateLimit: "速率限制",
    rateLimitVal: "暂无限制（请合理使用）",
    paramsTitle: "请求参数",
    paramName: "参数名",
    paramType: "类型",
    paramRequired: "必填",
    paramDefault: "默认值",
    paramDesc: "说明",
    no: "否",
    responseTitle: "响应格式",
    examplesTitle: "示例请求",
    ex1Title: "获取所有即将举行的活动",
    ex2Title: "获取 MIT 的活动",
    ex3Title: "获取最近 3 场活动",
    ex4Title: "获取 Stanford 的英文数据（限 5 条）",
    fieldTitle: "响应字段说明",
    fieldName: "字段名",
    fieldTypeLabel: "类型",
    fieldDescLabel: "说明",
    useCasesTitle: "使用场景",
    uc1Title: "Notion / Obsidian / Anytype 嵌入",
    uc1Desc: "通过 /embed 小窗口直接嵌入，或调用 API 自定义展示。",
    uc2Title: "申请日历自动同步",
    uc2Desc: "定期调用 API，将新活动自动添加到 Google Calendar 或 iCal。",
    uc3Title: "AI 助手数据源",
    uc3Desc: "为 ChatGPT、Perplexity 等 AI 工具提供实时招生活动数据。",
    uc4Title: "数据研究与分析",
    uc4Desc: "研究各校招生活动频率、时间分布和类型偏好。",
    integrationLink: "查看集成指南",
    copyBtn: "复制",
    copied: "已复制",
    tryItTitle: "在线测试",
    tryItDesc: "直接在浏览器中测试 API：",
    openInBrowser: "在浏览器中打开",
    updateFreq: "数据更新频率",
    updateFreqVal: "每日 UTC 02:00 自动爬取各校官方 Portal",
    dataSource: "数据来源",
    dataSourceVal: "各校官方招生网站（直接爬取，非第三方转载）",
    license: "使用许可",
    licenseVal: "CC BY-NC 4.0（非商业用途免费使用，需注明来源）",
  },
  en: {
    backToHome: "← Back to AdmitLens",
    badge: "Developer Docs",
    pageTitle: "Public API Documentation",
    pageDesc: "AdmitLens provides a free, open JSON API for developers, researchers, and tool integrators to access real-time admissions event data. No registration or API key required.",
    baseUrl: "Base URL",
    endpoint: "Endpoint",
    method: "Method",
    auth: "Authentication",
    authNone: "None required (fully public)",
    cors: "CORS",
    corsEnabled: "Enabled (all origins allowed)",
    rateLimit: "Rate Limit",
    rateLimitVal: "None currently (please use responsibly)",
    paramsTitle: "Query Parameters",
    paramName: "Parameter",
    paramType: "Type",
    paramRequired: "Required",
    paramDefault: "Default",
    paramDesc: "Description",
    no: "No",
    responseTitle: "Response Format",
    examplesTitle: "Example Requests",
    ex1Title: "Get all upcoming sessions",
    ex2Title: "Get MIT sessions",
    ex3Title: "Get the 3 most recent sessions",
    ex4Title: "Get Stanford sessions in English (limit 5)",
    fieldTitle: "Response Field Reference",
    fieldName: "Field",
    fieldTypeLabel: "Type",
    fieldDescLabel: "Description",
    useCasesTitle: "Use Cases",
    uc1Title: "Notion / Obsidian / Anytype Embed",
    uc1Desc: "Embed via the /embed widget, or call the API directly for custom display.",
    uc2Title: "Auto-sync to Application Calendar",
    uc2Desc: "Poll the API periodically to auto-add new sessions to Google Calendar or iCal.",
    uc3Title: "AI Assistant Data Source",
    uc3Desc: "Feed real-time admissions data to ChatGPT, Perplexity, or other AI tools.",
    uc4Title: "Research & Analytics",
    uc4Desc: "Study session frequency, timing patterns, and type distribution across schools.",
    integrationLink: "View Integration Guides",
    copyBtn: "Copy",
    copied: "Copied",
    tryItTitle: "Try It Live",
    tryItDesc: "Test the API directly in your browser:",
    openInBrowser: "Open in Browser",
    updateFreq: "Update Frequency",
    updateFreqVal: "Daily at UTC 02:00 — automated crawl of official school portals",
    dataSource: "Data Source",
    dataSourceVal: "Official university admissions websites (direct crawl, not third-party)",
    license: "License",
    licenseVal: "CC BY-NC 4.0 (free for non-commercial use with attribution)",
  },
} as const;

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="relative group">
      <pre className="bg-stone-900 text-stone-100 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 flex items-center gap-1 text-[10px] bg-stone-700 hover:bg-stone-600 text-stone-200 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
        {copied ? label.replace("Copy", "Copied") : label}
      </button>
    </div>
  );
}

export default function ApiDocs() {
  const urlLang = (new URLSearchParams(window.location.search).get("lang") as Lang) || "en";
  const [lang] = useState<Lang>(urlLang === "zh" ? "zh" : "en");
  const t = T[lang];

  const baseUrl = SITE_ORIGIN;
  const endpointPath = "/api/public/sessions";

  const params = [
    { name: "school", type: "string", required: t.no, default: "—", desc: lang === "zh" ? "按学校缩写筛选，如 MIT、Stanford、Yale" : "Filter by school abbreviation, e.g. MIT, Stanford, Yale" },
    { name: "upcoming", type: "boolean", required: t.no, default: "false", desc: lang === "zh" ? "为 true 时仅返回有未来日期的活动" : "When true, only return sessions with future dates" },
    { name: "limit", type: "integer", required: t.no, default: "20", desc: lang === "zh" ? "返回结果数量上限（1–100）" : "Maximum number of results to return (1–100)" },
  ];

  const fields = [
    { name: "sessions", type: "array", desc: lang === "zh" ? "活动对象数组" : "Array of session objects" },
    { name: "sessions[].id", type: "string", desc: lang === "zh" ? "活动唯一标识符" : "Unique session identifier" },
    { name: "sessions[].schoolId", type: "string", desc: lang === "zh" ? "学校唯一标识符" : "School unique identifier" },
    { name: "sessions[].schoolName", type: "string", desc: lang === "zh" ? "学校全名" : "Full school name" },
    { name: "sessions[].title", type: "string", desc: lang === "zh" ? "活动标题" : "Session title" },
    { name: "sessions[].type", type: "string", desc: lang === "zh" ? "活动类型（General Info Session / Specialty 等）" : "Session type (General Info Session, Specialty, etc.)" },
    { name: "sessions[].dates", type: "string[]", desc: lang === "zh" ? "活动日期数组（YYYY-MM-DD 格式）" : "Array of session dates (YYYY-MM-DD format)" },
    { name: "sessions[].time", type: "string", desc: lang === "zh" ? "活动时间（含时区，如 2:00 PM ET）" : "Session time with timezone (e.g. 2:00 PM ET)" },
    { name: "sessions[].duration", type: "string", desc: lang === "zh" ? "活动时长（如 60 min）" : "Session duration (e.g. 60 min)" },
    { name: "sessions[].registrationUrl", type: "string", desc: lang === "zh" ? "官方报名链接" : "Official registration URL" },
    { name: "sessions[].isRolling", type: "boolean", desc: lang === "zh" ? "是否为滚动开放（全年可选日期）" : "Whether the session has rolling (year-round) availability" },
    { name: "total", type: "integer", desc: lang === "zh" ? "返回活动总数" : "Total number of sessions returned" },
    { name: "updatedAt", type: "string (ISO 8601)", desc: lang === "zh" ? "数据最后更新时间（UTC）" : "Last data update timestamp (UTC)" },
  ];

  const examples = [
    {
      title: t.ex1Title,
      url: `${baseUrl}${endpointPath}?upcoming=true`,
    },
    {
      title: t.ex2Title,
      url: `${baseUrl}${endpointPath}?school=MIT`,
    },
    {
      title: t.ex3Title,
      url: `${baseUrl}${endpointPath}?upcoming=true&limit=3`,
    },
    {
      title: t.ex4Title,
      url: `${baseUrl}${endpointPath}?school=Stanford&limit=5`,
    },
  ];

  const responseExample = `{
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
      "registrationUrl": "https://mitadmissions.org/apply/visit/",
      "isRolling": false
    }
  ],
  "total": 1,
  "updatedAt": "2026-02-28T03:00:00Z"
}`;

  const fetchExample = `// JavaScript / TypeScript
const res = await fetch('${baseUrl}${endpointPath}?upcoming=true&limit=10');
const data = await res.json();
console.log(data.sessions);`;

  const pythonExample = `# Python
import requests

resp = requests.get(
    '${baseUrl}${endpointPath}',
    params={'upcoming': 'true', 'limit': 10}
)
sessions = resp.json()['sessions']
for s in sessions:
    print(s['schoolName'], s['title'], s['dates'])`;

  const curlExample = `# cURL
curl "${baseUrl}${endpointPath}?upcoming=true&limit=5"`;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-sm font-semibold text-stone-800 hover:text-blue-600 transition-colors">
          {t.backToHome}
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.search = `?lang=${lang === "zh" ? "en" : "zh"}`}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            {lang === "zh" ? "English" : "中文"}
          </button>
          <span className="text-xs text-stone-400">{t.badge}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <Code2 size={12} />
            {t.badge}
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">{t.pageTitle}</h1>
          <p className="text-stone-500 text-base leading-relaxed">{t.pageDesc}</p>
        </div>

        {/* Quick Reference */}
        <section className="mb-12 border border-stone-200 rounded-lg overflow-hidden">
          <div className="bg-stone-50 px-5 py-3 border-b border-stone-200">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={12} />
              Quick Reference
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              [t.baseUrl, baseUrl],
              [t.endpoint, `GET ${endpointPath}`],
              [t.auth, t.authNone],
              [t.cors, t.corsEnabled],
              [t.rateLimit, t.rateLimitVal],
              [t.updateFreq, t.updateFreqVal],
              [t.dataSource, t.dataSourceVal],
              [t.license, t.licenseVal],
            ].map(([label, value]) => (
              <div key={label} className="flex px-5 py-3 gap-4">
                <span className="text-xs font-medium text-stone-500 w-28 shrink-0">{label}</span>
                <span className="text-xs text-stone-700 font-mono break-all">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Parameters */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            {t.paramsTitle}
          </h2>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {[t.paramName, t.paramType, t.paramRequired, t.paramDefault, t.paramDesc].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {params.map((p) => (
                  <tr key={p.name} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-700 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-stone-500">{p.type}</td>
                    <td className="px-4 py-3 text-stone-500">{p.required}</td>
                    <td className="px-4 py-3 font-mono text-stone-500">{p.default}</td>
                    <td className="px-4 py-3 text-stone-600">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4">{t.examplesTitle}</h2>
          <div className="space-y-4">
            {examples.map((ex) => (
              <div key={ex.url}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-stone-700">{ex.title}</span>
                  <a
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    {t.openInBrowser}
                    <ExternalLink size={10} />
                  </a>
                </div>
                <CodeBlock code={ex.url} label={t.copyBtn} />
              </div>
            ))}
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            {lang === "zh" ? "代码示例" : "Code Examples"}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-stone-700 mb-1.5">JavaScript / TypeScript</p>
              <CodeBlock code={fetchExample} label={t.copyBtn} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700 mb-1.5">Python</p>
              <CodeBlock code={pythonExample} label={t.copyBtn} />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700 mb-1.5">cURL</p>
              <CodeBlock code={curlExample} label={t.copyBtn} />
            </div>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4">{t.responseTitle}</h2>
          <CodeBlock code={responseExample} label={t.copyBtn} />
        </section>

        {/* Field Reference */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Database size={16} className="text-blue-500" />
            {t.fieldTitle}
          </h2>
          <div className="border border-stone-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {[t.fieldName, t.fieldTypeLabel, t.fieldDescLabel].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {fields.map((f) => (
                  <tr key={f.name} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-700">{f.name}</td>
                    <td className="px-4 py-3 text-stone-500 font-mono">{f.type}</td>
                    <td className="px-4 py-3 text-stone-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-stone-900 mb-4">{t.useCasesTitle}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: t.uc1Title, desc: t.uc1Desc, icon: "📋" },
              { title: t.uc2Title, desc: t.uc2Desc, icon: "📅" },
              { title: t.uc3Title, desc: t.uc3Desc, icon: "🤖" },
              { title: t.uc4Title, desc: t.uc4Desc, icon: "📊" },
            ].map((uc) => (
              <div key={uc.title} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                <div className="text-xl mb-2">{uc.icon}</div>
                <h3 className="text-sm font-semibold text-stone-800 mb-1">{uc.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Claude Integration Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">C</span>
            </div>
            <h2 className="text-base font-semibold text-stone-800">
              {lang === "zh" ? "Claude 工具集成" : "Claude Tool Integration"}
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
              {lang === "zh" ? "AI Native" : "AI Native"}
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {lang === "zh"
              ? "AdmitLens 支持三种方式与 Claude 集成，无需 API Key，免费使用。"
              : "AdmitLens supports three integration methods with Claude. No API key required, free to use."}
          </p>

          {/* Three methods */}
          <div className="space-y-3">
            {/* Method 1: Claude.ai Projects */}
            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <h3 className="text-xs font-semibold text-stone-700 mb-2">
                {lang === "zh" ? "方式一：Claude.ai Projects（推荐）" : "Option 1: Claude.ai Projects (Recommended)"}
              </h3>
              <ol className="text-xs text-stone-500 space-y-1 list-decimal list-inside">
                {(lang === "zh"
                  ? ["打开 claude.ai，创建或进入一个 Project", "点击 Settings → Tools → Add Tool", "选择 MCP Server，输入以下 URL", "保存后，在该 Project 的对话中即可调用 AdmitLens 数据"]
                  : ["Open claude.ai, create or enter a Project", "Click Settings → Tools → Add Tool", "Select MCP Server, enter the URL below", "After saving, AdmitLens data is available in all conversations in this Project"]
                ).map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <div className="mt-3 bg-stone-900 rounded p-3 font-mono text-xs text-green-400">
                {`MCP Server URL: ${SITE_ORIGIN}/mcp`}
              </div>
            </div>

            {/* Method 2: Claude Desktop */}
            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <h3 className="text-xs font-semibold text-stone-700 mb-2">
                {lang === "zh" ? "方式二：Claude Desktop" : "Option 2: Claude Desktop"}
              </h3>
              <p className="text-xs text-stone-500 mb-2">
                {lang === "zh"
                  ? "在 claude_desktop_config.json 中添加以下配置："
                  : "Add the following to your claude_desktop_config.json:"}
              </p>
              <div className="bg-stone-900 rounded p-3 font-mono text-xs text-green-400 whitespace-pre">{`{
  "mcpServers": {
    "admitlens": {
      "url": "${SITE_ORIGIN}/mcp"
    }
  }
}`}</div>
            </div>

            {/* Method 3: Claude API */}
            <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <h3 className="text-xs font-semibold text-stone-700 mb-2">
                {lang === "zh" ? "方式三：Claude API tool_use（开发者）" : "Option 3: Claude API tool_use (Developers)"}
              </h3>
              <p className="text-xs text-stone-500 mb-2">
                {lang === "zh"
                  ? "在 API 请求中直接传入工具定义，无需注册，任何调用 Claude API 的应用均可使用："
                  : "Pass tool definitions directly in API requests. No registration needed — any app calling the Claude API can use this:"}
              </p>
              <div className="bg-stone-900 rounded p-3 font-mono text-xs text-green-400 whitespace-pre overflow-x-auto">{`import anthropic

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
                "school": {"type": "string", "description": "e.g. MIT, Stanford"},
                "upcoming": {"type": "boolean"},
                "limit": {"type": "integer", "default": 5}
            }
        }
    }],
    messages=[{"role": "user", "content": "Find MIT info sessions"}]
)
# Tool call result automatically fetches from:
# ${SITE_ORIGIN}/api/public/sessions?school=MIT&upcoming=true`}</div>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={`${SITE_ORIGIN}/openapi.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={11} />
                  {lang === "zh" ? "下载 OpenAPI Schema (openapi.json)" : "Download OpenAPI Schema (openapi.json)"}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="border-t border-stone-200 pt-8 flex items-center justify-between">
          <a href="/notion-template" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors">
            {t.integrationLink}
            <ExternalLink size={13} />
          </a>
          <a href="/" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
            {t.backToHome}
          </a>
        </div>
      </div>
    </div>
  );
}
