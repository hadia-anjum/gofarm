import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/firebase-admin-auth";
import { client } from "@/sanity/lib/client";

export async function GET() {
  try {
    // Check if user is admin (checks both env var and Sanity isAdmin field)
    const { isAdmin, user } = await checkAdminAccess();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all subscriptions
    const subscriptions = await client.fetch(
      `*[_type == "subscription"] | order(subscribedAt desc) {
        _id,
        email,
        status,
        subscribedAt,
        unsubscribedAt,
        source,
        ipAddress,
        userAgent
      }`
    );

    return NextResponse.json(
      {
        subscriptions,
        total: subscriptions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
