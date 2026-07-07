import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const variants = await client.fetch(
      `*[_type == "productVariant" && isActive == true] | order(weight asc) {
        _id,
        weight,
        variant,
        order
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      variants: variants || [],
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
