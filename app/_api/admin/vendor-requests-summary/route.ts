import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET() {
  try {
    // Fetch summary counts for vendor requests
    const [pending, approved, rejected, suspended] = await Promise.all([
      client.fetch(`count(*[_type == "user" && vendorStatus == "pending"])`),
      client.fetch(`count(*[_type == "user" && vendorStatus == "active"])`),
      client.fetch(`count(*[_type == "user" && vendorStatus == "rejected"])`),
      client.fetch(`count(*[_type == "user" && vendorStatus == "suspended"])`),
    ]);

    return NextResponse.json({
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      suspended: suspended || 0,
      total:
        (pending || 0) + (approved || 0) + (rejected || 0) + (suspended || 0),
    });
  } catch (error) {
    console.error("Error fetching vendor requests summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor requests summary" },
      { status: 500 }
    );
  }
}
