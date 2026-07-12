import { describe, it, expect } from "vitest";
import {
  GAME_RESULTS,
  ATTENDED_RESULTS,
  DECIDED_RESULTS,
  isScheduled,
  isAttended,
  yearOf,
  type GameResult,
} from "./game";

describe("GAME_RESULTS / ATTENDED_RESULTS", () => {
  it("GAME_RESULTS は Game.result 型と一致し、5値すべてを含む", () => {
    // typeof の網羅性は型で担保。ここでは値の完全性を回帰で固定する。
    const all: GameResult[] = [...GAME_RESULTS];
    expect(all.sort()).toEqual(["draw", "lose", "scheduled", "unknown", "win"].sort());
  });

  it("ATTENDED_RESULTS は勝敗チップ表示順・URL 受理順として順序ごと固定（load-bearing）", () => {
    // 順序を並び替えると Filters のチップ表示が変わるため、順序込みで固定する。
    expect([...ATTENDED_RESULTS]).toEqual(["win", "lose", "draw"]);
  });

  it("ATTENDED_RESULTS は GAME_RESULTS の部分集合で scheduled/unknown を除く", () => {
    for (const r of ATTENDED_RESULTS) {
      expect(GAME_RESULTS).toContain(r);
      expect(r).not.toBe("scheduled");
      expect(r).not.toBe("unknown");
    }
  });

  it("DECIDED_RESULTS は ATTENDED_RESULTS と同一（勝敗が決着する 3 値）", () => {
    expect([...DECIDED_RESULTS]).toEqual(["win", "lose", "draw"]);
    for (const r of DECIDED_RESULTS) {
      expect(ATTENDED_RESULTS).toContain(r);
    }
  });
});

describe("isScheduled / isAttended", () => {
  it("scheduled のみ非観戦、他は観戦（unknown も観戦扱い）", () => {
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
