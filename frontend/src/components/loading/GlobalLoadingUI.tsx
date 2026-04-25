import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { TopProgressBar } from "@/components/loading/TopProgressBar";
import { FullPageLoader } from "@/components/loading/FullPageLoader";
import { useSmoothProgress } from "@/components/loading/useSmoothProgress";

export function GlobalLoadingUI() {
  const location = useLocation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const variant = useMemo<"public" | "admin">(
    () => (location.pathname.startsWith("/admin") ? "admin" : "public"),
    [location.pathname],
  );

  const loadingCount = isFetching + isMutating;
  const { visible: barVisible, progress } = useSmoothProgress({ active: loadingCount > 0 });

  const [routeTransition, setRouteTransition] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const routeKey = `${location.pathname}${location.search}`;
  useEffect(() => {
    setRouteTransition(true);
    const t = window.setTimeout(() => setRouteTransition(false), 1200);
    return () => window.clearTimeout(t);
  }, [routeKey]);

  useEffect(() => {
    if (loadingCount > 0 && routeTransition) {
      const t = window.setTimeout(() => setOverlayVisible(true), 420);
      return () => window.clearTimeout(t);
    }
    setOverlayVisible(false);
    return undefined;
  }, [loadingCount, routeTransition]);

  return (
    <>
      <TopProgressBar visible={barVisible} progress={progress} variant={variant} />
      <FullPageLoader show={overlayVisible} variant={variant} />
    </>
  );
}

