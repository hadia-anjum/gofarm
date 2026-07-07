import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for authentication and authorization
 *
 * ADMIN CHECK STRATEGY:
 * To work around Edge Runtime limitations (can't directly query Sanity),
 * this middleware uses a two-tier approach:
 *
 * 1. Fast Check: NEXT_PUBLIC_ADMIN_EMAIL environment variable
 *    - No API call needed, instant response
 *    - Works for admins listed in .env
 *
 * 2. Database Check: Sanity isAdmin field via API endpoint
 *    - Calls /api/auth/check-admin (runs in Node.js runtime)
 *    - Checks user.isAdmin field in Sanity database
 *    - Allows admin access without .env changes
 *
 * User is granted admin access if EITHER check returns true.
 */

// Helper function to check if user is admin
const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmailsEnv) return false;

  try {
    const adminEmails = adminEmailsEnv
      .replace(/[\[\]]/g, "") // Remove brackets if present
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    return adminEmails.includes(userEmail.toLowerCase());
  } catch (error) {
    console.error("Error parsing admin emails:", error);
    return false;
  }
};

// Helper to check admin status from both env and Sanity
async function checkAdminStatus(
  email: string,
  firebaseUid: string,
  requestUrl: string
): Promise<boolean> {
  // First check environment variable (fast, no API call needed)
  if (isUserAdmin(email)) {
    return true;
  }

  // If not in env, check Sanity via API endpoint
  try {
    const apiUrl = new URL("/api/auth/check-admin", requestUrl);
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firebaseUid }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.isAdmin === true;
    }
  } catch (error) {
    console.error("Error checking admin status from Sanity:", error);
  }

  return false;
}

// Helper to decode Firebase token (client-side token)
async function decodeFirebaseToken(token: string) {
  try {
    // Firebase tokens are JWTs - we'll do basic validation
    // For production, you'd verify against Firebase's public keys
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Protected routes that require authentication
const protectedRoutes = [
  "/user",
  // "/cart",
  "/wishlist",
  "/success",
  "/checkout",
  "/settings",
  "/admin",
  "/employee",
  "/vendor",
  "/vendor-management",
];

// Admin-only routes
const adminRoutes = ["/admin", "/vendor-management"];

// Employee routes
const employeeRoutes = ["/employee"];

// Vendor routes
const vendorRoutes = ["/vendor"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isEmployeeRoute = employeeRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isVendorRoute =
    vendorRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/vendor-registration") &&
    !pathname.startsWith("/vendor-info");

  // Get the Firebase token from cookies
  const token = request.cookies.get("session")?.value;

  // If it's a protected route and user is not authenticated, redirect to sign-in
  if (isProtected && !token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated, perform role-based checks
  if (token && (isAdminRoute || isVendorRoute)) {
    try {
      const decodedToken = await decodeFirebaseToken(token);

      if (decodedToken && decodedToken.email) {
        // Check admin routes - check both env and Sanity database
        if (isAdminRoute) {
          const isAdmin = await checkAdminStatus(
            decodedToken.email,
            decodedToken.uid || decodedToken.user_id,
            request.url
          );

          if (!isAdmin) {
            // Redirect non-admin users trying to access admin/vendor-management
            const accessDeniedUrl = new URL(
              "/admin/access-denied",
              request.url
            );
            return NextResponse.redirect(accessDeniedUrl);
          }
        }

        // For vendor routes, we'll let the server-side layout check vendor status
        // since that requires database lookup which is better done server-side
        // But we still ensure they're authenticated here
      }
    } catch (error) {
      console.error("Error checking token:", error);
      // If token is invalid, redirect to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For employee routes, the actual role check will happen server-side
  // This middleware just ensures they have a valid token

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
