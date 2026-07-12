import { describe, it, expect } from "vitest";
import {
  GAME_RESULTS,
  ATTENDED_RESULTS,
  isScheduled,
  isAttended,
  yearOf,
  type GameResult,
} from "./game";

describe("GAME_RESULTS / ATTENDED_RESULTS", () => {
  it("GAME_RESULTS は Game.result 型と一致し、6値すべてを含む", () => {
    // typeof の網羅性は型で担保。ここでは値の完全性を回帰で固定する。
    const all: GameResult[] = [...GAME_RESULTS];
    expect(all.sort()).toEqual(["cancelled", "draw", "lose", "scheduled", "unknown", "win"].sort());
  });

  it("ATTENDED_RESULTS は GAME_RESULTS の部分集合で scheduled/unknown を除く", () => {
    expect([...ATTENDED_RESULTS].sort()).toEqual(["cancelled", "draw", "lose", "win"].sort());
    for (const r of ATTENDED_RESULTS) {
      expect(GAME_RESULTS).toContain(r);
      expect(r).not.toBe("scheduled");
      expect(r).not.toBe("unknown");
    }
  });
});

describe("isScheduled / isAttended", () => {
  it("scheduled のみ非観戦、他は観戦（unknown/cancelled も観戦）", () => {
    expect(isScheduled({ result: "scheduled" })).toBe(true);
    for (const r of GAME_RESULTS) {
      if (r === "scheduled") continue;
      expect(isScheduled({ result: r })).toBe(false);
      expect(isAttended({ result: r })).toBe(true);
    }
    expect(isAttended({ result: "scheduled" })).toBe(false);
  });
});

describe("yearOf", () => {
  it("ISO 文字列と Game の両方から年度を取り出す", () => {
    expect(yearOf("2013-08-15")).toBe("2013");
    expect(yearOf({ date: "2025-04-01" })).toBe("2025");
  });
});
