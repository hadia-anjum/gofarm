import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Get user from Sanity to check admin status
    const user = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]`,
      { uid: decodedToken.uid }
    );

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all vendors with their statistics
    const vendors = await client.fetch(
      `*[_type == "user" && isVendor == true] | order(_createdAt desc) {
        _id,
        email,
        firstName,
        lastName,
        isVendor,
        vendorStatus,
        vendorBusinessName,
        vendorBusinessDescription,
        vendorApprovedAt,
        "totalProducts": count(*[_type == "vendorProduct" && vendorEmail == ^.email]),
        "pendingProducts": count(*[_type == "vendorProduct" && vendorEmail == ^.email && vendorProductStatus == "pending"]),
        "approvedProducts": count(*[_type == "vendorProduct" && vendorEmail == ^.email && vendorProductStatus == "approved"]),
        "totalRevenue": 0
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json(
      {
        success: true,
        vendors: vendors || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vendors",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
