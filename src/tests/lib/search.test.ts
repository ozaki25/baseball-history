import { describe, it, expect } from "vitest";
import { validateGameSearch, searchToFilter, filterToSearch } from "@/lib/search";
import { emptyFilter, type GameFilter } from "@/lib/filters";

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
