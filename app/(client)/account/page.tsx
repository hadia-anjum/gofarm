"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page - account is handled by user dashboard
    router.replace("/");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white text-black">
      <p>Redirecting...</p>
    </div>
  );
}
