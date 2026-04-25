import { Link } from "react-router-dom";
import { useGetSettings } from "@workspace/api-client-react";
import { MapPin, Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaSnapchat, FaWhatsapp } from "react-icons/fa6";
import { Reveal } from "@/components/motion/Reveal";
import { resolveContactLinks } from "@/config/contactLinks";

export function PublicFooter() {
  const { data: settings } = useGetSettings();
  const links = resolveContactLinks(settings ?? null);

  return (
    <footer className="mt-auto border-t bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="lux-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-5">
            <Reveal>
              <div>
                <div className="text-sm tracking-wide text-muted-foreground">Al Qattan</div>
                <h3 className="text-2xl font-serif font-bold text-primary leading-tight">
                  القطّان للستائر
                </h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                {settings?.brandTagline || "الفخامة والأناقة في كل تفصيلة."}
              </p>
              <div className="h-px w-40 lux-divider opacity-60" />
            </Reveal>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Reveal delay={0.05}>
              <h4 className="font-semibold">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/products">
                    <span className="hover:text-primary cursor-pointer transition-colors">المنتجات</span>
                  </Link>
                </li>
                <li>
                  <Link to="/categories">
                    <span className="hover:text-primary cursor-pointer transition-colors">التصنيفات</span>
                  </Link>
                </li>
                <li>
                  <Link to="/gallery">
                    <span className="hover:text-primary cursor-pointer transition-colors">أعمالنا</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact">
                    <span className="hover:text-primary cursor-pointer transition-colors">تواصل معنا</span>
                  </Link>
                </li>
              </ul>
            </Reveal>
          </div>

          <div className="md:col-span-4 space-y-4">
            <Reveal delay={0.1}>
              <h4 className="font-semibold">معلومات التواصل</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <a href={links.phone.href} className="hover:text-primary transition-colors" dir="ltr">
                    {links.phone.value}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <a href={links.email.href} className="hover:text-primary transition-colors">
                    {links.email.value}
                  </a>
                </li>
                {settings?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>

              <div className="pt-3 flex items-center gap-2">
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
            </Reveal>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} القطّان للستائر. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
