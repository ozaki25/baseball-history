// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeView } from "#/components/HomeView";
import type { GameSearch } from "#/lib/search";
import { makeGame } from "#/tests/helpers/makeGame";

const GAMES = [
  makeGame({ id: "2025-04-01", date: "2025-04-01", opponent: "千葉ロッテ", result: "win" }),
  makeGame({
    id: "2025-05-03",
    date: "2025-05-03",
    opponent: "オリックス",
    stadium: "京セラドーム大阪",
    result: "lose",
    homeAway: "away",
  }),
  makeGame({
    id: "2013-08-07",
    date: "2013-08-07",
    opponent: "埼玉西武",
    stadium: "西武ドーム",
    result: "win",
    homeAway: "away",
  }),
  makeGame({
    id: "2026-08-10",
    date: "2026-08-10",
    opponent: "",
    stadium: "",
    result: "scheduled",
    homeAway: null,
    score: { fighters: null, opponent: null },
  }),
];
// 2024 は記録なし（空白年）としてマスタにだけ存在
const ALL_YEARS = ["2026", "2025", "2024", "2013"];

function setup(search: GameSearch = {}) {
  const onNavigate = vi.fn();
  const user = userEvent.setup();
  render(<HomeView games={GAMES} allYears={ALL_YEARS} search={search} onNavigate={onNavigate} />);
  return { onNavigate, user };
}

function recordHeading() {
  return screen.getByRole("heading", { name: /観戦記録/ });
}

describe("HomeView", () => {
  it("観戦記録（scheduled 除外）を一覧と件数で表示する", () => {
    setup();
    // win/lose/win の 3 件（scheduled は除外）
    expect(recordHeading()).toHaveTextContent("3件");
    const table = screen.getByRole("table", { name: "観戦記録" });
    expect(within(table).getByText("千葉ロッテ")).toBeInTheDocument();
    expect(within(table).getByText("オリックス")).toBeInTheDocument();
    expect(within(table).getByText("埼玉西武")).toBeInTheDocument();
  });

  it("scheduled があれば観戦予定を別枠で表示する", () => {
    setup();
    expect(screen.getByRole("region", { name: "観戦予定" })).toBeInTheDocument();
  });

  it("年フィルタのクリックで year を onNavigate に渡す", async () => {
    const { onNavigate, user } = setup();
    // 直近年（上部に出るクイック年度）をクリック
    await user.click(screen.getByRole("button", { name: "2025年" }));
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith({ year: "2025" });
  });

  it("search で年度指定すると一覧が絞られ、対象外年の予定も消える", () => {
    setup({ year: "2025" });
    // 2025 の 2 件のみ
    expect(recordHeading()).toHaveTextContent("2件");
    const table = screen.getByRole("table", { name: "観戦記録" });
    expect(within(table).queryByText("埼玉西武")).not.toBeInTheDocument();
    // 2026 の予定は 2025 絞り込みでは出ない
    expect(screen.queryByRole("region", { name: "観戦予定" })).not.toBeInTheDocument();
  });

  it("search の球場(安定ID)指定で一覧が絞られる（多値キーの結線）", () => {
    setup({ stadium: ["kyocera"] });
    // 京セラドーム大阪 の 1 件（オリックス）だけ
    expect(recordHeading()).toHaveTextContent("1件");
    const table = screen.getByRole("table", { name: "観戦記録" });
    expect(within(table).getByText("オリックス")).toBeInTheDocument();
    expect(within(table).queryByText("千葉ロッテ")).not.toBeInTheDocument();
  });

  it("「条件をクリア」で空の検索条件を onNavigate に渡す", async () => {
    const { onNavigate, user } = setup({ year: "2025" });
    await user.click(screen.getByRole("button", { name: "条件をクリア" }));
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith({});
  });

  it("記録なし年度(2024)も年フィルタの選択肢に出る", () => {
    setup();
    expect(screen.getByRole("button", { name: "2024年" })).toBeInTheDocument();
  });
});
