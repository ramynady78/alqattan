import { FaFacebookF, FaInstagram, FaSnapchat, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import type { SocialKey } from "@/config/contactLinks";

const SOCIAL_ICONS: Record<SocialKey, typeof FaInstagram> = {
  instagram: FaInstagram,
  snapchat: FaSnapchat,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
};

type SocialItem = {
  key: SocialKey;
  label: string;
  href: string;
};

export function SocialLinksRow({ socials }: { socials: SocialItem[] }) {
  return (
    <div className="flex items-center gap-2">
      {socials.map((s) => {
        const Icon = SOCIAL_ICONS[s.key] ?? FaWhatsapp;
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background/40 hover:bg-muted transition-all hover:-translate-y-0.5 hover:shadow-sm"
            aria-label={s.label}
            title={s.label}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
