import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useGetSettings } from "@workspace/api-client-react";

export function WhatsappButton() {
  const { data: settings } = useGetSettings();

  if (!settings?.whatsapp) return null;

  const url = buildWhatsAppUrl(settings.whatsapp, "مرحباً، أود الاستفسار من خلال موقعكم الإلكتروني.");

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
