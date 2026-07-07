import { redirect } from "next/navigation";
import { getCurrentUser, checkVendorStatus } from "@/lib/auth-helpers";
import { VendorLayoutClient } from "@/components/vendor/VendorLayoutClient";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication server-side
  const user = await getCurrentUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in?redirectTo=/vendor/dashboard");
  }

  // Check vendor status
  const vendorStatus = await checkVendorStatus(user.uid);

  // Redirect if not an active vendor
  if (!vendorStatus.isVendor || !vendorStatus.isActive) {
    redirect("/user/dashboard");
  }

  // Pass user data to client component
  return (
    <VendorLayoutClient
      user={{
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
      }}
    >
      {children}
    </VendorLayoutClient>
  );
}
