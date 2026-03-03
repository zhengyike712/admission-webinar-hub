// ============================================================
// Design Philosophy: Academic Archive × Event Calendar
// - Core unit: Session (a scheduled virtual event with AO)
// - Each school has a registration page URL for its sessions
// - Session types: General Info Session, Up Close, Multi-College, Regional, Student Forum
// ============================================================

/** 数据最后更新日期，自动从 git commit 时间戳获取，格式 YYYY-MM-DD */
declare const __DATA_LAST_UPDATED__: string;
export const DATA_LAST_UPDATED: string = typeof __DATA_LAST_UPDATED__ !== "undefined" ? __DATA_LAST_UPDATED__ : "2026-02-28";

export type SchoolType = "National University" | "Liberal Arts College" | "Research University" | "Comprehensive University";
export type Region = "US" | "UK" | "HK" | "AU";

export type SessionType =
  | "General Info Session"
  | "Up Close / Specialty"
  | "Multi-College Session"
  | "Regional Session"
  | "Student Forum"
  | "Financial Aid Session"
  | "International Student Session";

export interface School {
  id: number;
  name: string;
  shortName?: string;
  type: SchoolType;
  region: Region; // US / UK / HK / AU
  rank: number;       // USNews rank (primary sort)
  qsRank?: number;    // QS World University Rankings 2026
  location: string;
  state: string;
  color: string; // brand color for accent
  registrationPage: string; // main virtual events / info session page
  admissionPage: string;
  tags: string[];
}

export interface Session {
  id: string;
  schoolId: number;
  title: string;
  type: SessionType;
  description: string;
  // null means "see registration page for dates" (rolling calendar like Princeton)
  dates: string[] | null;
  time?: string; // e.g. "7:00 PM ET"
  duration?: string; // e.g. "60 min"
  registrationUrl: string;
  isRolling?: boolean; // true = calendar-based, pick any available date
  partnerSchools?: string[]; // for multi-college sessions
}

