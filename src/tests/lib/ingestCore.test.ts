import { describe, it, expect } from "vitest";
import type { Game } from "@/types/game";
import {
  buildGame,
  resultFromScores,
  toIsoDate,
  isFutureDate,
  withResolvedIds,
} from "@/lib/ingestCore";
import { loadTestHTML, TEST_PATTERNS } from "@/tests/helpers/testHtmlLoader";

describe("resultFromScores", () => {
  it("勝敗を判定する", () => {
    expect(resultFromScores(5, 1)).toBe("win");
    expect(resultFromScores(1, 5)).toBe("lose");
    expect(resultFromScores(4, 4)).toBe("draw");
  });
});

describe("toIsoDate", () => {
  it("YYYY + MMDD を ISO に変換", () => {
    expect(toIsoDate("2025", "0401")).toBe("2025-04-01");
    expect(toIsoDate("2026", "1103")).toBe("2026-11-03");
  });
});

describe("isFutureDate", () => {
  const now = new Date("2026-07-11T00:00:00Z");
  it("未来日は true", () => {
    expect(isFutureDate("2026-09-20", now)).toBe(true);
  });
  it("過去日は false", () => {
    expect(isFutureDate("2025-04-01", now)).toBe(false);
  });
});

describe("buildGame (フィクスチャで実パーサ検証)", () => {
  it("ホーム勝利", () => {
    const g = buildGame("2025-04-01", "2025-04-01", loadTestHTML(TEST_PATTERNS.HOME_WIN));
    expect(g.opponent).toBe("千葉ロッテ");
    expect(g.stadium).toBe("エスコンフィールド");
    expect(g.homeAway).toBe("home");
    expect(g.result).toBe("win");
    expect(g.score).toEqual({ fighters: 5, opponent: 1 });
  });

  it("ビジター勝利", () => {
    const g = buildGame("2025-08-23", "2025-08-23", loadTestHTML(TEST_PATTERNS.VISITOR_WIN));
    expect(g.opponent).toBe("オリックス");
    expect(g.homeAway).toBe("away");
    expect(g.result).toBe("win");
    expect(g.score).toEqual({ fighters: 1, opponent: 0 });
  });

  it("引き分け", () => {
    const g = buildGame("2025-05-01", "2025-05-01", loadTestHTML(TEST_PATTERNS.DRAW));
    expect(g.result).toBe("draw");
    expect(g.opponent).toBe("福岡ソフトバンク");
  });
});

describe("withResolvedIds", () => {
  it("表示名から opponentId/stadiumId を再解決する（表示名は保持）", () => {
    const stale: Game = {
      id: "2013-08-07",
      date: "2013-08-07",
      opponent: "埼玉西武",
      opponentId: "OLD",
      stadium: "西武ドーム",
      stadiumId: "OLD",
      homeAway: "away",
      result: "lose",
      score: { fighters: 6, opponent: 7 },
    };
    const fixed = withResolvedIds(stale);
    expect(fixed.opponentId).toBe("seibu");
    expect(fixed.stadiumId).toBe("seibu-dome");
    expect(fixed.opponent).toBe("埼玉西武");
    expect(fixed.stadium).toBe("西武ドーム");
  });

  it("表示名が空（中止/予定）ならIDも空", () => {
    const cancelled: Game = {
      id: "2025-07-14",
      date: "2025-07-14",
      opponent: "",
      opponentId: "x",
      stadium: "",
      stadiumId: "x",
      homeAway: null,
      result: "cancelled",
      score: { fighters: null, opponent: null },
    };
    const fixed = withResolvedIds(cancelled);
    expect(fixed.opponentId).toBe("");
    expect(fixed.stadiumId).toBe("");
  });
});
