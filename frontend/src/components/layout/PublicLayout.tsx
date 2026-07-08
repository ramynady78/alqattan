import { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <PublicHeader />
      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 sm:pt-16 md:pt-[74px]">{children}</main>
      <PublicFooter />
    </div>
  );
}
