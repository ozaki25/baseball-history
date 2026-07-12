import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * モーダルダイアログのアクセシビリティ副作用をまとめて担うフック。
 * open の間だけ有効化し、以下を行う（DOM 構造は一切変えない）:
 * - open になった直後に initialFocusRef へフォーカスを移す（open 遷移時の1回のみ）
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
  // onClose は毎レンダー新規生成されうる。ref に逃がし、keydown effect の再購読や
  // 初期フォーカス effect の再実行（＝フォーカス奪取）を防ぐ。
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 初期フォーカスは open 遷移時のみ。onClose 等の変化で再実行させない（開いている間の
  // 再レンダーでフォーカスを奪わない）。
  useEffect(() => {
    if (open) initialFocusRef.current?.focus();
  }, [open, initialFocusRef]);

  // Escape で閉じる / Tab のフォーカストラップ。
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
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
  }, [open, dialogRef]);
}
