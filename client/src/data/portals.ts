/**
 * portals.ts
 *
 * Applicant portal URLs and decision release dates for each school.
 * Data is manually curated from official university websites.
 *
 * decisionDates: key = round (ED/EA/SCEA/RD/REA/QuestBridge), value = expected release date
 * portalUrl: direct link to the applicant status portal
 * portalName: official name of the portal
 *
 * releaseDate: ISO date string (YYYY-MM-DD) for exact dates, or approximate string for fuzzy dates.
 * isReleased() helper computes status automatically from current date.
 */

export type DecisionRound =
  | "ED"
  | "ED2"
  | "EA"
  | "SCEA"
  | "REA"
  | "QuestBridge"
  | "RD"
  | "Rolling";

export interface DecisionDate {
  round: DecisionRound;
  label: string; // human-readable label
  labelZh: string;
  date: string; // display string e.g. "Mid-December 2025"
  dateZh: string;
  releaseDate: string; // ISO date YYYY-MM-DD for exact, or "approx:YYYY-MM-DD" for fuzzy
}

export interface SchoolPortal {
  schoolId: number;
  name: string;
  shortName?: string;
  portalUrl: string;
  portalName: string;
  portalNameZh: string;
  decisionDates: DecisionDate[];
  notes?: string;
  notesZh?: string;
}

/**
 * Determine if a decision date has been released based on current date.
 * Supports exact ISO dates and "approx:YYYY-MM-DD" format.
 */
export function isReleased(releaseDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = releaseDate.startsWith("approx:") ? releaseDate.slice(7) : releaseDate;
  const release = new Date(dateStr);
  return today >= release;
}

/**
 * Get days until release (negative = already released)
 */
export function daysUntilRelease(releaseDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = releaseDate.startsWith("approx:") ? releaseDate.slice(7) : releaseDate;
  const release = new Date(dateStr);
  return Math.ceil((release.getTime() - today.getTime()) / 86400000);
}

