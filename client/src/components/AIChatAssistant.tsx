/**
 * AIChatAssistant
 *
 * A floating chat button + panel that lets users bring their own API key.
 * - First-time users see a 3-step onboarding wizard (provider → key → chat)
 * - Button label: "接入 AI 助手" before setup, "AI 助手" after
 * - Supports any OpenAI-compatible endpoint (OpenAI, DeepSeek, Groq, etc.)
 * - Browsing-profile-aware recommended questions
 * - Chat history: DB for logged-in users, localStorage for anonymous
 * - Positioned on the LEFT side to avoid clashing with the subscribe button
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BrowsingProfile } from "@/hooks/useBrowsingTracker";
import { getRecommendedQuestions, ChatQuestion } from "@/data/chatQuestions";
import { X, Send, Settings, Bot, Trash2, ChevronDown, CheckCircle, ExternalLink, Loader2, Plug } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const LS_SESSION_ID = "jingshen_chat_session_id";
const LS_MESSAGES = "jingshen_chat_messages";
const LS_API_KEY = "jingshen_chat_api_key";
const LS_BASE_URL = "jingshen_chat_base_url";
const LS_MODEL = "jingshen_chat_model";

const SYSTEM_PROMPT = `你是景深的 AI 招生顾问助手，专门帮助学生了解美国、英国、香港等地顶尖大学的招生流程、Info Session 活动、申请策略和奖学金信息。

你的特点：
- 直接、准确、不夸大
- 鼓励学生直接从大学官方渠道获取一手信息
- 不替代专业留学顾问，但提供公开可查的客观信息
- 中英文均可回答，根据用户语言自动切换

请用简洁、友好的语气回答问题。`;

// ── Provider presets ─────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  nameZh: string;
  nameHi: string;
  baseUrl: string;
  defaultModel: string;
  keyPlaceholder: string;
  keyLink: string;
  keyLinkLabel: string;
  keyLinkLabelZh: string;
  keyLinkLabelHi: string;
  note: string;
  noteZh: string;
  noteHi: string;
  badge?: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    nameZh: "DeepSeek（推荐）",
    nameHi: "DeepSeek (अनुशंसित)",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    keyPlaceholder: "sk-...",
    keyLink: "https://platform.deepseek.com/api_keys",
    keyLinkLabel: "Get DeepSeek API Key →",
    keyLinkLabelZh: "获取 DeepSeek API Key →",
    keyLinkLabelHi: "DeepSeek API Key प्राप्त करें →",
    note: "~¥0.001/msg · Best value",
    noteZh: "约 ¥0.001/条 · 性价比最高",
    noteHi: "~₹0.01/संदेश · सर्वोत्तम मूल्य",
    badge: "推荐",
  },
  {
    id: "openai",
    name: "OpenAI",
    nameZh: "OpenAI",
    nameHi: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyPlaceholder: "sk-...",
    keyLink: "https://platform.openai.com/api-keys",
    keyLinkLabel: "Get OpenAI API Key →",
    keyLinkLabelZh: "获取 OpenAI API Key →",
    keyLinkLabelHi: "OpenAI API Key प्राप्त करें →",
    note: "gpt-4o-mini · Widely supported",
    noteZh: "gpt-4o-mini · 兼容性最广",
    noteHi: "gpt-4o-mini · व्यापक समर्थन",
  },
  {
    id: "groq",
    name: "Groq",
    nameZh: "Groq",
    nameHi: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    keyPlaceholder: "gsk_...",
    keyLink: "https://console.groq.com/keys",
    keyLinkLabel: "Get Groq API Key →",
    keyLinkLabelZh: "获取 Groq API Key →",
    keyLinkLabelHi: "Groq API Key प्राप्त करें →",
    note: "Free tier available · Very fast",
    noteZh: "有免费额度 · 响应极快",
    noteHi: "मुफ्त स्तर उपलब्ध · बहुत तेज़",
  },
  {
    id: "custom",
    name: "Custom",
    nameZh: "自定义",
    nameHi: "कस्टम",
    baseUrl: "",
    defaultModel: "",
    keyPlaceholder: "your-api-key",
    keyLink: "",
    keyLinkLabel: "",
    keyLinkLabelZh: "",
    keyLinkLabelHi: "",
    note: "Any OpenAI-compatible endpoint",
    noteZh: "任意 OpenAI 兼容接口",
    noteHi: "कोई भी OpenAI-संगत endpoint",
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ApiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  providerId: string;
}

type WizardStep = "provider" | "key" | "chat";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(LS_SESSION_ID);
  if (!id) {
    id = generateId();
    localStorage.setItem(LS_SESSION_ID, id);
  }
  return id;
}

function loadLocalMessages(): Message[] {
  try {
    const raw = localStorage.getItem(LS_MESSAGES);
    if (raw) return JSON.parse(raw) as Message[];
  } catch { /* ignore */ }
  return [];
}

