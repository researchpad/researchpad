import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "@tanstack/react-router";

const NAV_MAP: Record<string, string> = {
  d: "/",
  e: "/experiments",
  r: "/research",
  b: "/debug",
  i: "/insights",
};

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleHelp = useCallback(() => setShowHelp((p) => !p), []);
  const closeHelp = useCallback(() => setShowHelp(false), []);

  useEffect(() => {
    function isInputFocused() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (el as HTMLElement).isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();

      // ? — toggle help
      if (key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        toggleHelp();
        return;
      }

      // Escape — close help
      if (key === "escape" && showHelp) {
        e.preventDefault();
        closeHelp();
        return;
      }

      // / — focus search input
      if (key === "/" && !e.shiftKey) {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]'
        );
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          return;
        }
      }

      // g + key navigation
      if (pendingG.current) {
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        const dest = NAV_MAP[key];
        if (dest) {
          e.preventDefault();
          router.navigate({ to: dest });
          return;
        }
      }

      if (key === "g" && !e.ctrlKey && !e.metaKey) {
        pendingG.current = true;
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 500);
        return;
      }

      // j/k — navigate table rows
      if (key === "j" || key === "k") {
        const rows = Array.from(
          document.querySelectorAll<HTMLElement>("table tbody tr, [data-row]")
        );
        if (rows.length === 0) return;

        const current = rows.findIndex((r) => r.classList.contains("ring-1"));
        let next: number;
        if (key === "j") {
          next = current < 0 ? 0 : Math.min(current + 1, rows.length - 1);
        } else {
          next = current < 0 ? rows.length - 1 : Math.max(current - 1, 0);
        }

        rows.forEach((r) => r.classList.remove("ring-1", "ring-accent-cyan/30"));
        rows[next].classList.add("ring-1", "ring-accent-cyan/30");
        rows[next].scrollIntoView({ block: "nearest" });
        return;
      }

      // Enter — click focused row
      if (key === "enter") {
        const focused = document.querySelector<HTMLElement>(
          "table tbody tr.ring-1, [data-row].ring-1"
        );
        if (focused) {
          e.preventDefault();
          focused.click();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showHelp, toggleHelp, closeHelp]);

  return { showHelp, toggleHelp, closeHelp };
}
