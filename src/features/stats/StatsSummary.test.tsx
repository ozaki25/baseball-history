// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsSummary } from "#/features/stats/StatsSummary";
import { makeGame } from "#/tests/helpers/makeGame";

// 集計ロジックは stats.test.ts で網羅。ここは「集計結果が正しく画面に出るか」を確認する。
const GAMES = [
  makeGame({ id: "2025-04-01", date: "2025-04-01", result: "win" }),
  makeGame({ id: "2025-04-02", date: "2025-04-02", result: "win" }),
  makeGame({ id: "2025-04-03", date: "2025-04-03", result: "lose" }),
  makeGame({ id: "2025-04-04", date: "2025-04-04", result: "draw" }),
  makeGame({ id: "2025-05-01", date: "2025-05-01", result: "scheduled" }),
];

// セルはラベルと値を内包する。DOM 構造に依存せず、コンテナのテキストから
// ラベルを除いた残り（＝値）を読む。
function cell(label: string): string {
  const container = screen.getByText(label).parentElement!;
  return container.textContent!.replace(label, "");
}

describe("StatsSummary", () => {
  it("観戦・勝敗・勝率を表示する（予定は観戦数から除外）", () => {
    render(<StatsSummary games={GAMES} />);
    // 観戦=win2+lose1+draw1=4（scheduledは除外）
    expect(cell("観戦")).toBe("4");
    expect(cell("勝")).toBe("2");
    expect(cell("敗")).toBe("1");
    expect(cell("分")).toBe("1");
    // 勝率 = 勝2/(勝2+敗1) = .667
    expect(cell("勝率")).toBe(".667");
  });

  it("勝敗ゼロなら勝率は - 表示", () => {
    render(<StatsSummary games={[makeGame({ result: "unknown" })]} />);
    expect(cell("勝率")).toBe("-");
  });
});
