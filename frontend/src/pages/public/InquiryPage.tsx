import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateInquiry, useGetSettings } from "@workspace/api-client-react";
import { useCart } from "@/lib/inquiryCart";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppUrl, formatInquiryMessage } from "@/lib/whatsapp";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";

export default function InquiryPage() {
  useDocumentTitle("سلة الاستفسارات");
  const { items, updateQty, removeItem, clear } = useCart();
  const createInquiry = useCreateInquiry();
  const { data: settings } = useGetSettings();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    createInquiry.mutate(
      {
        data: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          items,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم إرسال استفسارك بنجاح");
          clear();
          navigate("/");
        },
        onError: () => {
          toast.error("حدث خطأ أثناء الإرسال");
        },
      },
    );
  };

  const handleWhatsApp = () => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    if (!settings?.whatsapp) {
      toast.error("رقم الواتساب غير متوفر");
      return;
    }

    const msg = formatInquiryMessage(items, formData.name);
    const url = buildWhatsAppUrl(settings.whatsapp, msg);
    window.open(url, "_blank");
    clear();
    navigate("/");
  };

  if (items.length === 0) {
    return (
      <div className="lux-section lux-noise">
        <div className="lux-container min-h-[60vh] flex flex-col items-center justify-center text-center">
          <Reveal>
            <h2 className="text-3xl font-serif mb-4">سلة الاستفسارات فارغة</h2>
            <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
              قم بتصفح المنتجات وإضافة ما ترغب للاستفسار عنه.
            </p>
            <Link to="/products">
              <Button size="lg" className="rounded-full px-10">
                تصفح المنتجات
              </Button>
            </Link>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-section lux-noise">
      <div className="lux-container max-w-5xl">
        <Reveal>
          <SectionHeader title="إرسال طلب استفسار" subtitle="خطوة واحدة تفصلك" align="center" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Reveal>
              <Card className="rounded-3xl lux-surface lux-outline">
                <CardContent className="p-7 md:p-8">
                  <h3 className="text-xl font-bold mb-4 font-serif">معلومات الاتصال</h3>
                  <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        الاسم <span className="text-destructive">*</span>
                      </Label>
                      <Input id="name" name="name" required value={formData.name} onChange={handleChange} className="rounded-2xl" />
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
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
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
                      <Label htmlFor="message">ملاحظات إضافية (اختياري)</Label>
                      <Textarea id="message" name="message" rows={3} value={formData.message} onChange={handleChange} className="rounded-2xl" />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Reveal delay={0.05}>
              <Card className="rounded-3xl lux-surface lux-outline">
                <CardContent className="p-7 md:p-8">
                  <h3 className="text-xl font-bold mb-4 font-serif">المنتجات ({items.length})</h3>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between py-3 border-b last:border-0 gap-3">
                        <div className="flex-1 font-medium truncate" title={item.productName}>
                          {item.productName}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border rounded-full overflow-hidden bg-background/40">
                            <button
                              type="button"
                              className="p-2 hover:bg-muted text-muted-foreground"
                              onClick={() => updateQty(item.productId, item.quantity - 1)}
                              aria-label="إنقاص"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              className="p-2 hover:bg-muted text-muted-foreground"
                              onClick={() => updateQty(item.productId, item.quantity + 1)}
                              aria-label="زيادة"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-destructive p-2 hover:bg-destructive/10 rounded-full"
                            onClick={() => removeItem(item.productId)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      form="inquiry-form"
                      className="w-full h-12 rounded-full"
                      disabled={createInquiry.isPending}
                    >
                      {createInquiry.isPending ? "جاري الإرسال…" : "إرسال الطلب عبر الموقع"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      onClick={handleWhatsApp}
                    >
                      <MessageCircle className="ml-2 h-5 w-5" />
                      إرسال الطلب عبر واتساب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

