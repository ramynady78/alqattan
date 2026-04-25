import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { GlobalLoadingUI } from "@/components/loading/GlobalLoadingUI";

// Layouts & Guards
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import AboutPage from "@/pages/public/AboutPage";
import CategoriesPage from "@/pages/public/CategoriesPage";
import ProductsPage from "@/pages/public/ProductsPage";
import ProductDetailPage from "@/pages/public/ProductDetailPage";
import GalleryPage from "@/pages/public/GalleryPage";
import ContactPage from "@/pages/public/ContactPage";
import InquiryPage from "@/pages/public/InquiryPage";
import NotFoundPublic from "@/pages/public/NotFoundPublic";

// Admin Pages
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import CategoriesAdminPage from "@/pages/admin/CategoriesAdminPage";
import ProductsAdminPage from "@/pages/admin/ProductsAdminPage";
import GalleryAdminPage from "@/pages/admin/GalleryAdminPage";
import InquiriesAdminPage from "@/pages/admin/InquiriesAdminPage";
import SettingsAdminPage from "@/pages/admin/SettingsAdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PublicShell() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}

function AdminShell() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminGuard>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin">
        <Route path="login" element={<LoginPage />} />
        <Route element={<AdminShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesAdminPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="gallery" element={<GalleryAdminPage />} />
          <Route path="inquiries" element={<InquiriesAdminPage />} />
          <Route path="settings" element={<SettingsAdminPage />} />
          <Route path="*" element={<div className="p-8">Page not found in admin</div>} />
        </Route>
      </Route>

      <Route path="/" element={<PublicShell />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="inquiry" element={<InquiryPage />} />
        <Route path="*" element={<NotFoundPublic />} />
      </Route>
    </Routes>
  );
}

function AnimatedRouter() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const key = `${location.pathname}${location.search}`;

  useEffect(() => {
    // Smoothly reset scroll on navigation for a premium feel.
    // Use auto behavior for reduced motion users.
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [key, reduce]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <AppRoutes />
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <GlobalLoadingUI />
          <AnimatedRouter />
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
