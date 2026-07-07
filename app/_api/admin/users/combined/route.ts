import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/firebase-admin-auth";
import { writeClient } from "@/sanity/lib/client";
import { adminAuth } from "@/lib/firebase-admin";

// Disable caching for this route to ensure fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SanityUser {
  _id: string;
  firebaseUid: string;
  isActive: boolean;
  role?: string;
  accountStatus?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  activatedAt?: string;
  activatedBy?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  notificationCount?: number;
  isEmployee?: boolean;
  employeeRole?: string;
  employeeStatus?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (checks both env var and Sanity isAdmin field)
    const { isAdmin, user } = await checkAdminAccess();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("query") || "";
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Fetch data in parallel for better performance
    const [firebaseUsersResult, sanityUsers] = await Promise.all([
      // Fetch Firebase users with pagination
      adminAuth.listUsers(limit, query ? undefined : undefined),

      // Fetch Sanity users with optimized query (only needed fields)
      writeClient.fetch(
        activeOnly
          ? `*[_type == "user" && isActive == true]{
              _id,
              firebaseUid,
              isActive,
              activatedAt,
              activatedBy,
              loyaltyPoints,
              totalSpent,
              "notificationCount": count(notifications),
              isEmployee,
              employeeRole,
              employeeStatus
            }`
          : `*[_type == "user"]{
              _id,
              firebaseUid,
              isActive,
              activatedAt,
              activatedBy,
              loyaltyPoints,
              totalSpent,
              "notificationCount": count(notifications),
              isEmployee,
              employeeRole,
              employeeStatus
            }`
      ),
    ]);

    const firebaseUsers = firebaseUsersResult.users;

    // Create a map of Sanity users by firebaseUid
    const sanityUserMap = new Map<string, SanityUser>(
      sanityUsers.map((user: SanityUser) => [user.firebaseUid, user])
    );

    // Combine data: include all Firebase users with their Sanity status
    const combinedUsers = firebaseUsers.map((firebaseUser) => {
      const sanityUser = sanityUserMap.get(firebaseUser.uid);
      const displayName = firebaseUser.displayName || "";
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        firstName: firstName,
        lastName: lastName,
        fullName: displayName,
        email: firebaseUser.email || "",
        imageUrl: firebaseUser.photoURL || "",
        createdAt: new Date(firebaseUser.metadata.creationTime).getTime(),
        lastSignInAt: firebaseUser.metadata.lastSignInTime
          ? new Date(firebaseUser.metadata.lastSignInTime).getTime()
          : null,
        emailVerified: firebaseUser.emailVerified,
        banned: firebaseUser.disabled,
        locked: false,
        // Sanity-specific fields
        isActive: sanityUser?.isActive || false,
        activatedAt: sanityUser?.activatedAt,
        activatedBy: sanityUser?.activatedBy,
        sanityId: sanityUser?._id,
        inSanity: !!sanityUser,
        loyaltyPoints: sanityUser?.loyaltyPoints || 0,
        totalSpent: sanityUser?.totalSpent || 0,
        notificationCount: sanityUser?.notificationCount || 0,
        // Employee fields
        isEmployee: sanityUser?.isEmployee || false,
        employeeRole: sanityUser?.employeeRole,
        employeeStatus: sanityUser?.employeeStatus,
      };
    });

    // Filter based on query if provided
    let filteredUsers = combinedUsers;
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredUsers = combinedUsers.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(lowerQuery) ||
          user.lastName?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return NextResponse.json({
      users: paginatedUsers,
      totalCount: filteredUsers.length,
      hasNextPage: offset + limit < filteredUsers.length,
      sanityUsersCount: sanityUsers.length,
      activeUsersCount: sanityUsers.filter((u: SanityUser) => u.isActive)
        .length,
    });
  } catch (error) {
    console.error("Error fetching combined users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
