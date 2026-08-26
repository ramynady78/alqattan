import type { Settings } from "@workspace/api-client-react";

export type SocialKey = "instagram" | "snapchat" | "facebook" | "tiktok" | "whatsapp";

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

export function isDisplayablePhone(value: string): boolean {
  const phone = value.trim();
  if (!phone) return false;
  if (/000000/.test(phone) || phone === "+966500000000") return false;
  return true;
}

export function isDisplayableEmail(value: string): boolean {
  const email = value.trim();
  if (!email) return false;
  if (email.includes("example.com")) return false;
  return true;
}

export function isDisplayableSocial(href: string): boolean {
  const url = href.trim();
  if (!url) return false;
  if (url === "https://instagram.com/" || url === "https://facebook.com/") return false;
  if (url.includes("snapchat.com/add/") && url.endsWith("add/")) return false;
  if (url.includes("example.com")) return false;
  return true;
}

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
  const tiktokUrl = (settings?.tiktokUrl || "").trim();

  const socials: ResolvedContactLinks["socials"] = (
    [
      { key: "instagram" as const, label: "Instagram", href: instagram },
      { key: "snapchat" as const, label: "Snapchat", href: snapchat },
      { key: "facebook" as const, label: "Facebook", href: facebook },
    ] satisfies ResolvedContactLinks["socials"]
  ).filter((item) => isDisplayableSocial(item.href));

  if (tiktokUrl && isDisplayableSocial(tiktokUrl)) {
    socials.push({ key: "tiktok", label: "TikTok", href: tiktokUrl });
  }

  if (isDisplayablePhone(whatsappValue)) {
    socials.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: buildWhatsAppChatUrl(whatsappValue),
    });
  }

  return {
    phone: { label: "الهاتف", value: phoneValue, href: `tel:${phoneValue}` },
    email: { label: "البريد الإلكتروني", value: emailValue, href: `mailto:${emailValue}` },
    whatsapp: {
      label: "واتساب",
      value: whatsappValue,
      href: buildWhatsAppChatUrl(whatsappValue, "مرحبا، نود الاستفسار من خلال موقعكم."),
    },
    socials,
  };
}
