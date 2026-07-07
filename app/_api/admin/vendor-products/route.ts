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

    // Fetch all vendor products with populated references
    const products = await client.fetch(
      `*[_type == "vendorProduct"] | order(_createdAt desc) {
        _id,
        _createdAt,
        name,
        description,
        vendorEmail,
        vendorName,
        price,
        discount,
        stock,
        profitMargin,
        baseWeight,
        hasWeights,
        hasVariants,
        isFeatured,
        vendorProductStatus,
        approvalStatus,
        submittedAt,
        approvedAt,
        approvedBy,
        rejectedAt,
        rejectedBy,
        rejectionReason,
        mainProductId,
        "images": images[]{
          "url": asset->url,
          alt
        },
        "categories": categories[]->{
          _id,
          title
        },
        "brand": brand->{
          _id,
          title
        },
        "variant": variant->{
          _id,
          name
        },
        "weights": weights[]->{
          _id,
          value,
          unit
        },
        "sizes": sizes[]->{
          _id,
          value
        },
        "colors": colors[]->{
          _id,
          name,
          value
        }
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json(
      {
        success: true,
        products: products || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vendor products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
