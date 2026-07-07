import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { backendClient } from "@/sanity/lib/backendClient";

export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Store,
  AlertCircle,
  LogIn,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import VendorRegistrationForm from "@/components/vendor/VendorRegistrationForm";

async function getApplicationStatus(userId: string) {
  try {
    // Get the user's application
    const application = await backendClient.fetch(
      `*[_type == "vendorApplication" && userId == $userId][0]{
        _id,
        status,
        appliedAt,
        reviewedAt,
        rejectionReason,
        businessName
      }`,
      { userId }
    );

    // Get the user's vendor status from user document
    const user = await backendClient.fetch(
      `*[_type == "user" && firebaseUid == $userId][0]{
        vendorStatus,
        isVendor,
        vendorRejectionReason,
        vendorAppliedAt
      }`,
      { userId }
    );

    return {
      application,
      userVendorStatus: user,
    };
  } catch (error) {
    console.error("Error fetching application status:", error);
    return null;
  }
}

export default async function VendorRegistrationPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  let user = null;
  let applicationData = null;

  if (sessionCookie?.value) {
    try {
      // Use verifyIdToken instead of verifySessionCookie since the cookie contains an ID token
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie.value);
      user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      // Fetch application status
      applicationData = await getApplicationStatus(decodedToken.uid);
    } catch (error) {
      console.error("Error verifying session:", error);
      // Session invalid, user remains null
      user = null;
    }
  }

  const applicationStatus =
    applicationData?.application?.status ||
    applicationData?.userVendorStatus?.vendorStatus ||
    null;
  const application = applicationData?.application;
  const isVendor = applicationData?.userVendorStatus?.isVendor || false;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Become a GoFarm Vendor
              </h1>
              <p className="text-gray-600">
                Join our marketplace and start selling your products
              </p>
            </div>
          </div>
        </div>

        {/* Application Status - Show for logged in users */}
        {user && applicationStatus === "pending" && !isVendor && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Application Pending Review
                </h3>
                <p className="text-blue-800 mb-2">
                  Your vendor application is currently under review. We'll
                  notify you once it's been processed.
                </p>
                {application?.appliedAt && (
                  <p className="text-sm text-blue-700">
                    Applied on:{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4">
                  <Link href="/user/dashboard">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-700 hover:bg-blue-100"
                    >
                      View Application Status
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {user && (applicationStatus === "approved" || isVendor) && (
          <Card className="p-6 mb-8 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  Application Approved
                </h3>
                <p className="text-green-800 mb-4">
                  Congratulations! Your vendor application has been approved.
                  You can now access your vendor dashboard.
                </p>
                <div className="flex gap-3">
                  <Link href="/vendor/dashboard">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Go to Vendor Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {user && applicationStatus === "rejected" && (
          <Card className="p-6 mb-8 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Application Rejected
                </h3>
                <p className="text-red-800 mb-2">
                  Unfortunately, your vendor application was not approved at
                  this time.
                </p>
                {(application?.rejectionReason ||
                  applicationData?.userVendorStatus?.vendorRejectionReason) && (
                  <div className="bg-white p-3 rounded-md border border-red-200 mb-4">
                    <p className="text-sm text-red-900">
                      <strong>Reason:</strong>{" "}
                      {application?.rejectionReason ||
                        applicationData?.userVendorStatus
                          ?.vendorRejectionReason}
                    </p>
                  </div>
                )}
                <p className="text-sm text-red-700">
                  Please contact our support team if you have any questions.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!user && (
          <Card className="p-6 mb-8 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Sign In Required
                </h3>
                <p className="text-amber-800 mb-4">
                  You need to be signed in to apply for a vendor account. Please
                  sign in or create an account to continue with your
                  application.
                </p>
                <Link href="/sign-in?redirectTo=/vendor-registration">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Apply
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Form - Only show when user is logged in and hasn't applied or status is not pending/approved */}
        {user &&
          !["pending", "approved"].includes(applicationStatus || "") &&
          !isVendor && <VendorRegistrationForm />}
      </div>
    </div>
  );
}
