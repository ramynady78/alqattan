import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useGetSettings } from "@workspace/api-client-react";

export function WhatsappButton() {
  const { data: settings } = useGetSettings();

  if (!settings?.whatsapp) return null;

  const url = buildWhatsAppUrl(settings.whatsapp, "مرحبا، نود الاستفسار من خلال موقعكم.");

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
      aria-label="تواصلوا معنا عبر واتساب"
    >
      <FaWhatsapp className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
    </a>
  );
}
