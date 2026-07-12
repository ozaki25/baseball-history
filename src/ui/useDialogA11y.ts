import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * モーダルダイアログのアクセシビリティ副作用をまとめて担うフック。
 * open の間だけ有効化し、以下を行う（DOM 構造は一切変えない）:
 * - open になった直後に initialFocusRef へフォーカスを移す
 * - Escape で onClose を呼ぶ（フォーカス復帰は onClose 側の責務）
 * - Tab / Shift+Tab を dialogRef 内の先頭↔末尾で循環させる（フォーカストラップ）
 */
export function useDialogA11y({
  open,
  onClose,
  dialogRef,
  initialFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!open) return;
    initialFocusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const activeEl = document.activeElement;
      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, dialogRef, initialFocusRef]);
}
