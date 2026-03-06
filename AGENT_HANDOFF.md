# Kollegers — Agent Handoff & Maintenance Guide

> **For:** MaxClaw or any AI agent taking over maintenance and development  
> **Last updated:** 2026-03-06  
> **GitHub:** https://github.com/zhengyike712/kollegers  
> **Live site:** https://kollegers.manus.space

---

## 1. What Is This Project

Kollegers is a multilingual university admissions virtual info session hub. It aggregates official virtual open days, info sessions, and interview events from 65+ universities across the US, UK, HK, and AU, and presents them in a searchable, filterable interface. The core value proposition is **information equity** — every student, regardless of location, should be able to find and register for official admissions events directly.

**Target users:** High school students applying to top universities globally, primarily Chinese-speaking users (zh) and English-speaking users (en), with Hindi (hi) as a secondary language.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Express 4 + tRPC 11 |
| Database | MySQL (TiDB) via Drizzle ORM |
| Language | TypeScript (strict) |
| Build | Vite (frontend) + esbuild (server) |
| Testing | Vitest |
| Package manager | pnpm |

**Key commands:**
```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Build for production
pnpm test         # Run Vitest tests
pnpm db:push      # Push schema changes (drizzle-kit generate + migrate)
```

---

## 3. File Structure (Key Files Only)

```
client/src/
  data/
    schools.ts          ← PRIMARY DATA FILE: schools + sessions (manually maintained)
    interviews.ts       ← Interview deadlines per school (manually maintained)
    portals.ts          ← Applicant portal links + decision dates (manually maintained)
    chatQuestions.ts    ← AI chat suggested questions
  pages/
    Home.tsx            ← Main page (4 tabs: Sessions / Interviews / Schools / Portals)
    Admin.tsx           ← Admin panel (crawl logs, subscriber management)
    NotionEmbed.tsx     ← Embeddable iframe version for Notion
    NotionTemplate.tsx  ← Notion template page
    ApiDocs.tsx         ← Public API documentation
    Portals.tsx         ← Portal subscriptions page (currently disabled in routing)
  lib/
    lang.ts             ← Language detection utility (zh/en/hi)
  App.tsx               ← Routes

server/
  routers/              ← tRPC routers split by feature
  crawler.ts            ← AI-powered session data crawler (LLM-based extraction)
  interviewCrawler.ts   ← Interview deadline verification crawler
  scheduler.ts          ← Cron-style scheduler (daily crawl + weekly verification)
  db.ts                 ← Database query helpers
  routers.ts            ← Root router (assembles all sub-routers)

drizzle/
  schema.ts             ← Database table definitions
```

---

## 4. Data Architecture

### 4.1 Static Data (Source of Truth for UI)

The frontend reads from three static TypeScript files. These are the **primary source of truth** for what users see:

**`client/src/data/schools.ts`** — Schools and their sessions

```typescript
interface School {
  id: number;           // Unique, never reuse
  name: string;         // Full official name
  shortName?: string;   // Abbreviation (e.g. "MIT")
  type: SchoolType;     // "National University" | "Liberal Arts College" | "Research University" | "Comprehensive University"
  region: Region;       // "US" | "UK" | "HK" | "AU"
  rank: number;         // USNews rank (primary sort key)
  qsRank?: number;      // QS World University Rankings 2026
  location: string;     // City, State/Country
  state: string;        // State/Country code (e.g. "NJ", "UK", "HK")
  color: string;        // Brand hex color for UI accent
  registrationPage: string;  // Main virtual events page URL
  admissionPage: string;     // Main admissions homepage URL
  tags: string[];       // e.g. ["Ivy League", "No Loan Policy"]
}

interface Session {
  id: string;           // Format: "{schoolShortName}-{type}-{number}" e.g. "mit-general-1"
  schoolId: number;     // Must match a School.id
  title: string;        // Event title (bilingual OK)
  type: SessionType;    // See valid values below
  description: string;  // 1-2 sentence description
  dates: string[] | null;  // YYYY-MM-DD format, null = see registration page
  time?: string;        // e.g. "7:00 PM ET"
  duration?: string;    // e.g. "60 min"
  registrationUrl: string;  // Direct registration link
  isRolling?: boolean;  // true = pick-your-own-date calendar
  partnerSchools?: string[];  // For multi-college sessions
}
```

**Valid `SessionType` values:**
- `"General Info Session"` — Standard info session
- `"Up Close / Specialty"` — Deep-dive on specific topic/department
- `"Multi-College Session"` — Joint session with multiple schools
- `"Regional Session"` — Targeted at specific geographic region
- `"Student Forum"` — Student-led Q&A
- `"Financial Aid Session"` — Financial aid / scholarship focus
- `"International Student Session"` — Specifically for international applicants

