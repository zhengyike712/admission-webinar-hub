import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(ip = "127.0.0.1"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": ip },
      socket: { remoteAddress: ip },
    } as unknown as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// Mock fetch globally so we don't make real HTTP calls
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "" }));
});

describe("sendLink.sendToEmail", () => {
  it("returns success for valid email", async () => {
    const caller = appRouter.createCaller(createCtx("10.0.0.1"));
    const result = await caller.sendLink.sendToEmail({
      email: "test@example.com",
      url: "https://admissionhub-f6apvxhh.manus.space/",
      lang: "zh",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createCtx("10.0.0.2"));
    await expect(
      caller.sendLink.sendToEmail({
        email: "not-an-email",
        url: "https://admissionhub-f6apvxhh.manus.space/",
        lang: "en",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid URL", async () => {
    const caller = appRouter.createCaller(createCtx("10.0.0.3"));
    await expect(
      caller.sendLink.sendToEmail({
        email: "test@example.com",
        url: "not-a-url",
        lang: "en",
      })
    ).rejects.toThrow();
  });

  it("rate limits after 3 requests from same IP", async () => {
    const ip = "192.168.99.1";
    // First 3 should succeed
    for (let i = 0; i < 3; i++) {
      const caller = appRouter.createCaller(createCtx(ip));
      const result = await caller.sendLink.sendToEmail({
        email: `user${i}@example.com`,
        url: "https://admissionhub-f6apvxhh.manus.space/",
        lang: "en",
      });
      expect(result).toEqual({ success: true });
    }
    // 4th should be rate limited
    const caller = appRouter.createCaller(createCtx(ip));
    await expect(
      caller.sendLink.sendToEmail({
        email: "user4@example.com",
        url: "https://admissionhub-f6apvxhh.manus.space/",
        lang: "en",
      })
    ).rejects.toThrow("Too many requests");
  });
});
