/**
 * AIChatAssistant
 *
 * A floating chat button + panel that lets users bring their own API key.
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
import { X, Send, Settings, Bot, Trash2, ChevronDown } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const LS_SESSION_ID = "jingshen_chat_session_id";
const LS_MESSAGES = "jingshen_chat_messages";
const LS_API_KEY = "jingshen_chat_api_key";
const LS_BASE_URL = "jingshen_chat_base_url";
const LS_MODEL = "jingshen_chat_model";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `你是景深的 AI 招生顾问助手，专门帮助学生了解美国、英国、香港等地顶尖大学的招生流程、Info Session 活动、申请策略和奖学金信息。

你的特点：
- 直接、准确、不夸大
- 鼓励学生直接从大学官方渠道获取一手信息
- 不替代专业留学顾问，但提供公开可查的客观信息
- 中英文均可回答，根据用户语言自动切换

请用简洁、友好的语气回答问题。`;

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ApiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

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
    baseUrl: localStorage.getItem(LS_BASE_URL) ?? DEFAULT_BASE_URL,
    model: localStorage.getItem(LS_MODEL) ?? DEFAULT_MODEL,
  };
}

function saveApiSettings(s: ApiSettings) {
  localStorage.setItem(LS_API_KEY, s.apiKey);
  localStorage.setItem(LS_BASE_URL, s.baseUrl);
  localStorage.setItem(LS_MODEL, s.model);
}

// ── Component ────────────────────────────────────────────────────────────────

interface AIChatAssistantProps {
  browsingProfile: BrowsingProfile;
  lang?: "zh" | "en" | "hi";
}

export default function AIChatAssistant({ browsingProfile, lang = "zh" }: AIChatAssistantProps) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ApiSettings>(loadApiSettings);
  const [settingsDraft, setSettingsDraft] = useState<ApiSettings>(loadApiSettings);
  const [sessionId] = useState(getOrCreateSessionId);
  const [dbLoaded, setDbLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const zh = lang === "zh";

  // ── Recommended questions ──────────────────────────────────────────────
  const recommended = getRecommendedQuestions(browsingProfile, 4);

  // ── tRPC ──────────────────────────────────────────────────────────────
  const { data: dbMessages } = trpc.chat.getMessages.useQuery(
    { sessionId },
    { enabled: isAuthenticated && open && !dbLoaded }
  );
  const saveMessages = trpc.chat.saveMessages.useMutation();
  const clearMessagesMutation = trpc.chat.clearMessages.useMutation();
  const upsertSession = trpc.chat.upsertSession.useMutation();

  // Load messages: DB for auth users, localStorage for anon
  useEffect(() => {
    if (!open) return;
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
  }, [open, isAuthenticated, dbMessages, dbLoaded]);

  // Sync browsing profile to DB
  useEffect(() => {
    if (!open) return;
    upsertSession.mutate({ sessionId, browsingProfile });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, showSettings]);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      if (!settings.apiKey) {
        setShowSettings(true);
        return;
      }

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
        const assistantContent: string =
          data?.choices?.[0]?.message?.content ?? "(no response)";

        const assistantMsg: Message = { role: "assistant", content: assistantContent };
        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);

        // Persist
        if (isAuthenticated) {
          saveMessages.mutate({
            sessionId,
            messages: [userMsg, assistantMsg],
          });
        } else {
          saveLocalMessages(finalMessages);
        }
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : String(err);
        const errMsg: Message = {
          role: "assistant",
          content: zh
            ? `❌ 请求失败：${errorText}\n\n请检查你的 API Key 和 Base URL 是否正确。`
            : `❌ Request failed: ${errorText}\n\nPlease check your API Key and Base URL.`,
        };
        setMessages([...newMessages, errMsg]);
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
    if (isAuthenticated) {
      clearMessagesMutation.mutate({ sessionId });
    }
  };

  const handleSaveSettings = () => {
    saveApiSettings(settingsDraft);
    setSettings(settingsDraft);
    setShowSettings(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button — left side */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-4 z-40 flex items-center gap-2 bg-stone-900 text-white px-3 py-2.5 shadow-lg hover:bg-stone-700 transition-colors"
        aria-label="AI 招生助手"
      >
        <Bot size={16} />
        <span className="text-xs font-medium hidden sm:inline">
          {zh ? "AI 助手" : "AI Assistant"}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-[340px] sm:w-[380px] max-h-[560px] flex flex-col bg-white border border-stone-200 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-100 bg-stone-50">
            <Bot size={14} className="text-stone-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-stone-800 leading-none">
                {zh ? "AI 招生助手" : "AI Admissions Assistant"}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                {zh ? "使用你自己的 API Key" : "Powered by your own API Key"}
              </div>
            </div>
            <button
              onClick={() => { setShowSettings((v) => !v); setSettingsDraft(settings); }}
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              title={zh ? "设置" : "Settings"}
            >
              <Settings size={13} />
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                title={zh ? "清空记录" : "Clear history"}
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="p-3 border-b border-stone-100 bg-stone-50 space-y-2.5">
              <div className="text-xs font-semibold text-stone-700 mb-1">
                {zh ? "API 设置" : "API Settings"}
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={settingsDraft.apiKey}
                  onChange={(e) => setSettingsDraft((d) => ({ ...d, apiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-1">
                  Base URL <span className="text-stone-400">(OpenAI compatible)</span>
                </label>
                <input
                  type="text"
                  value={settingsDraft.baseUrl}
                  onChange={(e) => setSettingsDraft((d) => ({ ...d, baseUrl: e.target.value }))}
                  placeholder={DEFAULT_BASE_URL}
                  className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
                />
                <div className="text-[9px] text-stone-400 mt-1">
                  {zh
                    ? "DeepSeek: https://api.deepseek.com/v1 · Groq: https://api.groq.com/openai/v1"
                    : "DeepSeek: https://api.deepseek.com/v1 · Groq: https://api.groq.com/openai/v1"}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-1">
                  {zh ? "模型" : "Model"}
                </label>
                <input
                  type="text"
                  value={settingsDraft.model}
                  onChange={(e) => setSettingsDraft((d) => ({ ...d, model: e.target.value }))}
                  placeholder={DEFAULT_MODEL}
                  className="w-full border border-stone-200 px-2 py-1.5 text-xs focus:outline-none focus:border-stone-400"
                />
                <div className="text-[9px] text-stone-400 mt-1">
                  {zh
                    ? "例：gpt-4o-mini · deepseek-chat · llama-3.3-70b-versatile"
                    : "e.g. gpt-4o-mini · deepseek-chat · llama-3.3-70b-versatile"}
                </div>
              </div>
              <div className="text-[9px] text-stone-400 bg-stone-100 px-2 py-1.5">
                {zh
                  ? "🔒 API Key 仅存储在你的浏览器本地，不会上传到服务器。"
                  : "🔒 Your API Key is stored locally in your browser only — never sent to our servers."}
              </div>
              <button
                onClick={handleSaveSettings}
                className="w-full bg-stone-900 text-white text-xs py-1.5 hover:bg-stone-700 transition-colors"
              >
                {zh ? "保存" : "Save"}
              </button>
            </div>
          )}

          {/* Messages area */}
          {!showSettings && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: "320px" }}>
                {messages.length === 0 && (
                  <div className="text-center py-4">
                    <Bot size={24} className="text-stone-300 mx-auto mb-2" />
                    <div className="text-xs text-stone-500 mb-1">
                      {zh ? "你好！我是景深 AI 招生助手。" : "Hi! I'm the Jingshen AI Admissions Assistant."}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {zh
                        ? "根据你的浏览记录，为你推荐了以下问题："
                        : "Based on your browsing, here are some suggested questions:"}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-800"
                      }`}
                    >
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

              {/* Recommended questions */}
              {messages.length === 0 && recommended.length > 0 && (
                <div className="px-3 pb-2 space-y-1.5">
                  {recommended.map((q: ChatQuestion) => (
                    <button
                      key={q.id}
                      onClick={() => sendMessage(lang === 'zh' ? q.text : lang === 'hi' ? q.textHi : q.textEn)}
                      className="w-full text-left text-[10px] text-stone-600 border border-stone-200 px-2.5 py-1.5 hover:border-stone-400 hover:bg-stone-50 transition-colors leading-snug"
                    >
                      {lang === 'zh' ? q.text : lang === 'hi' ? q.textHi : q.textEn}
                    </button>
                  ))}
                  {!settings.apiKey && (
                    <div className="text-[9px] text-amber-600 bg-amber-50 px-2 py-1.5 border border-amber-200">
                      {zh
                        ? "⚠️ 请先在设置中填入你的 API Key 才能开始对话。"
                        : "⚠️ Please add your API Key in Settings to start chatting."}
                    </div>
                  )}
                </div>
              )}

              {/* Show recommended questions button when there are messages */}
              {messages.length > 0 && (
                <div className="px-3 pb-1">
                  <details className="group">
                    <summary className="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer hover:text-stone-600 list-none">
                      <ChevronDown size={10} className="group-open:rotate-180 transition-transform" />
                      {zh ? "推荐问题" : "Suggested questions"}
                    </summary>
                    <div className="mt-1.5 space-y-1">
                      {recommended.map((q: ChatQuestion) => (
                        <button
                          key={q.id}
onClick={() => sendMessage(lang === 'zh' ? q.text : lang === 'hi' ? q.textHi : q.textEn)}
                  className="w-full text-left text-[10px] text-stone-600 border border-stone-200 px-2.5 py-1.5 hover:border-stone-400 hover:bg-stone-50 transition-colors leading-snug"
                >
                  {lang === 'zh' ? q.text : lang === 'hi' ? q.textHi : q.textEn}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Input area */}
              <div className="border-t border-stone-100 p-2 flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={zh ? "输入问题，Enter 发送…" : "Type a question, Enter to send…"}
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
        </div>
      )}
    </>
  );
}
