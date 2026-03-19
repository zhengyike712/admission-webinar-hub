// Canada U15 Schools Seed Data
import { canadaSchools } from "./canada-schools";

export const canadaU15Schools = [
  // 1. University of Toronto
  {
    id: "uoft",
    slug: "university-of-toronto",
    nameEn: "University of Toronto",
    nameCn: "多伦多大学",
    province: "ON",
    city: "Toronto",
    isU15: true,
    u15Rank: "1",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.utoronto.ca",
    undergraduateApplyUrl: "https://www.utoronto.ca/admissions/apply",
    internationalStudentsUrl: "https://www.utoronto.ca/admissions/international",
    tuitionFeesUrl: "https://www.utoronto.ca/tuition",
    scholarshipUrl: "https://www.utoronto.ca/awards-scholarships",
    residenceUrl: "https://www.utoronto.ca/housing",
    programsUrl: "https://www.utoronto.ca/programs",
    applicationDeadlines: [
      { round: "Early Admission", deadline: "2024-11-07" },
      { round: "Regular Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 100,
      toeflAccepted: true,
      notes: "单项不低于 6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 85%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$6,100 - $10,000",
      international: "$60,000 - $70,000"
    },
    scholarshipSummary: "提供 Entrance Scholarships、Lester B. Pearson Scholarship 等",
    residenceSummary: "三个校区均有宿舍，第一年保证住宿",
    coOpSupported: true,
    notablePrograms: ["Computer Science", "Engineering", "Business", "Life Sciences", "Mathematics"],
    seoTitle: "多伦多大学 (University of Toronto) 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "多伦多大学本科申请完全指南。包含2024年学费、语言要求、录取率、奖学金等。",
    crawlStatus: "success"
  },
  // 2. University of British Columbia
  {
    id: "ubc",
    slug: "university-of-british-columbia",
    nameEn: "University of British Columbia",
    nameCn: "不列颠哥伦比亚大学",
    province: "BC",
    city: "Vancouver",
    isU15: true,
    u15Rank: "2",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.ubc.ca",
    undergraduateApplyUrl: "https://you.ubc.ca/apply/",
    internationalStudentsUrl: "https://you.ubc.ca/apply/international/",
    tuitionFeesUrl: "https://you.ubc.ca/finances/",
    scholarshipUrl: "https://you.ubc.ca/finances/scholarships/",
    residenceUrl: "https://vancouver.housing.ubc.ca/",
    programsUrl: "https://you.ubc.ca/programs/",
    applicationDeadlines: [
      { round: "Early Admission", deadline: "2024-12-01" },
      { round: "Regular Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 90,
      toeflAccepted: true,
      notes: "阅读不低于22，听力不低于22，口语不低于22，写作不低于22"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 84%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$5,700 - $9,500",
      international: "$58,000 - $65,000"
    },
    scholarshipSummary: "提供 International Major Entrance Scholarships (IMES)",
    residenceSummary: "温哥华和奥肯那根校区均有宿舍",
    coOpSupported: true,
    notablePrograms: ["Computer Science", "Engineering", "Business", "Forestry", "Life Sciences"],
    seoTitle: "UBC 不列颠哥伦比亚大学本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "UBC本科申请完全指南。包含2024年学费、语言要求、奖学金、热门专业等。",
    crawlStatus: "success"
  },
  // 3. McGill University
  {
    id: "mcgill",
    slug: "mcgill-university",
    nameEn: "McGill University",
    nameCn: "麦吉尔大学",
    province: "QC",
    city: "Montreal",
    isU15: true,
    u15Rank: "3",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.mcgill.ca",
    undergraduateApplyUrl: "https://www.mcgill.ca/undergraduate-admissions/apply",
    internationalStudentsUrl: "https://www.mcgill.ca/undergraduate-admissions/international",
    tuitionFeesUrl: "https://www.mcgill.ca/undergraduate-admissions/tuition-fees",
    scholarshipUrl: "https://www.mcgill.ca/undergraduate-admissions/scholarships",
    residenceUrl: "https://www.mcgill.ca/student-housing",
    programsUrl: "https://www.mcgill.ca/programs/",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-01-15" },
      { round: "Winter Admission", deadline: "2024-11-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 90,
      toeflAccepted: true,
      notes: "管理学课程需要法语"
    },
    academicRequirements: {
      gpaRequirement: "CEGEP average of 85%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$8,000 - $12,000",
      international: "$55,000 - $65,000"
    },
    scholarshipSummary: "提供 Major Entrance Scholarships、Clarke Award",
    residenceSummary: "市中心校区有多个宿舍楼",
    coOpSupported: false,
    notablePrograms: ["Medicine", "Business", "Arts", "Engineering", "Life Sciences"],
    seoTitle: "麦吉尔大学 McGill University 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "麦吉尔大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 4. University of Alberta
  {
    id: "ualberta",
    slug: "university-of-alberta",
    nameEn: "University of Alberta",
    nameCn: "阿尔伯塔大学",
    province: "AB",
    city: "Edmonton",
    isU15: true,
    u15Rank: "4",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.ualberta.ca",
    undergraduateApplyUrl: "https://www.ualberta.ca/undergraduate-admissions/apply",
    internationalStudentsUrl: "https://www.ualberta.ca/undergraduate-admissions/international",
    tuitionFeesUrl: "https://www.ualberta.ca/tuition",
    scholarshipUrl: "https://www.ualberta.ca/scholarships",
    residenceUrl: "https://www.ualberta.ca/housing",
    programsUrl: "https://www.ualberta.ca/programs",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-03-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 90,
      toeflAccepted: true,
      notes: "单项不低于5.5"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 70%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$5,800 - $9,500",
      international: "$35,000 - $50,000"
    },
    scholarshipSummary: "提供 International Student Scholarship",
    residenceSummary: "主校区有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Engineering", "Computer Science", "Business", "Agriculture", "Health Sciences"],
    seoTitle: "阿尔伯塔大学 University of Alberta 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "阿尔伯塔大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 5. University of Calgary
  {
    id: "ucalgary",
    slug: "university-of-calgary",
    nameEn: "University of Calgary",
    nameCn: "卡尔加里大学",
    province: "AB",
    city: "Calgary",
    isU15: true,
    u15Rank: "5",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.ucalgary.ca",
    undergraduateApplyUrl: "https://www.ucalgary.ca/apply",
    internationalStudentsUrl: "https://www.ucalgary.ca/international",
    tuitionFeesUrl: "https://www.ucalgary.ca/registrar/finances/tuition",
    scholarshipUrl: "https://www.ucalgary.ca/registrar/finances/scholarships",
    residenceUrl: "https://www.ucalgary.ca/housing",
    programsUrl: "https://www.ucalgary.ca/future-students/programs",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-03-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 86,
      toeflAccepted: true,
      notes: "单项不低于5.5"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 75%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$5,500 - $9,000",
      international: "$32,000 - $45,000"
    },
    scholarshipSummary: "提供 International Entrance Scholarship",
    residenceSummary: "校园内有多栋宿舍楼",
    coOpSupported: true,
    notablePrograms: ["Engineering", "Computer Science", "Business", "Kinesiology", " Veterinary Medicine"],
    seoTitle: "卡尔加里大学 University of Calgary 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "卡尔加里大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 6. McMaster University
  {
    id: "mcmaster",
    slug: "mcmaster-university",
    nameEn: "McMaster University",
    nameCn: "麦克马斯特大学",
    province: "ON",
    city: "Hamilton",
    isU15: true,
    u15Rank: "6",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.mcmaster.ca",
    undergraduateApplyUrl: "https://future.mcmaster.ca/admissions/",
    internationalStudentsUrl: "https://future.mcmaster.ca/admissions/international/",
    tuitionFeesUrl: "https://registrar.mcmaster.ca/fees/tuition-fees/",
    scholarshipUrl: "https://www.mcmaster.ca/awards/",
    residenceUrl: "https://housing.mcmaster.ca/",
    programsUrl: "https://future.mcmaster.ca/academics/",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 86,
      toeflAccepted: true,
      notes: "单项不低于6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 83%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$6,000 - $10,000",
      international: "$50,000 - $60,000"
    },
    scholarshipSummary: "提供 Entrance Scholarship Program",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Engineering", "Business", "Health Sciences", "Computer Science", "Life Sciences"],
    seoTitle: "麦克马斯特大学 McMaster University 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "麦克马斯特大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 7. University of Waterloo
  {
    id: "uwaterloo",
    slug: "university-of-waterloo",
    nameEn: "University of Waterloo",
    nameCn: "滑铁卢大学",
    province: "ON",
    city: "Waterloo",
    isU15: true,
    u15Rank: "7",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://uwaterloo.ca",
    undergraduateApplyUrl: "https://uwaterloo.ca/future-students/",
    internationalStudentsUrl: "https://uwaterloo.ca/future-students/international",
    tuitionFeesUrl: "https://uwaterloo.ca/finance/tuition-fees",
    scholarshipUrl: "https://uwaterloo.ca/finance/scholarships",
    residenceUrl: "https://uwaterloo.ca/housing",
    programsUrl: "https://uwaterloo.ca/future-students/undergraduate-programs",
    applicationDeadlines: [
      { round: "Early Fall Admission", deadline: "2024-11-01" },
      { round: "Regular Fall Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 90,
      toeflAccepted: true,
      notes: "写作不低于25，口语不低于25"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 85%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$6,000 - $10,000",
      international: "$50,000 - $60,000"
    },
    scholarshipSummary: "提供 President's Entrance Scholarship、International Student Scholarship",
    residenceSummary: "校园内有多个宿舍区，第一年保证住宿",
    coOpSupported: true,
    notablePrograms: ["Computer Science", "Engineering", "Mathematics", "Business", "Co-op Programs"],
    seoTitle: "滑铁卢大学 University of Waterloo 本科申请攻略 | 2024年学费、录取要求、Co-op",
    seoDescription: "滑铁卢大学本科申请完全指南。包含2024年学费、语言要求、Co-op项目、奖学金等。",
    crawlStatus: "success"
  },
  // 8. Western University
  {
    id: "western",
    slug: "western-university",
    nameEn: "Western University",
    nameCn: "韦仕敦大学",
    province: "ON",
    city: "London",
    isU15: true,
    u15Rank: "8",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.uwo.ca",
    undergraduateApplyUrl: "https://www.uwo.ca/admissions/undergraduate/",
    internationalStudentsUrl: "https://www.uwo.ca/admissions/international/",
    tuitionFeesUrl: "https://www.registrar.uwo.ca/tuition_fees/index.html",
    scholarshipUrl: "https://www.registrar.uwo.ca/scholarships/",
    residenceUrl: "https://www.uwo.ca/housing/",
    programsUrl: "https://www.uwo.ca/future_students/programs.html",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 83,
      toeflAccepted: true,
      notes: "单项不低于6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 80%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$6,000 - $10,000",
      international: "$45,000 - $55,000"
    },
    scholarshipSummary: "提供 Entrance Scholarships",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Business (Ivey)", "Engineering", "Health Sciences", "Computer Science", "Media Studies"],
    seoTitle: "韦仕敦大学 Western University 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "韦仕敦大学本科申请完全指南。包含2024年学费、语言要求、Ivey商学院等。",
    crawlStatus: "success"
  },
  // 9. Queen's University
  {
    id: "queens",
    slug: "queens-university",
    nameEn: "Queen's University",
    nameCn: "女王大学",
    province: "ON",
    city: "Kingston",
    isU15: true,
    u15Rank: "9",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.queensu.ca",
    undergraduateApplyUrl: "https://www.queensu.ca/undergrad/admissions",
    internationalStudentsUrl: "https://www.queensu.ca/undergrad/international",
    tuitionFeesUrl: "https://www.queensu.ca/registrar/financials/tuition",
    scholarshipUrl: "https://www.queensu.ca/registrar/scholarships",
    residenceUrl: "https://www.housing.queensu.ca/",
    programsUrl: "https://www.queensu.ca/undergrad/programs",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-01-15" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 88,
      toeflAccepted: true,
      notes: "写作不低于24，口语不低于22"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 85%+",
      satOptional: true,
      actOptional: true,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$6,000 - $10,000",
      international: "$50,000 - $60,000"
    },
    scholarshipSummary: "提供 Principal's Scholarship、Admission Scholarship",
    residenceSummary: "第一年保证住宿",
    coOpSupported: true,
    notablePrograms: ["Business (Smith)", "Engineering", "Health Sciences", "Arts", "Law"],
    seoTitle: "女王大学 Queen's University 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "女王大学本科申请完全指南。包含2024年学费、语言要求、Smith商学院等。",
    crawlStatus: "success"
  },
  // 10. University of Ottawa
  {
    id: "uottawa",
    slug: "university-of-ottawa",
    nameEn: "University of Ottawa",
    nameCn: "渥太华大学",
    province: "ON",
    city: "Ottawa",
    isU15: true,
    u15Rank: "10",
    schoolType: "public",
    language: "bilingual",
    officialWebsite: "https://www.uottawa.ca",
    undergraduateApplyUrl: "https://www.uottawa.ca/en/undergraduate-admissions",
    internationalStudentsUrl: "https://www.uottawa.ca/en/future-students/international",
    tuitionFeesUrl: "https://www.uottawa.ca/en/registrar/fees",
    scholarshipUrl: "https://www.uottawa.ca/en/financial-aid/scholarships",
    residenceUrl: "https://www.uottawa.ca/en/housing",
    programsUrl: "https://www.uottawa.ca/en/undergraduate-studies/programs",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-04-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 86,
      toeflAccepted: true,
      notes: "法语项目需要TEF/TCF成绩"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 80%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$4,000 - $8,000",
      international: "$30,000 - $45,000"
    },
    scholarshipSummary: "提供 International Scholarship",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Medicine", "Law", "Engineering", "Business", "Social Sciences"],
    seoTitle: "渥太华大学 University of Ottawa 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "渥太华大学本科申请完全指南。包含2024年学费、语言要求、双语教学等。",
    crawlStatus: "success"
  },
  // 11. Dalhousie University
  {
    id: "dal",
    slug: "dalhousie-university",
    nameEn: "Dalhousie University",
    nameCn: "戴尔豪斯大学",
    province: "NS",
    city: "Halifax",
    isU15: true,
    u15Rank: "11",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.dal.ca",
    undergraduateApplyUrl: "https://www.dal.ca/admissions/undergraduate.html",
    internationalStudentsUrl: "https://www.dal.ca/admissions/international.html",
    tuitionFeesUrl: "https://www.dal.ca/admissions/fees.html",
    scholarshipUrl: "https://www.dal.ca/admissions/scholarships.html",
    residenceUrl: "https://www.dal.ca/housing.html",
    programsUrl: "https://www.dal.ca/academics/undergraduate.html",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-04-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 90,
      toeflAccepted: true,
      notes: "单项不低于6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 70%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$5,000 - $8,000",
      international: "$25,000 - $35,000"
    },
    scholarshipSummary: "提供 International Student Scholarship",
    residenceSummary: " Halifax和Truro校区均有宿舍",
    coOpSupported: true,
    notablePrograms: ["Ocean Sciences", "Engineering", "Business", "Computer Science", "Health Professions"],
    seoTitle: "戴尔豪斯大学 Dalhousie University 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "戴尔豪斯大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 12. Université Laval
  {
    id: "ulaval",
    slug: "universite-laval",
    nameEn: "Université Laval",
    nameCn: "拉瓦尔大学",
    province: "QC",
    city: "Quebec City",
    isU15: true,
    u15Rank: "12",
    schoolType: "public",
    language: "french",
    officialWebsite: "https://www.ulaval.ca",
    undergraduateApplyUrl: "https://www.ulaval.ca/admissions",
    internationalStudentsUrl: "https://www.ulaval.ca/etudes/international",
    tuitionFeesUrl: "https://www.ulaval.ca/finances/droits-de-scolarite",
    scholarshipUrl: "https://www.ulaval.ca/bourses",
    residenceUrl: "https://www.ulaval.ca/vie-etudiante/logement",
    programsUrl: "https://www.ulaval.ca/etudes",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-02-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.0,
      ieltsAccepted: true,
      toeflMin: 79,
      toeflAccepted: true,
      notes: "需要TEF/TCF成绩用于法语项目"
    },
    academicRequirements: {
      gpaRequirement: "CEGEP average of 75%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$4,000 - $8,000",
      international: "$20,000 - $30,000"
    },
    scholarshipSummary: "提供 Bourses d'admission internationales",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Food Sciences", "Forestry", "Engineering", "Medicine", "Sciences"],
    seoTitle: "拉瓦尔大学 Université Laval 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "拉瓦尔大学本科申请完全指南。包含2024年学费、法语要求、奖学金等。",
    crawlStatus: "success"
  },
  // 13. Université de Montréal
  {
    id: "udm",
    slug: "universite-de-montreal",
    nameEn: "Université de Montréal",
    nameCn: "蒙特利尔大学",
    province: "QC",
    city: "Montreal",
    isU15: true,
    u15Rank: "13",
    schoolType: "public",
    language: "french",
    officialWebsite: "https://www.umontreal.ca",
    undergraduateApplyUrl: "https://www.umontreal.ca/admissions/",
    internationalStudentsUrl: "https://www.umontreal.ca/admissions/international/",
    tuitionFeesUrl: "https://www.umontreal.ca/finances/",
    scholarshipUrl: "https://www.umontreal.ca/bourses/",
    residenceUrl: "https://www.umontreal.ca/housing/",
    programsUrl: "https://www.umontreal.ca/programs/",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-02-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.0,
      ieltsAccepted: true,
      toeflMin: 79,
      toeflAccepted: true,
      notes: "需要TEF/TCF成绩用于法语项目"
    },
    academicRequirements: {
      gpaRequirement: "CEGEP average of 75%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$4,000 - $8,000",
      international: "$20,000 - $30,000"
    },
    scholarshipSummary: "提供 Bourses d'admission",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Medicine", "Business", "Engineering", "Arts", "Computer Science"],
    seoTitle: "蒙特利尔大学 Université de Montréal 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "蒙特利尔大学本科申请完全指南。包含2024年学费、法语要求、奖学金等。",
    crawlStatus: "success"
  },
  // 14. University of Manitoba
  {
    id: "umanitoba",
    slug: "university-of-manitoba",
    nameEn: "University of Manitoba",
    nameCn: "曼尼托巴大学",
    province: "MB",
    city: "Winnipeg",
    isU15: true,
    u15Rank: "14",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.umanitoba.ca",
    undergraduateApplyUrl: "https://umanitoba.ca/admissions/undergraduate",
    internationalStudentsUrl: "https://umanitoba.ca/admissions/international",
    tuitionFeesUrl: "https://umanitoba.ca/registrar/finances/tuition-fees",
    scholarshipUrl: "https://umanitoba.ca/awards",
    residenceUrl: "https://umanitoba.ca/housing",
    programsUrl: "https://umanitoba.ca/academics",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-05-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 86,
      toeflAccepted: true,
      notes: "单项不低于6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 70%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$4,000 - $7,000",
      international: "$20,000 - $30,000"
    },
    scholarshipSummary: "提供 International Student Scholarship",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Agriculture", "Engineering", "Medicine", "Business", "Health Sciences"],
    seoTitle: "曼尼托巴大学 University of Manitoba 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "曼尼托巴大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  },
  // 15. University of Saskatchewan
  {
    id: "usask",
    slug: "university-of-saskatchewan",
    nameEn: "University of Saskatchewan",
    nameCn: "萨省大学",
    province: "SK",
    city: "Saskatoon",
    isU15: true,
    u15Rank: "15",
    schoolType: "public",
    language: "english",
    officialWebsite: "https://www.usask.ca",
    undergraduateApplyUrl: "https://admissions.usask.ca/",
    internationalStudentsUrl: "https://admissions.usask.ca/international/",
    tuitionFeesUrl: "https://students.usask.ca/finances/tuition-fees.php",
    scholarshipUrl: "https://students.usask.ca/finances/scholarships.php",
    residenceUrl: "https://housing.usask.ca/",
    programsUrl: "https://admissions.usask.ca/programs/",
    applicationDeadlines: [
      { round: "Fall Admission", deadline: "2025-05-01" }
    ],
    languageRequirements: {
      ieltsMin: 6.5,
      ieltsAccepted: true,
      toeflMin: 86,
      toeflAccepted: true,
      notes: "单项不低于6.0"
    },
    academicRequirements: {
      gpaRequirement: "High school average of 70%+",
      satOptional: false,
      actOptional: false,
      apCreditsAccepted: true
    },
    tuitionRange: {
      domestic: "$4,000 - $7,000",
      international: "$20,000 - $30,000"
    },
    scholarshipSummary: "提供 International Student Scholarship",
    residenceSummary: "校园内有多个宿舍区",
    coOpSupported: true,
    notablePrograms: ["Agriculture", "Engineering", "Veterinary Medicine", "Business", "Health Sciences"],
    seoTitle: "萨省大学 University of Saskatchewan 本科申请攻略 | 2024年学费、录取要求",
    seoDescription: "萨省大学本科申请完全指南。包含2024年学费、语言要求、奖学金等。",
    crawlStatus: "success"
  }
];

export const canadaProvinces = [
  { code: "ON", name: "Ontario", nameCn: "安大略省" },
  { code: "BC", name: "British Columbia", nameCn: "不列颠哥伦比亚省" },
  { code: "AB", name: "Alberta", nameCn: "阿尔伯塔省" },
  { code: "QC", name: "Quebec", nameCn: "魁北克省" },
  { code: "NS", name: "Nova Scotia", nameCn: "新斯科舍省" },
  { code: "MB", name: "Manitoba", nameCn: "曼尼托巴省" },
  { code: "SK", name: "Saskatchewan", nameCn: "萨斯喀彻温省" },
];
