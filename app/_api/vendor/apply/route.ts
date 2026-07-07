import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { backendClient } from "@/sanity/lib/backendClient";

export async function POST(req: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Get the request body
    const body = await req.json();
    const {
      businessName,
      businessType,
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
      taxId,
      websiteUrl,
      productsCategory,
      estimatedMonthlyRevenue,
    } = body;

    // Validate required fields
    if (
      !businessName ||
      !businessType ||
      !businessDescription ||
      !businessAddress ||
      !businessPhone ||
      !businessEmail ||
      !productsCategory
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists in Sanity (try by firebaseUid first, then by email)
    let existingUser = await backendClient.fetch(
      `*[_type == "user" && (firebaseUid == $userId || email == $email)][0]`,
      { userId, email: userEmail || businessEmail }
    );

    // If user doesn't exist, create them
    if (!existingUser) {
      try {
        existingUser = await backendClient.create({
          _type: "user",
          firebaseUid: userId,
          email: userEmail || businessEmail,
          firstName: "",
          lastName: "",
          isActive: true,
          isVendor: false,
          vendorStatus: "none",
          isEmployee: false,
          isAdmin: false,
          rewardPoints: 0,
          loyaltyPoints: 0,
          totalSpent: 0,
          walletBalance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error creating user in Sanity:", error);
        return NextResponse.json(
          { error: "Failed to create user profile. Please try again." },
          { status: 500 }
        );
      }
    }

    // Check if user already has a vendor application
    const existingApplication = await backendClient.fetch(
      `*[_type == "vendorApplication" && userId == $userId][0]`,
      { userId }
    );

    if (existingApplication) {
      // Check the status
      if (
        existingApplication.status === "pending" ||
        existingApplication.status === "reviewing"
      ) {
        return NextResponse.json(
          {
            error: "You already have a pending application",
            status: existingApplication.status,
            appliedAt: existingApplication.appliedAt,
          },
          { status: 400 }
        );
      }

      if (existingApplication.status === "approved") {
        return NextResponse.json(
          {
            error: "You are already an approved vendor",
            status: "approved",
          },
          { status: 400 }
        );
      }

      if (existingApplication.status === "rejected") {
        return NextResponse.json(
          {
            error:
              "Your previous application was rejected. You cannot apply again.",
            status: "rejected",
            rejectionReason: existingApplication.rejectionReason,
            rejectedAt: existingApplication.reviewedAt,
          },
          { status: 400 }
        );
      }
    }

    // Check user's vendor status
    if (
      existingUser.vendorStatus === "pending" ||
      existingUser.vendorStatus === "active"
    ) {
      return NextResponse.json(
        {
          error: "You already have a vendor account or pending application",
          vendorStatus: existingUser.vendorStatus,
        },
        { status: 400 }
      );
    }

    if (existingUser.vendorStatus === "rejected") {
      return NextResponse.json(
        {
          error:
            "Your vendor application was previously rejected. You cannot apply again.",
          vendorStatus: "rejected",
          rejectionReason: existingUser.vendorRejectionReason,
        },
        { status: 400 }
      );
    }

    // Create the vendor application
    const application = await backendClient.create({
      _type: "vendorApplication",
      user: {
        _type: "reference",
        _ref: existingUser._id,
      },
      userId,
      userEmail: userEmail || businessEmail,
      businessName,
      businessType,
      businessDescription,
      businessAddress,
      businessPhone,
      businessEmail,
      taxId: taxId || undefined,
      websiteUrl: websiteUrl || undefined,
      productsCategory,
      estimatedMonthlyRevenue: estimatedMonthlyRevenue || undefined,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });

    // Update user's vendor status to pending
    await backendClient
      .patch(existingUser._id)
      .set({
        vendorStatus: "pending",
        vendorAppliedAt: new Date().toISOString(),
        vendorBusinessName: businessName,
        vendorBusinessDescription: businessDescription,
      })
      .commit();

    return NextResponse.json(
      {
        success: true,
        message: "Vendor application submitted successfully!",
        applicationId: application._id,
        status: "pending",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting vendor application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check application status
export async function GET(req: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get the user's application
    const application = await backendClient.fetch(
      `*[_type == "vendorApplication" && userId == $userId][0]{
        _id,
        status,
        appliedAt,
        reviewedAt,
        rejectionReason,
        businessName,
        businessType,
        productsCategory
      }`,
      { userId }
    );

    // Get the user's vendor status from user document
    const user = await backendClient.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{
        vendorStatus,
        isVendor,
        vendorRejectionReason,
        vendorAppliedAt,
        vendorApprovedAt,
        vendorRejectedAt
      }`,
      { userId }
    );

    return NextResponse.json({
      application: application || null,
      userVendorStatus: user || null,
    });
  } catch (error) {
    console.error("Error fetching vendor application status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