**`client/src/data/interviews.ts`** — Interview deadlines

```typescript
interface SchoolInterview {
  id: string;           // Format: "{schoolShortName}-interview"
  schoolId: number;     // Must match a School.id
  schoolName: string;
  type: "Alumni" | "Staff" | "Optional" | "Required" | "None";
  deadline?: string;    // YYYY-MM-DD
  deadlineNote?: string;
  portalUrl: string;    // URL where deadline info was verified
  notes?: string;
}
```

**`client/src/data/portals.ts`** — Applicant portals and decision dates

```typescript
interface PortalEntry {
  schoolId: number;
  schoolName: string;
  portalUrl: string;
  rounds: Array<{
    round: string;      // e.g. "REA", "ED", "RD"
    releaseDate: string; // YYYY-MM-DD (estimated)
    releaseDateNote?: string;
  }>;
}
```

### 4.2 Dynamic Data (Database)

The database stores **live-crawled session data** that supplements the static files. The crawler runs daily and updates the `sessions` table. The frontend fetches from the DB via tRPC when available, falling back to static data.

**Database tables:**
| Table | Purpose |
|-------|---------|
| `sessions` | Live-crawled session data from school websites |
| `crawl_logs` | Crawl history and status per school |
| `subscribers` | Email subscribers for activity notifications |
| `interview_verifications` | Weekly-verified interview deadline status |
| `chat_sessions` | Anonymous chat session tracking |
| `chat_messages` | AI chat message history |
| `portal_subscriptions` | Email subscriptions for decision release alerts |
| `users` | Authenticated user accounts (Manus OAuth) |

---

## 5. Automated Systems

### 5.1 Daily Crawler (UTC 02:00)

`server/crawler.ts` + `server/scheduler.ts`

**Flow:**
1. For each school in `allSchools`, fetch HTML from `registrationPage`
2. Strip HTML → plain text
3. Call LLM (via `invokeLLM`) to extract structured session data
4. Upsert into `sessions` table
5. Log result to `crawl_logs`
6. Notify owner via `notifyOwner()` with summary

**Failure handling:** After 3 consecutive failures for a school, owner receives an alert notification.

### 5.2 Weekly Deadline Verification (Monday UTC 03:00)

`server/interviewCrawler.ts` + `server/scheduler.ts`

Crawls each school's interview portal page, extracts deadline text via LLM, compares to static data in `interviews.ts`, and notifies owner of any changes.

### 5.3 Email Notifications

`server/routers/subscribers.ts` — Manages subscriber list  
`server/routers/portalSubs.ts` — Portal decision date subscriptions

Emails are sent via the Manus built-in notification API (`notifyOwner`). Currently only owner notifications are implemented; subscriber broadcast emails are scaffolded but not fully wired.

---

## 6. Language System

**File:** `client/src/lib/lang.ts`

Detection priority:
1. `localStorage.getItem("jingshen_lang")` — user's saved preference
2. `navigator.languages` — browser/OS language detection
   - Chinese (zh-CN, zh-TW, etc.) → `"zh"`
   - Hindi (hi) → `"hi"`
   - Everything else → `"en"` (default)
3. Fallback: `"en"`

**Supported languages:** `"zh"` | `"en"` | `"hi"`

All i18n strings are defined inline in each page component as a `T` object with `zh`, `en`, `hi` keys. There is no external i18n library.

---

## 7. Known Issues & Technical Debt

### 7.1 Broken Links (High Priority — 78 × 404)

A link audit on 2026-03-06 found **78 URLs returning 404**. The majority are `/visit/virtual` paths that universities have removed or restructured. These are primarily in `registrationUrl` fields of `Session` objects.

**Pattern:** Most broken URLs follow the pattern `admissions.xxx.edu/visit/virtual` — these pages were removed when schools stopped offering virtual tours as a separate section. The fix is to update them to the current virtual events page or fall back to `admissionPage`.

**Affected schools include:** Vanderbilt, WashU, UNC, UT Austin, Pomona, Smith, Wellesley, Oberlin, Colgate, BC, Bowdoin, Bryn Mawr, CMC, Colorado, Davidson, Kenyon, Mt Holyoke, Oxy, Stony Brook, Trinity, UMass, Union, W&L, Villanova, and ~40 more.

**Fix approach:** For each broken URL, either find the new virtual events page URL or replace with `admissionPage` as fallback.

### 7.2 Applicant Portal Links (7 × 404)