export const schools: School[] = [
  // ===== National Universities Top 50 =====
  {
    id: 1, name: "Princeton University", type: "National University", region: "US", rank: 1, qsRank: 25,
    location: "Princeton, NJ", state: "NJ", color: "#E87722",
    registrationPage: "https://apply.princeton.edu/portal/virtual_information_session",
    admissionPage: "https://admission.princeton.edu",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 2, name: "Massachusetts Institute of Technology", shortName: "MIT",
    type: "National University", region: "US", rank: 2, qsRank: 1,
    location: "Cambridge, MA", state: "MA", color: "#A31F34",
    registrationPage: "https://apply.mitadmissions.org/portal/virtualmit",
    admissionPage: "https://mitadmissions.org",
    tags: ["STEM", "Ivy-equivalent"],
  },
  {
    id: 3, name: "Harvard University", type: "National University", region: "US", rank: 3, qsRank: 5,
    location: "Cambridge, MA", state: "MA", color: "#A51C30",
    registrationPage: "https://college.harvard.edu/admissions/explore-harvard/meet-us-online",
    admissionPage: "https://college.harvard.edu/admissions",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 4, name: "Stanford University", type: "National University", region: "US", rank: 4, qsRank: 3,
    location: "Stanford, CA", state: "CA", color: "#8C1515",
    registrationPage: "https://admission.stanford.edu/events/",
    admissionPage: "https://admission.stanford.edu",
    tags: ["Silicon Valley", "No Loan Policy"],
  },
  {
    id: 5, name: "Yale University", type: "National University", region: "US", rank: 5, qsRank: 21,
    location: "New Haven, CT", state: "CT", color: "#00356B",
    registrationPage: "https://admissions.yale.edu/virtual-events",
    admissionPage: "https://admissions.yale.edu",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 6, name: "University of Pennsylvania", shortName: "UPenn",
    type: "National University", region: "US", rank: 6, qsRank: 15,
    location: "Philadelphia, PA", state: "PA", color: "#011F5B",
    registrationPage: "https://admissions.upenn.edu/visit-connect/visit-penn/virtual-events",
    admissionPage: "https://admissions.upenn.edu",
    tags: ["Ivy League", "Business"],
  },
  {
    id: 7, name: "California Institute of Technology", shortName: "Caltech",
    type: "National University", region: "US", rank: 7, qsRank: 10,
    location: "Pasadena, CA", state: "CA", color: "#FF6C0C",
    registrationPage: "https://www.admissions.caltech.edu/visit/connect-virtually",
    admissionPage: "https://admissions.caltech.edu",
    tags: ["STEM", "Research"],
  },
  {
    id: 8, name: "Duke University", type: "National University", region: "US", rank: 8, qsRank: 62,
    location: "Durham, NC", state: "NC", color: "#003087",
    registrationPage: "https://admiss.ugrad.duke.edu/portal/discover-duke",
    admissionPage: "https://admissions.duke.edu",
    tags: ["Pre-Med", "Public Policy"],
  },
  {
    id: 9, name: "Brown University", type: "National University", region: "US", rank: 9, qsRank: 69,
    location: "Providence, RI", state: "RI", color: "#4E3629",
    registrationPage: "https://admission.brown.edu/visit/virtual-events",
    admissionPage: "https://admission.brown.edu",
    tags: ["Ivy League", "Open Curriculum"],
  },
  {
    id: 10, name: "Johns Hopkins University", shortName: "JHU",
    type: "National University", region: "US", rank: 10, qsRank: 24,
    location: "Baltimore, MD", state: "MD", color: "#002D72",
    registrationPage: "https://apply.jhu.edu/event_group/information-session/",
    admissionPage: "https://apply.jhu.edu",
    tags: ["Pre-Med", "Research"],
  },
  {
    id: 11, name: "Northwestern University", type: "National University", region: "US", rank: 11, qsRank: 42,
    location: "Evanston, IL", state: "IL", color: "#4E2A84",
    registrationPage: "https://admission.northwestern.edu/visit/virtual-visits/",
    admissionPage: "https://admission.northwestern.edu",
    tags: ["Journalism", "Business"],
  },
  {
    id: 12, name: "Dartmouth College", type: "National University", region: "US", rank: 12, qsRank: 199,
    location: "Hanover, NH", state: "NH", color: "#00693E",
    registrationPage: "https://apply.dartmouth.edu/portal/campus-visit-virtual",
    admissionPage: "https://admissions.dartmouth.edu",
    tags: ["Ivy League", "D-Plan"],
  },
  {
    id: 13, name: "Vanderbilt University", type: "National University", region: "US", rank: 13, qsRank: 198,
    location: "Nashville, TN", state: "TN", color: "#866D4B",
    registrationPage: "https://myappvu.vanderbilt.edu/portal/onlinesession",
    admissionPage: "https://admissions.vanderbilt.edu",
    tags: ["No Loan Policy", "Nashville"],
  },
  {
    id: 14, name: "Rice University", type: "National University", region: "US", rank: 14, qsRank: 119,
    location: "Houston, TX", state: "TX", color: "#00205B",
    registrationPage: "https://admission.rice.edu/visit/virtual-events",
    admissionPage: "https://admission.rice.edu",
    tags: ["Residential College", "No Loan Policy"],
  },
  {
    id: 15, name: "Washington University in St. Louis", shortName: "WashU",
    type: "National University", region: "US", rank: 15, qsRank: 237,
    location: "St. Louis, MO", state: "MO", color: "#A51417",
    registrationPage: "https://pathway.wustl.edu/portal/virtual_visit",
    admissionPage: "https://admissions.wustl.edu",
    tags: ["Pre-Med", "Business"],
  },
  {
    id: 16, name: "Cornell University", type: "National University", region: "US", rank: 16, qsRank: 16,
    location: "Ithaca, NY", state: "NY", color: "#B31B1B",
    registrationPage: "https://engage.admissions.cornell.edu/portal/prospective_student_events",
    admissionPage: "https://admissions.cornell.edu",
    tags: ["Ivy League", "Engineering"],
  },
  {
    id: 17, name: "University of Notre Dame", type: "National University", region: "US", rank: 17, qsRank: 265,
    location: "Notre Dame, IN", state: "IN", color: "#0C2340",
    registrationPage: "https://admissions.nd.edu/visit-engage/virtual-events/",
    admissionPage: "https://admissions.nd.edu",
    tags: ["Catholic", "Business"],
  },
  {
    id: 18, name: "UCLA", type: "National University", region: "US", rank: 18, qsRank: 46,
    location: "Los Angeles, CA", state: "CA", color: "#2774AE",
    registrationPage: "https://connect.admission.ucla.edu/portal/virtualpresentations",
    admissionPage: "https://admission.ucla.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 19, name: "Emory University", type: "National University", region: "US", rank: 19, qsRank: 290,
    location: "Atlanta, GA", state: "GA", color: "#012169",
    registrationPage: "https://apply.emory.edu/visit/virtual.php",
    admissionPage: "https://apply.emory.edu",
    tags: ["Pre-Med", "Public Health"],
  },
  {
    id: 20, name: "Georgetown University", type: "National University", region: "US", rank: 20, qsRank: 330,
    location: "Washington, D.C.", state: "DC", color: "#041E42",
    registrationPage: "https://uapply.georgetown.edu/portal/virtualsession",
    admissionPage: "https://uadmissions.georgetown.edu",
    tags: ["Jesuit", "International Relations"],
  },
  {
    id: 21, name: "UC Berkeley", type: "National University", region: "US", rank: 21, qsRank: 17,
    location: "Berkeley, CA", state: "CA", color: "#003262",
    registrationPage: "https://admissions.berkeley.edu/visit/events/",
    admissionPage: "https://admissions.berkeley.edu",
    tags: ["Public", "UC System", "STEM"],
  },
  {
    id: 22, name: "University of Michigan", shortName: "UMich",
    type: "National University", region: "US", rank: 22, qsRank: 45,
    location: "Ann Arbor, MI", state: "MI", color: "#00274C",
    registrationPage: "https://admissions.umich.edu/visit/virtual-visits",
    admissionPage: "https://admissions.umich.edu",
    tags: ["Public", "Business", "Engineering"],
  },
  {
    id: 23, name: "Carnegie Mellon University", shortName: "CMU",
    type: "National University", region: "US", rank: 23, qsRank: 52,
    location: "Pittsburgh, PA", state: "PA", color: "#C41230",
    registrationPage: "https://admission.cmu.edu/visit/virtual-visits.html",
    admissionPage: "https://admission.cmu.edu",
    tags: ["CS", "Engineering"],
  },
  {
    id: 24, name: "University of Virginia", shortName: "UVA",
    type: "National University", region: "US", rank: 24, qsRank: 375,
    location: "Charlottesville, VA", state: "VA", color: "#232D4B",
    registrationPage: "https://admission.virginia.edu/visit/virtual",
    admissionPage: "https://admission.virginia.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 25, name: "University of North Carolina", shortName: "UNC",
    type: "National University", region: "US", rank: 25, qsRank: 341,
    location: "Chapel Hill, NC", state: "NC", color: "#4B9CD3",
    registrationPage: "https://admissions.unc.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.unc.edu",
    tags: ["Public", "Journalism"],
  },
  {
    id: 26, name: "Wake Forest University", type: "National University", region: "US", rank: 26, qsRank: 601,
    location: "Winston-Salem, NC", state: "NC", color: "#9E7E38",
    registrationPage: "https://admissions.wfu.edu/visit/virtual/",
    admissionPage: "https://admissions.wfu.edu",
    tags: ["Test Optional", "Business"],
  },
  {
    id: 27, name: "Tufts University", type: "National University", region: "US", rank: 27, qsRank: 388,
    location: "Medford, MA", state: "MA", color: "#3E8EDE",
    registrationPage: "https://admissions.tufts.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.tufts.edu",
    tags: ["International Relations"],
  },
  {
    id: 28, name: "University of Florida", shortName: "UF",
    type: "National University", region: "US", rank: 28, qsRank: 300,
    location: "Gainesville, FL", state: "FL", color: "#0021A5",
    registrationPage: "https://admissions.ufl.edu/visit/virtual/",
    admissionPage: "https://admissions.ufl.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 29, name: "University of Southern California", shortName: "USC",
    type: "National University", region: "US", rank: 29, qsRank: 165,
    location: "Los Angeles, CA", state: "CA", color: "#990000",
    registrationPage: "https://admission.usc.edu/visit/virtual-visits/",
    admissionPage: "https://admission.usc.edu",
    tags: ["Film", "Business"],
  },
  {
    id: 30, name: "New York University", shortName: "NYU",
    type: "National University", region: "US", rank: 30, qsRank: 55,
    location: "New York, NY", state: "NY", color: "#57068C",
    registrationPage: "https://www.nyu.edu/admissions/undergraduate-admissions/visit-nyu/virtual-visits.html",
    admissionPage: "https://www.nyu.edu/admissions/undergraduate-admissions.html",
    tags: ["Urban", "Arts"],
  },
  {
    id: 31, name: "Boston College", shortName: "BC",
    type: "National University", region: "US", rank: 31, qsRank: 499,
    location: "Chestnut Hill, MA", state: "MA", color: "#8A0000",
    registrationPage: "https://www.bc.edu/bc-web/admission/visit/virtual.html",
    admissionPage: "https://www.bc.edu/bc-web/admission.html",
    tags: ["Jesuit", "Business"],
  },
  {
    id: 32, name: "Georgia Institute of Technology", shortName: "Georgia Tech",
    type: "National University", region: "US", rank: 32, qsRank: 123,
    location: "Atlanta, GA", state: "GA", color: "#B3A369",
    registrationPage: "https://admission.gatech.edu/visit/virtual",
    admissionPage: "https://admission.gatech.edu",
    tags: ["STEM", "Engineering", "CS"],
  },
  {
    id: 33, name: "University of Texas at Austin", shortName: "UT Austin",
    type: "National University", region: "US", rank: 33, qsRank: 68,
    location: "Austin, TX", state: "TX", color: "#BF5700",
    registrationPage: "https://admissions.utexas.edu/visit/virtual",
    admissionPage: "https://admissions.utexas.edu",
    tags: ["Public", "Business"],
  },
  {
    id: 34, name: "University of Wisconsin-Madison", shortName: "UW-Madison",
    type: "National University", region: "US", rank: 34, qsRank: 110,
    location: "Madison, WI", state: "WI", color: "#C5050C",
    registrationPage: "https://admissions.wisc.edu/visit/virtual/",
    admissionPage: "https://admissions.wisc.edu",
    tags: ["Public", "Research"],
  },
  {
    id: 35, name: "Tulane University", type: "National University", region: "US", rank: 35, qsRank: 601,
    location: "New Orleans, LA", state: "LA", color: "#006747",
    registrationPage: "https://admission.tulane.edu/visit/virtual",
    admissionPage: "https://admission.tulane.edu",
    tags: ["New Orleans", "Public Health"],
  },
  {
    id: 36, name: "Boston University", shortName: "BU",
    type: "National University", region: "US", rank: 36, qsRank: 88,
    location: "Boston, MA", state: "MA", color: "#CC0000",
    registrationPage: "https://www.bu.edu/admissions/visit/virtual/",
    admissionPage: "https://www.bu.edu/admissions/",
    tags: ["Urban", "Research"],
  },
  {
    id: 37, name: "Purdue University", type: "National University", region: "US", rank: 37, qsRank: 88,
    location: "West Lafayette, IN", state: "IN", color: "#CEB888",
    registrationPage: "https://www.admissions.purdue.edu/visit/virtual.php",
    admissionPage: "https://www.admissions.purdue.edu",
    tags: ["Engineering", "Agriculture"],
  },
  {
    id: 38, name: "Ohio State University", shortName: "OSU",
    type: "National University", region: "US", rank: 38, qsRank: 171,
    location: "Columbus, OH", state: "OH", color: "#BB0000",
    registrationPage: "https://undergrad.osu.edu/visit/virtual",
    admissionPage: "https://undergrad.osu.edu/apply",
    tags: ["Public", "Big Ten"],
  },
  {
    id: 39, name: "Penn State University", shortName: "Penn State",
    type: "National University", region: "US", rank: 39, qsRank: 82,
    location: "University Park, PA", state: "PA", color: "#1E407C",
    registrationPage: "https://admissions.psu.edu/visit/virtual/",
    admissionPage: "https://admissions.psu.edu",
    tags: ["Public", "Big Ten"],
  },
  {
    id: 40, name: "University of Illinois Urbana-Champaign", shortName: "UIUC",
    type: "National University", region: "US", rank: 40, qsRank: 70,
    location: "Champaign, IL", state: "IL", color: "#13294B",
    registrationPage: "https://admissions.illinois.edu/Visit/virtual",
    admissionPage: "https://admissions.illinois.edu",
    tags: ["CS", "Engineering"],
  },
  {
    id: 41, name: "University of Washington", shortName: "UW",
    type: "National University", region: "US", rank: 41, qsRank: 81,
    location: "Seattle, WA", state: "WA", color: "#4B2E83",
    registrationPage: "https://admit.uw.edu/visit/virtual/",
    admissionPage: "https://admit.uw.edu",
    tags: ["Public", "CS"],
  },
  {
    id: 42, name: "Villanova University", type: "National University", region: "US", rank: 42, qsRank: 801,
    location: "Villanova, PA", state: "PA", color: "#00205B",
    registrationPage: "https://www1.villanova.edu/university/undergraduate-admission/visit/virtual.html",
    admissionPage: "https://www1.villanova.edu/university/undergraduate-admission.html",
    tags: ["Augustinian", "Business"],
  },
  {
    id: 43, name: "Lehigh University", type: "National University", region: "US", rank: 43, qsRank: 701,
    location: "Bethlehem, PA", state: "PA", color: "#653700",
    registrationPage: "https://admissions.lehigh.edu/visit/virtual",
    admissionPage: "https://admissions.lehigh.edu",
    tags: ["Engineering", "Business"],
  },
  {
    id: 44, name: "Northeastern University", type: "National University", region: "US", rank: 44, qsRank: 350,
    location: "Boston, MA", state: "MA", color: "#CC0000",
    registrationPage: "https://admissions.northeastern.edu/visit/virtual/",
    admissionPage: "https://admissions.northeastern.edu",
    tags: ["Co-op", "CS"],
  },
  {
    id: 45, name: "UC San Diego", shortName: "UCSD",
    type: "National University", region: "US", rank: 45, qsRank: 66,
    location: "La Jolla, CA", state: "CA", color: "#00629B",
    registrationPage: "https://admissions.ucsd.edu/visit/virtual.html",
    admissionPage: "https://admissions.ucsd.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 46, name: "UC Davis", type: "National University", region: "US", rank: 46, qsRank: 114,
    location: "Davis, CA", state: "CA", color: "#002855",
    registrationPage: "https://admissions.ucdavis.edu/visit/virtual",
    admissionPage: "https://admissions.ucdavis.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 47, name: "UC Santa Barbara", shortName: "UCSB",
    type: "National University", region: "US", rank: 47, qsRank: 160,
    location: "Santa Barbara, CA", state: "CA", color: "#003660",
    registrationPage: "https://admissions.ucsb.edu/visit/virtual",
    admissionPage: "https://admissions.ucsb.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 48, name: "Case Western Reserve University", shortName: "Case Western",
    type: "National University", region: "US", rank: 48, qsRank: 400,
    location: "Cleveland, OH", state: "OH", color: "#0A304E",
    registrationPage: "https://case.edu/admission/undergraduate/visit/virtual",
    admissionPage: "https://case.edu/admission/undergraduate",
    tags: ["Pre-Med", "Engineering"],
  },
  {
    id: 49, name: "University of Rochester", type: "National University", region: "US", rank: 49, qsRank: 420,
    location: "Rochester, NY", state: "NY", color: "#003B71",
    registrationPage: "https://enrollment.rochester.edu/admissions/visit/virtual/",
    admissionPage: "https://enrollment.rochester.edu/admissions/",
    tags: ["Music", "Optics"],
  },
  {
    id: 50, name: "Rensselaer Polytechnic Institute", shortName: "RPI",
    type: "National University", region: "US", rank: 50, qsRank: 601,
    location: "Troy, NY", state: "NY", color: "#D6001C",
    registrationPage: "https://admissions.rpi.edu/visit/virtual",
    admissionPage: "https://admissions.rpi.edu",
    tags: ["Engineering", "STEM"],
  },

  // ===== Liberal Arts Colleges Top 30 =====
  {
    id: 51, name: "Williams College", type: "Liberal Arts College", region: "US", rank: 1,
    location: "Williamstown, MA", state: "MA", color: "#512698",
    registrationPage: "https://admission.williams.edu/visit/virtual/",
    admissionPage: "https://admission.williams.edu",
    tags: ["No Loan Policy", "Small Class"],
  },
  {
    id: 52, name: "Amherst College", type: "Liberal Arts College", region: "US", rank: 2,
    location: "Amherst, MA", state: "MA", color: "#3F1F69",
    registrationPage: "https://www.amherst.edu/admission/visit/virtual",
    admissionPage: "https://www.amherst.edu/admission",
    tags: ["No Loan Policy", "Open Curriculum"],
  },
  {
    id: 53, name: "Swarthmore College", type: "Liberal Arts College", region: "US", rank: 3,
    location: "Swarthmore, PA", state: "PA", color: "#8C1515",
    registrationPage: "https://www.swarthmore.edu/admissions-aid/virtual-visits",
    admissionPage: "https://www.swarthmore.edu/admissions-aid",
    tags: ["No Loan Policy", "Engineering"],
  },
  {
    id: 54, name: "Pomona College", type: "Liberal Arts College", region: "US", rank: 4,
    location: "Claremont, CA", state: "CA", color: "#0C2340",
    registrationPage: "https://www.pomona.edu/admissions/visit/virtual",
    admissionPage: "https://www.pomona.edu/admissions",
    tags: ["No Loan Policy", "Claremont Consortium"],
  },
  {
    id: 55, name: "Wellesley College", type: "Liberal Arts College", region: "US", rank: 5,
    location: "Wellesley, MA", state: "MA", color: "#1D6FA4",
    registrationPage: "https://www.wellesley.edu/admission/visit/virtual",
    admissionPage: "https://www.wellesley.edu/admission",
    tags: ["Women's College", "No Loan Policy"],
  },
  {
    id: 56, name: "Bowdoin College", type: "Liberal Arts College", region: "US", rank: 6,
    location: "Brunswick, ME", state: "ME", color: "#000000",
    registrationPage: "https://www.bowdoin.edu/admissions/visit/virtual.html",
    admissionPage: "https://www.bowdoin.edu/admissions/",
    tags: ["No Loan Policy", "Test Optional"],
  },
  {
    id: 57, name: "Carleton College", type: "Liberal Arts College", region: "US", rank: 7,
    location: "Northfield, MN", state: "MN", color: "#003865",
    registrationPage: "https://www.carleton.edu/admissions/visit/virtual/",
    admissionPage: "https://www.carleton.edu/admissions/",
    tags: ["Trimester", "Research"],
  },
  {
    id: 58, name: "Middlebury College", type: "Liberal Arts College", region: "US", rank: 8,
    location: "Middlebury, VT", state: "VT", color: "#003B71",
    registrationPage: "https://www.middlebury.edu/admissions/visit/virtual",
    admissionPage: "https://www.middlebury.edu/admissions",
    tags: ["Languages", "Environment"],
  },
  {
    id: 59, name: "Claremont McKenna College", shortName: "CMC",
    type: "Liberal Arts College", region: "US", rank: 9,
    location: "Claremont, CA", state: "CA", color: "#8B0000",
    registrationPage: "https://www.cmc.edu/admission/visit/virtual",
    admissionPage: "https://www.cmc.edu/admission",
    tags: ["Economics", "Government"],
  },
  {
    id: 60, name: "Haverford College", type: "Liberal Arts College", region: "US", rank: 10,
    location: "Haverford, PA", state: "PA", color: "#003865",
    registrationPage: "https://www.haverford.edu/admission/visit/virtual",
    admissionPage: "https://www.haverford.edu/admission",
    tags: ["Honor Code", "Quaker"],
  },
  {
    id: 61, name: "Davidson College", type: "Liberal Arts College", region: "US", rank: 11,
    location: "Davidson, NC", state: "NC", color: "#CC0000",
    registrationPage: "https://www.davidson.edu/admission-and-financial-aid/visit/virtual",
    admissionPage: "https://www.davidson.edu/admission-and-financial-aid",
    tags: ["Honor Code", "No Loan Policy"],
  },
  {
    id: 62, name: "Washington and Lee University", shortName: "W&L",
    type: "Liberal Arts College", region: "US", rank: 12,
    location: "Lexington, VA", state: "VA", color: "#041E42",
    registrationPage: "https://www.wlu.edu/admission/visit/virtual/",
    admissionPage: "https://www.wlu.edu/admission/",
    tags: ["Honor System", "Law"],
  },
  {
    id: 63, name: "Colgate University", type: "Liberal Arts College", region: "US", rank: 13,
    location: "Hamilton, NY", state: "NY", color: "#821019",
    registrationPage: "https://www.colgate.edu/admission/visit/virtual",
    admissionPage: "https://www.colgate.edu/admission",
    tags: ["Core Curriculum"],
  },
  {
    id: 64, name: "Hamilton College", type: "Liberal Arts College", region: "US", rank: 14,
    location: "Clinton, NY", state: "NY", color: "#003865",
    registrationPage: "https://www.hamilton.edu/admission/visit/virtual",
    admissionPage: "https://www.hamilton.edu/admission",
    tags: ["Writing", "Open Curriculum"],
  },
  {
    id: 65, name: "Smith College", type: "Liberal Arts College", region: "US", rank: 15,
    location: "Northampton, MA", state: "MA", color: "#002855",
    registrationPage: "https://www.smith.edu/admission/visit/virtual",
    admissionPage: "https://www.smith.edu/admission",
    tags: ["Women's College", "Five College"],
  },
  {
    id: 66, name: "Vassar College", type: "Liberal Arts College", region: "US", rank: 16,
    location: "Poughkeepsie, NY", state: "NY", color: "#721422",
    registrationPage: "https://admissions.vassar.edu/visit/virtual.html",
    admissionPage: "https://admissions.vassar.edu",
    tags: ["Arts", "No Loan Policy"],
  },
  {
    id: 67, name: "Colby College", type: "Liberal Arts College", region: "US", rank: 17,
    location: "Waterville, ME", state: "ME", color: "#003865",
    registrationPage: "https://www.colby.edu/admission/visit/virtual/",
    admissionPage: "https://www.colby.edu/admission/",
    tags: ["No Loan Policy", "Sustainability"],
  },
  {
    id: 68, name: "Bates College", type: "Liberal Arts College", region: "US", rank: 18,
    location: "Lewiston, ME", state: "ME", color: "#8C1515",
    registrationPage: "https://www.bates.edu/admission/visit/virtual/",
    admissionPage: "https://www.bates.edu/admission/",
    tags: ["Test Optional", "Thesis"],
  },
  {
    id: 69, name: "Grinnell College", type: "Liberal Arts College", region: "US", rank: 19,
    location: "Grinnell, IA", state: "IA", color: "#C1292E",
    registrationPage: "https://www.grinnell.edu/admission/visit/virtual",
    admissionPage: "https://www.grinnell.edu/admission",
    tags: ["No Loan Policy", "Social Justice"],
  },
  {
    id: 70, name: "Barnard College", type: "Liberal Arts College", region: "US", rank: 20,
    location: "New York, NY", state: "NY", color: "#003865",
    registrationPage: "https://admissions.barnard.edu/visit/virtual",
    admissionPage: "https://admissions.barnard.edu",
    tags: ["Women's College", "Columbia Affiliation"],
  },
  {
    id: 71, name: "Oberlin College", type: "Liberal Arts College", region: "US", rank: 21,
    location: "Oberlin, OH", state: "OH", color: "#CC0000",
    registrationPage: "https://www.oberlin.edu/admissions-and-aid/visit/virtual",
    admissionPage: "https://www.oberlin.edu/admissions-and-aid",
    tags: ["Music Conservatory", "Social Justice"],
  },
  {
    id: 72, name: "Colorado College", type: "Liberal Arts College", region: "US", rank: 22,
    location: "Colorado Springs, CO", state: "CO", color: "#000000",
    registrationPage: "https://www.coloradocollege.edu/admission/visit/virtual/",
    admissionPage: "https://www.coloradocollege.edu/admission/",
    tags: ["Block Plan", "Outdoor"],
  },
  {
    id: 73, name: "Bryn Mawr College", type: "Liberal Arts College", region: "US", rank: 23,
    location: "Bryn Mawr, PA", state: "PA", color: "#003865",
    registrationPage: "https://www.brynmawr.edu/admissions/visit/virtual",
    admissionPage: "https://www.brynmawr.edu/admissions",
    tags: ["Women's College"],
  },
  {
    id: 74, name: "Mount Holyoke College", type: "Liberal Arts College", region: "US", rank: 24,
    location: "South Hadley, MA", state: "MA", color: "#003865",
    registrationPage: "https://www.mtholyoke.edu/admission/visit/virtual",
    admissionPage: "https://www.mtholyoke.edu/admission",
    tags: ["Women's College", "Five College"],
  },
  {
    id: 75, name: "Trinity College", type: "Liberal Arts College", region: "US", rank: 25,
    location: "Hartford, CT", state: "CT", color: "#003865",
    registrationPage: "https://www.trincoll.edu/admissions/visit/virtual/",
    admissionPage: "https://www.trincoll.edu/admissions/",
    tags: ["Urban", "Hartford"],
  },
  {
    id: 76, name: "Kenyon College", type: "Liberal Arts College", region: "US", rank: 26,
    location: "Gambier, OH", state: "OH", color: "#4A2C6E",
    registrationPage: "https://www.kenyon.edu/admissions-aid/visit/virtual/",
    admissionPage: "https://www.kenyon.edu/admissions-aid/",
    tags: ["Writing", "Literature"],
  },
  {
    id: 77, name: "Macalester College", type: "Liberal Arts College", region: "US", rank: 27,
    location: "St. Paul, MN", state: "MN", color: "#003865",
    registrationPage: "https://www.macalester.edu/admissions/visit/virtual/",
    admissionPage: "https://www.macalester.edu/admissions/",
    tags: ["International", "Diversity"],
  },
  {
    id: 78, name: "Occidental College", type: "Liberal Arts College", region: "US", rank: 28,
    location: "Los Angeles, CA", state: "CA", color: "#CC0000",
    registrationPage: "https://www.oxy.edu/admission-aid/visit/virtual",
    admissionPage: "https://www.oxy.edu/admission-aid",
    tags: ["Diversity", "Los Angeles"],
  },
  {
    id: 79, name: "Scripps College", type: "Liberal Arts College", region: "US", rank: 29,
    location: "Claremont, CA", state: "CA", color: "#8B0000",
    registrationPage: "https://www.scrippscollege.edu/admission/visit/virtual",
    admissionPage: "https://www.scrippscollege.edu/admission",
    tags: ["Women's College", "Claremont Consortium"],
  },
  {
    id: 80, name: "Union College", type: "Liberal Arts College", region: "US", rank: 30,
    location: "Schenectady, NY", state: "NY", color: "#862633",
    registrationPage: "https://www.union.edu/admissions/visit/virtual",
    admissionPage: "https://www.union.edu/admissions",
    tags: ["Engineering", "Liberal Arts"],
  },

  // ===== National Universities Rank 51-75 =====
  {
    id: 81, name: "University of California, Irvine", shortName: "UC Irvine",
    type: "National University", region: "US", rank: 51, qsRank: 149,
    location: "Irvine, CA", state: "CA", color: "#0064A4",
    registrationPage: "https://admissions.uci.edu/connect/virtual-visit.php",
    admissionPage: "https://admissions.uci.edu",
    tags: ["Public", "UC System", "Research"],
  },
  {
    id: 82, name: "University of Maryland", shortName: "UMD",
    type: "National University", region: "US", rank: 52, qsRank: 171,
    location: "College Park, MD", state: "MD", color: "#E03A3E",
    registrationPage: "https://admissions.umd.edu/connect/virtual-visits",
    admissionPage: "https://admissions.umd.edu",
    tags: ["Public", "CS", "Engineering"],
  },
  {
    id: 83, name: "University of Minnesota", shortName: "UMN",
    type: "National University", region: "US", rank: 53, qsRank: 171,
    location: "Minneapolis, MN", state: "MN", color: "#7A0019",
    registrationPage: "https://admissions.tc.umn.edu/visit/virtual",
    admissionPage: "https://admissions.tc.umn.edu",
    tags: ["Public", "Big Ten", "Research"],
  },
  {
    id: 84, name: "Indiana University Bloomington", shortName: "IU Bloomington",
    type: "National University", region: "US", rank: 54, qsRank: 350,
    location: "Bloomington, IN", state: "IN", color: "#990000",
    registrationPage: "https://admissions.indiana.edu/visit/virtual.html",
    admissionPage: "https://admissions.indiana.edu",
    tags: ["Public", "Business", "Music"],
  },
  {
    id: 85, name: "University of Georgia", shortName: "UGA",
    type: "National University", region: "US", rank: 55, qsRank: 501,
    location: "Athens, GA", state: "GA", color: "#BA0C2F",
    registrationPage: "https://www.admissions.uga.edu/visit/virtual/",
    admissionPage: "https://www.admissions.uga.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 86, name: "University of Pittsburgh", shortName: "Pitt",
    type: "National University", region: "US", rank: 56, qsRank: 250,
    location: "Pittsburgh, PA", state: "PA", color: "#003594",
    registrationPage: "https://oafa.pitt.edu/visit/virtual/",
    admissionPage: "https://oafa.pitt.edu",
    tags: ["Public", "Pre-Med", "Research"],
  },
  {
    id: 87, name: "Rutgers University–New Brunswick", shortName: "Rutgers",
    type: "National University", region: "US", rank: 57, qsRank: 225,
    location: "New Brunswick, NJ", state: "NJ", color: "#CC0033",
    registrationPage: "https://admissions.rutgers.edu/visit/virtual-visits",
    admissionPage: "https://admissions.rutgers.edu",
    tags: ["Public", "Research"],
  },
  {
    id: 88, name: "Texas A&M University", shortName: "Texas A&M",
    type: "National University", region: "US", rank: 58, qsRank: 186,
    location: "College Station, TX", state: "TX", color: "#500000",
    registrationPage: "https://admissions.tamu.edu/visit/virtual",
    admissionPage: "https://admissions.tamu.edu",
    tags: ["Public", "Engineering", "Agriculture"],
  },
  {
    id: 89, name: "Michigan State University", shortName: "MSU",
    type: "National University", region: "US", rank: 59, qsRank: 225,
    location: "East Lansing, MI", state: "MI", color: "#18453B",
    registrationPage: "https://admissions.msu.edu/visit/virtual",
    admissionPage: "https://admissions.msu.edu",
    tags: ["Public", "Big Ten", "Agriculture"],
  },
  {
    id: 90, name: "University of Connecticut", shortName: "UConn",
    type: "National University", region: "US", rank: 60, qsRank: 501,
    location: "Storrs, CT", state: "CT", color: "#000E2F",
    registrationPage: "https://admissions.uconn.edu/visit/virtual/",
    admissionPage: "https://admissions.uconn.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 91, name: "University of Colorado Boulder", shortName: "CU Boulder",
    type: "National University", region: "US", rank: 61, qsRank: 250,
    location: "Boulder, CO", state: "CO", color: "#CFB87C",
    registrationPage: "https://www.colorado.edu/admissions/virtual-visits",
    admissionPage: "https://www.colorado.edu/admissions",
    tags: ["Public", "Research", "Outdoor"],
  },
  {
    id: 92, name: "Stony Brook University", shortName: "Stony Brook",
    type: "National University", region: "US", rank: 62, qsRank: 350,
    location: "Stony Brook, NY", state: "NY", color: "#990000",
    registrationPage: "https://www.stonybrook.edu/commcms/ugadmissions/visit/virtual.php",
    admissionPage: "https://www.stonybrook.edu/commcms/ugadmissions",
    tags: ["Public", "SUNY", "Research"],
  },
  {
    id: 93, name: "University of Iowa", shortName: "UI",
    type: "National University", region: "US", rank: 63, qsRank: 501,
    location: "Iowa City, IA", state: "IA", color: "#FFCD00",
    registrationPage: "https://admissions.uiowa.edu/visit/virtual",
    admissionPage: "https://admissions.uiowa.edu",
    tags: ["Public", "Writing", "Medicine"],
  },
  {
    id: 94, name: "University of Arizona", shortName: "UA",
    type: "National University", region: "US", rank: 64, qsRank: 350,
    location: "Tucson, AZ", state: "AZ", color: "#CC0033",
    registrationPage: "https://admissions.arizona.edu/visit/virtual",
    admissionPage: "https://admissions.arizona.edu",
    tags: ["Public", "Research"],
  },
  {
    id: 95, name: "Virginia Tech", type: "National University", region: "US", rank: 65, qsRank: 401,
    location: "Blacksburg, VA", state: "VA", color: "#861F41",
    registrationPage: "https://www.admissions.vt.edu/visit/virtual.html",
    admissionPage: "https://www.admissions.vt.edu",
    tags: ["Public", "Engineering", "Architecture"],
  },
  {
    id: 96, name: "University of California, Santa Cruz", shortName: "UC Santa Cruz",
    type: "National University", region: "US", rank: 66, qsRank: 350,
    location: "Santa Cruz, CA", state: "CA", color: "#003C6C",
    registrationPage: "https://admissions.ucsc.edu/visit/virtual.html",
    admissionPage: "https://admissions.ucsc.edu",
    tags: ["Public", "UC System", "Research"],
  },
  {
    id: 97, name: "University of California, Riverside", shortName: "UC Riverside",
    type: "National University", region: "US", rank: 67, qsRank: 501,
    location: "Riverside, CA", state: "CA", color: "#003DA5",
    registrationPage: "https://admissions.ucr.edu/visit/virtual",
    admissionPage: "https://admissions.ucr.edu",
    tags: ["Public", "UC System", "Diversity"],
  },
  {
    id: 98, name: "Arizona State University", shortName: "ASU",
    type: "National University", region: "US", rank: 68, qsRank: 216,
    location: "Tempe, AZ", state: "AZ", color: "#8C1D40",
    registrationPage: "https://admission.asu.edu/visit/virtual",
    admissionPage: "https://admission.asu.edu",
    tags: ["Public", "Innovation", "Online"],
  },
  {
    id: 99, name: "University of Tennessee", shortName: "UTK",
    type: "National University", region: "US", rank: 69, qsRank: 601,
    location: "Knoxville, TN", state: "TN", color: "#FF8200",
    registrationPage: "https://admissions.utk.edu/visit/virtual/",
    admissionPage: "https://admissions.utk.edu",
    tags: ["Public", "Research"],
  },
  {
    id: 100, name: "University of Massachusetts Amherst", shortName: "UMass Amherst",
    type: "National University", region: "US", rank: 70, qsRank: 501,
    location: "Amherst, MA", state: "MA", color: "#881C1C",
    registrationPage: "https://www.umass.edu/admissions/visit/virtual",
    admissionPage: "https://www.umass.edu/admissions",
    tags: ["Public", "Five College", "Research"],
  },
];

