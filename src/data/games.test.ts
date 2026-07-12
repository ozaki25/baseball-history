import { describe, it, expect } from "vitest";
import { ALL_GAMES, ALL_YEARS, GAMES_GENERATED_AT, parseGamesData, parseDatesData } from "./games";

describe("ALL_GAMES / ALL_YEARS / GAMES_GENERATED_AT", () => {
  it("games.json をパースして ALL_GAMES を提供する（実データが1件以上）", () => {
    expect(ALL_GAMES.length).toBeGreaterThan(0);
    for (const g of ALL_GAMES) {
      expect(typeof g.id).toBe("string");
      expect(g.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("ALL_YEARS は dates.json のキー順（記録なし年度も含む）", () => {
    expect(ALL_YEARS.length).toBeGreaterThan(0);
    for (const y of ALL_YEARS) {
      expect(y).toMatch(/^\d{4}$/);
    }
  });

  it("GAMES_GENERATED_AT は取り込み時刻(ISO 文字列)", () => {
    expect(GAMES_GENERATED_AT).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

const validGame = {
  id: "2025-04-01",
  date: "2025-04-01",
  opponent: "オリックス",
  opponentId: "orix",
  stadium: "エスコンフィールド",
  stadiumId: "escon",
  homeAway: "home",
  result: "win",
  score: { fighters: 5, opponent: 3 },
};

describe("parseGamesData（境界の形状ガード）", () => {
  it("正しい形状を通す", () => {
    const parsed = parseGamesData({ generatedAt: "2026-07-12T00:00:00Z", games: [validGame] });
    expect(parsed.games).toHaveLength(1);
    expect(parsed.games[0]!.result).toBe("win");
  });

  it("generatedAt 欠落はエラー", () => {
    expect(() => parseGamesData({ games: [] })).toThrow(/generatedAt/);
  });

  it("games が配列でない場合エラー", () => {
    expect(() => parseGamesData({ generatedAt: "x", games: {} })).toThrow(/games/);
  });

  it("date が ISO 形式でない場合エラー", () => {
    const bad = { ...validGame, date: "2025/04/01" };
    expect(() => parseGamesData({ generatedAt: "x", games: [bad] })).toThrow(/date/);
  });

  it("result が GameResult 外だとエラー（型の逸脱を境界で捕捉）", () => {
    const bad = { ...validGame, result: "postponed" };
    expect(() => parseGamesData({ generatedAt: "x", games: [bad] })).toThrow(/result/);
  });

  it("homeAway が想定外の値だとエラー（null は許容）", () => {
    expect(() =>
      parseGamesData({ generatedAt: "x", games: [{ ...validGame, homeAway: "either" }] }),
    ).toThrow(/homeAway/);
    // null は許容
    const ok = parseGamesData({
      generatedAt: "x",
      games: [{ ...validGame, homeAway: null, result: "unknown" }],
    });
    expect(ok.games[0]!.homeAway).toBeNull();
  });

  it("score の fighters/opponent は number または null のみ", () => {
    expect(() =>
      parseGamesData({
        generatedAt: "x",
        games: [{ ...validGame, score: { fighters: "5", opponent: 3 } }],
      }),
    ).toThrow(/fighters/);
  });

  it("トップレベルが object でなければエラー", () => {
    expect(() => parseGamesData(null)).toThrow(/games\.json/);
    expect(() => parseGamesData("x")).toThrow(/games\.json/);
  });
});

describe("parseDatesData（境界の形状ガード）", () => {
  it("正しい形状を通す", () => {
    const parsed = parseDatesData({ "2025": ["0401", "0518"], "2013": ["0815"] });
    expect(parsed["2025"]).toEqual(["0401", "0518"]);
    expect(parsed["2013"]).toEqual(["0815"]);
  });

  it("空辞書は通す", () => {
    expect(parseDatesData({})).toEqual({});
  });

  it("キーが 4 桁の数字でないとエラー", () => {
    expect(() => parseDatesData({ "25": ["0401"] })).toThrow(/dates\.json/);
  });

  it("値が配列でないとエラー", () => {
    expect(() => parseDatesData({ "2025": "0401" })).toThrow(/dates\.json/);
  });

  it('要素が "MMDD" 形式でないとエラー', () => {
    expect(() => parseDatesData({ "2025": ["4/1"] })).toThrow(/MMDD/);
  });
});
