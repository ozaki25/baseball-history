import { describe, it, expect } from "vitest";
import type { Game, GameResult } from "#/domain/game";
import { AXES, AXIS_ORDER, type GroupKey } from "#/domain/stats/axes";
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
    homeAway: "homeAway" in partial ? partial.homeAway! : "home",
    result: partial.result,
    score: partial.score ?? { fighters: null, opponent: null },
  };
}

describe("AXIS_ORDER", () => {
  it("タブ表示順を load-bearing として厳密固定（CrossStats のタブ順・列ヘッダ順の起点）", () => {
    // 順序を変えると CrossStats のタブが並び替わるため、順序込みで固定する。
    expect([...AXIS_ORDER]).toEqual(["stadium", "opponent", "year", "homeAway"]);
  });

  it("GroupKey 全キーを網羅する（キーごとに AXES にエントリがある）", () => {
    for (const k of AXIS_ORDER) {
      expect(AXES[k]).toBeDefined();
      expect(AXES[k].key).toBe(k);
    }
  });
});

describe("AXES 各軸のメタデータ（タブ表示語・列ヘッダは load-bearing）", () => {
  const expected: Record<GroupKey, { label: string; columnLabel: string }> = {
    stadium: { label: "球場別", columnLabel: "球場" },
    opponent: { label: "相手別", columnLabel: "相手" },
    year: { label: "年度別", columnLabel: "年度" },
    homeAway: { label: "主催/ビジター", columnLabel: "主催/ビジター" },
  };
  for (const k of AXIS_ORDER) {
    it(`${k}: label と columnLabel が固定`, () => {
      expect(AXES[k].label).toBe(expected[k].label);
      expect(AXES[k].columnLabel).toBe(expected[k].columnLabel);
    });
  }
});

describe("AXES.valueOf", () => {
  it("stadium: stadiumId を返す。空文字は集計対象外(null)", () => {
    expect(AXES.stadium.valueOf(game({ date: "2025-04-01", result: "win" }))).toBe(
      resolveStadium("エスコンフィールド").id,
    );
    expect(
      AXES.stadium.valueOf(game({ date: "2025-04-01", result: "unknown", stadium: "" })),
    ).toBeNull();
  });

  it("opponent: opponentId を返す。空文字は null", () => {
    expect(AXES.opponent.valueOf(game({ date: "2025-04-01", result: "win" }))).toBe(
      resolveTeam("オリックス").id,
    );
    expect(
      AXES.opponent.valueOf(game({ date: "2025-04-01", result: "unknown", opponent: "" })),
    ).toBeNull();
  });

  it("year: 日付から年度を抽出する", () => {
    expect(AXES.year.valueOf(game({ date: "2013-08-15", result: "win" }))).toBe("2013");
  });

  it("homeAway: game.homeAway をそのまま返す。null は集計対象外", () => {
    expect(
      AXES.homeAway.valueOf(game({ date: "2025-04-01", result: "win", homeAway: "home" })),
    ).toBe("home");
    expect(
      AXES.homeAway.valueOf(game({ date: "2025-04-01", result: "unknown", homeAway: null })),
    ).toBeNull();
  });
});

describe("AXES.labelOf（軸を取り違えない）", () => {
  it("stadium/opponent の解決先は異なる（安定IDが同値でも別ラベルになる）", () => {
    // 既存の実装は「未知キーは key をそのまま返す」フォールバック。
    // 既知IDでは stadiumLabel と teamLabel の結果が異なることを固定する。
    const sid = resolveStadium("エスコンフィールド").id;
    const oid = resolveTeam("千葉ロッテ").id;
    expect(AXES.stadium.labelOf(sid)).toBe("エスコンフィールド");
    expect(AXES.opponent.labelOf(oid)).toBe("千葉ロッテ");
  });

  it("homeAway は日本語、year はキーそのまま", () => {
    expect(AXES.homeAway.labelOf("home")).toBe("主催");
    expect(AXES.homeAway.labelOf("away")).toBe("ビジター");
    expect(AXES.year.labelOf("2025")).toBe("2025");
  });
});
