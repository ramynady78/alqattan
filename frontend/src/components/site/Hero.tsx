import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_NAME_AR, SITE_TAGLINE } from "@/config/site";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  heading: string;
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type HeroProps = {
  slides?: HeroSlide[];
  heading?: string;
  className?: string;
  autoplayMs?: number;
};

function clampIndex(n: number, len: number): number {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

export function Hero({ slides, heading, className, autoplayMs = 5000 }: HeroProps) {
  const reduce = useReducedMotion();

  const fallbackSlides: HeroSlide[] = useMemo(
    () => [
      {
        id: "signature",
        imageUrl:
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80",
        heading: SITE_NAME_AR,
        subheading: "تفاصيل فاخرة تصمم بعناية لتكمل ذوق منازلكم.",
        primaryCta: { label: "اختاروا من تصاميمنا", href: "/products" },
      },
      {
        id: "craft",
        imageUrl:
          "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=2400&q=80",
        heading: "أناقة تحاك بعناية",
        subheading: "أقمشة مختارة وتشطيب راق، لأن الفخامة تبدأ من الملمس.",
        primaryCta: { label: "اكتشفوا التصنيفات", href: "/categories" },
      },
      {
        id: "bespoke",
        imageUrl:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2400&q=80",
        heading: "تصميم حسب الطلب",
        subheading: "قياس، اقتراحات، وتنفيذ… تجربة سلسة من أول فكرة حتى التركيب.",
        primaryCta: { label: "تواصلوا معنا للطلب", href: "/contact" },
      },
    ],
    [],
  );

  const effectiveSlides = slides && slides.length >= 3 ? slides : fallbackSlides;
  const total = effectiveSlides.length;

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;

  const goTo = (next: number) => setIndex(clampIndex(next, total));
  const next = () => goTo(indexRef.current + 1);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      next();
    }, Math.max(2500, autoplayMs));
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs, reduce, total]);

  const slide = effectiveSlides[index]!;

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      aria-label="القسم الرئيسي"
    >
      <div className="relative min-h-[68vh] sm:min-h-[78vh] md:min-h-[86vh] lux-noise">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={reduce ? { opacity: 1 } : { opacity: 0.15, scale: 1.02 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background/70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,150,90,0.30),transparent_55%)] mix-blend-screen opacity-70" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 lux-container">
          <div className="mx-auto flex min-h-[68vh] sm:min-h-[78vh] md:min-h-[86vh] max-w-5xl flex-col items-center justify-center text-center pt-16 sm:pt-20 md:pt-24 px-2">
            <motion.div
              key={`${slide.id}-content`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: reduce ? { opacity: 1 } : { opacity: 0 },
                show: reduce
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.09,
                        delayChildren: 0.05,
                      },
                    },
              }}
              className="w-full"
            >
              <motion.div
                variants={{
                  hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
                  show: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/85 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs md:text-sm tracking-wide">
                  {SITE_TAGLINE}
                </span>
              </motion.div>

              <motion.h1
                variants={{
                  hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                  show: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="text-balance text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.08] text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
              >
                {heading || slide.heading}
              </motion.h1>

              <motion.p
                variants={{
                  hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                  show: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-4 sm:mt-5 max-w-2xl text-pretty text-sm sm:text-base md:text-xl text-white/90 leading-relaxed"
              >
                {slide.subheading}
              </motion.p>

              <motion.div
                variants={{
                  hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                  show: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Link to={slide.primaryCta.href}>
                  <Button size="lg" className="h-12 sm:h-14 px-7 sm:px-9 text-sm sm:text-base md:text-lg rounded-full shadow-sm w-full sm:w-auto">
                    {slide.primaryCta.label}
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>

              <div className="mt-10 flex items-center justify-center gap-2">
                {effectiveSlides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300",
                      i === index ? "w-10 bg-primary" : "w-2.5 bg-white/35 hover:bg-white/55",
                    )}
                    aria-label={`انتقال إلى الشريحة ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 lux-divider opacity-80" />
      </div>
    </section>
  );
}
