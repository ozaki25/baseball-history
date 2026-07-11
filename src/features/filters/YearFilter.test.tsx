// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearFilter, visibleYears } from "#/features/filters/YearFilter";

// 新しい順。直近3年は 2026/2025/2024、それより古い年は既定では上部に出さない。
const YEARS = ["2026", "2025", "2024", "2023", "2019", "2013"];

describe("YearFilter", () => {
  it("「すべて」＋直近3年だけを描画し、それより古い年は出さない", () => {
    render(<YearFilter years={YEARS} value="all" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026年" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2025年" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2024年" })).toBeInTheDocument();
    // 直近外は上部に出さない（全年度は絞り込みシートで選ぶ）
    expect(screen.queryByRole("button", { name: "2023年" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "2013年" })).not.toBeInTheDocument();
  });

  it("直近外の年が選択されている時は、その年もピルに出して解除できる", () => {
    render(<YearFilter years={YEARS} value="2013" onChange={() => {}} />);
    const y2013 = screen.getByRole("button", { name: "2013年" });
    expect(y2013).toBeInTheDocument();
    expect(y2013).toHaveAttribute("aria-pressed", "true");
    // 他の直近外(2019/2023)は依然出さない
    expect(screen.queryByRole("button", { name: "2019年" })).not.toBeInTheDocument();
  });

  it("選択中の年度だけ aria-pressed=true になる", () => {
    render(<YearFilter years={YEARS} value="2024" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "2024年" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "すべて" })).toHaveAttribute("aria-pressed", "false");
  });

  it("年度クリックでその値を onChange に渡す", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearFilter years={YEARS} value="all" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "2025年" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("2025");
  });

  it("「すべて」クリックで all を onChange に渡す", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearFilter years={YEARS} value="2025" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "すべて" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("all");
  });
});

describe("visibleYears（純関数）", () => {
  it("既定は直近3年のみ", () => {
    expect(visibleYears(YEARS, "all")).toEqual(["2026", "2025", "2024"]);
  });

  it("選択中の年が直近内ならそのまま（重複させない）", () => {
    expect(visibleYears(YEARS, "2025")).toEqual(["2026", "2025", "2024"]);
  });

  it("選択中の年が直近外なら末尾に足して可視化する", () => {
    expect(visibleYears(YEARS, "2013")).toEqual(["2026", "2025", "2024", "2013"]);
  });

  it("recentCount を変えられる", () => {
    expect(visibleYears(YEARS, "all", 2)).toEqual(["2026", "2025"]);
  });
});
