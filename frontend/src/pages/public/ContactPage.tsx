import { useState } from "react";
import { useGetSettings, useCreateInquiry } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/Reveal";
import { isDisplayableEmail, isDisplayablePhone, resolveContactLinks } from "@/config/contactLinks";
import { FaWhatsapp } from "react-icons/fa6";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { SocialLinksRow } from "@/components/site/SocialLinksRow";
import { staticPageSeo } from "@/seo/pages";
import { usePageSeo } from "@/seo/usePageSeo";
import { STATIC_SEO } from "@/seo/content";

export default function ContactPage() {
  usePageSeo(staticPageSeo("contact"));
  const { data: settings } = useGetSettings();
  const createInquiry = useCreateInquiry();
  const links = resolveContactLinks(settings ?? null);
  const showPhone = isDisplayablePhone(links.phone.value);
  const showEmail = isDisplayableEmail(links.email.value);
  const showWhatsapp = isDisplayablePhone(links.whatsapp.value);
  const showAddress = Boolean(settings?.address?.trim());
  const hasContactMethods = showPhone || showEmail || showWhatsapp || showAddress || links.socials.length > 0;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInquiry.mutate(
      {
        data: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          items: [],
        },
      },
      {
        onSuccess: () => {
          toast.success("تم إرسال الطلب بنجاح");
          setFormData({ name: "", phone: "", email: "", message: "" });
        },
        onError: () => {
          toast.error("حدث خطأ، حاولوا مرة أخرى");
        },
      },
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const InfoCard = ({
    icon,
    title,
    value,
    dir,
    href,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    dir?: "ltr" | "rtl";
    href?: string;
  }) => (
    <Card className="lux-surface lux-outline rounded-3xl">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/10">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold mb-1">{title}</p>
          {href ? (
            <a
              href={href}
              className="text-muted-foreground break-words whitespace-pre-line hover:text-primary transition-colors"
              dir={dir}
            >
              {value}
            </a>
          ) : (
            <p className="text-muted-foreground break-words whitespace-pre-line" dir={dir}>
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PublicPageHero
        title={STATIC_SEO.contact.h1}
        subtitle="شاركونا احتياجكم والمساحة اللي تبغون تكملونها، ونساعدكم تختارون التصميم والتفاصيل المناسبة."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "تواصلوا معنا" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=80"
      />

      <div className="lux-section lux-noise">
        <div className="lux-container max-w-6xl">
          <Reveal>
            <SectionHeader title="أرسلوا طلبكم" subtitle="نبدأ من الفكرة" align="center" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 mt-6 sm:mt-10">
            <div className="order-1 lg:order-2 lg:col-span-2 space-y-8">
              <Reveal>
                <Card className="lux-surface lux-outline rounded-3xl border shadow-sm">
                  <CardContent className="p-5 sm:p-8 md:p-10">
                    <p className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6">بيانات الطلب</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            الاسم <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            رقم الجوال <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            dir="ltr"
                            className="text-right rounded-2xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          dir="ltr"
                          className="text-right rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">
                          رسالتكم <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="rounded-2xl"
                        />
                      </div>
                      <Button type="submit" size="lg" className="px-10 rounded-full" disabled={createInquiry.isPending}>
                        {createInquiry.isPending ? "جاري الإرسال…" : "إرسال الرسالة"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Reveal>

              {settings?.mapEmbedUrl ? (
                <Reveal>
                  <div className="rounded-3xl overflow-hidden border lux-outline h-80 bg-muted">
                    <iframe
                      src={settings.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="موقع المعرض"
                    />
                  </div>
                </Reveal>
              ) : null}
            </div>

            {hasContactMethods ? (
              <div className="order-2 lg:order-1 lg:col-span-1 space-y-5">
                {showPhone ? (
                  <Reveal>
                    <InfoCard
                      icon={<Phone className="h-6 w-6 text-primary" />}
                      title="الهاتف"
                      value={links.phone.value}
                      dir="ltr"
                      href={links.phone.href}
                    />
                  </Reveal>
                ) : null}
                {showEmail ? (
                  <Reveal delay={0.05}>
                    <InfoCard
                      icon={<Mail className="h-6 w-6 text-primary" />}
                      title="البريد الإلكتروني"
                      value={links.email.value}
                      href={links.email.href}
                    />
                  </Reveal>
                ) : null}
                {showAddress ? (
                  <Reveal delay={0.1}>
                    <InfoCard
                      icon={<MapPin className="h-6 w-6 text-primary" />}
                      title="العنوان"
                      value={settings?.address || ""}
                    />
                  </Reveal>
                ) : null}
                {showWhatsapp || links.socials.length > 0 ? (
                  <Reveal delay={0.15}>
                    <Card className="lux-surface lux-outline rounded-3xl">
                      <CardContent className="p-6">
                        <p className="font-bold mb-3">قنوات التواصل</p>
                        {links.socials.length > 0 ? <SocialLinksRow socials={links.socials} /> : null}
                        {showWhatsapp ? (
                          <div className="mt-4">
                            <a
                              href={links.whatsapp.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <FaWhatsapp className="h-4 w-4" />
                              فتح محادثة واتساب
                            </a>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Reveal>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="lux-section bg-muted/20">
        <div className="lux-container max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">كيف نقدر نساعدكم؟</h2>
            <p className="text-muted-foreground leading-relaxed">
              نساعدكم في اختيار التصميم، مناقشة التفاصيل المناسبة لمساحتكم، وترتيب خطوات الطلب والتنفيذ بوضوح. أرسلوا
              احتياجكم من النموذج، ونكمل معكم من هناك.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
