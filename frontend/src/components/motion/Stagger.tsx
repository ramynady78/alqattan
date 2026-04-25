import { PropsWithChildren } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";

type StaggerProps = PropsWithChildren<{
  className?: string;
  once?: boolean;
  delayChildren?: number;
  staggerChildren?: number;
}>;

export function Stagger({
  children,
  className,
  once = true,
  delayChildren = 0.05,
  staggerChildren = 0.08,
}: StaggerProps) {
  const reduce = useReducedMotion();

  const variants: Variants = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