// ── Representative Session Data ──
// Based on real patterns observed from Yale, Princeton, Harvard, etc.
// Dates are illustrative for the 2025-26 cycle (fall/spring admission season)
export const sessions: Session[] = [
  // Princeton – rolling calendar
  {
    id: "princeton-general",
    schoolId: 1,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "招生官主持的 30 分钟校情介绍 + 15 分钟 Q&A，涵盖学术项目、招生流程和奖学金政策。",
    dates: null,
    time: "多时段可选（东部时间）",
    duration: "45 min",
    registrationUrl: "https://apply.princeton.edu/portal/virtual_information_session",
    isRolling: true,
  },

  // Harvard
  {
    id: "harvard-general",
    schoolId: 3,
    title: "Online Information Session",
    type: "General Info Session",
    description: "哈佛招生官与在校生联合主持，介绍学术项目、校园生活和申请流程，含现场 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://college.harvard.edu/admissions/explore-harvard/meet-us-online",
    isRolling: true,
  },
  {
    id: "harvard-multicollege",
    schoolId: 3,
    title: "Harvard · Princeton · UVA · Wellesley · Yale 联合宣讲",
    type: "Multi-College Session",
    description: "五所顶尖院校招生官联合出席，一场活动了解五所学校，含选择性录取和奖学金介绍。",
    dates: ["2026-03-05", "2026-03-19", "2026-04-02"],
    time: "7:00 PM ET",
    duration: "90 min",
    registrationUrl: "https://college.harvard.edu/admissions/harvard-princeton-uva-wellesley-and-yale-information-sessions",
    partnerSchools: ["Princeton", "UVA", "Wellesley", "Yale"],
  },

  // Yale
  {
    id: "yale-general",
    schoolId: 5,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "耶鲁招生官与在校生联合主持，60 分钟涵盖学术项目、住宿学院制度、奖学金和申请流程，可提前提交问题。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
    isRolling: true,
  },
  {
    id: "yale-student-forum",
    schoolId: 5,
    title: "Virtual Student Forum",
    type: "Student Forum",
    description: "仅在校生参与（无招生官），非正式 Q&A，可以更坦诚地了解耶鲁真实的学生生活。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
    isRolling: true,
  },
  {
    id: "yale-upclose-stem",
    schoolId: 5,
    title: "Yale Up Close: Science & Engineering",
    type: "Up Close / Specialty",
    description: "深度聚焦耶鲁理工科项目，招生官 + 教授 + 在校生联合介绍科研机会和课程体系。",
    dates: ["2026-03-04"],
    time: "7:00 PM ET",
    duration: "75 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
  },
  {
    id: "yale-upclose-arts",
    schoolId: 5,
    title: "Yale Up Close: Performing Arts",
    type: "Up Close / Specialty",
    description: "聚焦耶鲁表演艺术资源，含戏剧学院、音乐学院和课外艺术活动介绍。",
    dates: ["2026-03-08"],
    time: "7:00 PM ET",
    duration: "75 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
  },
  {
    id: "yale-upclose-finaid",
    schoolId: 5,
    title: "Yale Up Close: Financial Aid & Affordability",
    type: "Financial Aid Session",
    description: "耶鲁奖学金政策详解，招生官 + 财务援助官员联合主持，解答奖学金计算和申请流程。",
    dates: ["2026-03-09"],
    time: "7:00 PM ET",
    duration: "75 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
  },
  {
    id: "yale-midwest",
    schoolId: 5,
    title: "Yale & the Midwest – Regional Session",
    type: "Regional Session",
    description: "面向中西部地区学生的专场，含在校生面板对话，分享来自该地区学生的真实申请经验。",
    dates: ["2026-04-10", "2026-04-15"],
    time: "8:00 PM ET / 7:00 PM CT",
    duration: "60 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
  },

  // MIT
  {
    id: "mit-general",
    schoolId: 2,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "MIT 招生官介绍本科申请流程、学术项目和校园文化，含 Q&A 环节。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://mitadmissions.org/apply/visit/",
    isRolling: true,
  },

  // Stanford
  {
    id: "stanford-general",
    schoolId: 4,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "斯坦福招生官介绍申请流程、学术项目和学生生活，含现场 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.stanford.edu/events/",
    isRolling: true,
  },

  // UPenn
  {
    id: "upenn-general",
    schoolId: 6,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "宾大招生官介绍四所学院（文理、工程、沃顿、护理）的申请流程和学术特色。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.upenn.edu/visit/virtual-visits",
    isRolling: true,
  },
  {
    id: "upenn-wharton",
    schoolId: 6,
    title: "Wharton School Virtual Info Session",
    type: "Up Close / Specialty",
    description: "专为有意申请沃顿商学院的学生设计，深度介绍本科商科项目和招生标准。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.upenn.edu/visit/virtual-visits",
    isRolling: true,
  },

  // Duke
  {
    id: "duke-general",
    schoolId: 8,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "杜克招生官介绍学术项目、校园生活和申请流程，含在校生 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.duke.edu/visit/virtual-visits/",
    isRolling: true,
  },

  // Brown
  {
    id: "brown-general",
    schoolId: 9,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "布朗招生官介绍开放课程体系（Open Curriculum）和申请流程，含 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.brown.edu/visit/virtual-visit",
    isRolling: true,
  },

  // JHU
  {
    id: "jhu-general",
    schoolId: 10,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "约翰霍普金斯招生官介绍本科研究机会、医学预科路径和申请流程。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://apply.jhu.edu/visit/virtual-visits/",
    isRolling: true,
  },

  // Northwestern
  {
    id: "northwestern-general",
    schoolId: 11,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "西北大学招生官介绍各学院特色、Quarter 学制和芝加哥地区优势，含 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.northwestern.edu/visit/virtual-visits/",
    isRolling: true,
  },

  // Dartmouth
  {
    id: "dartmouth-general",
    schoolId: 12,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "达特茅斯招生官介绍 D-Plan 学期制、本科研究机会和申请流程。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.dartmouth.edu/visit/virtual-visits",
    isRolling: true,
  },

  // Vanderbilt
  {
    id: "vanderbilt-general",
    schoolId: 13,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "范德堡招生官介绍奖学金政策（无贷款）、学术项目和纳什维尔城市优势。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.vanderbilt.edu/visit/virtual/",
    isRolling: true,
  },

  // Rice
  {
    id: "rice-general",
    schoolId: 14,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "莱斯大学招生官介绍住宿学院制度、奖学金政策和休斯顿医疗中心机会。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.rice.edu/visit/virtual-visits",
    isRolling: true,
  },

  // WashU
  {
    id: "washu-general",
    schoolId: 15,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "华盛顿大学圣路易斯分校招生官介绍各学院特色和申请流程。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.wustl.edu/visit/virtual-visits/",
    isRolling: true,
  },

  // Cornell
  {
    id: "cornell-general",
    schoolId: 16,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "康奈尔大学招生官介绍七所学院的申请流程和学术特色，含 Q&A。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admissions.cornell.edu/visit/virtual-visits",
    isRolling: true,
  },

  // Georgetown
  {
    id: "georgetown-general",
    schoolId: 20,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "乔治城大学招生官介绍各学院（外交、商学、文理、护理）的申请流程和华盛顿 D.C. 优势。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://uadmissions.georgetown.edu/visit/virtual-visits/",
    isRolling: true,
  },

  // CMU
  {
    id: "cmu-general",
    schoolId: 23,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "CMU 招生官介绍计算机科学、工程和艺术等各学院的申请流程和项目特色。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.cmu.edu/visit/virtual-visits.html",
    isRolling: true,
  },

  // Williams
  {
    id: "williams-general",
    schoolId: 51,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "威廉姆斯学院招生官介绍小班教学理念、奖学金政策和申请流程。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://admission.williams.edu/visit/virtual/",
    isRolling: true,
  },

  // Amherst
  {
    id: "amherst-general",
    schoolId: 52,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "阿默斯特学院招生官介绍开放课程体系、五校联盟资源和奖学金政策。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://www.amherst.edu/admission/visit/virtual",
    isRolling: true,
  },

  // Swarthmore
  {
    id: "swarthmore-general",
    schoolId: 53,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "斯沃斯莫尔学院招生官介绍贵格会传统、工程专业和奖学金政策。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://www.swarthmore.edu/admissions-aid/virtual-visits",
    isRolling: true,
  },

  // Pomona
  {
    id: "pomona-general",
    schoolId: 54,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "波莫纳学院招生官介绍克莱蒙特联合学院资源、奖学金政策和加州生活。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://www.pomona.edu/admissions/visit/virtual",
    isRolling: true,
  },

  // Wellesley
  {
    id: "wellesley-general",
    schoolId: 55,
    title: "Virtual Information Session",
    type: "General Info Session",
    description: "韦尔斯利学院招生官介绍女子学院特色、MIT 交换项目和奖学金政策。",
    dates: null,
    time: "多时段可选",
    duration: "60 min",
    registrationUrl: "https://www.wellesley.edu/admission/visit/virtual",
    isRolling: true,
  },

  // Multi-college: Discovering U
  {
    id: "discovering-u",
    schoolId: 5, // Yale is the anchor
    title: "Discovering U: Columbia · UChicago · UMich · UT Austin · Yale",
    type: "Multi-College Session",
    description: "五所顶尖大学联合宣讲，一场活动了解五所学校的学术特色和申请流程。",
    dates: ["2026-03-26", "2026-04-09"],
    time: "7:00 PM ET",
    duration: "90 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
    partnerSchools: ["Columbia", "UChicago", "UMich", "UT Austin"],
  },

  // STORY multi-college
  {
    id: "story-rural",
    schoolId: 5,
    title: "STORY: Barnard · Colorado College · Rice · Tufts · Yale 联合宣讲",
    type: "Multi-College Session",
    description: "面向来自小城镇和农村地区学生的专场联合宣讲，五所学校招生官联合出席。",
    dates: ["2026-03-15", "2026-03-22"],
    time: "7:00 PM ET",
    duration: "75 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
    partnerSchools: ["Barnard", "Colorado College", "Rice", "Tufts"],
  },
];

