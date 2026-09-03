import { describe, expect, it } from "vitest";

import {
  alertRulesInputSchema,
  externalPriceHistoryInputSchema,
  fetchPlayerInputSchema,
  leaderboardIdSchema,
  logFlipInputSchema,
  priceHistoryInputSchema,
  webhookInputSchema,
} from "../src/lib/schemas";

describe("phase-1 input boundaries", () => {
  it("rejects overlong/invalid usernames", () => {
    expect(() =>
      fetchPlayerInputSchema.parse({ username: "a".repeat(17) }),
    ).toThrow();
    expect(() =>
      fetchPlayerInputSchema.parse({ username: "bad;name" }),
    ).toThrow();
    expect(
      fetchPlayerInputSchema.parse({ username: "Deathstreeks" }).username,
    ).toBe("Deathstreeks");
  });

  it("requires UUID-shaped API keys", () => {
    expect(() =>
      fetchPlayerInputSchema.parse({ username: "Steve", apiKey: "not-a-key" }),
    ).toThrow();
    expect(
      fetchPlayerInputSchema.parse({
        username: "Steve",
        apiKey: "123e4567-e89b-12d3-a456-426614174000",
      }).apiKey,
    ).toBe("123e4567-e89b-12d3-a456-426614174000");
  });

  it("caps price-history ids and logFlip values", () => {
    expect(() =>
      priceHistoryInputSchema.parse({ ids: Array(201).fill("STONE") }),
    ).toThrow();
    expect(() =>
      logFlipInputSchema.parse({
        id: "x",
        itemId: "STONE",
        price: -5,
        expected: 10,
        kind: "bazaar",
      }),
    ).toThrow();
  });

  it("only allows Discord webhook URLs or empty", () => {
    expect(webhookInputSchema.parse("")).toBe("");
    expect(() =>
      webhookInputSchema.parse("https://evil.com/hook"),
    ).toThrow();
    expect(
      webhookInputSchema.parse("https://discord.com/api/webhooks/123/abc").startsWith(
        "https://",
      ),
    ).toBe(true);
  });

  it("validates alert rules and external history", () => {
    expect(() =>
      alertRulesInputSchema.parse([
        { id: "1", itemId: "STONE", itemName: "Stone", direction: "sideways", threshold: 5 },
      ]),
    ).toThrow();
    expect(
      externalPriceHistoryInputSchema.parse({ itemId: "ENCHANTED_DIAMOND", days: 30 })
        .itemId,
    ).toBe("ENCHANTED_DIAMOND");
  });

  it("allowlist leaderboard ids", () => {
    expect(leaderboardIdSchema.parse("farming_1")).toBe("farming_1");
    expect(() => leaderboardIdSchema.parse("../etc/passwd")).toThrow();
  });
});
