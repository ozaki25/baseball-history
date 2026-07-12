import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "#/domain/game";
import {
  summarize,
  groupBy,
  formatWinRate,
  buildRows,
  rowLabel,
} from "#/features/stats/model/stats";
import { resolveTeam, resolveStadium, teamLabel, stadiumLabel } from "#/domain/masters";

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

  it("unknown(詳細不明) は観戦数に含めるが勝敗には数えない", () => {
    const s = summarize([
      game({ date: "2006-06-02", result: "unknown" }),
      game({ date: "2025-04-01", result: "win" }),
    ]);
    expect(s.attended).toBe(2); // 記録として残す＝観戦数に含む
    expect(s.win).toBe(1);
    expect(s.lose + s.draw + s.cancelled).toBe(0);
    expect(s.winRate).toBe(1); // 勝1/(勝1+敗0)
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

describe("rowLabel", () => {
  it("主催/ビジターは日本語、年度はそのまま、未知キーはフォールバック", () => {
    expect(rowLabel("homeAway", "home")).toBe("主催");
    expect(rowLabel("homeAway", "away")).toBe("ビジター");
    expect(rowLabel("year", "2025")).toBe("2025");
    expect(rowLabel("stadium", "__unknown__")).toBe("__unknown__");
    expect(rowLabel("opponent", "__unknown__")).toBe("__unknown__");
  });

  it("球場/相手はそれぞれ stadiumLabel/teamLabel で解決する（軸を取り違えない）", () => {
    const sid = resolveStadium("エスコンフィールド").id;
    const oid = resolveTeam("千葉ロッテ").id;
    expect(rowLabel("stadium", sid)).toBe(stadiumLabel(sid));
    expect(rowLabel("opponent", oid)).toBe(teamLabel(oid));
    // 解決関数が入れ替わると値が変わることをこのテスト自身の前提として固定
    expect(stadiumLabel(sid)).not.toBe(teamLabel(sid));
    expect(teamLabel(oid)).not.toBe(stadiumLabel(oid));
  });
});

describe("buildRows", () => {
  const sample = [
    game({ result: "win", date: "2026-04-01" }),
    game({ result: "lose", date: "2025-04-01" }),
    game({ result: "win", date: "2025-05-01" }),
  ];

  it("年度別は記録の無い年度も0件で末尾に年降順で明示する（空白年を隠さない）", () => {
    const rows = buildRows(sample, "year", ["2026", "2025", "2024", "2013"]);
    // 実データ年(2025→2件, 2026→1件)が先、空白年(2024,2013)が末尾に年降順
    expect(rows.map((r) => r.key)).toEqual(["2025", "2026", "2024", "2013"]);
    const y2024 = rows.find((r) => r.key === "2024")!;
    expect(y2024.attended).toBe(0);
    expect(y2024.winRate).toBeNull();
  });

  it("years が空なら実データの年度のみ（空白年の補完なし）", () => {
    const rows = buildRows(sample, "year", []);
    expect(new Set(rows.map((r) => r.key))).toEqual(new Set(["2025", "2026"]));
  });

  it("年度以外の軸では years 引数を無視する", () => {
    const withYears = buildRows(sample, "homeAway", ["2024", "2013"]);
    const without = buildRows(sample, "homeAway", []);
    expect(withYears).toEqual(without);
  });
});