The following schools' applicant portal links are broken:
- Berkeley: `admissions.berkeley.edu/applicant-portal/`
- Dartmouth: `admissions.dartmouth.edu/applicant-portal`
- Duke: `admissions.duke.edu/applicant-portal/`
- Northwestern: `admissions.northwestern.edu/applicant-portal/`
- UPenn: `admissions.upenn.edu/applicant-portal`
- UT Austin: `admissions.utexas.edu/applicant-portal`
- Vanderbilt: `admissions.vanderbilt.edu/applicant-portal/`

### 7.3 Portals Tab Disabled

`/portals` route is commented out in `App.tsx`. The `Portals.tsx` page exists but is not linked from the main navigation. Re-enable when ready.

### 7.4 Scheduler Brand Name

`server/scheduler.ts` still uses `"AdmitLens"` in owner notification messages (lines with `notifyOwner` calls). Should be updated to `"Kollegers"`.

### 7.5 DNS-Unreachable apply.xxx.edu Links (20 URLs)

These are application portal login pages (e.g., `apply.cornell.edu`, `apply.brown.edu`). They require browser cookies/sessions and are unreachable by curl/server-side fetch. **This is expected behavior — do not remove these links.**

---

## 8. How to Add a New School

1. **Add to `client/src/data/schools.ts`:**
   - Assign a new unique `id` (increment from the last one)
   - Fill all required fields
   - Add at least one `Session` entry in `allSessions`

2. **Add interview data to `client/src/data/interviews.ts`:**
   - Required fields: `id`, `schoolId`, `schoolName`, `type`, `portalUrl`
   - `deadline` is optional but highly valuable

3. **Add portal data to `client/src/data/portals.ts`:**
   - Add `portalUrl` and at least one `round` entry

4. **Verify links** before committing — run a quick `curl -I <url>` check on all new URLs.

5. **Commit and push** to GitHub, then the Manus platform will auto-deploy.

---

## 9. How to Update Existing Session Data

**For date updates** (most common maintenance task):
- Find the session in `allSessions` array in `schools.ts` by `id`
- Update `dates: ["YYYY-MM-DD", ...]` array
- If the event is now rolling (pick-your-own-date), set `isRolling: true` and `dates: null`

**For URL updates:**
- Verify the new URL returns 200 before updating
- Update both `registrationUrl` in the session AND `registrationPage` in the school if the main page changed

**For expired sessions:**
- Remove the session from `allSessions` (or set `dates` to past dates — the UI filters these out automatically)

---

## 10. Deployment

The project is hosted on the **Manus platform** at `kollegers.manus.space`. Deployment is managed through the Manus UI:

1. Make changes and commit to GitHub
2. In Manus Management UI: create a checkpoint, then click **Publish**

**Do not attempt to deploy via CLI or external hosting** — the project uses Manus-injected environment variables (database, OAuth, storage) that are only available in the Manus runtime.

**Environment variables** (auto-injected by Manus, do not hardcode):
- `DATABASE_URL` — MySQL/TiDB connection
- `JWT_SECRET` — Session signing
- `VITE_APP_ID` — OAuth app ID
- `OAUTH_SERVER_URL` — OAuth backend
- `BUILT_IN_FORGE_API_KEY` — Server-side API key (LLM, storage, notifications)
- `VITE_FRONTEND_FORGE_API_KEY` — Frontend API key

---

## 11. Testing

```bash
pnpm test
```

Test files are in `server/*.test.ts`. Key test files:
- `server/auth.logout.test.ts` — Auth flow
- `server/chat.test.ts` — AI chat
- `server/sendLink.test.ts` — Email link sending

When adding new server procedures, add corresponding tests in `server/routers/<feature>.test.ts`.

---

## 12. Admin Panel

Available at `/admin` (requires login). Provides:
- Crawl log viewer (per-school crawl history and status)
- Manual crawl trigger
- Subscriber management
- Interview verification status

---

## 13. Quick Reference: Common Tasks

| Task | File to Edit | Notes |
|------|-------------|-------|
| Add new session dates | `client/src/data/schools.ts` | Update `dates` array in matching session |
| Fix broken link | `client/src/data/schools.ts` | Update `registrationUrl` or `registrationPage` |
| Add new school | `schools.ts` + `interviews.ts` + `portals.ts` | All three files needed for full coverage |
| Add i18n string | Inline `T` object in each page | Must add to zh, en, AND hi |
| Change UI text | Find in `Home.tsx` T object | Trilingual, check all three keys |
| Add new DB table | `drizzle/schema.ts` → `pnpm db:push` | Follow existing table patterns |
| Add new API endpoint | `server/routers/<feature>.ts` | Then register in `server/routers.ts` |
| Fix scheduler brand name | `server/scheduler.ts` | Replace "AdmitLens" with "Kollegers" |

---

*This document was generated for agent handoff purposes. For questions about the project vision or business decisions, contact the project owner via the Manus platform.*
