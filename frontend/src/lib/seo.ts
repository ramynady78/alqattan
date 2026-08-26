import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { formatPageTitle, SITE_DESCRIPTION } from "@/config/site";

export function useDocumentTitle(title: string, description?: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = formatPageTitle(title);
    const content = description || SITE_DESCRIPTION;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);

    if (pathname.startsWith("/admin")) {
      let robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
    }
  }, [title, description, pathname]);
}

