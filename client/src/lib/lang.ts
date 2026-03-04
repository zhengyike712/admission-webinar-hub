/**
 * Language detection utility
 *
 * Priority:
 *  1. User's explicit choice saved in localStorage
 *  2. Browser / OS language (navigator.language)
 *  3. Fallback: "en"
 *
 * Logic:
 *  - Chinese variants (zh-CN, zh-TW, zh-HK, zh …) → "zh"
 *  - Hindi (hi …) → "hi"
 *  - Everything else → "en"
 */

export type Lang = "zh" | "en" | "hi";

const STORAGE_KEY = "jingshen_lang";

/** Detect preferred language from browser/OS without reading localStorage */
export function detectBrowserLang(): Lang {
  const nav =
    (typeof navigator !== "undefined" && navigator.language) || "";
  const langs =
    typeof navigator !== "undefined" && navigator.languages?.length
      ? navigator.languages
      : [nav];

  for (const l of langs) {
    const lower = l.toLowerCase();
    if (lower.startsWith("zh")) return "zh";
    if (lower.startsWith("hi")) return "hi";
  }
  return "en";
}

/**
 * Get the initial language:
 *  1. Saved preference in localStorage
 *  2. Browser language detection
 */
export function getInitialLang(): Lang {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en" || saved === "hi") return saved;
  }
  return detectBrowserLang();
}

/** Persist user's explicit language choice */
export function saveLang(lang: Lang): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