export const schoolPortals: SchoolPortal[] = [
  // ── Ivy League + Peers ──────────────────────────────────────────────────
  {
    schoolId: 1,
    name: "Princeton University",
    portalUrl: "https://applicant.princeton.edu/",
    portalName: "Princeton Applicant Portal",
    portalNameZh: "普林斯顿申请者门户",
    decisionDates: [
      { round: "SCEA", label: "SCEA", labelZh: "限制性早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 2,
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    portalUrl: "https://apply.mit.edu/",
    portalName: "MIT Applicant Portal",
    portalNameZh: "MIT 申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-14" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "March 14, 2026", dateZh: "2026年3月14日", releaseDate: "2026-03-14" },
    ],
  },
  {
    schoolId: 3,
    name: "Harvard University",
    portalUrl: "https://my.harvard.edu/",
    portalName: "my.harvard",
    portalNameZh: "哈佛申请者门户",
    decisionDates: [
      { round: "SCEA", label: "Restrictive Early Action", labelZh: "限制性早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-12" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 4,
    name: "Stanford University",
    portalUrl: "https://apply.stanford.edu/",
    portalName: "Stanford Applicant Portal",
    portalNameZh: "斯坦福申请者门户",
    decisionDates: [
      { round: "REA", label: "Restrictive Early Action", labelZh: "限制性早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-12" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 5,
    name: "Yale University",
    portalUrl: "https://apply.yale.edu/",
    portalName: "Yale Applicant Status Portal",
    portalNameZh: "耶鲁申请者门户",
    decisionDates: [
      { round: "SCEA", label: "Single-Choice Early Action", labelZh: "单选早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-17" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 6,
    name: "University of Pennsylvania",
    shortName: "UPenn",
    portalUrl: "https://admissions.upenn.edu/applicant-portal",
    portalName: "Penn Applicant Portal",
    portalNameZh: "宾大申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 7,
    name: "California Institute of Technology",
    shortName: "Caltech",
    portalUrl: "https://apply.caltech.edu/",
    portalName: "Caltech Applicant Portal",
    portalNameZh: "加州理工申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Mid-March 2026", dateZh: "2026年3月中旬", releaseDate: "approx:2026-03-15" },
    ],
  },
  {
    schoolId: 8,
    name: "Duke University",
    portalUrl: "https://admissions.duke.edu/applicant-portal/",
    portalName: "Duke Applicant Portal",
    portalNameZh: "杜克申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 9,
    name: "Brown University",
    portalUrl: "https://apply.brown.edu/",
    portalName: "Brown Applicant Portal",
    portalNameZh: "布朗申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 10,
    name: "Johns Hopkins University",
    shortName: "JHU",
    portalUrl: "https://apply.jhu.edu/",
    portalName: "JHU Applicant Portal",
    portalNameZh: "约翰霍普金斯申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 11,
    name: "Northwestern University",
    portalUrl: "https://admissions.northwestern.edu/applicant-portal/",
    portalName: "Northwestern Applicant Portal",
    portalNameZh: "西北大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 12,
    name: "Dartmouth College",
    portalUrl: "https://admissions.dartmouth.edu/applicant-portal",
    portalName: "Dartmouth Applicant Portal",
    portalNameZh: "达特茅斯申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 13,
    name: "Vanderbilt University",
    portalUrl: "https://admissions.vanderbilt.edu/applicant-portal/",
    portalName: "Vanderbilt Applicant Portal",
    portalNameZh: "范德堡申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 14,
    name: "Rice University",
    portalUrl: "https://apply.rice.edu/",
    portalName: "Rice Applicant Portal",
    portalNameZh: "莱斯大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 15,
    name: "Washington University in St. Louis",
    shortName: "WashU",
    portalUrl: "https://apply.wustl.edu/",
    portalName: "WashU Applicant Portal",
    portalNameZh: "圣路易斯华盛顿大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 16,
    name: "Cornell University",
    portalUrl: "https://apply.cornell.edu/",
    portalName: "Cornell Applicant Portal",
    portalNameZh: "康奈尔申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 17,
    name: "University of Notre Dame",
    portalUrl: "https://apply.nd.edu/",
    portalName: "Notre Dame Applicant Portal",
    portalNameZh: "圣母大学申请者门户",
    decisionDates: [
      { round: "REA", label: "Restrictive Early Action", labelZh: "限制性早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-20" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 18,
    name: "UCLA",
    portalUrl: "https://my.ucla.edu/",
    portalName: "UCLA Applicant Portal",
    portalNameZh: "UCLA 申请者门户",
    decisionDates: [
      { round: "RD", label: "Freshman Decision", labelZh: "本科申请结果", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
    notesZh: "UC 系统不提供 EA/ED，统一 11月30日截止，3月下旬出结果",
  },
  {
    schoolId: 19,
    name: "Emory University",
    portalUrl: "https://apply.emory.edu/",
    portalName: "Emory Applicant Portal",
    portalNameZh: "埃默里申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 20,
    name: "Georgetown University",
    portalUrl: "https://apply.georgetown.edu/",
    portalName: "Georgetown Applicant Portal",
    portalNameZh: "乔治城申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 21,
    name: "UC Berkeley",
    portalUrl: "https://admissions.berkeley.edu/applicant-portal/",
    portalName: "UC Berkeley Applicant Portal",
    portalNameZh: "伯克利申请者门户",
    decisionDates: [
      { round: "RD", label: "Freshman Decision", labelZh: "本科申请结果", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
    notesZh: "UC 系统不提供 EA/ED，统一 11月30日截止，3月下旬出结果",
  },
  {
    schoolId: 22,
    name: "University of Michigan",
    shortName: "UMich",
    portalUrl: "https://apply.umich.edu/",
    portalName: "UMich Applicant Portal",
    portalNameZh: "密歇根大学申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Late January 2026", dateZh: "2026年1月下旬", releaseDate: "2026-01-28" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 23,
    name: "Carnegie Mellon University",
    shortName: "CMU",
    portalUrl: "https://apply.cmu.edu/",
    portalName: "CMU Applicant Portal",
    portalNameZh: "卡内基梅隆申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 24,
    name: "University of Virginia",
    shortName: "UVA",
    portalUrl: "https://apply.virginia.edu/",
    portalName: "UVA Applicant Portal",
    portalNameZh: "弗吉尼亚大学申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Late January 2026", dateZh: "2026年1月下旬", releaseDate: "2026-01-28" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 25,
    name: "University of North Carolina",
    shortName: "UNC",
    portalUrl: "https://apply.unc.edu/",
    portalName: "UNC Applicant Portal",
    portalNameZh: "北卡罗来纳大学申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Late January 2026", dateZh: "2026年1月下旬", releaseDate: "2026-01-28" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 26,
    name: "Wake Forest University",
    portalUrl: "https://apply.wfu.edu/",
    portalName: "Wake Forest Applicant Portal",
    portalNameZh: "维克森林申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 27,
    name: "Tufts University",
    portalUrl: "https://apply.tufts.edu/",
    portalName: "Tufts Applicant Portal",
    portalNameZh: "塔夫茨申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 29,
    name: "University of Southern California",
    shortName: "USC",
    portalUrl: "https://apply.usc.edu/",
    portalName: "USC Applicant Portal",
    portalNameZh: "南加大申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Late January 2026", dateZh: "2026年1月下旬", releaseDate: "2026-01-28" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 30,
    name: "New York University",
    shortName: "NYU",
    portalUrl: "https://apply.nyu.edu/",
    portalName: "NYU Applicant Portal",
    portalNameZh: "纽约大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 31,
    name: "Boston College",
    shortName: "BC",
    portalUrl: "https://apply.bc.edu/",
    portalName: "BC Applicant Portal",
    portalNameZh: "波士顿学院申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 32,
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    portalUrl: "https://admission.gatech.edu/applicant-portal",
    portalName: "Georgia Tech Applicant Portal",
    portalNameZh: "佐治亚理工申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "Mid-January 2026", dateZh: "2026年1月中旬", releaseDate: "2026-01-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 33,
    name: "University of Texas at Austin",
    shortName: "UT Austin",
    portalUrl: "https://admissions.utexas.edu/applicant-portal",
    portalName: "UT Austin Applicant Portal",
    portalNameZh: "德克萨斯大学奥斯汀分校申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "February 2026", dateZh: "2026年2月", releaseDate: "approx:2026-02-01" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 35,
    name: "Tulane University",
    portalUrl: "https://apply.tulane.edu/",
    portalName: "Tulane Applicant Portal",
    portalNameZh: "杜兰大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 36,
    name: "Boston University",
    shortName: "BU",
    portalUrl: "https://apply.bu.edu/",
    portalName: "BU Applicant Portal",
    portalNameZh: "波士顿大学申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Decision / Early Action", labelZh: "早申", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 40,
    name: "University of Illinois Urbana-Champaign",
    shortName: "UIUC",
    portalUrl: "https://apply.illinois.edu/",
    portalName: "UIUC Applicant Portal",
    portalNameZh: "伊利诺伊大学香槟分校申请者门户",
    decisionDates: [
      { round: "EA", label: "Early Action", labelZh: "早申", date: "January 2026", dateZh: "2026年1月", releaseDate: "approx:2026-01-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "February–March 2026", dateZh: "2026年2月至3月", releaseDate: "approx:2026-02-15" },
    ],
  },
  {
    schoolId: 44,
    name: "Northeastern University",
    portalUrl: "https://apply.northeastern.edu/",
    portalName: "Northeastern Applicant Portal",
    portalNameZh: "东北大学申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 45,
    name: "UC San Diego",
    shortName: "UCSD",
    portalUrl: "https://apply.ucsd.edu/",
    portalName: "UCSD Applicant Portal",
    portalNameZh: "加州大学圣地亚哥分校申请者门户",
    decisionDates: [
      { round: "RD", label: "Freshman Decision", labelZh: "本科申请结果", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  // ── Liberal Arts Colleges ─────────────────────────────────────────────
  {
    schoolId: 51,
    name: "Williams College",
    portalUrl: "https://apply.williams.edu/",
    portalName: "Williams Applicant Portal",
    portalNameZh: "威廉姆斯学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 52,
    name: "Amherst College",
    portalUrl: "https://apply.amherst.edu/",
    portalName: "Amherst Applicant Portal",
    portalNameZh: "阿默斯特学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 53,
    name: "Swarthmore College",
    portalUrl: "https://apply.swarthmore.edu/",
    portalName: "Swarthmore Applicant Portal",
    portalNameZh: "斯沃斯莫尔学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 54,
    name: "Pomona College",
    portalUrl: "https://apply.pomona.edu/",
    portalName: "Pomona Applicant Portal",
    portalNameZh: "波莫纳学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 55,
    name: "Wellesley College",
    portalUrl: "https://apply.wellesley.edu/",
    portalName: "Wellesley Applicant Portal",
    portalNameZh: "韦尔斯利学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 56,
    name: "Bowdoin College",
    portalUrl: "https://apply.bowdoin.edu/",
    portalName: "Bowdoin Applicant Portal",
    portalNameZh: "鲍登学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 57,
    name: "Carleton College",
    portalUrl: "https://apply.carleton.edu/",
    portalName: "Carleton Applicant Portal",
    portalNameZh: "卡尔顿学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
  {
    schoolId: 58,
    name: "Middlebury College",
    portalUrl: "https://apply.middlebury.edu/",
    portalName: "Middlebury Applicant Portal",
    portalNameZh: "明德学院申请者门户",
    decisionDates: [
      { round: "ED", label: "Early Decision I", labelZh: "早决定 I", date: "Mid-December 2025", dateZh: "2025年12月中旬", releaseDate: "2025-12-15" },
      { round: "ED2", label: "Early Decision II", labelZh: "早决定 II", date: "Mid-February 2026", dateZh: "2026年2月中旬", releaseDate: "2026-02-15" },
      { round: "RD", label: "Regular Decision", labelZh: "常规申请", date: "Late March 2026", dateZh: "2026年3月下旬", releaseDate: "approx:2026-03-26" },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getPortalBySchoolId(schoolId: number): SchoolPortal | undefined {
  return schoolPortals.find((p) => p.schoolId === schoolId);
}

/**
 * Get upcoming (not yet released) decisions, sorted by release date ascending.
 */
export function getUpcomingDecisions(): Array<SchoolPortal & { nextDate: DecisionDate }> {
  const results: Array<SchoolPortal & { nextDate: DecisionDate }> = [];

  for (const portal of schoolPortals) {
    const upcoming = portal.decisionDates.filter((d) => !isReleased(d.releaseDate));
    if (upcoming.length > 0) {
      // Sort upcoming by releaseDate
      const sorted = [...upcoming].sort((a, b) => {
        const da = a.releaseDate.startsWith("approx:") ? a.releaseDate.slice(7) : a.releaseDate;
        const db = b.releaseDate.startsWith("approx:") ? b.releaseDate.slice(7) : b.releaseDate;
        return new Date(da).getTime() - new Date(db).getTime();
      });
      results.push({ ...portal, nextDate: sorted[0] });
    }
  }

  return results.sort((a, b) => {
    const da = a.nextDate.releaseDate.startsWith("approx:") ? a.nextDate.releaseDate.slice(7) : a.nextDate.releaseDate;
    const db = b.nextDate.releaseDate.startsWith("approx:") ? b.nextDate.releaseDate.slice(7) : b.nextDate.releaseDate;
    return new Date(da).getTime() - new Date(db).getTime();
  });
}

/**
 * Get decisions releasing within the next N days.
 */
export function getDecisionsReleasingWithin(days: number): Array<{ portal: SchoolPortal; date: DecisionDate }> {
  const results: Array<{ portal: SchoolPortal; date: DecisionDate }> = [];
  for (const portal of schoolPortals) {
    for (const d of portal.decisionDates) {
      const daysLeft = daysUntilRelease(d.releaseDate);
      if (daysLeft >= 0 && daysLeft <= days) {
        results.push({ portal, date: d });
      }
    }
  }
  return results.sort((a, b) => daysUntilRelease(a.date.releaseDate) - daysUntilRelease(b.date.releaseDate));
}

export const ROUND_COLORS: Record<DecisionRound, string> = {
  ED: "bg-red-100 text-red-700 border-red-200",
  ED2: "bg-orange-100 text-orange-700 border-orange-200",
  EA: "bg-blue-100 text-blue-700 border-blue-200",
  SCEA: "bg-purple-100 text-purple-700 border-purple-200",
  REA: "bg-purple-100 text-purple-700 border-purple-200",
  QuestBridge: "bg-green-100 text-green-700 border-green-200",
  RD: "bg-stone-100 text-stone-600 border-stone-200",
  Rolling: "bg-teal-100 text-teal-700 border-teal-200",
};

export const ROUND_LABELS_ZH: Record<DecisionRound, string> = {
  ED: "早决定 I",
  ED2: "早决定 II",
  EA: "早申",
  SCEA: "限制性早申",
  REA: "限制性早申",
  QuestBridge: "QuestBridge",
  RD: "常规申请",
  Rolling: "滚动录取",
};
