// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "#/components/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("初期はシステム（data-theme 未設定）", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /現在: システム/ })).toBeInTheDocument();
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("クリックで システム→ライト→ダーク→システム を循環し localStorage に保存", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /テーマ切り替え/ });

    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("theme")).toBe("light");

    await user.click(button);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(button);
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem("theme")).toBeNull(); // システムは保存しない
  });

  it("保存済みのテーマを初期表示に反映する", async () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    expect(await screen.findByRole("button", { name: /現在: ダーク/ })).toBeInTheDocument();
  });
});
