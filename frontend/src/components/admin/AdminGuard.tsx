import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCurrentAdmin, getGetCurrentAdminQueryKey } from "@workspace/api-client-react";
import { FullPageLoader } from "@/components/loading/FullPageLoader";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: admin, isLoading, isError, isFetching } = useGetCurrentAdmin({
    query: {
      retry: false,
      queryKey: getGetCurrentAdminQueryKey(),
      refetchOnMount: "always",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // `GET /api/auth/me` returns `null` when not logged in.
    // Only redirect once any in-flight fetch settles.
    if ((!isLoading && !admin && !isFetching) || (isError && !isFetching)) {
      navigate("/admin/login", { replace: true, state: { from: location.pathname } });
    }
  }, [admin, isError, isFetching, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <FullPageLoader show variant="admin" title="جاري التحميل..." subtitle="يتم تجهيز بيانات لوحة الإدارة..." />;
  }

  if (!admin) return null;

  return <>{children}</>;
}
