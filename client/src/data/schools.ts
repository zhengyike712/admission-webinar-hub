// ============================================================
// Design Philosophy: Academic Archive × Event Calendar
// - Core unit: Session (a scheduled virtual event with AO)
// - Each school has a registration page URL for its sessions
// - Session types: General Info Session, Up Close, Multi-College, Regional, Student Forum
// ============================================================

export type SchoolType = "National University" | "Liberal Arts College";

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
  rank: number;
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
    id: 1, name: "Princeton University", type: "National University", rank: 1,
    location: "Princeton, NJ", state: "NJ", color: "#E87722",
    registrationPage: "https://apply.princeton.edu/portal/virtual_information_session",
    admissionPage: "https://admission.princeton.edu",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 2, name: "Massachusetts Institute of Technology", shortName: "MIT",
    type: "National University", rank: 2,
    location: "Cambridge, MA", state: "MA", color: "#A31F34",
    registrationPage: "https://mitadmissions.org/apply/visit/",
    admissionPage: "https://mitadmissions.org",
    tags: ["STEM", "Ivy-equivalent"],
  },
  {
    id: 3, name: "Harvard University", type: "National University", rank: 3,
    location: "Cambridge, MA", state: "MA", color: "#A51C30",
    registrationPage: "https://college.harvard.edu/admissions/explore-harvard/meet-us-online",
    admissionPage: "https://college.harvard.edu/admissions",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 4, name: "Stanford University", type: "National University", rank: 4,
    location: "Stanford, CA", state: "CA", color: "#8C1515",
    registrationPage: "https://admission.stanford.edu/events/",
    admissionPage: "https://admission.stanford.edu",
    tags: ["Silicon Valley", "No Loan Policy"],
  },
  {
    id: 5, name: "Yale University", type: "National University", rank: 5,
    location: "New Haven, CT", state: "CT", color: "#00356B",
    registrationPage: "https://admissions.yale.edu/virtual-events",
    admissionPage: "https://admissions.yale.edu",
    tags: ["Ivy League", "No Loan Policy"],
  },
  {
    id: 6, name: "University of Pennsylvania", shortName: "UPenn",
    type: "National University", rank: 6,
    location: "Philadelphia, PA", state: "PA", color: "#011F5B",
    registrationPage: "https://admissions.upenn.edu/visit/virtual-visits",
    admissionPage: "https://admissions.upenn.edu",
    tags: ["Ivy League", "Business"],
  },
  {
    id: 7, name: "California Institute of Technology", shortName: "Caltech",
    type: "National University", rank: 7,
    location: "Pasadena, CA", state: "CA", color: "#FF6C0C",
    registrationPage: "https://admissions.caltech.edu/connect/events",
    admissionPage: "https://admissions.caltech.edu",
    tags: ["STEM", "Research"],
  },
  {
    id: 8, name: "Duke University", type: "National University", rank: 8,
    location: "Durham, NC", state: "NC", color: "#003087",
    registrationPage: "https://admissions.duke.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.duke.edu",
    tags: ["Pre-Med", "Public Policy"],
  },
  {
    id: 9, name: "Brown University", type: "National University", rank: 9,
    location: "Providence, RI", state: "RI", color: "#4E3629",
    registrationPage: "https://admission.brown.edu/visit/virtual-visit",
    admissionPage: "https://admission.brown.edu",
    tags: ["Ivy League", "Open Curriculum"],
  },
  {
    id: 10, name: "Johns Hopkins University", shortName: "JHU",
    type: "National University", rank: 10,
    location: "Baltimore, MD", state: "MD", color: "#002D72",
    registrationPage: "https://apply.jhu.edu/visit/virtual-visits/",
    admissionPage: "https://apply.jhu.edu",
    tags: ["Pre-Med", "Research"],
  },
  {
    id: 11, name: "Northwestern University", type: "National University", rank: 11,
    location: "Evanston, IL", state: "IL", color: "#4E2A84",
    registrationPage: "https://admission.northwestern.edu/visit/virtual-visits/",
    admissionPage: "https://admission.northwestern.edu",
    tags: ["Journalism", "Business"],
  },
  {
    id: 12, name: "Dartmouth College", type: "National University", rank: 12,
    location: "Hanover, NH", state: "NH", color: "#00693E",
    registrationPage: "https://admissions.dartmouth.edu/visit/virtual-visits",
    admissionPage: "https://admissions.dartmouth.edu",
    tags: ["Ivy League", "D-Plan"],
  },
  {
    id: 13, name: "Vanderbilt University", type: "National University", rank: 13,
    location: "Nashville, TN", state: "TN", color: "#866D4B",
    registrationPage: "https://admissions.vanderbilt.edu/visit/virtual/",
    admissionPage: "https://admissions.vanderbilt.edu",
    tags: ["No Loan Policy", "Nashville"],
  },
  {
    id: 14, name: "Rice University", type: "National University", rank: 14,
    location: "Houston, TX", state: "TX", color: "#00205B",
    registrationPage: "https://admission.rice.edu/visit/virtual-visits",
    admissionPage: "https://admission.rice.edu",
    tags: ["Residential College", "No Loan Policy"],
  },
  {
    id: 15, name: "Washington University in St. Louis", shortName: "WashU",
    type: "National University", rank: 15,
    location: "St. Louis, MO", state: "MO", color: "#A51417",
    registrationPage: "https://admissions.wustl.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.wustl.edu",
    tags: ["Pre-Med", "Business"],
  },
  {
    id: 16, name: "Cornell University", type: "National University", rank: 16,
    location: "Ithaca, NY", state: "NY", color: "#B31B1B",
    registrationPage: "https://admissions.cornell.edu/visit/virtual-visits",
    admissionPage: "https://admissions.cornell.edu",
    tags: ["Ivy League", "Engineering"],
  },
  {
    id: 17, name: "University of Notre Dame", type: "National University", rank: 17,
    location: "Notre Dame, IN", state: "IN", color: "#0C2340",
    registrationPage: "https://admissions.nd.edu/visit/virtual/",
    admissionPage: "https://admissions.nd.edu",
    tags: ["Catholic", "Business"],
  },
  {
    id: 18, name: "UCLA", type: "National University", rank: 18,
    location: "Los Angeles, CA", state: "CA", color: "#2774AE",
    registrationPage: "https://admission.ucla.edu/visit/virtual-visits",
    admissionPage: "https://admission.ucla.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 19, name: "Emory University", type: "National University", rank: 19,
    location: "Atlanta, GA", state: "GA", color: "#012169",
    registrationPage: "https://apply.emory.edu/visit/virtual.php",
    admissionPage: "https://apply.emory.edu",
    tags: ["Pre-Med", "Public Health"],
  },
  {
    id: 20, name: "Georgetown University", type: "National University", rank: 20,
    location: "Washington, D.C.", state: "DC", color: "#041E42",
    registrationPage: "https://uadmissions.georgetown.edu/visit/virtual-visits/",
    admissionPage: "https://uadmissions.georgetown.edu",
    tags: ["Jesuit", "International Relations"],
  },
  {
    id: 21, name: "UC Berkeley", type: "National University", rank: 21,
    location: "Berkeley, CA", state: "CA", color: "#003262",
    registrationPage: "https://admissions.berkeley.edu/visit/events/",
    admissionPage: "https://admissions.berkeley.edu",
    tags: ["Public", "UC System", "STEM"],
  },
  {
    id: 22, name: "University of Michigan", shortName: "UMich",
    type: "National University", rank: 22,
    location: "Ann Arbor, MI", state: "MI", color: "#00274C",
    registrationPage: "https://admissions.umich.edu/visit/virtual-visits",
    admissionPage: "https://admissions.umich.edu",
    tags: ["Public", "Business", "Engineering"],
  },
  {
    id: 23, name: "Carnegie Mellon University", shortName: "CMU",
    type: "National University", rank: 23,
    location: "Pittsburgh, PA", state: "PA", color: "#C41230",
    registrationPage: "https://admission.cmu.edu/visit/virtual-visits.html",
    admissionPage: "https://admission.cmu.edu",
    tags: ["CS", "Engineering"],
  },
  {
    id: 24, name: "University of Virginia", shortName: "UVA",
    type: "National University", rank: 24,
    location: "Charlottesville, VA", state: "VA", color: "#232D4B",
    registrationPage: "https://admission.virginia.edu/visit/virtual",
    admissionPage: "https://admission.virginia.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 25, name: "University of North Carolina", shortName: "UNC",
    type: "National University", rank: 25,
    location: "Chapel Hill, NC", state: "NC", color: "#4B9CD3",
    registrationPage: "https://admissions.unc.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.unc.edu",
    tags: ["Public", "Journalism"],
  },
  {
    id: 26, name: "Wake Forest University", type: "National University", rank: 26,
    location: "Winston-Salem, NC", state: "NC", color: "#9E7E38",
    registrationPage: "https://admissions.wfu.edu/visit/virtual/",
    admissionPage: "https://admissions.wfu.edu",
    tags: ["Test Optional", "Business"],
  },
  {
    id: 27, name: "Tufts University", type: "National University", rank: 27,
    location: "Medford, MA", state: "MA", color: "#3E8EDE",
    registrationPage: "https://admissions.tufts.edu/visit/virtual-visits/",
    admissionPage: "https://admissions.tufts.edu",
    tags: ["International Relations"],
  },
  {
    id: 28, name: "University of Florida", shortName: "UF",
    type: "National University", rank: 28,
    location: "Gainesville, FL", state: "FL", color: "#0021A5",
    registrationPage: "https://admissions.ufl.edu/visit/virtual/",
    admissionPage: "https://admissions.ufl.edu",
    tags: ["Public", "Honors"],
  },
  {
    id: 29, name: "University of Southern California", shortName: "USC",
    type: "National University", rank: 29,
    location: "Los Angeles, CA", state: "CA", color: "#990000",
    registrationPage: "https://admission.usc.edu/visit/virtual-visits/",
    admissionPage: "https://admission.usc.edu",
    tags: ["Film", "Business"],
  },
  {
    id: 30, name: "New York University", shortName: "NYU",
    type: "National University", rank: 30,
    location: "New York, NY", state: "NY", color: "#57068C",
    registrationPage: "https://www.nyu.edu/admissions/undergraduate-admissions/visit-nyu/virtual-visits.html",
    admissionPage: "https://www.nyu.edu/admissions/undergraduate-admissions.html",
    tags: ["Urban", "Arts"],
  },
  {
    id: 31, name: "Boston College", shortName: "BC",
    type: "National University", rank: 31,
    location: "Chestnut Hill, MA", state: "MA", color: "#8A0000",
    registrationPage: "https://www.bc.edu/bc-web/admission/visit/virtual.html",
    admissionPage: "https://www.bc.edu/bc-web/admission.html",
    tags: ["Jesuit", "Business"],
  },
  {
    id: 32, name: "Georgia Institute of Technology", shortName: "Georgia Tech",
    type: "National University", rank: 32,
    location: "Atlanta, GA", state: "GA", color: "#B3A369",
    registrationPage: "https://admission.gatech.edu/visit/virtual",
    admissionPage: "https://admission.gatech.edu",
    tags: ["STEM", "Engineering", "CS"],
  },
  {
    id: 33, name: "University of Texas at Austin", shortName: "UT Austin",
    type: "National University", rank: 33,
    location: "Austin, TX", state: "TX", color: "#BF5700",
    registrationPage: "https://admissions.utexas.edu/visit/virtual",
    admissionPage: "https://admissions.utexas.edu",
    tags: ["Public", "Business"],
  },
  {
    id: 34, name: "University of Wisconsin-Madison", shortName: "UW-Madison",
    type: "National University", rank: 34,
    location: "Madison, WI", state: "WI", color: "#C5050C",
    registrationPage: "https://admissions.wisc.edu/visit/virtual/",
    admissionPage: "https://admissions.wisc.edu",
    tags: ["Public", "Research"],
  },
  {
    id: 35, name: "Tulane University", type: "National University", rank: 35,
    location: "New Orleans, LA", state: "LA", color: "#006747",
    registrationPage: "https://admission.tulane.edu/visit/virtual",
    admissionPage: "https://admission.tulane.edu",
    tags: ["New Orleans", "Public Health"],
  },
  {
    id: 36, name: "Boston University", shortName: "BU",
    type: "National University", rank: 36,
    location: "Boston, MA", state: "MA", color: "#CC0000",
    registrationPage: "https://www.bu.edu/admissions/visit/virtual/",
    admissionPage: "https://www.bu.edu/admissions/",
    tags: ["Urban", "Research"],
  },
  {
    id: 37, name: "Purdue University", type: "National University", rank: 37,
    location: "West Lafayette, IN", state: "IN", color: "#CEB888",
    registrationPage: "https://www.admissions.purdue.edu/visit/virtual.php",
    admissionPage: "https://www.admissions.purdue.edu",
    tags: ["Engineering", "Agriculture"],
  },
  {
    id: 38, name: "Ohio State University", shortName: "OSU",
    type: "National University", rank: 38,
    location: "Columbus, OH", state: "OH", color: "#BB0000",
    registrationPage: "https://undergrad.osu.edu/visit/virtual",
    admissionPage: "https://undergrad.osu.edu/apply",
    tags: ["Public", "Big Ten"],
  },
  {
    id: 39, name: "Penn State University", shortName: "Penn State",
    type: "National University", rank: 39,
    location: "University Park, PA", state: "PA", color: "#1E407C",
    registrationPage: "https://admissions.psu.edu/visit/virtual/",
    admissionPage: "https://admissions.psu.edu",
    tags: ["Public", "Big Ten"],
  },
  {
    id: 40, name: "University of Illinois Urbana-Champaign", shortName: "UIUC",
    type: "National University", rank: 40,
    location: "Champaign, IL", state: "IL", color: "#13294B",
    registrationPage: "https://admissions.illinois.edu/Visit/virtual",
    admissionPage: "https://admissions.illinois.edu",
    tags: ["CS", "Engineering"],
  },
  {
    id: 41, name: "University of Washington", shortName: "UW",
    type: "National University", rank: 41,
    location: "Seattle, WA", state: "WA", color: "#4B2E83",
    registrationPage: "https://admit.uw.edu/visit/virtual/",
    admissionPage: "https://admit.uw.edu",
    tags: ["Public", "CS"],
  },
  {
    id: 42, name: "Villanova University", type: "National University", rank: 42,
    location: "Villanova, PA", state: "PA", color: "#00205B",
    registrationPage: "https://www1.villanova.edu/university/undergraduate-admission/visit/virtual.html",
    admissionPage: "https://www1.villanova.edu/university/undergraduate-admission.html",
    tags: ["Augustinian", "Business"],
  },
  {
    id: 43, name: "Lehigh University", type: "National University", rank: 43,
    location: "Bethlehem, PA", state: "PA", color: "#653700",
    registrationPage: "https://admissions.lehigh.edu/visit/virtual",
    admissionPage: "https://admissions.lehigh.edu",
    tags: ["Engineering", "Business"],
  },
  {
    id: 44, name: "Northeastern University", type: "National University", rank: 44,
    location: "Boston, MA", state: "MA", color: "#CC0000",
    registrationPage: "https://admissions.northeastern.edu/visit/virtual/",
    admissionPage: "https://admissions.northeastern.edu",
    tags: ["Co-op", "CS"],
  },
  {
    id: 45, name: "UC San Diego", shortName: "UCSD",
    type: "National University", rank: 45,
    location: "La Jolla, CA", state: "CA", color: "#00629B",
    registrationPage: "https://admissions.ucsd.edu/visit/virtual.html",
    admissionPage: "https://admissions.ucsd.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 46, name: "UC Davis", type: "National University", rank: 46,
    location: "Davis, CA", state: "CA", color: "#002855",
    registrationPage: "https://admissions.ucdavis.edu/visit/virtual",
    admissionPage: "https://admissions.ucdavis.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 47, name: "UC Santa Barbara", shortName: "UCSB",
    type: "National University", rank: 47,
    location: "Santa Barbara, CA", state: "CA", color: "#003660",
    registrationPage: "https://admissions.ucsb.edu/visit/virtual",
    admissionPage: "https://admissions.ucsb.edu",
    tags: ["Public", "UC System"],
  },
  {
    id: 48, name: "Case Western Reserve University", shortName: "Case Western",
    type: "National University", rank: 48,
    location: "Cleveland, OH", state: "OH", color: "#0A304E",
    registrationPage: "https://case.edu/admission/undergraduate/visit/virtual",
    admissionPage: "https://case.edu/admission/undergraduate",
    tags: ["Pre-Med", "Engineering"],
  },
  {
    id: 49, name: "University of Rochester", type: "National University", rank: 49,
    location: "Rochester, NY", state: "NY", color: "#003B71",
    registrationPage: "https://enrollment.rochester.edu/admissions/visit/virtual/",
    admissionPage: "https://enrollment.rochester.edu/admissions/",
    tags: ["Music", "Optics"],
  },
  {
    id: 50, name: "Rensselaer Polytechnic Institute", shortName: "RPI",
    type: "National University", rank: 50,
    location: "Troy, NY", state: "NY", color: "#D6001C",
    registrationPage: "https://admissions.rpi.edu/visit/virtual",
    admissionPage: "https://admissions.rpi.edu",
    tags: ["Engineering", "STEM"],
  },

  // ===== Liberal Arts Colleges Top 30 =====
  {
    id: 51, name: "Williams College", type: "Liberal Arts College", rank: 1,
    location: "Williamstown, MA", state: "MA", color: "#512698",
    registrationPage: "https://admission.williams.edu/visit/virtual/",
    admissionPage: "https://admission.williams.edu",
    tags: ["No Loan Policy", "Small Class"],
  },
  {
    id: 52, name: "Amherst College", type: "Liberal Arts College", rank: 2,
    location: "Amherst, MA", state: "MA", color: "#3F1F69",
    registrationPage: "https://www.amherst.edu/admission/visit/virtual",
    admissionPage: "https://www.amherst.edu/admission",
    tags: ["No Loan Policy", "Open Curriculum"],
  },
  {
    id: 53, name: "Swarthmore College", type: "Liberal Arts College", rank: 3,
    location: "Swarthmore, PA", state: "PA", color: "#8C1515",
    registrationPage: "https://www.swarthmore.edu/admissions-aid/virtual-visits",
    admissionPage: "https://www.swarthmore.edu/admissions-aid",
    tags: ["No Loan Policy", "Engineering"],
  },
  {
    id: 54, name: "Pomona College", type: "Liberal Arts College", rank: 4,
    location: "Claremont, CA", state: "CA", color: "#0C2340",
    registrationPage: "https://www.pomona.edu/admissions/visit/virtual",
    admissionPage: "https://www.pomona.edu/admissions",
    tags: ["No Loan Policy", "Claremont Consortium"],
  },
  {
    id: 55, name: "Wellesley College", type: "Liberal Arts College", rank: 5,
    location: "Wellesley, MA", state: "MA", color: "#1D6FA4",
    registrationPage: "https://www.wellesley.edu/admission/visit/virtual",
    admissionPage: "https://www.wellesley.edu/admission",
    tags: ["Women's College", "No Loan Policy"],
  },
  {
    id: 56, name: "Bowdoin College", type: "Liberal Arts College", rank: 6,
    location: "Brunswick, ME", state: "ME", color: "#000000",
    registrationPage: "https://www.bowdoin.edu/admissions/visit/virtual.html",
    admissionPage: "https://www.bowdoin.edu/admissions/",
    tags: ["No Loan Policy", "Test Optional"],
  },
  {
    id: 57, name: "Carleton College", type: "Liberal Arts College", rank: 7,
    location: "Northfield, MN", state: "MN", color: "#003865",
    registrationPage: "https://www.carleton.edu/admissions/visit/virtual/",
    admissionPage: "https://www.carleton.edu/admissions/",
    tags: ["Trimester", "Research"],
  },
  {
    id: 58, name: "Middlebury College", type: "Liberal Arts College", rank: 8,
    location: "Middlebury, VT", state: "VT", color: "#003B71",
    registrationPage: "https://www.middlebury.edu/admissions/visit/virtual",
    admissionPage: "https://www.middlebury.edu/admissions",
    tags: ["Languages", "Environment"],
  },
  {
    id: 59, name: "Claremont McKenna College", shortName: "CMC",
    type: "Liberal Arts College", rank: 9,
    location: "Claremont, CA", state: "CA", color: "#8B0000",
    registrationPage: "https://www.cmc.edu/admission/visit/virtual",
    admissionPage: "https://www.cmc.edu/admission",
    tags: ["Economics", "Government"],
  },
  {
    id: 60, name: "Haverford College", type: "Liberal Arts College", rank: 10,
    location: "Haverford, PA", state: "PA", color: "#003865",
    registrationPage: "https://www.haverford.edu/admission/visit/virtual",
    admissionPage: "https://www.haverford.edu/admission",
    tags: ["Honor Code", "Quaker"],
  },
  {
    id: 61, name: "Davidson College", type: "Liberal Arts College", rank: 11,
    location: "Davidson, NC", state: "NC", color: "#CC0000",
    registrationPage: "https://www.davidson.edu/admission-and-financial-aid/visit/virtual",
    admissionPage: "https://www.davidson.edu/admission-and-financial-aid",
    tags: ["Honor Code", "No Loan Policy"],
  },
  {
    id: 62, name: "Washington and Lee University", shortName: "W&L",
    type: "Liberal Arts College", rank: 12,
    location: "Lexington, VA", state: "VA", color: "#041E42",
    registrationPage: "https://www.wlu.edu/admission/visit/virtual/",
    admissionPage: "https://www.wlu.edu/admission/",
    tags: ["Honor System", "Law"],
  },
  {
    id: 63, name: "Colgate University", type: "Liberal Arts College", rank: 13,
    location: "Hamilton, NY", state: "NY", color: "#821019",
    registrationPage: "https://www.colgate.edu/admission/visit/virtual",
    admissionPage: "https://www.colgate.edu/admission",
    tags: ["Core Curriculum"],
  },
  {
    id: 64, name: "Hamilton College", type: "Liberal Arts College", rank: 14,
    location: "Clinton, NY", state: "NY", color: "#003865",
    registrationPage: "https://www.hamilton.edu/admission/visit/virtual",
    admissionPage: "https://www.hamilton.edu/admission",
    tags: ["Writing", "Open Curriculum"],
  },
  {
    id: 65, name: "Smith College", type: "Liberal Arts College", rank: 15,
    location: "Northampton, MA", state: "MA", color: "#002855",
    registrationPage: "https://www.smith.edu/admission/visit/virtual",
    admissionPage: "https://www.smith.edu/admission",
    tags: ["Women's College", "Five College"],
  },
  {
    id: 66, name: "Vassar College", type: "Liberal Arts College", rank: 16,
    location: "Poughkeepsie, NY", state: "NY", color: "#721422",
    registrationPage: "https://admissions.vassar.edu/visit/virtual.html",
    admissionPage: "https://admissions.vassar.edu",
    tags: ["Arts", "No Loan Policy"],
  },
  {
    id: 67, name: "Colby College", type: "Liberal Arts College", rank: 17,
    location: "Waterville, ME", state: "ME", color: "#003865",
    registrationPage: "https://www.colby.edu/admission/visit/virtual/",
    admissionPage: "https://www.colby.edu/admission/",
    tags: ["No Loan Policy", "Sustainability"],
  },
  {
    id: 68, name: "Bates College", type: "Liberal Arts College", rank: 18,
    location: "Lewiston, ME", state: "ME", color: "#8C1515",
    registrationPage: "https://www.bates.edu/admission/visit/virtual/",
    admissionPage: "https://www.bates.edu/admission/",
    tags: ["Test Optional", "Thesis"],
  },
  {
    id: 69, name: "Grinnell College", type: "Liberal Arts College", rank: 19,
    location: "Grinnell, IA", state: "IA", color: "#C1292E",
    registrationPage: "https://www.grinnell.edu/admission/visit/virtual",
    admissionPage: "https://www.grinnell.edu/admission",
    tags: ["No Loan Policy", "Social Justice"],
  },
  {
    id: 70, name: "Barnard College", type: "Liberal Arts College", rank: 20,
    location: "New York, NY", state: "NY", color: "#003865",
    registrationPage: "https://admissions.barnard.edu/visit/virtual",
    admissionPage: "https://admissions.barnard.edu",
    tags: ["Women's College", "Columbia Affiliation"],
  },
  {
    id: 71, name: "Oberlin College", type: "Liberal Arts College", rank: 21,
    location: "Oberlin, OH", state: "OH", color: "#CC0000",
    registrationPage: "https://www.oberlin.edu/admissions-and-aid/visit/virtual",
    admissionPage: "https://www.oberlin.edu/admissions-and-aid",
    tags: ["Music Conservatory", "Social Justice"],
  },
  {
    id: 72, name: "Colorado College", type: "Liberal Arts College", rank: 22,
    location: "Colorado Springs, CO", state: "CO", color: "#000000",
    registrationPage: "https://www.coloradocollege.edu/admission/visit/virtual/",
    admissionPage: "https://www.coloradocollege.edu/admission/",
    tags: ["Block Plan", "Outdoor"],
  },
  {
    id: 73, name: "Bryn Mawr College", type: "Liberal Arts College", rank: 23,
    location: "Bryn Mawr, PA", state: "PA", color: "#003865",
    registrationPage: "https://www.brynmawr.edu/admissions/visit/virtual",
    admissionPage: "https://www.brynmawr.edu/admissions",
    tags: ["Women's College"],
  },
  {
    id: 74, name: "Mount Holyoke College", type: "Liberal Arts College", rank: 24,
    location: "South Hadley, MA", state: "MA", color: "#003865",
    registrationPage: "https://www.mtholyoke.edu/admission/visit/virtual",
    admissionPage: "https://www.mtholyoke.edu/admission",
    tags: ["Women's College", "Five College"],
  },
  {
    id: 75, name: "Trinity College", type: "Liberal Arts College", rank: 25,
    location: "Hartford, CT", state: "CT", color: "#003865",
    registrationPage: "https://www.trincoll.edu/admissions/visit/virtual/",
    admissionPage: "https://www.trincoll.edu/admissions/",
    tags: ["Urban", "Hartford"],
  },
  {
    id: 76, name: "Kenyon College", type: "Liberal Arts College", rank: 26,
    location: "Gambier, OH", state: "OH", color: "#4A2C6E",
    registrationPage: "https://www.kenyon.edu/admissions-aid/visit/virtual/",
    admissionPage: "https://www.kenyon.edu/admissions-aid/",
    tags: ["Writing", "Literature"],
  },
  {
    id: 77, name: "Macalester College", type: "Liberal Arts College", rank: 27,
    location: "St. Paul, MN", state: "MN", color: "#003865",
    registrationPage: "https://www.macalester.edu/admissions/visit/virtual/",
    admissionPage: "https://www.macalester.edu/admissions/",
    tags: ["International", "Diversity"],
  },
  {
    id: 78, name: "Occidental College", type: "Liberal Arts College", rank: 28,
    location: "Los Angeles, CA", state: "CA", color: "#CC0000",
    registrationPage: "https://www.oxy.edu/admission-aid/visit/virtual",
    admissionPage: "https://www.oxy.edu/admission-aid",
    tags: ["Diversity", "Los Angeles"],
  },
  {
    id: 79, name: "Scripps College", type: "Liberal Arts College", rank: 29,
    location: "Claremont, CA", state: "CA", color: "#8B0000",
    registrationPage: "https://www.scrippscollege.edu/admission/visit/virtual",
    admissionPage: "https://www.scrippscollege.edu/admission",
    tags: ["Women's College", "Claremont Consortium"],
  },
  {
    id: 80, name: "Union College", type: "Liberal Arts College", rank: 30,
    location: "Schenectady, NY", state: "NY", color: "#862633",
    registrationPage: "https://www.union.edu/admissions/visit/virtual",
    admissionPage: "https://www.union.edu/admissions",
    tags: ["Engineering", "Liberal Arts"],
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
    dates: ["2025-10-05", "2025-10-19", "2025-11-02"],
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
    dates: ["2025-10-12"],
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
    dates: ["2025-10-08"],
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
    dates: ["2025-10-09"],
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
    dates: ["2025-09-10", "2025-09-15"],
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
    dates: ["2025-10-26", "2025-11-09"],
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
    dates: ["2025-10-15", "2025-10-22"],
    time: "7:00 PM ET",
    duration: "75 min",
    registrationUrl: "https://admissions.yale.edu/virtual-events",
    partnerSchools: ["Barnard", "Colorado College", "Rice", "Tufts"],
  },
];

export const schoolsMap = Object.fromEntries(schools.map((s) => [s.id, s]));

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
