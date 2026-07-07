import { NextRequest, NextResponse } from "next/server";
import { syncUserToSanity } from "@/lib/sync-user-to-sanity";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * POST /api/auth/sync-user
 * Syncs a Firebase user to Sanity CMS
 * Called after successful authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Get the full user record from Firebase
    const firebaseUser = await getAuth().getUser(decodedToken.uid);

    // Convert Firebase Admin User to a format compatible with syncUserToSanity
    const userForSync = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || null,
      photoURL: firebaseUser.photoURL || null,
    };

    // Sync to Sanity
    const sanityUserId = await syncUserToSanity(userForSync as any);

    return NextResponse.json({
      success: true,
      sanityUserId,
      firebaseUid: firebaseUser.uid,
    });
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}
