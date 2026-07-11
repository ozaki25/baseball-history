// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameTable } from "@/components/GameTable";
import { makeGame } from "@/tests/helpers/makeGame";

const GAMES = [
  makeGame({ id: "2025-04-01", date: "2025-04-01", opponent: "千葉ロッテ", result: "win" }),
  makeGame({ id: "2025-06-15", date: "2025-06-15", opponent: "オリックス", result: "lose" }),
  makeGame({
    id: "2025-05-03",
    date: "2025-05-03",
    opponent: "埼玉西武",
    result: "cancelled",
    homeAway: null,
    score: { fighters: null, opponent: null },
  }),
];

// デスクトップ表(md:table)の行を取得。行=各試合、ヘッダ行を除く。
function tableRows() {
  const table = screen.getByRole("table");
  return within(table).getAllByRole("row").slice(1); // 先頭はヘッダ
}

describe("GameTable", () => {
  it("空配列なら空状態メッセージを出す", () => {
    render(<GameTable games={[]} />);
    expect(screen.getByText("条件に合う観戦記録がありません")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("全試合を行として描画する", () => {
    render(<GameTable games={GAMES} />);
    expect(tableRows()).toHaveLength(3);
    const table = screen.getByRole("table");
    expect(within(table).getByText("千葉ロッテ")).toBeInTheDocument();
    expect(within(table).getByText("オリックス")).toBeInTheDocument();
  });

  it("初期は日付降順（新しい試合が先頭）", () => {
    render(<GameTable games={GAMES} />);
    expect(tableRows()[0]).toHaveTextContent("2025.6.15");
    expect(tableRows()[2]).toHaveTextContent("2025.4.1");
  });

  it("日付ヘッダのクリックで並び順を切り替えられる", async () => {
    const user = userEvent.setup();
    render(<GameTable games={GAMES} />);
    const table = screen.getByRole("table");
    const dateButton = within(table).getByRole("button", { name: /日付/ });
    const dateHeader = () => within(table).getAllByRole("columnheader")[0]!;

    // 初期は降順
    expect(dateHeader()).toHaveAttribute("aria-sort", "descending");

    // 降順 → 解除 → 昇順（TanStack Table の既定サイクル）
    await user.click(dateButton);
    await user.click(dateButton);
    expect(dateHeader()).toHaveAttribute("aria-sort", "ascending");
    expect(tableRows()[0]).toHaveTextContent("2025.4.1");
    expect(tableRows()[2]).toHaveTextContent("2025.6.15");
  });

  it("中止試合は主催/球場が — 、スコアも —", () => {
    render(<GameTable games={[GAMES[2]!]} />);
    const table = screen.getByRole("table");
    // 対戦相手は表示される（埼玉西武）が、homeAway と score は — になる
    expect(within(table).getByText("埼玉西武")).toBeInTheDocument();
    expect(within(table).getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});
