"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle2, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function VendorRegistrationForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: user?.email || "",
    taxId: "",
    websiteUrl: "",
    productsCategory: "",
    estimatedMonthlyRevenue: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to submit your application");
      return;
    }

    // Validate required fields
    if (
      !formData.businessName ||
      !formData.businessType ||
      !formData.businessDescription ||
      !formData.businessAddress ||
      !formData.businessPhone ||
      !formData.businessEmail ||
      !formData.productsCategory
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the Firebase ID token
      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const idToken = await user.getIdToken();

      if (!idToken) {
        toast.error("Failed to get authentication token");
        return;
      }

      const response = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setShowSuccess(true);
      toast.success("Application submitted successfully!");

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 3000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Application Submitted!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your interest in becoming a GoFarm vendor. We'll review
          your application and get back to you within 2-3 business days.
        </p>
        <Button
          onClick={() => router.push("/user/dashboard")}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          Go to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessName">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="Enter your business name"
                  disabled={!user}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessType">
                  Business Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleChange("businessType", value)}
                  disabled={!user}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      Individual/Sole Proprietor
                    </SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">
                      Limited Liability Company (LLC)
                    </SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="cooperative">Cooperative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="businessDescription">
                  Business Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) =>
                    handleChange("businessDescription", e.target.value)
                  }
                  placeholder="Tell us about your business and what products you sell"
                  rows={4}
                  disabled={!user}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="businessAddress">
                  Business Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) =>
                    handleChange("businessAddress", e.target.value)
                  }
                  placeholder="Enter your complete business address"
                  rows={3}
                  disabled={!user}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessPhone">
                  Business Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    handleChange("businessPhone", e.target.value)
                  }
                  placeholder="+1 (555) 123-4567"
                  disabled={!user}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessEmail">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    handleChange("businessEmail", e.target.value)
                  }
                  placeholder="business@example.com"
                  disabled={!user}
                  required
                />
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  placeholder="XX-XXXXXXX"
                  disabled={!user}
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange("websiteUrl", e.target.value)}
                  placeholder="https://www.example.com"
                  disabled={!user}
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="productsCategory">
                  Primary Product Category{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.productsCategory}
                  onValueChange={(value) =>
                    handleChange("productsCategory", value)
                  }
                  disabled={!user}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fruits">Fresh Fruits</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="dairy">Dairy Products</SelectItem>
                    <SelectItem value="meat">Meat & Poultry</SelectItem>
                    <SelectItem value="bakery">Bakery Items</SelectItem>
                    <SelectItem value="organic">Organic Products</SelectItem>
                    <SelectItem value="packaged">Packaged Foods</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedMonthlyRevenue">
                  Estimated Monthly Sales Volume (Optional)
                </Label>
                <Select
                  value={formData.estimatedMonthlyRevenue}
                  onValueChange={(value) =>
                    handleChange("estimatedMonthlyRevenue", value)
                  }
                  disabled={!user}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000-25000">
                      $10,000 - $25,000
                    </SelectItem>
                    <SelectItem value="25000-50000">
                      $25,000 - $50,000
                    </SelectItem>
                    <SelectItem value="50000+">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="sm:w-auto"
              disabled={!user}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !user}
              className="flex-1 sm:flex-none bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {!user ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Apply
                </>
              ) : isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Information Box */}
      {user && (
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Your application will be reviewed by our team within 2-3
                business days
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You'll receive an email notification once your application is
                approved or if we need more information
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Once approved, you'll gain access to the vendor dashboard to
                manage your products and orders
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                You can check your application status anytime from your user
                dashboard
              </span>
            </li>
          </ul>
        </Card>
      )}
    </>
  );
}
