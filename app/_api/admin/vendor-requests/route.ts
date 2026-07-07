import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Use writeClient for real-time data without caching
    // Fetch users with pending vendor requests
    const vendorRequests = await writeClient.fetch(
      `
      *[_type == "user" && vendorStatus == "pending"] {
        _id,
        firstName,
        lastName,
        email,
        vendorStatus,
        vendorAppliedAt,
        vendorApprovedBy,
        vendorApprovedAt,
        vendorRejectedAt,
        vendorRejectionReason,
        vendorBusinessName,
        vendorBusinessDescription
      } | order(vendorAppliedAt desc)
    `,
      {},
      { cache: "no-store" }
    );

    // Fetch users with approved vendor accounts
    const approvedVendorAccounts = await writeClient.fetch(
      `
      *[_type == "user" && vendorStatus == "active"] {
        _id,
        firstName,
        lastName,
        email,
        isVendor,
        vendorStatus,
        vendorAppliedAt,
        vendorApprovedBy,
        vendorApprovedAt,
        vendorBusinessName,
        vendorBusinessDescription
      } | order(vendorApprovedAt desc)
    `,
      {},
      { cache: "no-store" }
    );

    // Fetch users with rejected vendor applications
    const rejectedVendorAccounts = await writeClient.fetch(
      `
      *[_type == "user" && vendorStatus == "rejected"] {
        _id,
        firstName,
        lastName,
        email,
        vendorStatus,
        vendorAppliedAt,
        vendorRejectedAt,
        vendorRejectionReason,
        vendorBusinessName,
        vendorBusinessDescription
      } | order(vendorRejectedAt desc)
    `,
      {},
      { cache: "no-store" }
    );

    // Fetch users with suspended vendor accounts
    const suspendedVendorAccounts = await writeClient.fetch(
      `
      *[_type == "user" && vendorStatus == "suspended"] {
        _id,
        firstName,
        lastName,
        email,
        vendorStatus,
        vendorSuspendedAt,
        vendorSuspendedBy,
        vendorSuspensionReason,
        vendorBusinessName,
        vendorBusinessDescription
      } | order(vendorSuspendedAt desc)
    `,
      {},
      { cache: "no-store" }
    );

    // Fetch all users with vendor status for statistics
    const allVendorUsers = await writeClient.fetch(
      `
      *[_type == "user" && vendorStatus != "none"] {
        _id,
        firstName,
        lastName,
        email,
        vendorStatus,
        vendorAppliedAt,
        vendorApprovedAt,
        vendorRejectedAt,
        vendorSuspendedAt
      }
    `,
      {},
      { cache: "no-store" }
    );

    const response = NextResponse.json({
      success: true,
      vendorRequests,
      approvedVendorAccounts,
      rejectedVendorAccounts,
      suspendedVendorAccounts,
      allVendorUsers,
    });

    // Add cache control headers to prevent stale data
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error fetching vendor requests:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor requests" },
      { status: 500 }
    );
  }
}
