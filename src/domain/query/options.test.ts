import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "#/domain/game";
import { deriveOptions } from "#/domain/query/options";
import { resolveTeam, resolveStadium } from "#/domain/masters";

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

describe("deriveOptions", () => {
  it("安定IDで束ね、代表名を返す（年は新しい順）", () => {
    const options = deriveOptions(games);
    expect(options.years).toEqual(["2025", "2024"]);
    expect(
      options.stadiums.some((s) => s.id === "seibu-dome" && s.label === "ベルーナドーム"),
    ).toBe(true);
    expect(options.opponents.some((o) => o.id === "seibu" && o.label === "埼玉西武")).toBe(true);
  });

  it("allYears で記録の無い年度も候補に残す（新しい順で統合・重複なし）", () => {
    const options = deriveOptions(games, ["2023", "2024", "2017"]);
    // 実データ(2024,2025) と allYears(2023,2024,2017) を統合し降順
    expect(options.years).toEqual(["2025", "2024", "2023", "2017"]);
  });
});
