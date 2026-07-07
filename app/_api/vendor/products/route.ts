import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-admin-auth";
import { writeClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch vendor's products
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch vendor products
    const products = await writeClient.fetch(
      `*[_type == "vendorProduct" && vendorEmail == $email] | order(_createdAt desc) {
        _id,
        name,
        price,
        discount,
        stock,
        vendorProductStatus,
        approvalStatus,
        totalSales,
        totalRevenue,
        totalProfit,
        profitMargin,
        images[] {
          asset-> {
            url
          }
        },
        categories[]-> {
          _id,
          name
        },
        brand-> {
          _id,
          name
        }
      }`,
      { email: currentUser.email },
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a vendor
    const vendor = await writeClient.fetch(
      `*[_type == "user" && email == $email && isVendor == true && vendorStatus == "active"][0]`,
      { email: currentUser.email }
    );

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Active vendor account required.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const discount = parseFloat(formData.get("discount") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const profitMargin =
      parseFloat(formData.get("profitMargin") as string) || 10;
    const status = formData.get("status") as string;
    const categoriesJson = formData.get("categories") as string;
    const brand = formData.get("brand") as string;
    const hasWeights = formData.get("hasWeights") === "true";
    const hasVariants = formData.get("hasVariants") === "true";

    const categories = categoriesJson ? JSON.parse(categoriesJson) : [];

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    const imageAssets = [];

    for (const file of imageFiles) {
      if (file.size > 0) {
        const buffer = await file.arrayBuffer();
        const asset = await writeClient.assets.upload(
          "image",
          Buffer.from(buffer),
          {
            filename: file.name,
          }
        );
        imageAssets.push({
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        });
      }
    }

    // Create vendor product
    const productData: any = {
      _type: "vendorProduct",
      vendorEmail: currentUser.email,
      vendorName:
        currentUser.displayName || vendor.firstName + " " + vendor.lastName,
      name,
      description,
      price,
      discount,
      stock,
      profitMargin,
      vendorProductStatus: status === "draft" ? "draft" : "pending",
      approvalStatus: status === "draft" ? "awaiting" : "awaiting",
      hasWeights,
      hasVariants,
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
    };

    // Generate slug
    productData.slug = {
      _type: "slug",
      current: name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    };

    if (imageAssets.length > 0) {
      productData.images = imageAssets;
    }

    if (categories.length > 0) {
      productData.categories = categories.map((id: string) => ({
        _type: "reference",
        _ref: id,
      }));
    }

    if (brand) {
      productData.brand = {
        _type: "reference",
        _ref: brand,
      };
    }

    if (status !== "draft") {
      productData.submittedAt = new Date().toISOString();
    }

    const newProduct = await writeClient.create(productData);

    return NextResponse.json({
      success: true,
      message:
        status === "draft"
          ? "Product saved as draft"
          : "Product submitted for approval",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const productId = formData.get("productId") as string;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    // Verify product ownership
    const existingProduct = await writeClient.fetch(
      `*[_type == "vendorProduct" && _id == $productId && vendorEmail == $email][0]`,
      { productId, email: currentUser.email }
    );

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    const updateData: any = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      discount: parseFloat(formData.get("discount") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      profitMargin: parseFloat(formData.get("profitMargin") as string) || 10,
      hasWeights: formData.get("hasWeights") === "true",
      hasVariants: formData.get("hasVariants") === "true",
    };

    const status = formData.get("status") as string;
    if (status) {
      updateData.vendorProductStatus = status === "draft" ? "draft" : "pending";
      if (status !== "draft") {
        updateData.submittedAt = new Date().toISOString();
      }
    }

    const updatedProduct = await writeClient
      .patch(productId)
      .set(updateData)
      .commit();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}
