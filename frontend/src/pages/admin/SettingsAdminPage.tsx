import { useEffect, useState } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import type { SettingsInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Save, Smartphone } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentTitle } from "@/lib/seo";
import { AdminSettingsSkeleton } from "@/components/loading/skeletons/AdminSkeletons";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function SettingsAdminPage() {
  useDocumentTitle("إعدادات الموقع");
  const queryClient = useQueryClient();
  const settingsQuery = useGetSettings();
  const { data: settings, isLoading, isError } = settingsQuery;
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState<SettingsInput>({
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    mapEmbedUrl: "",
    instagram: "",
    snapchat: "",
    twitter: "",
  });

  useEffect(() => {
    if (!settings) return;
    setFormData({
      phone: settings.phone || "",
      whatsapp: settings.whatsapp || "",
      email: settings.email || "",
      address: settings.address || "",
      mapEmbedUrl: settings.mapEmbedUrl || "",
      instagram: settings.instagram || "",
      snapchat: settings.snapchat || "",
      twitter: settings.twitter || "",
    });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast.success("تم حفظ الإعدادات بنجاح");
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        },
        onError: () => toast.error("فشل حفظ الإعدادات"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminPageHeader
        title="إعدادات الموقع"
        description="تحديث معلومات الاتصال وروابط التواصل الاجتماعي."
        actions={
          <Button type="submit" disabled={isLoading || updateSettings.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateSettings.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        }
      />

      {isLoading ? (
        <AdminSettingsSkeleton />
      ) : isError ? (
        <ErrorState
          variant="admin"
          title="تعذر تحميل الإعدادات"
          description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
          onRetry={() => settingsQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">معلومات الاتصال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    dir="ltr"
                    className="text-right"
                    placeholder="9665xxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    رقم الواتساب
                  </Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp || ""}
                    onChange={handleChange}
                    dir="ltr"
                    className="text-right"
                    placeholder="9665xxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">يُستخدم لزر المحادثة المباشرة.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    dir="ltr"
                    className="text-right"
                    placeholder="info@example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    العنوان
                  </Label>
                  <Input id="address" name="address" value={formData.address || ""} onChange={handleChange} placeholder="المدينة - الحي - الشارع" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mapEmbedUrl">رابط تضمين الخريطة (Google Maps Embed)</Label>
                  <Input
                    id="mapEmbedUrl"
                    name="mapEmbedUrl"
                    value={formData.mapEmbedUrl || ""}
                    onChange={handleChange}
                    dir="ltr"
                    className="text-right"
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">روابط التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="instagram">إنستغرام</Label>
                <Input id="instagram" name="instagram" value={formData.instagram || ""} onChange={handleChange} dir="ltr" className="text-right" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapchat">سناب شات</Label>
                <Input id="snapchat" name="snapchat" value={formData.snapchat || ""} onChange={handleChange} dir="ltr" className="text-right" placeholder="https://snapchat.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">X / تويتر</Label>
                <Input id="twitter" name="twitter" value={formData.twitter || ""} onChange={handleChange} dir="ltr" className="text-right" placeholder="https://x.com/..." />
              </div>

             
            </CardContent>
          </Card>
        </div>
      )}
    </form>
  );
}
