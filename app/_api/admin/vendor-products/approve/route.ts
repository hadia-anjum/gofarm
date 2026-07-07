import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { client, writeClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fetch the vendor product
    const vendorProduct = await client.fetch(
      `*[_type == "vendorProduct" && _id == $productId][0] {
        _id,
        name,
        description,
        price,
        discount,
        stock,
        profitMargin,
        baseWeight,
        hasWeights,
        hasVariants,
        isFeatured,
        images,
        categories,
        brand,
        variant,
        weights,
        sizes,
        colors,
        vendorEmail,
        vendorName
      }`,
      { productId }
    );

    if (!vendorProduct) {
      return NextResponse.json(
        { success: false, message: "Vendor product not found" },
        { status: 404 }
      );
    }

    // Create new product in main product collection
    const slug = generateSlug(vendorProduct.name);

    const newProduct = await writeClient.create({
      _type: "product",
      name: vendorProduct.name,
      slug: {
        _type: "slug",
        current: slug,
      },
      description: vendorProduct.description,
      price: vendorProduct.price,
      discount: vendorProduct.discount || 0,
      stock: vendorProduct.stock,
      profitMargin: vendorProduct.profitMargin,
      baseWeight: vendorProduct.baseWeight,
      hasWeights: vendorProduct.hasWeights || false,
      hasVariants: vendorProduct.hasVariants || false,
      isFeatured: vendorProduct.isFeatured || false,
      images: vendorProduct.images || [],
      categories: vendorProduct.categories || [],
      brand: vendorProduct.brand,
      variant: vendorProduct.variant,
      weights: vendorProduct.weights || [],
      sizes: vendorProduct.sizes || [],
      colors: vendorProduct.colors || [],
      isVendorProduct: true,
      vendorEmail: vendorProduct.vendorEmail,
      vendorName: vendorProduct.vendorName,
    });

    // Update vendor product with approval info
    await writeClient
      .patch(productId)
      .set({
        vendorProductStatus: "approved",
        approvalStatus: "approved",
        mainProductId: {
          _type: "reference",
          _ref: newProduct._id,
        },
        approvedBy: adminUser.email,
        approvedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      {
        success: true,
        message: "Product approved successfully",
        productId: newProduct._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to approve product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
