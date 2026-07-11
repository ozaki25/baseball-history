// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearFilter } from "#/components/YearFilter";

const YEARS = ["2025", "2024", "2013"];

describe("YearFilter", () => {
  it("「すべて」＋各年度のボタンを描画する", () => {
    render(<YearFilter years={YEARS} value="all" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2025年" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2013年" })).toBeInTheDocument();
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
