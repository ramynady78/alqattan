import type { Settings } from "@workspace/api-client-react";

export type SocialKey = "instagram" | "snapchat" | "facebook" | "whatsapp";

export type ResolvedContactLinks = {
  phone: { label: string; value: string; href: string };
  email: { label: string; value: string; href: string };
  whatsapp: { label: string; value: string; href: string };
  socials: Array<{
    key: SocialKey;
    label: string;
    href: string;
  }>;
};

// Placeholders (edit here if real links are not available yet)
export const CONTACT_PLACEHOLDERS = {
  phone: "+966500000000",
  email: "info@example.com",
  whatsapp: "+966500000000",
  instagram: "https://instagram.com/",
  snapchat: "https://snapchat.com/add/",
  facebook: "https://facebook.com/",
} as const;

function normalizePhone(raw: string): string {
  return raw.trim();
}

function normalizeEmail(raw: string): string {
  return raw.trim();
}

function normalizeWhatsApp(raw: string): string {
  return raw.trim();
}

export function buildWhatsAppChatUrl(rawNumber: string, message?: string): string {
  const number = normalizeWhatsApp(rawNumber).replace(/[^\d+]/g, "");
  const digits = number.startsWith("+") ? number.slice(1) : number;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function resolveContactLinks(settings?: Settings | null): ResolvedContactLinks {
  const phoneValue = normalizePhone(settings?.phone || CONTACT_PLACEHOLDERS.phone);
  const emailValue = normalizeEmail(settings?.email || CONTACT_PLACEHOLDERS.email);
  const whatsappValue = normalizeWhatsApp(settings?.whatsapp || CONTACT_PLACEHOLDERS.whatsapp);

  const instagram = settings?.instagram || CONTACT_PLACEHOLDERS.instagram;
  const snapchat = settings?.snapchat || CONTACT_PLACEHOLDERS.snapchat;
  const facebook = CONTACT_PLACEHOLDERS.facebook;

  return {
    phone: { label: "الهاتف", value: phoneValue, href: `tel:${phoneValue}` },
    email: { label: "البريد الإلكتروني", value: emailValue, href: `mailto:${emailValue}` },
    whatsapp: {
      label: "واتساب",
      value: whatsappValue,
      href: buildWhatsAppChatUrl(whatsappValue, "مرحباً، أود الاستفسار من خلال موقعكم الإلكتروني."),
    },
    socials: [
      { key: "instagram", label: "Instagram", href: instagram },
      { key: "snapchat", label: "Snapchat", href: snapchat },
      { key: "facebook", label: "Facebook", href: facebook },
      { key: "whatsapp", label: "WhatsApp", href: buildWhatsAppChatUrl(whatsappValue) },
    ],
  };
}

