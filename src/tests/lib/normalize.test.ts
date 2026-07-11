import { describe, it, expect } from "vitest";
import { normalizeText } from "#/lib/normalize";

describe("normalizeText", () => {
  it("前後の空白と連続空白を整える", () => {
    expect(normalizeText("  エスコン   フィールド ")).toBe("エスコン フィールド");
  });

  it("全角英数を半角へ（NFKC）", () => {
    expect(normalizeText("ＺＯＺＯマリン")).toBe("ZOZOマリン");
  });

  it("カタカナはそのまま保持", () => {
    expect(normalizeText("オリックス")).toBe("オリックス");
  });
});