// ===== International Schools =====
export const intlSchools: School[] = [
  // ── UK: Russell Group Top 10 ──
  { id: 101, name: "University of Oxford", shortName: "Oxford", type: "Research University", region: "UK", rank: 1, qsRank: 3, location: "Oxford, England", state: "England", color: "#002147", registrationPage: "https://www.ox.ac.uk/admissions/undergraduate/increasing-access/events-calendar", admissionPage: "https://www.ox.ac.uk/admissions/undergraduate", tags: ["Russell Group", "World Top 5"] },
  { id: 102, name: "University of Cambridge", shortName: "Cambridge", type: "Research University", region: "UK", rank: 2, qsRank: 5, location: "Cambridge, England", state: "England", color: "#003B71", registrationPage: "https://www.undergraduate.study.cam.ac.uk/events", admissionPage: "https://www.undergraduate.study.cam.ac.uk/", tags: ["Russell Group", "World Top 5"] },
  { id: 103, name: "Imperial College London", shortName: "Imperial", type: "Research University", region: "UK", rank: 3, qsRank: 8, location: "London, England", state: "England", color: "#003E74", registrationPage: "https://www.imperial.ac.uk/study/visit/undergraduate/open-days/", admissionPage: "https://www.imperial.ac.uk/study/undergraduate/", tags: ["Russell Group", "STEM Focus"] },
  { id: 104, name: "University College London", shortName: "UCL", type: "Research University", region: "UK", rank: 4, qsRank: 9, location: "London, England", state: "England", color: "#500778", registrationPage: "https://www.ucl.ac.uk/prospective-students/undergraduate/events-and-open-days", admissionPage: "https://www.ucl.ac.uk/prospective-students/undergraduate/degrees", tags: ["Russell Group", "London"] },
  { id: 105, name: "London School of Economics", shortName: "LSE", type: "Research University", region: "UK", rank: 5, qsRank: 49, location: "London, England", state: "England", color: "#D32011", registrationPage: "https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/Virtual-undergraduate-open-day/virtual-online-events", admissionPage: "https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply", tags: ["Russell Group", "Social Sciences"] },
  { id: 106, name: "University of Edinburgh", shortName: "Edinburgh", type: "Research University", region: "UK", rank: 6, qsRank: 27, location: "Edinburgh, Scotland", state: "Scotland", color: "#041E42", registrationPage: "https://study.ed.ac.uk/undergraduate/open-days-events-visits/online-information-sessions", admissionPage: "https://study.ed.ac.uk/undergraduate", tags: ["Russell Group", "Scotland"] },
  { id: 107, name: "University of Manchester", shortName: "UoM", type: "Research University", region: "UK", rank: 7, qsRank: 34, location: "Manchester, England", state: "England", color: "#660099", registrationPage: "https://www.manchester.ac.uk/study/undergraduate/open-days-visits/virtual/", admissionPage: "https://www.manchester.ac.uk/study/undergraduate/applying/", tags: ["Russell Group"] },
  { id: 108, name: "King's College London", shortName: "KCL", type: "Research University", region: "UK", rank: 8, qsRank: 40, location: "London, England", state: "England", color: "#1E3A5F", registrationPage: "https://www.kcl.ac.uk/study/undergraduate/events", admissionPage: "https://www.kcl.ac.uk/study/undergraduate/how-to-apply", tags: ["Russell Group", "London"] },
  { id: 109, name: "University of Bristol", shortName: "Bristol", type: "Research University", region: "UK", rank: 9, qsRank: 54, location: "Bristol, England", state: "England", color: "#B01C2E", registrationPage: "https://www.bristol.ac.uk/study/virtual-bristol/undergraduate/", admissionPage: "https://www.bristol.ac.uk/study/undergraduate/", tags: ["Russell Group"] },
  { id: 110, name: "University of Warwick", shortName: "Warwick", type: "Research University", region: "UK", rank: 10, qsRank: 69, location: "Coventry, England", state: "England", color: "#5C2D91", registrationPage: "https://warwick.ac.uk/study/undergraduate/opendays/virtual/", admissionPage: "https://warwick.ac.uk/study/undergraduate/apply/", tags: ["Russell Group"] },
  // ── Hong Kong: Top 5 ──
  { id: 201, name: "University of Hong Kong", shortName: "HKU", type: "Research University", region: "HK", rank: 1, qsRank: 17, location: "Pokfulam, Hong Kong", state: "HK", color: "#006B3C", registrationPage: "https://admissions.hku.hk/events", admissionPage: "https://admissions.hku.hk/", tags: ["QS Top 30", "English-medium"] },
  { id: 202, name: "Hong Kong University of Science and Technology", shortName: "HKUST", type: "Research University", region: "HK", rank: 2, qsRank: 47, location: "Clear Water Bay, Hong Kong", state: "HK", color: "#003D7C", registrationPage: "https://join.hkust.edu.hk/whats-on", admissionPage: "https://join.hkust.edu.hk/", tags: ["QS Top 50", "STEM Focus"] },
  { id: 203, name: "Chinese University of Hong Kong", shortName: "CUHK", type: "Research University", region: "HK", rank: 3, qsRank: 36, location: "Sha Tin, Hong Kong", state: "HK", color: "#6B0D0D", registrationPage: "https://admission.cuhk.edu.hk/news-and-events", admissionPage: "https://admission.cuhk.edu.hk/", tags: ["QS Top 50"] },
  { id: 204, name: "City University of Hong Kong", shortName: "CityU", type: "Comprehensive University", region: "HK", rank: 4, qsRank: 62, location: "Kowloon Tong, Hong Kong", state: "HK", color: "#006F51", registrationPage: "https://www.cityu.edu.hk/admo/", admissionPage: "https://www.cityu.edu.hk/admo/", tags: ["QS Top 100"] },
  { id: 205, name: "Hong Kong Polytechnic University", shortName: "PolyU", type: "Comprehensive University", region: "HK", rank: 5, qsRank: 57, location: "Hung Hom, Hong Kong", state: "HK", color: "#8B0000", registrationPage: "https://www.polyu.edu.hk/study/events/", admissionPage: "https://www.polyu.edu.hk/study/ug", tags: ["QS Top 100"] },
  // ── Australia: Group of Eight ──
  { id: 301, name: "University of Melbourne", shortName: "UniMelb", type: "Research University", region: "AU", rank: 1, qsRank: 13, location: "Melbourne, VIC", state: "VIC", color: "#003087", registrationPage: "https://study.unimelb.edu.au/connect-with-us/events", admissionPage: "https://study.unimelb.edu.au/how-to-apply", tags: ["Group of Eight", "QS Top 50"] },
  { id: 302, name: "University of Sydney", shortName: "USYD", type: "Research University", region: "AU", rank: 2, qsRank: 18, location: "Sydney, NSW", state: "NSW", color: "#002147", registrationPage: "https://www.sydney.edu.au/study/events-for-prospective-students/undergraduate.html", admissionPage: "https://www.sydney.edu.au/study/how-to-apply/undergraduate-courses.html", tags: ["Group of Eight"] },
  { id: 303, name: "Australian National University", shortName: "ANU", type: "Research University", region: "AU", rank: 3, qsRank: 30, location: "Canberra, ACT", state: "ACT", color: "#1B3A6B", registrationPage: "https://www.anu.edu.au/study/study-experience/open-day", admissionPage: "https://study.anu.edu.au/apply", tags: ["Group of Eight"] },
  { id: 304, name: "University of Queensland", shortName: "UQ", type: "Research University", region: "AU", rank: 4, qsRank: 40, location: "Brisbane, QLD", state: "QLD", color: "#4E2A84", registrationPage: "https://study.uq.edu.au/events", admissionPage: "https://study.uq.edu.au/admissions", tags: ["Group of Eight"] },
  { id: 305, name: "University of New South Wales", shortName: "UNSW", type: "Research University", region: "AU", rank: 5, qsRank: 19, location: "Sydney, NSW", state: "NSW", color: "#FFD100", registrationPage: "https://www.unsw.edu.au/study/events/undergraduate", admissionPage: "https://www.unsw.edu.au/study/how-to-apply/undergraduate/admissions", tags: ["Group of Eight", "STEM Focus"] },
  { id: 306, name: "Monash University", shortName: "Monash", type: "Research University", region: "AU", rank: 6, qsRank: 37, location: "Melbourne, VIC", state: "VIC", color: "#006DAE", registrationPage: "https://www.monash.edu/discover/events", admissionPage: "https://www.monash.edu/study/how-to-apply", tags: ["Group of Eight"] },
  { id: 307, name: "University of Western Australia", shortName: "UWA", type: "Research University", region: "AU", rank: 7, qsRank: 72, location: "Perth, WA", state: "WA", color: "#003087", registrationPage: "https://www.uwa.edu.au/study/EVENTS", admissionPage: "https://www.uwa.edu.au/study/how-to-apply/undergraduate", tags: ["Group of Eight"] },
  { id: 308, name: "University of Adelaide", shortName: "Adelaide", type: "Research University", region: "AU", rank: 8, qsRank: 82, location: "Adelaide, SA", state: "SA", color: "#005A9C", registrationPage: "https://www.adelaide.edu.au/study/events", admissionPage: "https://www.adelaide.edu.au/study/undergraduate", tags: ["Group of Eight"] },
];

