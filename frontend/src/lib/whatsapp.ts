import { InquiryItem, Product } from "@workspace/api-client-react";

export function buildWhatsAppUrl(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function formatProductMessage(product: Product) {
  return `مرحباً، أود الاستفسار عن المنتج:
${product.name}
الرابط: ${window.location.origin}/products/${product.slug}`;
}

export function formatInquiryMessage(items: InquiryItem[], customerName?: string) {
  let msg = `مرحباً${customerName ? `، أنا ${customerName}` : ""}، أود الاستفسار عن المنتجات التالية:\n\n`;
  items.forEach((item) => {
    msg += `- ${item.productName} (الكمية: ${item.quantity})\n`;
  });
  return msg;
}
