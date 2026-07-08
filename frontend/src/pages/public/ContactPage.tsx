import { useState } from "react";
import { useGetSettings, useCreateInquiry } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useDocumentTitle } from "@/lib/seo";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/Reveal";
import { resolveContactLinks } from "@/config/contactLinks";
import { FaFacebookF, FaInstagram, FaSnapchat, FaWhatsapp } from "react-icons/fa6";

export default function ContactPage() {
  useDocumentTitle("تواصل معنا");
  const { data: settings } = useGetSettings();
  const createInquiry = useCreateInquiry();
  const links = resolveContactLinks(settings ?? null);

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
          toast.error("حدث خطأ، حاول مرة أخرى");
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
          <h4 className="font-bold mb-1">{title}</h4>
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
    <div className="lux-section lux-noise">
      <div className="lux-container max-w-6xl">
        <Reveal>
          <SectionHeader title="تواصل معنا" subtitle="نحن هنا لخدمتك" align="center" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 mt-6 sm:mt-10">
          <div className="lg:col-span-1 space-y-5">
            <Reveal>
              <InfoCard
                icon={<Phone className="h-6 w-6 text-primary" />}
                title="الهاتف"
                value={links.phone.value}
                dir="ltr"
                href={links.phone.href}
              />
            </Reveal>
            <Reveal delay={0.05}>
              <InfoCard
                icon={<Mail className="h-6 w-6 text-primary" />}
                title="البريد الإلكتروني"
                value={links.email.value}
                href={links.email.href}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <InfoCard
                icon={<MapPin className="h-6 w-6 text-primary" />}
                title="العنوان"
                value={settings?.address || "غير متوفر"}
              />
            </Reveal>
            <Reveal delay={0.15}>
              <InfoCard
                icon={<Clock className="h-6 w-6 text-primary" />}
                title="ساعات العمل"
                value={"السبت - الخميس\n9:00 ص - 10:00 م"}
              />
            </Reveal>

            <Reveal delay={0.2}>
              <Card className="lux-surface lux-outline rounded-3xl">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-3">تابعنا</h4>
                  <div className="flex items-center gap-2">
                    {links.socials.map((s) => {
                      const Icon =
                        s.key === "instagram"
                          ? FaInstagram
                          : s.key === "snapchat"
                            ? FaSnapchat
                            : s.key === "facebook"
                              ? FaFacebookF
                              : FaWhatsapp;
                      return (
                        <a
                          key={s.key}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background/40 hover:bg-muted transition-all hover:-translate-y-0.5 hover:shadow-sm"
                          aria-label={s.label}
                          title={s.label}
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                  <div className="mt-4">
                    <a
                      href={links.whatsapp.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FaWhatsapp className="h-4 w-4" />
                      فتح محادثة واتساب مباشرة
                    </a>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Reveal>
              <Card className="lux-surface lux-outline rounded-3xl border shadow-sm">
                <CardContent className="p-5 sm:p-8 md:p-10">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4 sm:mb-6">أرسل لنا رسالة</h3>
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
                        رسالتك <span className="text-destructive">*</span>
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

            {settings?.mapEmbedUrl && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
