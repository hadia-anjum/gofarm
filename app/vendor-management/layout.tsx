import { redirect } from "next/navigation";
import { getCurrentUser, isUserAdmin } from "@/lib/auth-helpers";
import { VendorManagementLayoutClient } from "@/components/admin/VendorManagementLayoutClient";

interface VendorManagementLayoutProps {
  children: React.ReactNode;
}

export default async function VendorManagementLayout({
  children,
}: VendorManagementLayoutProps) {
  // Check authentication server-side
  const user = await getCurrentUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in?redirectTo=/vendor-management");
  }

  // Check if user is admin (checks both env var and Sanity isAdmin field)
  const isAdmin = await isUserAdmin(user.email, user.uid);

  // Redirect non-admin users to access denied page
  if (!isAdmin) {
    redirect("/admin/access-denied");
  }

  // Pass user data to client component
  return (
    <VendorManagementLayoutClient
      user={{
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
      }}
    >
      {children}
    </VendorManagementLayoutClient>
  );
}
