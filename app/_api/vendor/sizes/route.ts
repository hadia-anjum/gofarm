import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sizes = await client.fetch(
      `*[_type == "productSize" && isActive == true] | order(order asc) {
        _id,
        size,
        order
      }`,
      {},
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      sizes: sizes || [],
    });
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
}
