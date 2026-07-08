import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITE_NAME_AR, SITE_NAME_EN, SITE_TAGLINE } from "@/config/site";

export function FullPageLoader({
  show,
  variant,
  title = "جاري التحميل...",
  subtitle = "يتم تجهيز البيانات...",
}: {
  show: boolean;
  variant: "public" | "admin";
  title?: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className={cn(
            "fixed inset-0 z-[70] grid place-items-center",
            variant === "public" ? "bg-background" : "bg-muted/40",
          )}
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className={cn(
              "absolute inset-0",
              variant === "public" ? "lux-noise" : "bg-gradient-to-b from-background to-muted/30",
            )}
          />

          <motion.div
            className={cn(
              "relative w-[min(520px,calc(100vw-2rem))] rounded-3xl border shadow-[0_18px_70px_rgba(0,0,0,0.08)]",
              variant === "public"
                ? "bg-card/75 backdrop-blur-xl lux-outline"
                : "bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80",
            )}
            initial={reduce ? { y: 0, scale: 1 } : { y: 10, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduce ? { y: 0, scale: 1 } : { y: -8, scale: 0.985 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-7 md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className={cn("text-xl sm:text-2xl font-serif font-bold", variant === "public" ? "text-primary" : "text-foreground")}>
                    {variant === "public" ? SITE_NAME_AR : "لوحة الإدارة"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {variant === "public" ? SITE_TAGLINE : `${SITE_NAME_EN} Admin`}
                  </div>
                </div>

                <motion.div
                  className={cn(
                    "shrink-0 h-12 w-12 rounded-2xl border bg-muted/30 grid place-items-center overflow-hidden",
                    variant === "public" ? "border-primary/20" : "border-border/60",
                  )}
                  animate={
                    reduce
                      ? undefined
                      : {
                          rotate: [0, 2.5, 0, -2.5, 0],
                          scale: [1, 1.02, 1],
                        }
                  }
                  transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  <div className={cn("lux-skeleton h-6 w-6 rounded-xl", variant === "public" ? "bg-primary/25" : "bg-primary/20")} />
                </motion.div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="text-base font-medium">{title}</div>
                <div className="text-sm text-muted-foreground">{subtitle}</div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="lux-skeleton h-3 flex-1 rounded-full" />
                  <div className="lux-skeleton h-3 w-20 rounded-full" />
                </div>
                <div className="lux-skeleton h-2.5 w-2/3 rounded-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

