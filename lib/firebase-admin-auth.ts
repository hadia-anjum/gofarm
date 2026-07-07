import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const mockUserCookie = cookieStore.get("mock-user")?.value;
    if (!mockUserCookie) {
      return null;
    }
    return JSON.parse(decodeURIComponent(mockUserCookie));
  } catch (error) {
    console.error("Error getting mock current user:", error);
    return null;
  }
}

export async function getAuthUserId() {
  const user = await getCurrentUser();
  return user?.uid || null;
}

export async function requireAuth() {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getSanityUserByFirebaseId(firebaseUid: string) {
  const user = await getCurrentUser();
  if (user && user.uid === firebaseUid) {
    return {
      _id: `user-${user.uid}`,
      firebaseUid: user.uid,
      email: user.email,
      firstName: user.displayName?.split(" ")[0] || "User",
      lastName: user.displayName?.split(" ")[1] || "",
      phone: "",
      loyaltyPoints: 100,
      rewardPoints: 150,
      totalSpent: 0,
      addresses: []
    };
  }
  return null;
}

export async function getUserRole(firebaseUid: string) {
  return "admin"; // Grant admin/vendor access locally
}

export async function getAddresses(userId: string) {
  return [];
}
