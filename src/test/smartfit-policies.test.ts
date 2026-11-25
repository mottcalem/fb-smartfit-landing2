import { describe, expect, it } from "vitest";
import { STORE_TERMS } from "@/lib/smartfit-policies";

describe("Merchant store terms", () => {
  it("dispatches within one business day", () => {
    expect(STORE_TERMS.dispatchBusinessDays).toBe(1);
  });
  it("offers 30 days of unconditional returns", () => {
    expect(STORE_TERMS.unconditionalReturnDays).toBe(30);
  });
  it("uses a 15 day cleaning interval", () => {
    expect(STORE_TERMS.cleaningIntervalDays).toBe(15);
  });
});
