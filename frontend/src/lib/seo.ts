import { useEffect } from "react";
import { formatPageTitle, SITE_DESCRIPTION } from "@/config/site";

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = formatPageTitle(title);
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "description";
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    } else {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", SITE_DESCRIPTION);
      }
    }
  }, [title, description]);
}