// Merge all schools
export const allSchools: School[] = [...schools, ...intlSchools];

// Sessions for international schools
export const intlSessions: Session[] = [
  // ── UK Sessions ──
  { id: "oxford-events", schoolId: 101, title: "Oxford Undergraduate Events", type: "General Info Session", description: "牛津大学招生活动，包含在线开放日、学科讲座和申请指导，部分场次可在线参与。", dates: ["2026-03-02", "2026-04-15", "2026-06-20"], time: "varies (GMT)", duration: "60-120 min", registrationUrl: "https://www.ox.ac.uk/admissions/undergraduate/increasing-access/events-calendar", isRolling: false },
  { id: "cambridge-events", schoolId: 102, title: "Cambridge Undergraduate Events", type: "General Info Session", description: "剑桥大学本科招生活动，包含在线开放日、学院参观和申请工作坊。", dates: ["2026-03-01", "2026-07-09", "2026-07-10"], time: "varies (GMT)", duration: "varies", registrationUrl: "https://www.undergraduate.study.cam.ac.uk/events", isRolling: false },
  { id: "lse-virtual", schoolId: 105, title: "LSE Virtual Undergraduate Open Day", type: "General Info Session", description: "伦敦政经学院虚拟开放日，招生官介绍各专业课程、奖学金和学生生活。", dates: ["2026-03-10", "2026-04-07"], time: "varies (GMT)", duration: "varies", registrationUrl: "https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/Virtual-undergraduate-open-day/virtual-online-events", isRolling: false },
  { id: "manchester-virtual", schoolId: 107, title: "Manchester Virtual Open Day", type: "General Info Session", description: "曼彻斯特大学虚拟开放日，了解专业设置、校园生活和申请流程。", dates: ["2026-04-20", "2026-07-06"], time: "varies (GMT)", duration: "varies", registrationUrl: "https://www.manchester.ac.uk/study/undergraduate/open-days-visits/virtual/", isRolling: false },
  { id: "bristol-webinars", schoolId: 109, title: "Bristol Undergraduate Webinars", type: "General Info Session", description: "布里斯托大学系列线上宣讲，涵盖学生生活、住宿和学费资助，每场约45分钟。", dates: ["2026-03-26", "2026-04-22", "2026-04-30"], time: "5:00 PM GMT", duration: "45 min", registrationUrl: "https://www.bristol.ac.uk/study/virtual-bristol/undergraduate/", isRolling: false },
  // UK Rolling
  { id: "ucl-ondemand", schoolId: 104, title: "UCL On-Demand Virtual Events", type: "General Info Session", description: "UCL 提供 31 场按需观看的虚拟活动，涵盖各学院专业介绍、申请指导和学生生活。", dates: null, time: "随时可看", duration: "varies", registrationUrl: "https://www.ucl.ac.uk/prospective-students/undergraduate/events-and-open-days", isRolling: true },
  { id: "edinburgh-online", schoolId: 106, title: "Edinburgh Online Information Sessions", type: "General Info Session", description: "爱丁堡大学在线信息宣讲，招生官介绍苏格兰大学体系、专业选择和申请要求。", dates: null, time: "多时段可选", duration: "60 min", registrationUrl: "https://study.ed.ac.uk/undergraduate/open-days-events-visits/online-information-sessions", isRolling: true },
  // ── HK Sessions ──
  { id: "hku-events", schoolId: 201, title: "HKU Admissions Events", type: "General Info Session", description: "香港大学招生活动，包含学生大使在线分享系列和本科招生信息日，适合国际申请者。", dates: ["2026-03-15", "2026-04-20", "2026-05-11"], time: "varies (HKT)", duration: "varies", registrationUrl: "https://admissions.hku.hk/events", isRolling: false },
  { id: "hkust-webinars", schoolId: 202, title: "HKUST Programs Showcase Webinars", type: "General Info Session", description: "香港科技大学专业展示宣讲，招生官介绍工程、商科、理学和人文学科的课程特色。", dates: null, time: "多时段可选", duration: "60 min", registrationUrl: "https://join.hkust.edu.hk/whats-on", isRolling: true },
  { id: "cuhk-events", schoolId: 203, title: "CUHK Admissions Events", type: "General Info Session", description: "香港中文大学招生活动，了解本科课程、书院制度和国际学生申请流程。", dates: null, time: "多时段可选", duration: "varies", registrationUrl: "https://admission.cuhk.edu.hk/news-and-events", isRolling: true },
  // ── AU Sessions ──
  { id: "unsw-events", schoolId: 305, title: "UNSW Undergraduate Info Sessions", type: "General Info Session", description: "新南威尔士大学本科招生信息宣讲，招生官介绍工程、商科、法学和医学课程。", dates: ["2026-03-11", "2026-03-31", "2026-04-22", "2026-05-06", "2026-05-20"], time: "varies (AEDT)", duration: "60 min", registrationUrl: "https://www.unsw.edu.au/study/events/undergraduate", isRolling: false },
  { id: "monash-events", schoolId: 306, title: "Monash University Info Sessions", type: "General Info Session", description: "莫纳什大学招生信息宣讲，介绍本科课程、奖学金和国际学生支持服务。", dates: ["2026-03-03", "2026-03-18", "2026-04-14", "2026-05-05", "2026-05-12"], time: "varies (AEDT)", duration: "60 min", registrationUrl: "https://www.monash.edu/discover/events", isRolling: false },
  { id: "unimelb-events", schoolId: 301, title: "UniMelb Connect Events", type: "General Info Session", description: "墨尔本大学招生联络活动，包含在线信息宣讲和学科深度讲座，适合国际申请者。", dates: null, time: "多时段可选", duration: "varies", registrationUrl: "https://study.unimelb.edu.au/connect-with-us/events", isRolling: true },
  { id: "usyd-events", schoolId: 302, title: "USYD Prospective Student Events", type: "General Info Session", description: "悉尼大学准学生活动，了解本科课程、校园生活和国际学生申请要求。", dates: null, time: "多时段可选", duration: "varies", registrationUrl: "https://www.sydney.edu.au/study/events-for-prospective-students/undergraduate.html", isRolling: true },
];

// Merge all sessions
export const allSessions: Session[] = [...sessions, ...intlSessions];

export const schoolsMap = Object.fromEntries(allSchools.map((s) => [s.id, s]));

export const allSessionTypes: SessionType[] = [
  "General Info Session",
  "Up Close / Specialty",
  "Multi-College Session",
  "Regional Session",
  "Student Forum",
  "Financial Aid Session",
  "International Student Session",
];

export const sessionTypeColors: Record<SessionType, string> = {
  "General Info Session": "bg-teal-100 text-teal-800 border-teal-200",
  "Up Close / Specialty": "bg-amber-100 text-amber-800 border-amber-200",
  "Multi-College Session": "bg-violet-100 text-violet-800 border-violet-200",
  "Regional Session": "bg-sky-100 text-sky-800 border-sky-200",
  "Student Forum": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Financial Aid Session": "bg-orange-100 text-orange-800 border-orange-200",
  "International Student Session": "bg-rose-100 text-rose-800 border-rose-200",
};
