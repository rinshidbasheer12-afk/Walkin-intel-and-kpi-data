import { describe, expect, it } from "vitest";

import { accentTone, appearanceLabels, densityTokens } from "../lib/appearance";

describe("appearance settings", () => {
  it("softens accents without changing vivid accents", () => {
    expect(accentTone("#5A8FF2", "vivid")).toBe("#5A8FF2");
    expect(accentTone("#5A8FF2", "soft")).not.toBe("#5A8FF2");
    expect(accentTone("#5A8FF2", "soft")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("exposes an ordered density scale", () => {
    expect(densityTokens.compact.cardPadding).toBeLessThan(densityTokens.comfortable.cardPadding);
    expect(densityTokens.comfortable.cardPadding).toBeLessThan(densityTokens.airy.cardPadding);
    expect(densityTokens.compact.chartGap).toBeLessThan(densityTokens.airy.chartGap);
  });

  it("exposes all supported theme modes", () => {
    expect(Object.keys(appearanceLabels.mode)).toEqual(["light", "dim", "automatic"]);
  });
});
