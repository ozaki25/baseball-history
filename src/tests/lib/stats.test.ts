import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "@/types/game";
import { summarize, groupBy, formatWinRate } from "@/lib/stats";

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
  game({ date: "2025-04-01", result: "win" }),
  game({ date: "2025-04-02", result: "win" }),
  game({ date: "2025-04-03", result: "lose" }),
  game({ date: "2025-05-01", result: "draw" }),
  game({ date: "2025-06-01", result: "cancelled" }),
  game({ date: "2025-09-20", result: "scheduled" }),
];

describe("summarize", () => {
  it("観戦数は scheduled を除き cancelled を含む", () => {
    const s = summarize(games);
    expect(s.attended).toBe(5);
    expect(s.win).toBe(2);
    expect(s.lose).toBe(1);
    expect(s.draw).toBe(1);
    expect(s.cancelled).toBe(1);
  });

  it("勝率は 勝/(勝+敗)（引分・中止・予定は分母外）", () => {
    const s = summarize(games);
    expect(s.winRate).toBeCloseTo(2 / 3, 5);
  });

  it("勝敗が無ければ勝率は null", () => {
    const s = summarize([game({ date: "2025-06-01", result: "cancelled" })]);
    expect(s.winRate).toBeNull();
  });
});

describe("groupBy", () => {
  it("年別に集計する", () => {
    const rows = groupBy(games, "year");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.key).toBe("2025");
    expect(rows[0]!.attended).toBe(5);
  });

  it("球場別に分割する", () => {
    const rows = groupBy(
      [
        game({ date: "2025-04-01", result: "win", stadium: "エスコンフィールド" }),
        game({ date: "2025-04-02", result: "lose", stadium: "京セラドーム大阪" }),
      ],
      "stadium",
    );
    expect(rows).toHaveLength(2);
  });
});

describe("formatWinRate", () => {
  it("先頭の0を省いた .xxx 形式", () => {
    expect(formatWinRate(0.667)).toBe(".667");
    expect(formatWinRate(null)).toBe("-");
  });
});