function saveLocalMessages(msgs: Message[]) {
  try {
    localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

function loadApiSettings(): ApiSettings {
  return {
    apiKey: localStorage.getItem(LS_API_KEY) ?? "",
    baseUrl: localStorage.getItem(LS_BASE_URL) ?? "",
    model: localStorage.getItem(LS_MODEL) ?? "",
    providerId: localStorage.getItem("jingshen_chat_provider") ?? "",
  };
}

function saveApiSettings(s: ApiSettings) {
  localStorage.setItem(LS_API_KEY, s.apiKey);
  localStorage.setItem(LS_BASE_URL, s.baseUrl);
  localStorage.setItem(LS_MODEL, s.model);
  localStorage.setItem("jingshen_chat_provider", s.providerId);
}

// ── Component ────────────────────────────────────────────────────────────────

interface AIChatAssistantProps {
  browsingProfile: BrowsingProfile;
  lang?: "zh" | "en" | "hi";
}

export default function AIChatAssistant({ browsingProfile, lang = "zh" }: AIChatAssistantProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ApiSettings>(loadApiSettings);
  const [sessionId] = useState(getOrCreateSessionId);
  const [dbLoaded, setDbLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Wizard state
  const isConnected = Boolean(settings.apiKey && settings.baseUrl);
  const [wizardStep, setWizardStep] = useState<WizardStep>(isConnected ? "chat" : "provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    PROVIDERS.find((p) => p.id === settings.providerId) ?? null
  );
  const [keyDraft, setKeyDraft] = useState("");
  const [customBaseUrl, setCustomBaseUrl] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const zh = lang === "zh";
  const hi = lang === "hi";

  const t = {
    connectBtn: zh ? "接入 AI 助手" : hi ? "AI सहायक जोड़ें" : "Connect AI Assistant",
    chatBtn: zh ? "AI 助手" : hi ? "AI सहायक" : "AI Assistant",
    step1Title: zh ? "选择 AI 服务商" : hi ? "AI प्रदाता चुनें" : "Choose AI Provider",
    step1Desc: zh
      ? "选择你已有账号的服务商，或注册一个新账号。你的 API Key 仅存储在浏览器本地。"
      : hi
      ? "वह प्रदाता चुनें जिसका आपके पास खाता है। आपकी API Key केवल आपके ब्राउज़र में संग्रहीत होती है।"
      : "Choose a provider you already have an account with. Your API Key is stored only in your browser.",
    step2Title: zh ? "粘贴你的 API Key" : hi ? "अपनी API Key दर्ज करें" : "Enter Your API Key",
    step2Desc: zh
      ? "API Key 仅保存在你的浏览器中，不会上传到景深服务器。"
      : hi
      ? "API Key केवल आपके ब्राउज़र में सहेजी जाती है, हमारे सर्वर पर नहीं।"
      : "Your API Key is saved only in your browser — never sent to our servers.",
    verify: zh ? "验证并连接" : hi ? "सत्यापित करें और जोड़ें" : "Verify & Connect",
    verifying: zh ? "验证中…" : hi ? "सत्यापित हो रहा है…" : "Verifying…",
    verifyOk: zh ? "连接成功！" : hi ? "सफलतापूर्वक जुड़ा!" : "Connected!",
    back: zh ? "← 返回" : hi ? "← वापस" : "← Back",
    keyLabel: "API Key",
    keyPrivacy: zh
      ? "🔒 Key 仅存储在你的浏览器本地，景深不会收集或上传。"
      : hi
      ? "🔒 Key केवल आपके ब्राउज़र में संग्रहीत है, हम इसे कभी नहीं देखते।"
      : "🔒 Your Key is stored locally in your browser only — we never see it.",
    customBaseUrl: zh ? "Base URL" : "Base URL",
    customModel: zh ? "模型名称" : hi ? "मॉडल नाम" : "Model name",
    settingsTitle: zh ? "修改 API 设置" : hi ? "API सेटिंग बदलें" : "Change API Settings",
    disconnect: zh ? "断开连接" : hi ? "डिस्कनेक्ट करें" : "Disconnect",
    clearHistory: zh ? "清空记录" : hi ? "इतिहास साफ़ करें" : "Clear history",
    emptyHello: zh ? "你好！我是景深 AI 招生助手。" : hi ? "नमस्ते! मैं Jingshen AI Admissions Assistant हूं।" : "Hi! I'm the Jingshen AI Admissions Assistant.",
    emptyHint: zh
      ? "根据你的浏览记录，为你推荐了以下问题："
      : hi
      ? "आपकी ब्राउज़िंग के आधार पर सुझाए गए प्रश्न:"
      : "Based on your browsing, here are some suggested questions:",
    inputPlaceholder: zh ? "输入问题，Enter 发送…" : hi ? "प्रश्न लिखें, Enter दबाएं…" : "Type a question, Enter to send…",
    suggestedQ: zh ? "推荐问题" : hi ? "सुझाए गए प्रश्न" : "Suggested questions",
    noKeyWarning: zh
      ? "⚠️ 请先在设置中填入你的 API Key 才能开始对话。"
      : hi
      ? "⚠️ कृपया पहले Settings में अपनी API Key दर्ज करें।"
      : "⚠️ Please add your API Key in Settings to start chatting.",
    poweredBy: zh ? "使用你自己的 API Key" : hi ? "आपकी अपनी API Key द्वारा संचालित" : "Powered by your own API Key",
  };

  // ── tRPC ──────────────────────────────────────────────────────────────
  const { data: dbMessages } = trpc.chat.getMessages.useQuery(
    { sessionId },
    { enabled: isAuthenticated && open && !dbLoaded && isConnected }
  );
  const saveMessages = trpc.chat.saveMessages.useMutation();
  const clearMessagesMutation = trpc.chat.clearMessages.useMutation();
  const upsertSession = trpc.chat.upsertSession.useMutation();

  // Load messages
  useEffect(() => {
    if (!open || !isConnected) return;
    if (isAuthenticated && dbMessages && !dbLoaded) {
      if (dbMessages.length > 0) {
        setMessages(dbMessages.map((m) => ({ role: m.role, content: m.content })));
      } else {
        setMessages(loadLocalMessages());
      }
      setDbLoaded(true);
    } else if (!isAuthenticated) {
      setMessages(loadLocalMessages());
    }
  }, [open, isAuthenticated, dbMessages, dbLoaded, isConnected]);

  // Sync browsing profile
  useEffect(() => {
    if (!open || !isConnected) return;
    upsertSession.mutate({ sessionId, browsingProfile });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input
  useEffect(() => {
    if (open && wizardStep === "chat" && !showSettingsPanel) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, wizardStep, showSettingsPanel]);

  // ── Wizard actions ─────────────────────────────────────────────────────
  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setKeyDraft("");
    setVerifyError("");
    setCustomBaseUrl(provider.baseUrl);
    setCustomModel(provider.defaultModel);
    setWizardStep("key");
  };

  const handleVerifyAndConnect = async () => {
    if (!selectedProvider) return;
    const baseUrl = selectedProvider.id === "custom" ? customBaseUrl : selectedProvider.baseUrl;
    const model = selectedProvider.id === "custom" ? customModel : selectedProvider.defaultModel;
    if (!keyDraft.trim() || !baseUrl) return;

    setVerifying(true);
    setVerifyError("");

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyDraft.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let msg = `HTTP ${res.status}`;
        try {
          const parsed = JSON.parse(errText);
          msg = parsed?.error?.message ?? msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      // Success — save settings
      const newSettings: ApiSettings = {
        apiKey: keyDraft.trim(),
        baseUrl,
        model,
        providerId: selectedProvider.id,
      };
      saveApiSettings(newSettings);
      setSettings(newSettings);
      setWizardStep("chat");
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : String(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = () => {
    const cleared: ApiSettings = { apiKey: "", baseUrl: "", model: "", providerId: "" };
    saveApiSettings(cleared);
    setSettings(cleared);
    setSelectedProvider(null);
    setKeyDraft("");
    setWizardStep("provider");
    setShowSettingsPanel(false);
    setMessages([]);
    saveLocalMessages([]);
  };

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch(`${settings.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...newMessages.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const assistantContent: string = data?.choices?.[0]?.message?.content ?? "(no response)";
        const assistantMsg: Message = { role: "assistant", content: assistantContent };
        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);

        if (isAuthenticated) {
          saveMessages.mutate({ sessionId, messages: [userMsg, assistantMsg] });
        } else {
          saveLocalMessages(finalMessages);
        }
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : String(err);
        setMessages([...newMessages, {
          role: "assistant",
          content: zh
            ? `❌ 请求失败：${errorText}\n\n请检查 API Key 是否正确，或点击设置重新配置。`
            : `❌ Request failed: ${errorText}\n\nPlease check your API Key or reconfigure in Settings.`,
        }]);
      } finally {
        setLoading(false);
      }
    },
    [loading, settings, messages, isAuthenticated, sessionId, saveMessages, zh]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    setMessages([]);
    saveLocalMessages([]);
    if (isAuthenticated) clearMessagesMutation.mutate({ sessionId });
  };

  const handleOpenPanel = () => {
    if (!isConnected) {
      setWizardStep("provider");
    } else {
      setWizardStep("chat");
    }
    setOpen(true);
  };

  // ── Recommended questions ──────────────────────────────────────────────
  const recommended = getRecommendedQuestions(browsingProfile, 4);
  const qText = (q: ChatQuestion) =>
    lang === "zh" ? q.text : lang === "hi" ? q.textHi : q.textEn;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpenPanel}
        className={`fixed bottom-6 left-4 z-40 flex items-center gap-2 px-3 py-2.5 shadow-lg transition-colors ${
          isConnected
            ? "bg-stone-900 text-white hover:bg-stone-700"
            : "bg-white text-stone-800 border border-stone-300 hover:border-stone-500 hover:bg-stone-50"
        }`}
        aria-label={isConnected ? t.chatBtn : t.connectBtn}
      >
        {isConnected ? <Bot size={16} /> : <Plug size={16} />}
        <span className="text-xs font-medium hidden sm:inline">
          {isConnected ? t.chatBtn : t.connectBtn}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-[340px] sm:w-[380px] max-h-[580px] flex flex-col bg-white border border-stone-200 shadow-xl">

          {/* ── Wizard: Step 1 — Choose provider ── */}
          {wizardStep === "provider" && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div>
                  <div className="text-sm font-semibold text-stone-800">{t.step1Title}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5 leading-snug max-w-[260px]">{t.step1Desc}</div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProvider(p)}
                    className="w-full text-left border border-stone-200 px-3 py-2.5 hover:border-stone-400 hover:bg-stone-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-800">
                        {zh ? p.nameZh : hi ? p.nameHi : p.name}
                      </span>
                      {p.badge && (
                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 font-medium">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {zh ? p.noteZh : hi ? p.noteHi : p.note}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Wizard: Step 2 — Enter API Key ── */}
          {wizardStep === "key" && selectedProvider && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <div>
                  <div className="text-sm font-semibold text-stone-800">{t.step2Title}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {zh ? selectedProvider.nameZh : hi ? selectedProvider.nameHi : selectedProvider.name}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Key link */}
                {selectedProvider.keyLink && (
                  <a
                    href={selectedProvider.keyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink size={11} />
                    {zh ? selectedProvider.keyLinkLabelZh : hi ? selectedProvider.keyLinkLabelHi : selectedProvider.keyLinkLabel}
                  </a>
                )}

                {/* API Key input */}
                <div>
                  <label className="text-[10px] text-stone-500 block mb-1">{t.keyLabel}</label>
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => { setKeyDraft(e.target.value); setVerifyError(""); }}
                    placeholder={selectedProvider.keyPlaceholder}
                    className="w-full border border-stone-200 px-2.5 py-2 text-xs focus:outline-none focus:border-stone-500"
                    autoFocus
                  />
                </div>

                {/* Custom provider fields */}
                {selectedProvider.id === "custom" && (
                  <>
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">{t.customBaseUrl}</label>
                      <input
                        type="text"
                        value={customBaseUrl}
                        onChange={(e) => setCustomBaseUrl(e.target.value)}
                        placeholder="https://api.example.com/v1"
                        className="w-full border border-stone-200 px-2.5 py-2 text-xs focus:outline-none focus:border-stone-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">{t.customModel}</label>
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="gpt-4o-mini"
                        className="w-full border border-stone-200 px-2.5 py-2 text-xs focus:outline-none focus:border-stone-500"
                      />
                    </div>
                  </>
                )}

                {/* Privacy note */}
                <div className="text-[9px] text-stone-400 bg-stone-50 px-2.5 py-2 border border-stone-100">
                  {t.keyPrivacy}
                </div>

                {/* Error */}
                {verifyError && (
                  <div className="text-[10px] text-red-600 bg-red-50 px-2.5 py-2 border border-red-200">
                    ❌ {verifyError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setWizardStep("provider")}
                    className="flex-none text-[11px] text-stone-500 hover:text-stone-700 px-2 py-2"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleVerifyAndConnect}
                    disabled={verifying || !keyDraft.trim() || (selectedProvider.id === "custom" && !customBaseUrl)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 text-white text-xs py-2 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {verifying ? (
                      <><Loader2 size={12} className="animate-spin" />{t.verifying}</>
                    ) : (
                      <><CheckCircle size={12} />{t.verify}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Chat interface ── */}
          {wizardStep === "chat" && (
            <>
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-100 bg-stone-50 shrink-0">
                <Bot size={14} className="text-stone-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-stone-800 leading-none">
                    {zh ? "AI 招生助手" : hi ? "AI Admissions Assistant" : "AI Admissions Assistant"}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{t.poweredBy}</div>
                </div>
                <button
                  onClick={() => setShowSettingsPanel((v) => !v)}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title={zh ? "设置" : "Settings"}
                >
                  <Settings size={13} />
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                    title={t.clearHistory}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X size={13} />
                </button>
              </div>

              {/* Settings panel (inline) */}
              {showSettingsPanel && (
                <div className="p-3 border-b border-stone-100 bg-stone-50 space-y-2 shrink-0">
                  <div className="text-xs font-semibold text-stone-700">{t.settingsTitle}</div>
                  <div className="text-[10px] text-stone-500">
                    {zh ? "当前服务商：" : "Current provider: "}
                    <span className="font-medium text-stone-700">
                      {PROVIDERS.find((p) => p.id === settings.providerId)?.name ?? settings.baseUrl}
                    </span>
                  </div>
                  <button
                    onClick={() => { setWizardStep("provider"); setShowSettingsPanel(false); }}
                    className="w-full text-xs border border-stone-300 py-1.5 hover:bg-stone-100 transition-colors text-stone-700"
                  >
                    {zh ? "切换服务商" : hi ? "प्रदाता बदलें" : "Switch Provider"}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full text-xs border border-red-200 py-1.5 hover:bg-red-50 transition-colors text-red-600"
                  >
                    {t.disconnect}
                  </button>
                </div>
              )}

              {/* Messages */}
              {!showSettingsPanel && (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: "300px" }}>
                    {messages.length === 0 && (
                      <div className="text-center py-4">
                        <Bot size={24} className="text-stone-300 mx-auto mb-2" />
                        <div className="text-xs text-stone-500 mb-1">{t.emptyHello}</div>
                        <div className="text-[10px] text-stone-400">{t.emptyHint}</div>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          m.role === "user" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-800"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-stone-100 px-3 py-2 text-xs text-stone-500">
                          <span className="animate-pulse">●●●</span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Recommended questions — empty state */}
                  {messages.length === 0 && recommended.length > 0 && (
                    <div className="px-3 pb-2 space-y-1.5 shrink-0">
                      {recommended.map((q: ChatQuestion) => (
                        <button
                          key={q.id}
                          onClick={() => sendMessage(qText(q))}
                          className="w-full text-left text-[10px] text-stone-600 border border-stone-200 px-2.5 py-1.5 hover:border-stone-400 hover:bg-stone-50 transition-colors leading-snug"
                        >
                          {qText(q)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recommended questions — collapsible when chatting */}
                  {messages.length > 0 && (
                    <div className="px-3 pb-1 shrink-0">
                      <details className="group">
                        <summary className="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer hover:text-stone-600 list-none">
                          <ChevronDown size={10} className="group-open:rotate-180 transition-transform" />
                          {t.suggestedQ}
                        </summary>
                        <div className="mt-1.5 space-y-1">
                          {recommended.map((q: ChatQuestion) => (
                            <button
                              key={q.id}
                              onClick={() => sendMessage(qText(q))}
                              className="w-full text-left text-[10px] text-stone-600 border border-stone-200 px-2.5 py-1.5 hover:border-stone-400 hover:bg-stone-50 transition-colors leading-snug"
                            >
                              {qText(q)}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Input */}
                  <div className="border-t border-stone-100 p-2 flex gap-2 items-end shrink-0">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.inputPlaceholder}
                      rows={1}
                      className="flex-1 resize-none border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400 leading-relaxed"
                      style={{ maxHeight: "80px", overflowY: "auto" }}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                      className="shrink-0 bg-stone-900 text-white p-2 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
