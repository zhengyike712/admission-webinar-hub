import { describe, it, expect } from "vitest";
import { getRecommendedQuestions, chatQuestions, SCENARIO_TAGS } from "../client/src/data/chatQuestions";

describe("chatQuestions data", () => {
  it("has at least 30 questions", () => {
    expect(chatQuestions.length).toBeGreaterThanOrEqual(30);
  });

  it("every question has id, text, textEn, and tags", () => {
    for (const q of chatQuestions) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(q.textEn).toBeTruthy();
      expect(Array.isArray(q.tags)).toBe(true);
      expect(q.tags.length).toBeGreaterThan(0);
    }
  });

  it("all question ids are unique", () => {
    const ids = chatQuestions.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("getRecommendedQuestions", () => {
  it("returns 4 questions by default", () => {
    const result = getRecommendedQuestions({
      schoolTypes: {},
      regions: {},
      sessionTypes: {},
    });
    expect(result.length).toBe(4);
  });

  it("returns general questions when no browsing profile", () => {
    const result = getRecommendedQuestions({
      schoolTypes: {},
      regions: {},
      sessionTypes: {},
    });
    // All returned questions should have the general_admission tag
    const hasGeneral = result.some((q) =>
      q.tags.includes(SCENARIO_TAGS.GENERAL_ADMISSION)
    );
    expect(hasGeneral).toBe(true);
  });

  it("prioritises LAC questions when user has browsed LAC schools", () => {
    const result = getRecommendedQuestions({
      schoolTypes: { "Liberal Arts College": 5 },
      regions: {},
      sessionTypes: {},
    });
    const lacQuestions = result.filter((q) =>
      q.tags.includes(SCENARIO_TAGS.LAC)
    );
    expect(lacQuestions.length).toBeGreaterThan(0);
  });

  it("prioritises UK questions when user has browsed UK region", () => {
    const result = getRecommendedQuestions({
      schoolTypes: {},
      regions: { UK: 3 },
      sessionTypes: {},
    });
    const ukQuestions = result.filter((q) => q.tags.includes(SCENARIO_TAGS.UK));
    expect(ukQuestions.length).toBeGreaterThan(0);
  });

  it("prioritises Financial Aid questions when user has browsed FA sessions", () => {
    const result = getRecommendedQuestions({
      schoolTypes: {},
      regions: {},
      sessionTypes: { "Financial Aid Session": 4 },
    });
    const faQuestions = result.filter((q) =>
      q.tags.includes(SCENARIO_TAGS.FINANCIAL_AID)
    );
    expect(faQuestions.length).toBeGreaterThan(0);
  });

  it("respects maxCount parameter", () => {
    const result = getRecommendedQuestions(
      { schoolTypes: {}, regions: {}, sessionTypes: {} },
      2
    );
    expect(result.length).toBe(2);
  });

  it("returns no duplicate questions", () => {
    const result = getRecommendedQuestions({
      schoolTypes: { "Liberal Arts College": 3, "National University": 2 },
      regions: { UK: 1 },
      sessionTypes: { "Financial Aid Session": 2 },
    });
    const ids = result.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
