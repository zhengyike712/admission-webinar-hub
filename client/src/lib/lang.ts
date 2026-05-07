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
  }
  return "en";
}

/**
 * Get the initial language:
 *  1. Saved preference in localStorage (hi treated as en — Hindi is muted)
 *  2. Browser language detection
 *  3. Fallback: "en"
 */
export function getInitialLang(): Lang {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh") return "zh";
    if (saved === "en") return "en";
    // "hi" was previously saveable — treat as en
  }
  return detectBrowserLang();
}

/** Persist user's explicit language choice */
export function saveLang(lang: Lang): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
