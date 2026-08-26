import { useEffect, useRef } from "react";
import { applyPageSeo } from "./apply";
import type { PageSeo } from "./content";

export function usePageSeo(seo: PageSeo | null | undefined): void {
  const seoRef = useRef(seo);
  seoRef.current = seo;
  const title = seo?.title ?? "";
  const description = seo?.description ?? "";
  const path = seo?.path ?? "";
  const ogImagePath = seo?.ogImagePath ?? "";
  const ogType = seo?.ogType ?? "website";
  const robots = seo?.robots ?? "";
  const jsonLd = seo ? JSON.stringify(seo.jsonLd ?? null) : "";

  useEffect(() => {
    if (!seoRef.current) return;
    applyPageSeo(seoRef.current);
  }, [title, description, path, ogImagePath, ogType, robots, jsonLd]);
}
