import { describe, it, expect } from "vitest";
import { buildGame, resultFromScores, toIsoDate, isFutureDate } from "@/lib/ingestCore";
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
