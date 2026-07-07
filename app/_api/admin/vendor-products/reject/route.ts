import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { client, writeClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
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

    // Get admin user from Sanity
    const adminUser = await client.fetch(
      `*[_type == "user" && firebaseUid == $uid][0]`,
      { uid: decodedToken.uid }
    );

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { productId, rejectionReason } = await req.json();

    if (!productId || !rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID and rejection reason are required",
        },
        { status: 400 }
      );
    }

    // Verify vendor product exists
    const vendorProduct = await client.fetch(
      `*[_type == "vendorProduct" && _id == $productId][0]`,
      { productId }
    );

    if (!vendorProduct) {
      return NextResponse.json(
        { success: false, message: "Vendor product not found" },
        { status: 404 }
      );
    }

    // Update vendor product with rejection info
    await writeClient
      .patch(productId)
      .set({
        vendorProductStatus: "rejected",
        approvalStatus: "rejected",
        rejectionReason: rejectionReason,
        rejectedBy: adminUser.email,
        rejectedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      {
        success: true,
        message: "Product rejected successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reject product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
