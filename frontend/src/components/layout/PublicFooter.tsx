import { Link } from "react-router-dom";
import { useGetSettings } from "@workspace/api-client-react";
import { MapPin, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { resolveContactLinks, isDisplayablePhone, isDisplayableEmail } from "@/config/contactLinks";
import { SocialLinksRow } from "@/components/site/SocialLinksRow";
import { SITE_NAME_AR } from "@/config/site";

export function PublicFooter() {
  const { data: settings } = useGetSettings();
  const links = resolveContactLinks(settings ?? null);

  return (
    <footer className="mt-auto border-t bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="lux-container py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">
          <div className="md:col-span-5 space-y-5">
            <Reveal>
              <div className="flex items-center gap-3">
                <img
                  src="/logo-curtain.png"
                  alt=""
                  className="h-12 w-12 md:h-14 md:w-14 object-contain mix-blend-multiply shrink-0"
                  loading="lazy"
                />
                <div>
                  <div className="footer-brand text-xl sm:text-2xl font-serif font-bold text-primary leading-tight">
                    {SITE_NAME_AR}
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                {settings?.brandTagline || "الفخامة والأناقة في كل تفصيلة."}
              </p>
              <div className="h-px w-40 lux-divider opacity-60" />
            </Reveal>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Reveal delay={0.05}>
              <h3 className="text-base font-semibold">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/products">
                    <span className="hover:text-primary cursor-pointer transition-colors">منتجات الستائر العصرية</span>
                  </Link>
                </li>
                <li>
                  <Link to="/categories">
                    <span className="hover:text-primary cursor-pointer transition-colors">تصنيفات الستائر</span>
                  </Link>
                </li>
                <li>
                  <Link to="/gallery">
                    <span className="hover:text-primary cursor-pointer transition-colors">معرض أعمالنا</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about">
                    <span className="hover:text-primary cursor-pointer transition-colors">من نحن</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact">
                    <span className="hover:text-primary cursor-pointer transition-colors">تواصلوا معنا</span>
                  </Link>
                </li>
              </ul>
            </Reveal>
          </div>

          <div className="md:col-span-4 space-y-4">
            <Reveal delay={0.1}>
              {isDisplayablePhone(links.phone.value) ||
              isDisplayableEmail(links.email.value) ||
              settings?.address ||
              links.socials.length > 0 ? (
                <>
              <h3 className="text-base font-semibold">معلومات التواصل</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {isDisplayablePhone(links.phone.value) ? (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-primary" />
                    <a href={links.phone.href} className="hover:text-primary transition-colors" dir="ltr">
                      {links.phone.value}
                    </a>
                  </li>
                ) : null}
                {isDisplayableEmail(links.email.value) ? (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    <a href={links.email.href} className="hover:text-primary transition-colors">
                      {links.email.value}
                    </a>
                  </li>
                ) : null}
                {settings?.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{settings.address}</span>
                  </li>
                )}
              </ul>

              {links.socials.length > 0 ? (
                <div className="pt-3">
                  <SocialLinksRow socials={links.socials} />
                </div>
              ) : null}
                </>
              ) : null}
            </Reveal>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME_AR}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
