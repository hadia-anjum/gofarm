"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useIsAdmin } from "@/lib/adminUtils";
import Container from "@/components/Container";
import AdminTopNavigation from "@/components/admin/AdminTopNavigation";
import Header from "@/components/Header";
import FooterClient from "@/components/FooterClient";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = useIsAdmin(user?.email, user?.uid);
  const isLoaded = !loading;
  const isAccessDeniedPage = pathname === "/admin/access-denied";

  // Redirect non-admin users (except on access-denied page)
  useEffect(() => {
    if (isLoaded && !isAdmin && !isAccessDeniedPage) {
      router.push("/admin/access-denied");
    }
  }, [isLoaded, isAdmin, isAccessDeniedPage, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gofarm-green"></div>
        </div>
      </Container>
    );
  }

  // If not admin and on access-denied page, show minimal layout
  if (!isAdmin && isAccessDeniedPage) {
    return (
      <div className="min-h-screen">
        <Header />
        {children}
        <FooterClient />
      </div>
    );
  }

  // If not admin and not on access-denied page, don't render (redirect will happen)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Container className="py-6">
        <div className="flex flex-col gap-6">
          {/* Top Navigation */}
          <AdminTopNavigation currentPath={pathname} user={user} />

          {/* Main Content */}
          <div className="admin-content-push bg-white rounded-2xl shadow-xl border border-gofarm-light-green/10 overflow-hidden">
            {children}
          </div>
        </div>
      </Container>
      <FooterClient />
    </div>
  );
};

export default AdminLayout;
