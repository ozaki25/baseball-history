import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "@/types/game";
import { applyFilters, deriveOptions, emptyFilter, isFilterActive } from "@/lib/filters";

function game(partial: Partial<Game> & { result: GameResult; date: string }): Game {
  return {
    id: partial.date,
    date: partial.date,
    opponent: partial.opponent ?? "オリックス",
    stadium: partial.stadium ?? "エスコンフィールド",
    homeAway: partial.homeAway ?? "home",
    result: partial.result,
    score: partial.score ?? { fighters: null, opponent: null },
  };
}

const games: Game[] = [
  game({ date: "2024-04-05", result: "win", stadium: "エスコンフィールド", homeAway: "home" }),
  game({
    date: "2025-05-18",
    result: "lose",
    stadium: "ベルーナドーム",
    homeAway: "away",
    opponent: "西武",
  }),
  game({ date: "2025-08-23", result: "win", stadium: "京セラドーム大阪", homeAway: "away" }),
];

describe("applyFilters", () => {
  it("空フィルタは全件通す", () => {
    expect(applyFilters(games, emptyFilter)).toHaveLength(3);
  });

  it("年で絞る", () => {
    expect(applyFilters(games, { ...emptyFilter, year: "2025" })).toHaveLength(2);
  });

  it("複数軸のANDで絞る", () => {
    const result = applyFilters(games, { ...emptyFilter, homeAway: "away", results: ["win"] });
    expect(result).toHaveLength(1);
    expect(result[0]!.date).toBe("2025-08-23");
  });

  it("球場の複数選択（OR）", () => {
    const result = applyFilters(games, {
      ...emptyFilter,
      stadiums: ["エスコンフィールド", "京セラドーム大阪"],
    });
    expect(result).toHaveLength(2);
  });
});

describe("deriveOptions", () => {
  it("実データの distinct 値を返す（年は新しい順）", () => {
    const options = deriveOptions(games);
    expect(options.years).toEqual(["2025", "2024"]);
    expect(options.stadiums).toContain("ベルーナドーム");
    expect(options.opponents).toContain("西武");
  });
});

describe("isFilterActive", () => {
  it("空フィルタは非アクティブ", () => {
    expect(isFilterActive(emptyFilter)).toBe(false);
    expect(isFilterActive({ ...emptyFilter, year: "2025" })).toBe(true);
  });
});
