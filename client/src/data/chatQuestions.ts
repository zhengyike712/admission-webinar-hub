/**
 * chatQuestions.ts
 *
 * A curated bank of ~40 questions organised by scenario.
 * The AI chat component uses the user's browsing profile to pick the most
 * relevant questions to surface as one-click prompts.
 */

export interface ChatQuestion {
  id: string;
  text: string;
  textEn: string;
  textHi: string;
  /** Which scenario tags this question belongs to */
  tags: string[];
}

/** Scenario tags — must match the keys used in BrowsingProfile */
export const SCENARIO_TAGS = {
  // school types
  LAC: "Liberal Arts College",
  NATIONAL: "National University",
  RESEARCH: "Research University",
  COMPREHENSIVE: "Comprehensive University",
  // regions
  US: "US",
  UK: "UK",
  HK: "HK",
  AU: "AU",
  // session types
  FINANCIAL_AID: "Financial Aid Session",
  INTERNATIONAL: "International Student Session",
  GENERAL: "General Info Session",
  INTERVIEW: "interview",
  // generic
  GENERAL_ADMISSION: "general",
} as const;

export const chatQuestions: ChatQuestion[] = [
  // ── General admission ────────────────────────────────────────────────────
  {
    id: "g1",
    text: "Info Session 上最值得问的问题是什么？",
    textEn: "What are the most valuable questions to ask at an Info Session?",
    textHi: "Info Session में पूछने के लिए सबसे महत्वपूर्ण प्रश्न कौन से हैं?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },
  {
    id: "g2",
    text: "如何在 Info Session 上给招生官留下深刻印象？",
    textEn: "How can I make a strong impression on an admissions officer during an Info Session?",
    textHi: "Info Session में एडमिशन ऑफिसर पर अच्छा प्रभाव कैसे डालें?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },
  {
    id: "g3",
    text: "ED、EA 和 RD 申请有什么核心区别？",
    textEn: "What are the key differences between ED, EA, and RD applications?",
    textHi: "ED, EA और RD आवेदन में क्या मुख्य अंतर हैं?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },
  {
    id: "g4",
    text: "如何选择最适合自己的学校 list？",
    textEn: "How do I build a balanced college list that fits my profile?",
    textHi: "अपनी प्रोफाइल के अनुसार संतुलित कॉलेज लिस्ट कैसे बनाएं?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },
  {
    id: "g5",
    text: "Demonstrated Interest 对录取有多大影响？",
    textEn: "How much does demonstrated interest actually affect admissions decisions?",
    textHi: "Demonstrated Interest का एडमिशन निर्णय पर कितना प्रभाव पड़ता है?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },
  {
    id: "g6",
    text: "Common App 文书和补充文书有什么区别？",
    textEn: "What is the difference between the Common App essay and supplemental essays?",
    textHi: "Common App निबंध और Supplemental निबंध में क्या अंतर है?",
    tags: [SCENARIO_TAGS.GENERAL_ADMISSION, SCENARIO_TAGS.GENERAL],
  },

  // ── Liberal Arts Colleges ────────────────────────────────────────────────
  {
    id: "lac1",
    text: "文理学院和综合大学的申请有什么核心区别？",
    textEn: "What are the core differences between applying to a liberal arts college vs. a research university?",
    textHi: "Liberal Arts College और Research University में आवेदन करने में क्या मुख्य अंतर है?",
    tags: [SCENARIO_TAGS.LAC],
  },
  {
    id: "lac2",
    text: "文理学院的 Financial Aid 为什么通常更慷慨？",
    textEn: "Why do liberal arts colleges often offer more generous financial aid?",
    textHi: "Liberal Arts Colleges आमतौर पर अधिक उदार Financial Aid क्यों देते हैं?",
    tags: [SCENARIO_TAGS.LAC, SCENARIO_TAGS.FINANCIAL_AID],
  },
  {
    id: "lac3",
    text: "文理学院的 Why School 文书应该怎么写？",
    textEn: "How should I approach the 'Why This School' essay for a liberal arts college?",
    textHi: "Liberal Arts College के लिए 'Why This School' निबंध कैसे लिखें?",
    tags: [SCENARIO_TAGS.LAC],
  },
  {
    id: "lac4",
    text: "文理学院的课堂规模和教学方式有什么特点？",
    textEn: "What makes the classroom experience at a liberal arts college unique?",
    textHi: "Liberal Arts College में कक्षा का अनुभव क्या अनूठा बनाता है?",
    tags: [SCENARIO_TAGS.LAC],
  },
  {
    id: "lac5",
    text: "文理学院毕业生的就业和读研前景怎么样？",
    textEn: "What are the career and graduate school outcomes for liberal arts college graduates?",
    textHi: "Liberal Arts College के स्नातकों के करियर और उच्च शिक्षा के परिणाम कैसे हैं?",
    tags: [SCENARIO_TAGS.LAC],
  },

  // ── Research / National Universities ────────────────────────────────────
  {
    id: "ru1",
    text: "如何在大型研究型大学找到归属感？",
    textEn: "How do I find community and belonging at a large research university?",
    textHi: "बड़े Research University में समुदाय और अपनापन कैसे खोजें?",
    tags: [SCENARIO_TAGS.RESEARCH, SCENARIO_TAGS.NATIONAL],
  },
  {
    id: "ru2",
    text: "本科生参与科研的机会有多少？",
    textEn: "How accessible are undergraduate research opportunities at research universities?",
    textHi: "Research Universities में Undergraduate Research के अवसर कितने सुलभ हैं?",
    tags: [SCENARIO_TAGS.RESEARCH],
  },
  {
    id: "ru3",
    text: "Honors Program 值得申请吗？",
    textEn: "Is it worth applying to an Honors Program at a large university?",
    textHi: "क्या बड़े विश्वविद्यालय में Honors Program के लिए आवेदन करना उचित है?",
    tags: [SCENARIO_TAGS.RESEARCH, SCENARIO_TAGS.NATIONAL],
  },
  {
    id: "ru4",
    text: "如何在 Info Session 上了解某个专业的具体课程设置？",
    textEn: "How can I learn about specific major curriculum details during an Info Session?",
    textHi: "Info Session में किसी विशेष Major के पाठ्यक्रम के बारे में कैसे जानें?",
    tags: [SCENARIO_TAGS.RESEARCH, SCENARIO_TAGS.NATIONAL, SCENARIO_TAGS.GENERAL],
  },

  // ── UK ──────────────────────────────────────────────────────────────────
  {
    id: "uk1",
    text: "英国本科申请和美国有什么根本区别？",
    textEn: "What are the fundamental differences between UK and US undergraduate admissions?",
    textHi: "UK और US Undergraduate Admissions में मूलभूत अंतर क्या हैं?",
    tags: [SCENARIO_TAGS.UK],
  },
  {
    id: "uk2",
    text: "UCAS 申请流程是怎样的？",
    textEn: "How does the UCAS application process work?",
    textHi: "UCAS आवेदन प्रक्रिया कैसे काम करती है?",
    tags: [SCENARIO_TAGS.UK],
  },
  {
    id: "uk3",
    text: "英国大学的 Personal Statement 和美国文书有什么不同？",
    textEn: "How is the UK Personal Statement different from US college essays?",
    textHi: "UK Personal Statement और US College Essays में क्या अंतर है?",
    tags: [SCENARIO_TAGS.UK],
  },
  {
    id: "uk4",
    text: "牛津/剑桥的入学考试和面试是什么形式？",
    textEn: "What are the admissions tests and interview formats for Oxford and Cambridge?",
    textHi: "Oxford और Cambridge के Admissions Tests और Interview का स्वरूप क्या है?",
    tags: [SCENARIO_TAGS.UK],
  },

  // ── Hong Kong ────────────────────────────────────────────────────────────
  {
    id: "hk1",
    text: "香港大学的国际生申请流程是怎样的？",
    textEn: "How does the international student application process work for Hong Kong universities?",
    textHi: "हांगकांग विश्वविद्यालयों में International Student आवेदन प्रक्रिया कैसी है?",
    tags: [SCENARIO_TAGS.HK],
  },
  {
    id: "hk2",
    text: "香港顶尖院校的奖学金机会有哪些？",
    textEn: "What scholarship opportunities are available at top Hong Kong universities?",
    textHi: "हांगकांग के शीर्ष विश्वविद्यालयों में Scholarship के क्या अवसर हैं?",
    tags: [SCENARIO_TAGS.HK, SCENARIO_TAGS.FINANCIAL_AID],
  },
  {
    id: "hk3",
    text: "在香港读大学的生活费和学费大概是多少？",
    textEn: "What are the typical tuition and living costs at Hong Kong universities?",
    textHi: "हांगकांग विश्वविद्यालयों में Tuition और रहने का खर्च कितना है?",
    tags: [SCENARIO_TAGS.HK],
  },

  // ── Financial Aid ────────────────────────────────────────────────────────
  {
    id: "fa1",
    text: "Need-blind 和 Need-aware 录取有什么区别？",
    textEn: "What is the difference between need-blind and need-aware admissions?",
    textHi: "Need-blind और Need-aware Admissions में क्या अंतर है?",
    tags: [SCENARIO_TAGS.FINANCIAL_AID],
  },
  {
    id: "fa2",
    text: "如何在 Financial Aid Session 上问出有价值的问题？",
    textEn: "What questions should I ask at a Financial Aid Info Session?",
    textHi: "Financial Aid Info Session में कौन से महत्वपूर्ण प्रश्न पूछने चाहिए?",
    tags: [SCENARIO_TAGS.FINANCIAL_AID],
  },
  {
    id: "fa3",
    text: "Merit scholarship 和 Need-based aid 有什么区别？",
    textEn: "What is the difference between merit scholarships and need-based financial aid?",
    textHi: "Merit Scholarship और Need-based Financial Aid में क्या अंतर है?",
    tags: [SCENARIO_TAGS.FINANCIAL_AID],
  },
  {
    id: "fa4",
    text: "国际生能申请到 Need-based Financial Aid 吗？",
    textEn: "Can international students receive need-based financial aid at US universities?",
    textHi: "क्या International Students को US विश्वविद्यालयों में Need-based Financial Aid मिल सकती है?",
    tags: [SCENARIO_TAGS.FINANCIAL_AID, SCENARIO_TAGS.INTERNATIONAL],
  },

  // ── International Students ───────────────────────────────────────────────
  {
    id: "intl1",
    text: "国际生申请美国大学有哪些特别注意事项？",
    textEn: "What should international students pay special attention to when applying to US universities?",
    textHi: "US विश्वविद्यालयों में आवेदन करते समय International Students को क्या विशेष ध्यान देना चाहिए?",
    tags: [SCENARIO_TAGS.INTERNATIONAL],
  },
  {
    id: "intl2",
    text: "托福/雅思分数对录取的影响有多大？",
    textEn: "How much do TOEFL/IELTS scores affect international student admissions?",
    textHi: "TOEFL/IELTS स्कोर International Student Admissions को कितना प्रभावित करते हैं?",
    tags: [SCENARIO_TAGS.INTERNATIONAL],
  },
  {
    id: "intl3",
    text: "国际生的 F-1 签证申请流程是怎样的？",
    textEn: "How does the F-1 student visa application process work?",
    textHi: "F-1 Student Visa आवेदन प्रक्रिया कैसे काम करती है?",
    tags: [SCENARIO_TAGS.INTERNATIONAL],
  },
  {
    id: "intl4",
    text: "中国大陆高中生申请美国大学有哪些常见误区？",
    textEn: "What are common mistakes Chinese high school students make when applying to US universities?",
    textHi: "US विश्वविद्यालयों में आवेदन करते समय Chinese High School Students की सामान्य गलतियाँ क्या हैं?",
    tags: [SCENARIO_TAGS.INTERNATIONAL],
  },

  // ── Interviews ───────────────────────────────────────────────────────────
  {
    id: "int1",
    text: "Alumni Interview 和 AO Interview 有什么区别？",
    textEn: "What is the difference between an alumni interview and an AO interview?",
    textHi: "Alumni Interview और AO Interview में क्या अंतर है?",
    tags: [SCENARIO_TAGS.INTERVIEW],
  },
  {
    id: "int2",
    text: "面试前应该准备哪些问题问面试官？",
    textEn: "What questions should I prepare to ask my interviewer?",
    textHi: "Interview से पहले Interviewer से पूछने के लिए कौन से प्रश्न तैयार करने चाहिए?",
    tags: [SCENARIO_TAGS.INTERVIEW],
  },
  {
    id: "int3",
    text: "面试中如何展示真实的自己而不显得刻意？",
    textEn: "How can I show my authentic self in an interview without seeming rehearsed?",
    textHi: "Interview में बिना रटे हुए दिखे अपना असली व्यक्तित्व कैसे दिखाएं?",
    tags: [SCENARIO_TAGS.INTERVIEW],
  },
  {
    id: "int4",
    text: "面试结果对录取决定有多大权重？",
    textEn: "How much weight does the interview carry in the final admissions decision?",
    textHi: "Final Admissions Decision में Interview का कितना महत्व होता है?",
    tags: [SCENARIO_TAGS.INTERVIEW],
  },
];

/**
 * Given a browsing profile, return the most relevant questions (up to maxCount).
 * Scoring: each matching tag adds 1 point; ties broken by question order.
 */
export function getRecommendedQuestions(
  profile: { schoolTypes: Record<string, number>; regions: Record<string, number>; sessionTypes: Record<string, number> },
  maxCount = 4
): ChatQuestion[] {
  // Build a set of active tags weighted by interaction count
  const activeTags = new Map<string, number>();

  const addTags = (record: Record<string, number>, tagMap: Record<string, string>) => {
    for (const [key, count] of Object.entries(record)) {
      if (count > 0) {
        // Try to find a matching scenario tag
        const tag = Object.values(tagMap).find(
          (t) => t.toLowerCase() === key.toLowerCase() || key.toLowerCase().includes(t.toLowerCase())
        );
        if (tag) activeTags.set(tag, (activeTags.get(tag) ?? 0) + count);
      }
    }
  };

  // Map raw profile keys to scenario tag values
  addTags(profile.schoolTypes, {
    "Liberal Arts College": SCENARIO_TAGS.LAC,
    "National University": SCENARIO_TAGS.NATIONAL,
    "Research University": SCENARIO_TAGS.RESEARCH,
    "Comprehensive University": SCENARIO_TAGS.COMPREHENSIVE,
  });
  addTags(profile.regions, {
    US: SCENARIO_TAGS.US,
    UK: SCENARIO_TAGS.UK,
    HK: SCENARIO_TAGS.HK,
    AU: SCENARIO_TAGS.AU,
  });
  addTags(profile.sessionTypes, {
    "Financial Aid Session": SCENARIO_TAGS.FINANCIAL_AID,
    "International Student Session": SCENARIO_TAGS.INTERNATIONAL,
    "General Info Session": SCENARIO_TAGS.GENERAL,
  });

  const hasActivity = activeTags.size > 0;

  const scored = chatQuestions.map((q) => {
    let score = 0;
    for (const tag of q.tags) {
      score += activeTags.get(tag) ?? 0;
    }
    // Always give a base score to general questions when no activity yet
    if (!hasActivity && q.tags.includes(SCENARIO_TAGS.GENERAL_ADMISSION)) {
      score += 1;
    }
    return { q, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || chatQuestions.indexOf(a.q) - chatQuestions.indexOf(b.q))
    .slice(0, maxCount)
    .map(({ q }) => q);
}
