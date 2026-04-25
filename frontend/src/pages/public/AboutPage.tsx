import { useMemo } from "react";
import { useGetSettings, useListProducts } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Award, BriefcaseBusiness, Package, Sparkles, Star, Users } from "lucide-react";

type Testimonial = {
  name: string;
  city: string;
  text: string;
  rating: 5 | 4;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-primary" : "fill-transparent"} `} />
      ))}
    </div>
  );
}

export default function AboutPage() {
  const { data: settings } = useGetSettings();
  const { data: products } = useListProducts({ page: 1, limit: 1 });

  useDocumentTitle("من نحن");

  const stats = useMemo(() => {
    const years = 10;
    const completedProjects = 350;
    const happyClients = 520;
    const availableProducts = typeof products?.total === "number" ? products.total : 120;
    return { years, completedProjects, happyClients, availableProducts };
  }, [products?.total]);

  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        name: "نورة العتيبي",
        city: "الرياض",
        rating: 5,
        text: "الخامة راقية جداً والتنفيذ ممتاز. تعاملهم احترافي من القياس إلى التركيب، والنتيجة أجمل من المتوقع.",
      },
      {
        name: "فهد الشهري",
        city: "جدة",
        rating: 5,
        text: "تفصيل حسب الطلب بدقة، واهتمام بالتفاصيل في كل شيء. أنصح بهم لمن يبحث عن فخامة بدون تعقيد.",
      },
      {
        name: "أم محمد",
        city: "الخبر",
        rating: 4,
        text: "تجربة ممتازة بشكل عام، والستائر أعطت المكان فخامة واضحة. المواعيد كانت دقيقة والخدمة جميلة.",
      },
    ],
    [],
  );

  return (
    <div>
      {/* Hero / Story */}
      <section className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="من نحن" subtitle="قصتنا" align="center" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <Reveal className="lg:col-span-7">
              <div className="rounded-3xl lux-surface lux-outline p-7 md:p-10 h-full">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Badge variant="outline" className="rounded-full">
                    <Award className="ml-2 h-4 w-4 text-primary" />
                    أكثر من {stats.years} سنوات من الخبرة
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    <Sparkles className="ml-2 h-4 w-4 text-primary" />
                    تفاصيل فاخرة وتنفيذ راقٍ
                  </Badge>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                  القطّان للستائر… حيث تلتقي الفخامة بالأصالة
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  نؤمن أن جمال المكان يبدأ من التفاصيل: خامة تُلامس الذوق، تصميم ينسجم مع الأثاث،
                  وتنفيذ احترافي يظهر الفرق. نعمل معك خطوة بخطوة — من اختيار القماش إلى القياس
                  والتركيب — لنقدّم نتيجة تليق بذوق منزلك.
                </p>

                <div className="mt-7 prose prose-stone max-w-none text-foreground/80 leading-relaxed dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        settings?.aboutText ||
                        "<p>نقدم تشكيلة من الستائر والأقمشة والتنجيد بأسلوب عصري يراعي الهوية العربية ويواكب أحدث صيحات الديكور.</p>",
                    }}
                  />
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={0.05}>
              <div className="relative overflow-hidden rounded-3xl lux-outline h-full min-h-[360px] bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80"
                  alt="القطّان للستائر"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-background/70" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white">
                    <div className="text-sm text-white/85">من الفكرة إلى التركيب</div>
                    <div className="mt-1 text-xl font-serif font-bold">تجربة راقية… ونتيجة فاخرة</div>
                    <div className="mt-2 text-sm text-white/80">
                      استشارات • قياسات • تفصيل • تركيب
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="lux-section bg-muted/20">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="أرقام نفتخر بها" subtitle="خبرة ونتائج" align="center" />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BriefcaseBusiness, label: "سنوات الخبرة", value: `${stats.years}+` },
              { icon: Award, label: "مشاريع مُنجزة", value: `${stats.completedProjects}+` },
              { icon: Users, label: "عملاء سعداء", value: `${stats.happyClients}+` },
              { icon: Package, label: "منتجات متاحة", value: `${stats.availableProducts}+` },
            ].map((s, idx) => (
              <Reveal key={s.label} delay={0.03 + idx * 0.05}>
                <Card className="rounded-3xl lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center">
                        <s.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-3xl font-serif font-bold text-foreground">{s.value}</div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values / What we do */}
      <section className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="من نحن" subtitle="لماذا نختلف؟" align="center" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: "اختيار خامات بعناية",
                text: "أقمشة راقية، ألوان متزنة، وتفاصيل تليق بالديكور الفاخر.",
              },
              {
                title: "تصميم ينسجم مع المكان",
                text: "نوازن بين الأناقة والعملية لنمنحك مظهراً متناسقاً وهادئاً.",
              },
              {
                title: "تنفيذ وتركيب باحتراف",
                text: "قياس دقيق، تفصيل متقن، وتركيب نهائي يضمن النتيجة المطلوبة.",
              },
            ].map((v, idx) => (
              <Reveal key={v.title} delay={0.03 + idx * 0.05}>
                <div className="rounded-3xl lux-surface lux-outline p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/10 mb-4" />
                  <h3 className="text-xl font-serif font-bold">{v.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lux-section bg-card border-t">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="آراء عملائنا" subtitle="تجارب حقيقية" align="center" />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Reveal key={t.name} delay={0.03 + idx * 0.05}>
                <div className="rounded-3xl lux-surface lux-outline p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <Stars rating={t.rating} />
                  <p className="mt-4 text-foreground/80 leading-relaxed">“{t.text}”</p>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.city}</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/10" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

