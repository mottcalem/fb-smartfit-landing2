import { describe, expect, it } from "vitest";
import { MODELS, PRICE_TL, recommend } from "@/lib/smartfit";

describe("SmartFit rules", () => {
  it("all three models sell at 4.900 TL", () => {
    expect(PRICE_TL).toBe(4900);
    expect(MODELS.map((m) => m.id)).toEqual(["konfor", "energy", "destek"]);
  });
  it("daily + soft recommends Konfor", () => {
    expect(recommend("daily", "soft")).toEqual(["konfor"]);
  });
  it("active + balanced recommends Energy", () => {
    expect(recommend("active", "balanced")).toEqual(["energy"]);
  });
  it("strong support recommends Destek", () => {
    expect(recommend("support", "firm")).toEqual(["destek"]);
  });
  it("conflicting answers show two models", () => {
    expect(recommend("daily", "firm")).toEqual(["konfor", "destek"]);
  });
});
