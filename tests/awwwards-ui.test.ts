import { describe, expect, it } from "vitest";

import { nextScrollVisibility } from "../lib/awwwards-motion";

describe("Awwwards scroll navigation", () => {
  it("shows the floating action when returning to the top or scrolling upward", () => {
    expect(nextScrollVisibility(0, 80, false)).toBe(true);
    expect(nextScrollVisibility(54, 80, false)).toBe(true);
  });

  it("hides the floating action when scrolling down and ignores tiny jitter", () => {
    expect(nextScrollVisibility(84, 80, true)).toBe(false);
    expect(nextScrollVisibility(81, 80, true)).toBe(true);
  });
});
