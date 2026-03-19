// Canada Schools Schema for Drizzle
import {
  boolean,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// U15 加拿大大学数据表
export const canadaSchools = mysqlTable("canada_schools", {
  // 基础标识
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  
  // 学校名称
  nameEn: varchar("name_en", { length: 256 }).notNull(),
  nameCn: varchar("name_cn", { length: 256 }),
  
  // 地理位置
  province: varchar("province", { length: 10 }).notNull(), // ON, BC, AB, QC, etc.
  city: varchar("city", { length: 128 }),
  
  // U15 标识
  isU15: boolean("is_u15").default(false),
  u15Rank: varchar("u15_rank", { length: 10 }),
  
  // 学校属性
  schoolType: varchar("school_type", { length: 32 }), // public, private
  language: varchar("language", { length: 32 }), // english, french, bilingual
  
  // 官方网站 URL
  officialWebsite: text("official_website"),
  undergraduateApplyUrl: text("undergraduate_apply_url"),
  internationalStudentsUrl: text("international_students_url"),
  tuitionFeesUrl: text("tuition_fees_url"),
  scholarshipUrl: text("scholarship_url"),
  residenceUrl: text("residence_url"),
  programsUrl: text("programs_url"),
  
  // 申请截止日期 (JSON)
  applicationDeadlines: json("application_deadlines").$type<{
    round: string;
    deadline: string;
    notificationDate?: string;
  }[]>(),
  
  // 语言要求 (JSON)
  languageRequirements: json("language_requirements").$type<{
    ieltsMin: number;
    ieltsAccepted: boolean;
    toeflMin: number;
    toeflAccepted: boolean;
    duolingoMin?: number;
    notes?: string;
  }>(),
  
  // 学术要求 (JSON)
  academicRequirements: json("academic_requirements").$type<{
    gpaRequirement?: string;
    satOptional: boolean;
    actOptional: boolean;
    apCreditsAccepted: boolean;
    notes?: string;
  }>(),
  
  // 学费范围 (JSON)
  tuitionRange: json("tuition_range").$type<{
    domestic: string;
    international: string;
  }>(),
  
  // 奖学金摘要
  scholarshipSummary: text("scholarship_summary"),
  
  // 住宿摘要
  residenceSummary: text("residence_summary"),
  
  // Co-op 支持
  coOpSupported: boolean("co_op_supported").default(false),
  
  // 热门专业 (JSON array)
  notablePrograms: json("notable_programs").$type<string[]>(),
  
  // SEO 字段
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  
  // FAQ (JSON)
  faq: json("faq").$type<{
    question: string;
    answer: string;
  }[]>(),
  
  // 元数据
  lastUpdated: timestamp("last_updated"),
  crawlStatus: varchar("crawl_status", { length: 32 }).default("pending"), // pending, success, failed
});

export type CanadaSchool = typeof canadaSchools.$inferSelect;
export type InsertCanadaSchool = typeof canadaSchools.$inferInsert;
