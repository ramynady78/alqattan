import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TopProgressBar({
  visible,
  progress,
  variant,
}: {
  visible: boolean;
  progress: number;
  variant: "public" | "admin";
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={cn(
            "fixed top-0 left-0 right-0 z-[60] h-[3px] overflow-hidden",
            variant === "public" ? "bg-primary/10" : "bg-foreground/5",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
        >
          <motion.div
            className={cn(
              "h-full",
              variant === "public"
                ? "bg-gradient-to-l from-primary via-secondary to-primary"
                : "bg-gradient-to-l from-primary via-primary/70 to-primary",
            )}
            style={{ width: `${progress}%` }}
            animate={reduce ? undefined : { filter: ["brightness(1)", "brightness(1.06)", "brightness(1)"] }}
            transition={reduce ? undefined : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

