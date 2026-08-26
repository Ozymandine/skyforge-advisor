import { describe, it, expect } from "vitest";
import { auditVoidgloomReadiness, auditKuudraReadiness } from "../src/lib/boss-tactics";

describe("Boss Tactics Engine", () => {
  it("audits Voidgloom Seraph T1-T4 tiers with scorecards and requirements", () => {
    const audit = auditVoidgloomReadiness(undefined);

    expect(audit.tiers.length).toBe(4);
    expect(audit.overallScore).toBeGreaterThan(0);
    expect(audit.tiers[0].name).toContain("Voidgloom T1");
    expect(audit.tiers[3].name).toContain("Voidgloom T4");
    expect(audit.tiers[0].optimalLoadout.weapon).toBeDefined();
  });

  it("audits Infernal Kuudra roles and generates expected profit forecasts", () => {
    const audit = auditKuudraReadiness(undefined);

    expect(audit.roles.length).toBe(4);
    expect(audit.recommendedRole).toBeDefined();
    expect(audit.expectedNetProfitPerHour).toBeGreaterThan(0);
  });
});

