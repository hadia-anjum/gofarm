import { cookies } from "next/headers";
import { verifyIdToken } from "./firebase-admin";
import { client } from "@/sanity/lib/client";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const decodedToken = await verifyIdToken(token);
  if (!decodedToken) {
    return null;
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    emailVerified: decodedToken.email_verified,
    displayName: decodedToken.name,
    photoURL: decodedToken.picture,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function isUserAdmin(
  email: string | undefined,
  uid?: string
): Promise<boolean> {
  if (!email) return false;

  // First, check environment variable (fast path)
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmailsEnv) {
    try {
      const adminEmails = adminEmailsEnv
        .replace(/[\[\]]/g, "") // Remove brackets if present
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);

      if (adminEmails.includes(email.toLowerCase())) {
        return true;
      }
    } catch (error) {
      console.error("Error parsing admin emails:", error);
    }
  }

  // Second, check Sanity database for isAdmin field
  if (uid) {
    try {
      const sanityUser = await client.fetch(
        `*[_type == "user" && firebaseUid == $uid][0]{ isAdmin }`,
        { uid }
      );
      if (sanityUser?.isAdmin === true) {
        return true;
      }
    } catch (error) {
      console.error("Error checking Sanity admin status:", error);
    }
  }

  return false;
}

export async function checkVendorStatus(uid: string): Promise<{
  isVendor: boolean;
  isActive: boolean;
}> {
  try {
    const query = `*[_type == "user" && firebaseUid == $uid][0]{
      isVendor,
      vendorStatus
    }`;

    const userProfile = await client.fetch(query, { uid });

    if (!userProfile) {
      return { isVendor: false, isActive: false };
    }

    return {
      isVendor: userProfile.isVendor || false,
      isActive: userProfile.vendorStatus === "active",
    };
  } catch (error) {
    console.error("Error checking vendor status:", error);
    return { isVendor: false, isActive: false };
  }
}
