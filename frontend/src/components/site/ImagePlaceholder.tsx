import { ImageIcon } from "lucide-react";

import { SITE_NAME_AR } from "@/config/site";

export function ImagePlaceholder() {
  return (
    <div className="w-full h-full min-h-[120px] sm:min-h-[200px] flex flex-col items-center justify-center bg-muted text-muted-foreground/50 p-2">
      <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 mb-2 opacity-50" />
      <span className="font-serif text-xs sm:text-sm font-medium text-center line-clamp-2">{SITE_NAME_AR}</span>
    </div>
  );
}
