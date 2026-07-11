import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "@/types/game";
import { applyFilters, deriveOptions, emptyFilter, isFilterActive } from "@/lib/filters";
import { resolveTeam, resolveStadium } from "@/lib/masters";

function game(partial: Partial<Game> & { result: GameResult; date: string }): Game {
  const opponent = partial.opponent ?? "オリックス";
  const stadium = partial.stadium ?? "エスコンフィールド";
  return {
    id: partial.date,
    date: partial.date,
    opponent,
    opponentId: opponent ? resolveTeam(opponent).id : "",
    stadium,
    stadiumId: stadium ? resolveStadium(stadium).id : "",
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

  it("球場の複数選択（安定IDのOR）", () => {
    const result = applyFilters(games, { ...emptyFilter, stadiums: ["escon", "kyocera"] });
    expect(result).toHaveLength(2);
  });
});

describe("deriveOptions", () => {
  it("安定IDで束ね、代表名を返す（年は新しい順）", () => {
    const options = deriveOptions(games);
    expect(options.years).toEqual(["2025", "2024"]);
    expect(
      options.stadiums.some((s) => s.id === "seibu-dome" && s.label === "ベルーナドーム"),
    ).toBe(true);
    expect(options.opponents.some((o) => o.id === "seibu" && o.label === "埼玉西武")).toBe(true);
  });
});

describe("isFilterActive", () => {
  it("空フィルタは非アクティブ", () => {
    expect(isFilterActive(emptyFilter)).toBe(false);
    expect(isFilterActive({ ...emptyFilter, year: "2025" })).toBe(true);
  });
});

describe("安定ID（表記ゆれの束ね）", () => {
  it("横浜と横浜DeNAは同一ID(baystars)", () => {
    expect(resolveTeam("横浜").id).toBe("baystars");
    expect(resolveTeam("横浜DeNA").id).toBe("baystars");
  });
  it("西武ドーム/西武プリンス/ベルーナドームは同一ID(seibu-dome)", () => {
    expect(resolveStadium("西武ドーム").id).toBe("seibu-dome");
    expect(resolveStadium("西武プリンス").id).toBe("seibu-dome");
    expect(resolveStadium("ベルーナドーム").id).toBe("seibu-dome");
  });
});
