import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFoundPublic() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background">
      <h1 className="text-9xl font-serif font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link to="/">
        <Button size="lg" className="font-serif">العودة للرئيسية</Button>
      </Link>
    </div>
  );
}
