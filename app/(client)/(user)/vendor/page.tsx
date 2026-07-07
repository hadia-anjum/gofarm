"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/vendor/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}
