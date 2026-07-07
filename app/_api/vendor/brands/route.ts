import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const brands = await client.fetch(
      `*[_type == "brand"] {
        _id,
        title
      } | order(title asc)`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
