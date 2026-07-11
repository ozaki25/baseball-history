// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrossStats } from "@/components/CrossStats";
import { makeGame } from "@/tests/helpers/makeGame";

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

describe("CrossStats", () => {
  it("初期は球場別タブが選択されている", () => {
    render(<CrossStats games={GAMES} />);
    expect(screen.getByRole("tab", { name: "球場別" })).toHaveAttribute("aria-selected", "true");
  });

  it("球場別: 表記ゆれ(西武ドーム/ベルーナ)を代表名で1行に束ねる", () => {
    render(<CrossStats games={GAMES} />);
    const panel = screen.getByRole("tabpanel");
    // 代表ラベルは「ベルーナドーム」1行のみ（西武ドームという行は出ない）
    expect(within(panel).getByRole("rowheader", { name: "ベルーナドーム" })).toBeInTheDocument();
    expect(within(panel).queryByRole("rowheader", { name: "西武ドーム" })).not.toBeInTheDocument();
    expect(
      within(panel).getByRole("rowheader", { name: "エスコンフィールド" }),
    ).toBeInTheDocument();
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
});
