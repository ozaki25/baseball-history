import { describe, it, expect } from "vitest";
import { pickDefaultYear } from "#/domain/query/defaults";

function now(year: number): Date {
  return new Date(`${year}-06-15T00:00:00Z`);
}

describe("pickDefaultYear", () => {
  it("allYears が空なら undefined", () => {
    expect(pickDefaultYear([], now(2026))).toBeUndefined();
  });

  it("今年の観戦データがあれば今年を返す", () => {
    expect(pickDefaultYear(["2013", "2025", "2026"], now(2026))).toBe("2026");
  });

  it("今年のデータが無ければ観戦データの最新年にフォールバック", () => {
    // 2027 年初にアクセスしたが 2027 年の観戦データがまだ無い → 2026
    expect(pickDefaultYear(["2013", "2025", "2026"], now(2027))).toBe("2026");
  });

  it("allYears が挿入順（時系列でない）でも文字列ソートで最新を選ぶ", () => {
    expect(pickDefaultYear(["2026", "2013", "2025"], now(2030))).toBe("2026");
  });

  it("今年 1 件だけ", () => {
    expect(pickDefaultYear(["2026"], now(2026))).toBe("2026");
  });
});
