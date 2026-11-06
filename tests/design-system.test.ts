import { describe, expect, it } from "vitest";

import { design } from "../constants/design";

describe("shared component sizing guide", () => {
  it("keeps repeated card heights explicit and ordered", () => {
    expect(design.sizing.metricCard).toBe(123);
    expect(design.sizing.kpiCard).toBe(136);
    expect(design.sizing.categoryCard).toBe(184);
    expect(design.sizing.performerCard).toBe(132);
    expect(design.sizing.employeeCard).toBe(286);
  });

  it("keeps the shared cards tall enough for their content hierarchy", () => {
    expect(design.sizing.kpiCard).toBeGreaterThan(design.sizing.metricCard);
    expect(design.sizing.employeeCard).toBeGreaterThan(design.sizing.categoryCard);
  });
});
