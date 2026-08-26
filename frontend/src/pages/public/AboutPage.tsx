import { useGetSettings } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Sparkles } from "lucide-react";
import { SITE_NAME_AR } from "@/config/site";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { staticPageSeo } from "@/seo/pages";
import { usePageSeo } from "@/seo/usePageSeo";
import { STATIC_SEO } from "@/seo/content";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const { data: settings } = useGetSettings();
  const aboutText = settings?.aboutText?.trim();

  usePageSeo(staticPageSeo("about"));

  return (
    <div>
      <PublicPageHero
        title={STATIC_SEO.about.h1}
        subtitle="نساعدكم تختارون ستائر تكمل جمال المكان وتناسب ذوقكم، من الفكرة حتى التنفيذ."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "من نحن" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />

      <section className="lux-section lux-noise">
        <div className="lux-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <Reveal className="lg:col-span-7">
              <div className="rounded-3xl lux-surface lux-outline p-7 md:p-10 h-full">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                    <Sparkles className="ml-2 h-4 w-4 text-primary" />
                    تفاصيل فاخرة وتنفيذ راق
                  </span>
                </div>

                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold leading-tight">
                  {SITE_NAME_AR}… حيث يلتقي التصميم بجودة التنفيذ
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  نؤمن أن جمال المكان يبدأ من التفاصيل: خامة تلامس الذوق، تصميم ينسجم مع الأثاث، وتنفيذ يظهر الفرق.
                  نعمل معكم خطوة بخطوة من اختيار التصميم إلى القياس والتنفيذ، حتى تكون النتيجة تليق بمساحتكم.
                </p>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={0.05}>
              <div className="relative overflow-hidden rounded-3xl lux-outline h-full min-h-[360px] bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-background/70" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white">
                    <div className="text-sm text-white/85">من الفكرة إلى التنفيذ</div>
                    <div className="mt-1 text-xl font-serif font-bold">تجربة واضحة… ونتيجة متقنة</div>
                    <div className="mt-2 text-sm text-white/80">استشارات • قياسات • تفصيل • تركيب</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {aboutText ? (
        <section className="lux-section bg-muted/20">
          <div className="lux-container">
            <Reveal>
              <SectionHeader title="رؤيتنا" subtitle="ما نحرص عليه" align="center" />
            </Reveal>
            <Reveal>
              <div className="mx-auto max-w-3xl rounded-3xl lux-surface lux-outline p-7 md:p-10 prose prose-stone text-foreground/80 leading-relaxed dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: aboutText }} />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="اهتمامنا يبدأ من التفاصيل" subtitle="التصميم والجودة" align="center" />
          </Reveal>
          <p className="mx-auto mb-10 max-w-3xl text-center text-muted-foreground leading-relaxed">
            نركز على التصميم المناسب لكل مساحة، وجودة الخامة، والتفاصيل اللي تخلي الستارة متناسقة مع المكان.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: "تصميم يناسب المكان",
                text: "نوازن بين الأناقة والاستخدام اليومي حتى ينسجم الشكل مع الأثاث والإضاءة.",
              },
              {
                title: "جودة في الخامة والتنفيذ",
                text: "اختيار متأن للخامات وتشطيب مرتب يظهر الفرق في النتيجة النهائية.",
              },
              {
                title: "تفاصيل لكل مساحة",
                text: "كل بيت له طابعه. نساعدكم تختارون ما يناسب مساحتكم وذوقكم.",
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

      <section className="lux-section bg-muted/20">
        <div className="lux-container max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">لماذا الستائر العصرية؟</h2>
            <p className="text-muted-foreground leading-relaxed">
              نجمع بين تصاميم عصرية، تفصيل حسب الطلب، وتنفيذ يراعي تفاصيل المساحة. الهدف نتيجة تليق بذوقكم بدون مبالغة
              في الوعود.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="lux-section bg-card border-t">
        <div className="lux-container text-center">
          <Reveal>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              تصفحوا التصاميم، أو تواصلوا معنا لنساعدكم تختارون الأنسب لمساحتكم.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8">
                  اكتشفوا المنتجات
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  تصفحوا التصنيفات
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  تواصلوا معنا
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
