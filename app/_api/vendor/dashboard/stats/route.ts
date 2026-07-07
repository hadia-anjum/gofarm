import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-admin-auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    // Check if user is a vendor
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/status`,
      {
        headers: {
          Cookie: `session=${sessionCookie}`,
        },
      }
    );

    if (!statusResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to verify vendor status" },
        { status: 403 }
      );
    }

    const statusData = await statusResponse.json();

    if (
      !statusData.userProfile?.isVendor ||
      statusData.userProfile?.vendorStatus !== "active"
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied. Vendor account required." },
        { status: 403 }
      );
    }

    // TODO: Fetch actual vendor stats from database
    // For now, return placeholder data
    const stats = {
      productsCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      customersCount: 0,
      monthlyRevenue: 0,
    };

    const recentActivity: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: string;
      type: "order" | "product" | "customer";
    }> = [];

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching vendor dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor dashboard stats" },
      { status: 500 }
    );
  }
}
