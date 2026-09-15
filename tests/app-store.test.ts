import { describe, expect, it } from "vitest";

import { CATEGORIES, conversionRate, createDemoState, dateKey, inRange, lossReasonRows, recordedRevenue, sampleConfidence, toCsv } from "../lib/app-store";

describe("CycleIntel data model", () => {
  it("seeds a realistic demo workspace with distinct entities", () => {
    const state = createDemoState();
    expect(state.staff.length).toBeGreaterThan(5);
    expect(state.bikes.length).toBeGreaterThan(5);
    expect(state.walkIns.length).toBeGreaterThan(20);
    expect(state.walkIns.some((row) => row.sold)).toBe(true);
    expect(state.walkIns.some((row) => !row.sold && row.lostReason)).toBe(true);
  });

  it("keeps the category vocabulary explicit", () => {
    expect(CATEGORIES).toContain("Road");
    expect(CATEGORIES).toContain("Looking Around");
    expect(CATEGORIES).not.toContain("Customer");
  });

  it("includes today in today range", () => {
    expect(inRange(dateKey(new Date()), "today")).toBe(true);
  });

  it("exports the recorded interaction shape as CSV", () => {
    const state = createDemoState();
    const csv = toCsv(state.walkIns.slice(0, 1), state.staff, state.bikes);
    expect(csv.split("\n")[0]).toContain("DATE,TIME,ATTENDED,ENQUIRY");
    expect(csv.split("\n").length).toBe(2);
    expect(csv).toContain("Road");
  });

  it("derives commercial insights from the existing walk-in records", () => {
    const state = createDemoState();
    expect(conversionRate(state.walkIns)).toBeGreaterThan(0);
    expect(recordedRevenue(state.walkIns)).toBeGreaterThan(0);
    expect(lossReasonRows(state.walkIns)[0].value).toBeGreaterThan(0);
    expect(sampleConfidence(state.walkIns)).toBe("reliable signal");
  });

  it("treats every recorded walk-in as attended and never invents sales value", () => {
    const state = createDemoState();
    const sold = state.walkIns.filter((row) => row.sold);
    expect(state.walkIns.length).toBeGreaterThan(0);
    expect(state.walkIns.every((row) => row.date && row.time && row.staffId)).toBe(true);
    expect(sold.every((row) => typeof row.budget === "number" || row.budget === undefined)).toBe(true);
    expect(recordedRevenue(state.walkIns)).toBe(sold.reduce((sum, row) => sum + (row.budget ?? 0), 0));
  });

  it("keeps every recorded interaction attributable to a known employee", () => {
    const state = createDemoState();
    const staffIds = new Set(state.staff.map((person) => person.id));
    expect(state.walkIns.every((row) => staffIds.has(row.staffId))).toBe(true);
    expect(state.staff.every((person) => person.name && person.joinedAt && typeof person.active === "boolean")).toBe(true);
  });
});
