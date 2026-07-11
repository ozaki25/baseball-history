// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameTable } from "#/components/GameTable";
import { makeGame } from "#/tests/helpers/makeGame";

const GAMES = [
  makeGame({ id: "2025-04-01", date: "2025-04-01", opponent: "千葉ロッテ", result: "win" }),
  makeGame({
    id: "2025-06-15",
    date: "2025-06-15",
    opponent: "オリックス",
    result: "lose",
    score: { fighters: 2, opponent: 6 },
  }),
  makeGame({
    id: "2025-05-03",
    date: "2025-05-03",
    opponent: "埼玉西武",
    stadium: "",
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
    const dateHeader = () => within(table).getByRole("columnheader", { name: /日付/ });

    // 初期は降順
    expect(dateHeader()).toHaveAttribute("aria-sort", "descending");

    // 降順 → 解除 → 昇順（TanStack Table の既定サイクル）
    await user.click(dateButton);
    await user.click(dateButton);
    expect(dateHeader()).toHaveAttribute("aria-sort", "ascending");
    expect(tableRows()[0]).toHaveTextContent("2025.4.1");
    expect(tableRows()[2]).toHaveTextContent("2025.6.15");
  });

  it("中止試合は主催/V・球場・スコアが — 、対戦相手は表示する", () => {
    render(<GameTable games={[GAMES[2]!]} />);
    // 列順: 日付 / 対戦相手 / 主催V / 球場 / 結果 / スコア
    const cells = within(tableRows()[0]!).getAllByRole("cell");
    expect(cells[1]).toHaveTextContent("埼玉西武"); // 対戦相手は残る
    expect(cells[2]).toHaveTextContent("—"); // 主催/V（homeAway=null）
    expect(cells[3]).toHaveTextContent("—"); // 球場（空）
    expect(cells[5]).toHaveTextContent("—"); // スコア（null）
  });

  it("日付は取得元(公式サイトの試合結果)へのリンク", () => {
    render(<GameTable games={GAMES} />);
    const table = screen.getByRole("table", { name: "観戦記録" });
    const link = within(table).getByRole("link", { name: /2025\.6\.15/ });
    expect(link).toHaveAttribute("href", "https://www.fighters.co.jp/gamelive/result/2025061501/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("モバイルカードにも対戦相手とスコアを表示する", () => {
    render(<GameTable games={GAMES} />);
    // モバイルは <ul>（role=list）。テーブルとは別に列挙される。
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(list).getByText("千葉ロッテ")).toBeInTheDocument();
    expect(within(list).getByText("5 - 1")).toBeInTheDocument();
  });
});
