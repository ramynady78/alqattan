import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminTableShell({
  children,
  toolbar,
  className,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card shadow-sm overflow-hidden text-right",
        "[&_th]:text-right [&_td]:text-right [&_th]:whitespace-nowrap",
        className,
      )}
    >
      {toolbar ? <div className="border-b bg-card/60 px-4 py-3">{toolbar}</div> : null}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
