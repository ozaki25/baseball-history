// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrossStats } from "#/components/CrossStats";
import { makeGame } from "#/tests/helpers/makeGame";

// 表記ゆれ（西武ドーム / ベルーナドーム）が同一IDへ束ねられ、代表名で1行に集約されることも確認。
const GAMES = [
  makeGame({
    id: "2013-08-07",
    date: "2013-08-07",
    stadium: "西武ドーム",
    opponent: "西武",
    result: "lose",
  }),
  makeGame({
    id: "2025-04-10",
    date: "2025-04-10",
    stadium: "ベルーナドーム",
    opponent: "埼玉西武",
    result: "win",
  }),
  makeGame({
    id: "2025-05-01",
    date: "2025-05-01",
    stadium: "エスコンフィールド",
    opponent: "千葉ロッテ",
    result: "win",
  }),
];

// 行(rowheader)から同じ <tr> の数値セルを取り出す。列順: 観戦/勝/敗/分/中止/勝率
function statsRow(name: string) {
  const panel = screen.getByRole("tabpanel");
  const row = within(panel).getByRole("rowheader", { name }).closest("tr")!;
  return within(row).getAllByRole("cell");
}

describe("CrossStats", () => {
  it("初期は球場別タブが選択されている", () => {
    render(<CrossStats games={GAMES} />);
    expect(screen.getByRole("tab", { name: "球場別" })).toHaveAttribute("aria-selected", "true");
  });

  it("球場別: 表記ゆれ(西武ドーム/ベルーナ)を代表名で1行に束ね、観戦数を合算する", () => {
    render(<CrossStats games={GAMES} />);
    const panel = screen.getByRole("tabpanel");
    // 代表ラベルは「ベルーナドーム」1行のみ（西武ドームという行は出ない）
    expect(within(panel).queryByRole("rowheader", { name: "西武ドーム" })).not.toBeInTheDocument();
    expect(
      within(panel).getByRole("rowheader", { name: "エスコンフィールド" }),
    ).toBeInTheDocument();
    // 2013(負) + 2025(勝) が束ねられ 観戦=2 / 勝=1 / 敗=1
    const cells = statsRow("ベルーナドーム");
    expect(cells[0]).toHaveTextContent("2"); // 観戦
    expect(cells[1]).toHaveTextContent("1"); // 勝
    expect(cells[2]).toHaveTextContent("1"); // 敗
  });

  it("相手別タブに切り替えるとチーム代表名で集計を出す", async () => {
    const user = userEvent.setup();
    render(<CrossStats games={GAMES} />);
    await user.click(screen.getByRole("tab", { name: "相手別" }));
    expect(screen.getByRole("tab", { name: "相手別" })).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    // 西武 / 埼玉西武 は同一IDなので「埼玉西武」1行に束ねられる
    expect(within(panel).getByRole("rowheader", { name: "埼玉西武" })).toBeInTheDocument();
    expect(within(panel).getByRole("rowheader", { name: "千葉ロッテ" })).toBeInTheDocument();
  });

  it("主催/ビジタータブは日本語ラベルで表示する", async () => {
    const user = userEvent.setup();
    render(<CrossStats games={GAMES} />);
    await user.click(screen.getByRole("tab", { name: "主催/ビジター" }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("rowheader", { name: "主催" })).toBeInTheDocument();
  });

  it("データが無ければ「データなし」を表示", () => {
    render(<CrossStats games={[]} />);
    expect(screen.getByText("データなし")).toBeInTheDocument();
  });

  it("年度別: 記録の無い年度も 0 件行として明示する（隠さない）", async () => {
    const user = userEvent.setup();
    // games は 2013/2025 のみ。years に 2017（空白年）を渡す。
    render(<CrossStats games={GAMES} years={["2025", "2017", "2013"]} />);
    await user.click(screen.getByRole("tab", { name: "年度別" }));
    // 空白年 2017 が末尾に 0 件で現れる
    const cells = statsRow("2017");
    expect(cells[0]).toHaveTextContent("0"); // 観戦
    expect(cells[5]).toHaveTextContent("-"); // 勝率（勝敗なし）
  });
});
