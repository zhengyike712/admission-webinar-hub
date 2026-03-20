// Canada Schools Router - Public API
import { router, publicProcedure } from "../trpc";
import { canadaU15Schools } from "../../data/canada-u15-seed";

export const canadaRouter = router({
  // 获取所有加拿大 U15 学校
  list: publicProcedure.query(async () => {
    return canadaU15Schools.map((school) => ({
      id: school.id,
      slug: school.slug,
      nameEn: school.nameEn,
      nameCn: school.nameCn,
      province: school.province,
      city: school.city,
      isU15: school.isU15,
      u15Rank: school.u15Rank,
      language: school.language,
      coOpSupported: school.coOpSupported,
      tuitionRange: school.tuitionRange,
      notablePrograms: school.notablePrograms,
    }));
  }),

  // 获取单个学校详情
  getBySlug: publicProcedure
    .input((z) => z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const school = canadaU15Schools.find((s) => s.slug === input.slug);
      if (!school) {
        return null;
      }
      return school;
    }),

  // 按省份获取学校
  getByProvince: publicProcedure
    .input((z) => z.object({ province: z.string() }))
    .query(async ({ input }) => {
      return canadaU15Schools
        .filter((s) => s.province === input.province)
        .map((school) => ({
          id: school.id,
          slug: school.slug,
          nameEn: school.nameEn,
          nameCn: school.nameCn,
          province: school.province,
          city: school.city,
          isU15: school.isU15,
          tuitionRange: school.tuitionRange,
        }));
    }),

  // 获取所有省份
  provinces: publicProcedure.query(async () => {
    const provinces = new Map<string, { code: string; name: string; nameCn: string; count: number }>();
    
    const provinceNames: Record<string, { name: string; nameCn: string }> = {
      ON: { name: "Ontario", nameCn: "安大略省" },
      BC: { name: "British Columbia", nameCn: "不列颠哥伦比亚省" },
      AB: { name: "Alberta", nameCn: "阿尔伯塔省" },
      QC: { name: "Quebec", nameCn: "魁北克省" },
      NS: { name: "Nova Scotia", nameCn: "新斯科舍省" },
      MB: { name: "Manitoba", nameCn: "曼尼托巴省" },
      SK: { name: "Saskatchewan", nameCn: "萨斯喀彻温省" },
    };

    canadaU15Schools.forEach((school) => {
      const existing = provinces.get(school.province);
      if (existing) {
        existing.count++;
      } else {
        provinces.set(school.province, {
          code: school.province,
          name: provinceNames[school.province]?.name || school.province,
          nameCn: provinceNames[school.province]?.nameCn || school.province,
          count: 1,
        });
      }
    });

    return Array.from(provinces.values());
  }),
});
