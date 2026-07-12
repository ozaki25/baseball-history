import { describe, it, expect } from "vitest";
import { validateGameSearch, searchToFilter, filterToSearch } from "#/domain/query/search";
import { emptyFilter, type GameFilter } from "#/domain/query/filter";
import { resolveStadium, resolveTeam } from "#/domain/masters";

describe("validateGameSearch", () => {
  it("正しい値を通す", () => {
    expect(
      validateGameSearch({
        year: "2025",
        stadium: ["escon", "kyocera"],
        opponent: "orix",
        home: "away",
        result: ["win", "lose"],
      }),
    ).toEqual({
      year: "2025",
      stadium: ["escon", "kyocera"],
      opponent: ["orix"],
      home: "away",
      result: ["win", "lose"],
    });
  });

  it("不正な値をサニタイズする", () => {
    const out = validateGameSearch({
      year: "20",
      home: "somewhere",
      result: ["win", "bogus"],
      stadium: [],
    });
    expect(out.year).toBeUndefined();
    expect(out.home).toBeUndefined();
    expect(out.result).toEqual(["win"]);
    expect(out.stadium).toBeUndefined();
  });

  it("配列内の重複を除去する", () => {
    expect(validateGameSearch({ stadium: ["escon", "escon"] }).stadium).toEqual(["escon"]);
  });
});

describe("searchToFilter", () => {
  it("未指定は既定値になる", () => {
    expect(searchToFilter({})).toEqual(emptyFilter);
  });

  it("安定IDはそのまま通る", () => {
    expect(searchToFilter({ stadium: ["seibu-dome"], opponent: ["baystars"] })).toMatchObject({
      stadiums: ["seibu-dome"],
      opponents: ["baystars"],
    });
  });

  it("旧ブックマークの表示名もIDへ写像する（後方互換）", () => {
    const f = searchToFilter({ stadium: ["西武ドーム"], opponent: ["横浜"] });
    expect(f.stadiums).toEqual(["seibu-dome"]);
    expect(f.opponents).toEqual(["baystars"]);
  });

  it("表示名とIDが混在しても重複排除される", () => {
    expect(searchToFilter({ stadium: ["西武ドーム", "seibu-dome"] }).stadiums).toEqual([
      "seibu-dome",
    ]);
  });
});

describe("filterToSearch", () => {
  it("既定値は省略する", () => {
    expect(filterToSearch(emptyFilter)).toEqual({});
  });

  it("設定値だけ書き出す", () => {
    const f: GameFilter = {
      year: "2025",
      stadiums: ["escon"],
      opponents: [],
      homeAway: "home",
      results: ["win"],
    };
    expect(filterToSearch(f)).toEqual({
      year: "2025",
      stadium: ["escon"],
      home: "home",
      result: ["win"],
    });
  });

  it("filter → search → filter でIDが保たれる（ラウンドトリップ）", () => {
    const f: GameFilter = {
      year: "2024",
      stadiums: ["escon", "seibu-dome"],
      opponents: ["baystars"],
      homeAway: "away",
      results: ["win", "draw"],
    };
    expect(searchToFilter(filterToSearch(f))).toEqual(f);
  });
});

describe("filter ⇔ search ラウンドトリップ", () => {
  it("安定IDで組んだフィルタは search→filter で往復同一（項目追加時の変換漏れ検知）", () => {
    // stadiums/opponents は resolve で正準IDに解決した値を使う（往復の不動点）。
    const stadiums = [resolveStadium("エスコンフィールド").id, resolveStadium("ベルーナドーム").id];
    const opponents = [resolveTeam("千葉ロッテ").id, resolveTeam("オリックス").id];
    const filters: GameFilter[] = [
      emptyFilter,
      { year: "2025", stadiums: [], opponents: [], homeAway: "all", results: [] },
      { year: "2013", stadiums, opponents, homeAway: "away", results: ["win", "cancelled"] },
      { ...emptyFilter, homeAway: "home", results: ["draw"] },
    ];
    for (const f of filters) {
      expect(searchToFilter(filterToSearch(f))).toEqual(f);
    }
  });
});
