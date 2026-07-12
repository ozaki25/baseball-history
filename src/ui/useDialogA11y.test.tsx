// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, fireEvent } from "@testing-library/react";
import { useDialogA11y } from "./useDialogA11y";

function setupDom() {
  const dialog = document.createElement("div");
  const first = document.createElement("button");
  const mid = document.createElement("button");
  const last = document.createElement("button");
  first.textContent = "first";
  mid.textContent = "mid";
  last.textContent = "last";
  dialog.append(first, mid, last);
  const trigger = document.createElement("button");
  trigger.textContent = "trigger";
  document.body.append(trigger, dialog);
  return { dialog, first, mid, last, trigger };
}

function renderDialog(dom: ReturnType<typeof setupDom>, open: boolean, onClose = () => {}) {
  return renderHook(() =>
    useDialogA11y({
      open,
      onClose,
      dialogRef: { current: dom.dialog },
      initialFocusRef: { current: dom.mid },
    }),
  );
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useDialogA11y", () => {
  it("open 時に initialFocusRef へフォーカスを移す", () => {
    const dom = setupDom();
    renderDialog(dom, true);
    expect(document.activeElement).toBe(dom.mid);
  });

  it("Escape で onClose を呼ぶ", () => {
    const dom = setupDom();
    const onClose = vi.fn();
    renderDialog(dom, true, onClose);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Tab は末尾→先頭、Shift+Tab は先頭→末尾に循環する（フォーカストラップ）", () => {
    const dom = setupDom();
    renderDialog(dom, true);

    dom.last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(dom.first);

    dom.first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(dom.last);
  });

  it("中間要素での Tab は何もしない（ブラウザ既定の移動に任せる）", () => {
    const dom = setupDom();
    renderDialog(dom, true);
    dom.mid.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(dom.mid); // トラップは端でのみ介入
  });

  it("open=false のときは何もしない（Escape で onClose を呼ばない）", () => {
    const dom = setupDom();
    const onClose = vi.fn();
    renderDialog(dom, false, onClose);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
