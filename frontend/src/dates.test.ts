import { describe, expect, it } from "vitest";
import { dayFromIso, dayToIso, formatDay } from "./dates";

describe("dates", () => {
  it("shows a UTC-midnight date as that same day", () => {
    expect(formatDay("2026-09-09T00:00:00Z")).toBe("Sep 9, 2026");
    expect(formatDay("2026-09-08T20:00:00-04:00")).toBe("Sep 9, 2026");
  });

  it("round-trips a picked day", () => {
    const picked = new Date(2026, 7, 2);
    expect(dayToIso(picked)).toBe("2026-08-02T00:00:00.000Z");
    expect(dayFromIso(dayToIso(picked)).getDate()).toBe(2);
  });
});
