"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import FooterClient from "@/components/FooterClient";
import VendorManagementTopNav from "@/components/admin/vendor-management/VendorManagementTopNav";

interface VendorManagementLayoutClientProps {
  user: {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  };
  children: React.ReactNode;
}

export function VendorManagementLayoutClient({
  user,
  children,
}: VendorManagementLayoutClientProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <Header />
      <Container className="py-6">
        <div className="flex flex-col gap-6">
          {/* Top Navigation */}
          <VendorManagementTopNav
            currentPath={pathname}
            user={{
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            }}
          />

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            {children}
          </div>
        </div>
      </Container>
      <FooterClient />
    </div>
  );
}
