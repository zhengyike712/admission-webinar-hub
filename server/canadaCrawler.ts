// Canada Schools Crawler
// 用于自动抓取加拿大大学官网信息（Phase 2+ 使用）

import { db } from "../db";
import { canadaSchools } from "../../drizzle/canada-schools";
import { canadaU15Schools } from "../data/canada-u15-seed";

// U15 学校官网 URL 配置
const U15_SCHOOL_URLS = [
  { slug: "university-of-toronto", admissionsUrl: "https://www.utoronto.ca/admissions" },
  { slug: "university-of-british-columbia", admissionsUrl: "https://you.ubc.ca/" },
  { slug: "mcgill-university", admissionsUrl: "https://www.mcgill.ca/undergraduate-admissions" },
  { slug: "university-of-alberta", admissionsUrl: "https://www.ualberta.ca/undergraduate-admissions" },
  { slug: "university-of-calgary", admissionsUrl: "https://www.ucalgary.ca/apply/future-students/undergraduate" },
  { slug: "mcmaster-university", admissionsUrl: "https://future.mcmaster.ca/admissions/" },
  { slug: "university-of-waterloo", admissionsUrl: "https://uwaterloo.ca/admissions/" },
  { slug: "western-university", admissionsUrl: "https://www.uwo.ca/admissions/" },
  { slug: "queens-university", admissionsUrl: "https://www.queensu.ca/admissions/" },
  { slug: "university-of-ottawa", admissionsUrl: "https://www.uottawa.ca/en/future-students/undergraduate/" },
  { slug: "dalhousie-university", admissionsUrl: "https://www.dal.ca/admissions.html" },
  { slug: "universite-laval", admissionsUrl: "https://www.ulaval.ca/en/admissions" },
  { slug: "universite-de-montreal", admissionsUrl: "https://www.umontreal.ca/admissions/" },
  { slug: "university-of-manitoba", admissionsUrl: "https://umanitoba.ca/admissions/" },
  { slug: "university-of-saskatchewan", admissionsUrl: "https://admissions.usask.ca/" },
];

/**
 * 加拿大 U15 学校爬虫
 * 
 * 当前 Phase 1: 使用静态种子数据
 * Phase 2+: 可扩展为自动抓取
 * 
 * 使用方式:
 * import { crawlCanadaSchools } from './canadaCrawler';
 * await crawlCanadaSchools();
 */
export async function crawlCanadaSchools(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  console.log("[Canada Crawler] Starting crawl for U15 schools...");

  for (const school of U15_SCHOOL_URLS) {
    try {
      console.log(`[Canada Crawler] Processing: ${school.slug}`);
      
      // Phase 2: 这里可以添加实际的爬取逻辑
      // 使用 Playwright/Cheerio 抓取学校官网
      // 
      // 示例:
      // const page = await browser.newPage();
      // await page.goto(school.admissionsUrl);
      // const deadlines = await page.$$eval('.deadline-table tr', ...);
      
      // 当前: 验证数据是否存在
      const existingData = canadaU15Schools.find(s => s.slug === school.slug);
      if (existingData) {
        console.log(`[Canada Crawler] ✓ ${school.slug} - data exists`);
        success++;
      } else {
        console.log(`[Canada Crawler] ✗ ${school.slug} - no data found`);
        failed++;
        errors.push(`No data found for ${school.slug}`);
      }
    } catch (error) {
      console.error(`[Canada Crawler] Error processing ${school.slug}:`, error);
      failed++;
      errors.push(`Error processing ${school.slug}: ${error}`);
    }
  }

  console.log(`[Canada Crawler] Complete: ${success} success, ${failed} failed`);
  
  return { success, failed, errors };
}

/**
 * 手动触发爬虫（用于 admin 手动更新）
 */
export async function manualCrawlCanadaSchools() {
  console.log("[Canada Crawler] Manual crawl triggered");
  const result = await crawlCanadaSchools();
  
  // 可以在这里添加通知逻辑
  if (result.failed > 0) {
    console.warn("[Canada Crawler] Some schools failed:", result.errors);
  }
  
  return result;
}
