import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const weights = await client.fetch(
      `*[_type == "productWeight" && isActive == true] | order(value asc) {
        _id,
        weight,
        value,
        unit
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      weights: weights || [],
    });
  } catch (error) {
    console.error("Error fetching weights:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch weights" },
      { status: 500 }
    );
  }
}
