import { useEffect, useMemo, useRef, useState } from "react";

type Options = {
  active: boolean;
  delayMs?: number;
  minVisibleMs?: number;
};

export function useSmoothProgress({ active, delayMs = 180, minVisibleMs = 520 }: Options) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const shownAtRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const cancelTimers = () => {
    if (delayTimerRef.current) window.clearTimeout(delayTimerRef.current);
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    delayTimerRef.current = null;
    rafRef.current = null;
  };

  useEffect(() => {
    cancelTimers();

    if (active) {
      delayTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
        setProgress((p) => (p > 0 ? p : 8));

        const tick = () => {
          setProgress((p) => {
            if (!active) return p;
            if (p >= 92) return p;
            const delta = Math.max(0.6, (92 - p) * 0.035);
            return Math.min(92, p + delta);
          });
          rafRef.current = window.requestAnimationFrame(tick);
        };
        rafRef.current = window.requestAnimationFrame(tick);
      }, delayMs);
      return () => cancelTimers();
    }

    if (!visible) {
      setProgress(0);
      shownAtRef.current = null;
      return undefined;
    }

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const wait = Math.max(0, minVisibleMs - elapsed);

    delayTimerRef.current = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
        shownAtRef.current = null;
      }, 220);
    }, wait);

    return () => cancelTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return useMemo(() => ({ visible, progress }), [visible, progress]);
}

