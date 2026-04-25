import { useState } from "react";
import { getGetCurrentAdminQueryKey, useAdminLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentTitle } from "@/lib/seo";

export default function LoginPage() {
  useDocumentTitle("تسجيل الدخول - لوحة الإدارة");

  const navigate = useNavigate();
  const loginMutation = useAdminLogin();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (admin) => {
          toast.success("تم تسجيل الدخول بنجاح");
          queryClient.setQueryData(getGetCurrentAdminQueryKey(), admin);
          navigate("/admin");
        },
        onError: () => toast.error("بيانات الدخول غير صحيحة"),
      },
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 lux-noise opacity-80 pointer-events-none" />
      <Card className="relative w-full max-w-md overflow-hidden border-primary/10 shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-serif font-bold text-primary mb-2">لوحة الإدارة</CardTitle>
          <CardDescription>القطّان للستائر — تسجيل الدخول</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="text-right"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="text-right"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "جارٍ التحقق..." : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

