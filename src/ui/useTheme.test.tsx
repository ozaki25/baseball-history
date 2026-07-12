// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "./useTheme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  it("初期はシステム（data-theme 未設定・未保存）", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("cycle で システム→ライト→ダーク→システム を循環し localStorage/属性を同期", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.cycle());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    act(() => result.current.cycle());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    act(() => result.current.cycle());
    expect(result.current.theme).toBe("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(localStorage.getItem("theme")).toBeNull(); // システムは保存しない
  });

  it("保存済みテーマ(dark)を初期状態に反映する", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("localStorage が例外を投げても system で描画を継続し、cycle は属性を更新し続ける", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system"); // 読取例外を握りつぶして継続

    act(() => result.current.cycle());
    // 保存が失敗しても state と data-theme 属性は更新される
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
