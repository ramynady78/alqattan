import { ImageIcon } from "lucide-react";

export function ImagePlaceholder() {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center bg-muted text-muted-foreground/50">
      <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
      <span className="font-serif text-sm font-medium">القطّان للستائر</span>
    </div>
  );
}
