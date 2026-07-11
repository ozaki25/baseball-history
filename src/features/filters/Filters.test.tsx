// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "#/features/filters/Filters";
import { emptyFilter, type FilterOptions, type GameFilter } from "#/features/filters/model/filters";

const OPTIONS: FilterOptions = {
  years: ["2025", "2024"],
  stadiums: [
    { id: "escon", label: "エスコンフィールド" },
    { id: "seibu-dome", label: "ベルーナドーム" },
  ],
  opponents: [
    { id: "lotte", label: "千葉ロッテ" },
    { id: "seibu", label: "埼玉西武" },
  ],
};

function setup(filter: GameFilter = emptyFilter) {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<Filters filter={filter} options={OPTIONS} onChange={onChange} />);
  return { onChange, user };
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /絞り込み/ }));
  return screen.getByRole("dialog");
}

describe("Filters", () => {
  it("初期はダイアログが閉じている", () => {
    setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("トリガーでダイアログが開き、選択肢が代表名で並ぶ", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("button", { name: "エスコンフィールド" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "千葉ロッテ" })).toBeInTheDocument();
  });

  it("球場チップのクリックで stadiumId を立て、他の条件は保持する", async () => {
    const { onChange, user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "ベルーナドーム" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, stadiums: ["seibu-dome"] });
  });

  it("選択済み球場チップの再クリックで解除する（toggle-off）", async () => {
    const { onChange, user } = setup({ ...emptyFilter, stadiums: ["escon"] });
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "エスコンフィールド" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, stadiums: [] });
  });

  it("年度チップは単一値として置き換える", async () => {
    const { onChange, user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "2024" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, year: "2024" });
  });

  it("主催/ビジターチップは単一値として置き換える", async () => {
    const { onChange, user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "ビジター" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, homeAway: "away" });
  });

  it("勝敗チップのクリックで results に追加する", async () => {
    const { onChange, user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "勝" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, results: ["win"] });
  });

  it("対戦相手チップのクリックで opponentId を立てる", async () => {
    const { onChange, user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "千葉ロッテ" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...emptyFilter, opponents: ["lotte"] });
  });

  it("選択済みチップは aria-pressed=true", async () => {
    const { user } = setup({ ...emptyFilter, opponents: ["lotte"] });
    const dialog = await openDialog(user);
    expect(within(dialog).getByRole("button", { name: "千葉ロッテ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(dialog).getByRole("button", { name: "埼玉西武" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("勝敗チップは予定(scheduled)を含まない", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    expect(within(dialog).getByRole("button", { name: "勝" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "中止" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "予定" })).not.toBeInTheDocument();
  });

  it("リセットボタンで emptyFilter を渡す", async () => {
    const { onChange, user } = setup({ ...emptyFilter, stadiums: ["escon"] });
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "リセット" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(emptyFilter);
  });

  it("Escape でダイアログを閉じ、トリガーへフォーカスを返す", async () => {
    const { user } = setup();
    await openDialog(user);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /絞り込み/ })).toHaveFocus();
  });

  it("開くと閉じるボタンに初期フォーカスが当たる", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    expect(within(dialog).getByRole("button", { name: "閉じる" })).toHaveFocus();
  });

  it("Tab が先頭↔末尾で循環する（フォーカストラップ）", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    const closeBtn = within(dialog).getByRole("button", { name: "閉じる" });
    const applyBtn = within(dialog).getByRole("button", { name: "この条件で見る" });

    expect(closeBtn).toHaveFocus(); // 先頭
    await user.tab({ shift: true }); // 先頭で Shift+Tab → 末尾へ
    expect(applyBtn).toHaveFocus();
    await user.tab(); // 末尾で Tab → 先頭へ
    expect(closeBtn).toHaveFocus();
  });

  it("「この条件で見る」で閉じ、トリガーへフォーカスを返す", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "この条件で見る" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /絞り込み/ })).toHaveFocus();
  });

  it("X（閉じる）ボタンで閉じ、トリガーへフォーカスを返す", async () => {
    const { user } = setup();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole("button", { name: "閉じる" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /絞り込み/ })).toHaveFocus();
  });

  it("背面(オーバーレイ)クリックで閉じる", async () => {
    const { user } = setup();
    await openDialog(user);
    // backdrop は X ボタンと区別できる固有名を持つ（アクセシブル名で選択）
    await user.click(screen.getByRole("button", { name: "閉じる（背景）" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("有効な条件があるとトリガーに件数バッジと「条件をクリア」を出す", () => {
    setup({ ...emptyFilter, stadiums: ["escon"], opponents: ["lotte"], homeAway: "home" });
    // stadiums1 + opponents1 + homeAway1 = 3。バッジはトリガーの名前に含まれる。
    expect(screen.getByRole("button", { name: /絞り込み\s*3/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "条件をクリア" })).toBeInTheDocument();
  });
});
