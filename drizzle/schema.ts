import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * sessions table — mirrors the static Session type in schools.ts
 * but lives in the DB so the crawler can update it automatically.
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 128 }).primaryKey(), // e.g. "oxford-events"
  schoolId: int("schoolId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  type: varchar("type", { length: 128 }).notNull(),
  description: text("description").notNull(),
  /** JSON array of "YYYY-MM-DD" strings, or null for rolling */
  dates: json("dates").$type<string[] | null>(),
  time: varchar("time", { length: 64 }),
  duration: varchar("duration", { length: 64 }),
  registrationUrl: text("registrationUrl").notNull(),
  isRolling: boolean("isRolling").default(false).notNull(),
  /** JSON array of partner school names */
  partnerSchools: json("partnerSchools").$type<string[]>(),
  /** When the crawler last successfully updated this row */
  lastCrawledAt: timestamp("lastCrawledAt"),
  /** Source URL that was crawled to get this data */
  crawlSourceUrl: text("crawlSourceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * crawl_logs table — records each crawler run for auditing and debugging.
 */
export const crawlLogs = mysqlTable("crawl_logs", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  schoolName: varchar("schoolName", { length: 256 }).notNull(),
  crawlUrl: text("crawlUrl").notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  sessionsFound: int("sessionsFound").default(0).notNull(),
  sessionsUpdated: int("sessionsUpdated").default(0).notNull(),
  /** How many consecutive failures this school has accumulated */
  consecutiveFailures: int("consecutiveFailures").default(0).notNull(),
  errorMessage: text("errorMessage"),
  rawContent: text("rawContent"), // truncated HTML/text for debugging
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CrawlLog = typeof crawlLogs.$inferSelect;
export type InsertCrawlLog = typeof crawlLogs.$inferInsert;

/**
 * subscribers table — stores email addresses for activity update notifications.
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Optional: regions the subscriber is interested in (JSON array) */
  regions: json("regions").$type<string[]>(),
  active: boolean("active").default(true).notNull(),
  /** Unique token used in one-click unsubscribe links */
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * interview_verifications table — stores the latest verification result
 * for each school's interview deadline, updated by the deadline crawler.
 */
export const interviewVerifications = mysqlTable("interview_verifications", {
  id: varchar("id", { length: 128 }).primaryKey(), // matches SchoolInterview.id
  schoolName: varchar("schoolName", { length: 256 }).notNull(),
  portalUrl: text("portalUrl").notNull(),
  /** Verified deadline (YYYY-MM-DD), null if not found on page */
  verifiedDeadline: varchar("verifiedDeadline", { length: 16 }),
  /** Raw deadline text extracted from the page */
  rawDeadlineText: text("rawDeadlineText"),
  /** Whether the deadline matches the static data */
  matches: boolean("matches"),
  /** Verification status */
  status: mysqlEnum("status", ["ok", "changed", "not_found", "error"]).notNull().default("ok"),
  /** Error message if status is 'error' */
  errorMessage: text("errorMessage"),
  /** Truncated page content for debugging */
  rawContent: text("rawContent"),
  lastVerifiedAt: timestamp("lastVerifiedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterviewVerification = typeof interviewVerifications.$inferSelect;
export type InsertInterviewVerification = typeof interviewVerifications.$inferInsert;

/**
 * chat_sessions table — one session per user (or anonymous client).
 * Stores the browsing profile used for dynamic question recommendations.
 */
export const chatSessions = mysqlTable("chat_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(), // uuid
  userId: int("userId"), // null for anonymous
  /** JSON object tracking browsing behaviour: { schoolTypes, regions, sessionTypes } */
  browsingProfile: json("browsingProfile").$type<{
    schoolTypes: Record<string, number>;
    regions: Record<string, number>;
    sessionTypes: Record<string, number>;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * chat_messages table — individual messages within a chat session.
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * portal_subscriptions table — stores email subscriptions for decision release notifications.
 * Each row represents one email subscribed to one school's decision results.
 */
export const portalSubscriptions = mysqlTable("portal_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  /** schoolId from portals.ts */
  schoolId: int("schoolId").notNull(),
  schoolName: varchar("schoolName", { length: 256 }).notNull(),
  /** The decision round subscribed to, e.g. "RD" */
  round: varchar("round", { length: 32 }).notNull(),
  /** ISO date string of the expected release date */
  releaseDate: varchar("releaseDate", { length: 32 }).notNull(),
  /** Whether the notification email has been sent */
  notified: boolean("notified").default(false).notNull(),
  /** When the notification was sent */
  notifiedAt: timestamp("notifiedAt"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortalSubscription = typeof portalSubscriptions.$inferSelect;
export type InsertPortalSubscription = typeof portalSubscriptions.$inferInsert;
