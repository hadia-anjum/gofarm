import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { isUserAdmin as checkEnvAdmin } from "@/lib/adminUtils";

/**
 * API endpoint to check if a user is admin
 * Checks both environment variable and Sanity database
 * Used by middleware to verify admin access
 */
export async function POST(req: NextRequest) {
  try {
    const { email, firebaseUid } = await req.json();

    if (!email && !firebaseUid) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check 1: Environment variable (fast)
    if (email && checkEnvAdmin(email)) {
      return NextResponse.json({ isAdmin: true }, { status: 200 });
    }

    // Check 2: Sanity database
    if (firebaseUid) {
      const sanityUser = await client.fetch(
        `*[_type == "user" && firebaseUid == $firebaseUid][0]{ isAdmin, email }`,
        { firebaseUid }
      );

      if (sanityUser?.isAdmin === true) {
        return NextResponse.json({ isAdmin: true }, { status: 200 });
      }
    }

    // If email but no firebaseUid, check Sanity by email
    if (email && !firebaseUid) {
      const sanityUser = await client.fetch(
        `*[_type == "user" && email == $email][0]{ isAdmin }`,
        { email }
      );

      if (sanityUser?.isAdmin === true) {
        return NextResponse.json({ isAdmin: true }, { status: 200 });
      }
    }

    return NextResponse.json({ isAdmin: false }, { status: 200 });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

// Also support GET for simple email checks
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check environment variable
    if (checkEnvAdmin(email)) {
      return NextResponse.json({ isAdmin: true }, { status: 200 });
    }

    // Check Sanity
    const sanityUser = await client.fetch(
      `*[_type == "user" && email == $email][0]{ isAdmin }`,
      { email }
    );

    if (sanityUser?.isAdmin === true) {
      return NextResponse.json({ isAdmin: true }, { status: 200 });
    }

    return NextResponse.json({ isAdmin: false }, { status: 200 });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
