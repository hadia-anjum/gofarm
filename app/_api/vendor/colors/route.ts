import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const colors = await client.fetch(
      `*[_type == "productColor" && isActive == true] | order(color asc) {
        _id,
        color,
        hexCode
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      colors: colors || [],
    });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}
