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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;
