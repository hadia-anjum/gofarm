"use client";

import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Store,
  CheckCircle,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VendorBadge from "@/components/ui/vendor-badge";
import { toast } from "sonner";

interface VendorStats {
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  pendingOrders: number;
  customersCount: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "order" | "product" | "customer";
}

interface VendorProfile {
  _id: string;
  isVendor: boolean;
  vendorStatus: "active" | "suspended" | "pending" | "rejected" | "none";
  firstName?: string;
  lastName?: string;
  vendorBusinessName?: string;
  vendorBusinessDescription?: string;
  vendorApprovedAt?: string;
  vendorApprovedBy?: string;
}

export default function VendorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [stats, setStats] = useState<VendorStats>({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    customersCount: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null
  );
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user) {
        return; // Layout will handle redirect
      }

      try {
        setLoading(true);

        // Check if user is a vendor
        const statusResponse = await fetch("/api/user/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setVendorProfile(statusData.userProfile);

          if (
            !statusData.userProfile?.isVendor ||
            statusData.userProfile?.vendorStatus !== "active"
          ) {
            toast.error("Access denied. Vendor account required.");
            router.push("/user/dashboard");
            return;
          }

          setIsAuthorized(true);

          // Fetch vendor dashboard stats
          const response = await fetch("/api/vendor/dashboard/stats");
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setStats(data.stats);
              setRecentActivity(data.recentActivity);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        toast.error("Failed to load vendor dashboard");
        router.push("/user/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkVendorStatus();
  }, [user, router]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case "product":
        return <Package className="h-4 w-4 text-green-500" />;
      case "customer":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="h-6 bg-gray-300 rounded w-40 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back,{" "}
                  {vendorProfile?.vendorBusinessName ||
                    user?.displayName ||
                    "Vendor"}
                  !
                </h1>
                <VendorBadge size="md" />
              </div>
              <p className="text-gray-600 mt-1">
                Here&apos;s what&apos;s happening with your store today
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-6" />

        {/* Vendor Account Active Status */}
        <div className="mb-6 p-6 bg-linear-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-green-900 text-lg">
                  ✨ Vendor Account Active!
                </h3>
                <Badge className="bg-green-200 text-green-800 border-green-300">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-green-800 text-sm mb-3">
                Your vendor account is active and ready to sell. Manage your
                products, track orders, and grow your business.
              </p>
              <div className="bg-white/60 p-3 rounded-md border border-green-200">
                <h4 className="font-semibold text-green-900 text-sm mb-2">
                  Business Information:
                </h4>
                <div className="text-green-700 text-xs space-y-1">
                  <div>
                    • Business Name:{" "}
                    {vendorProfile?.vendorBusinessName || "N/A"}
                  </div>
                  {vendorProfile?.vendorBusinessDescription && (
                    <div>
                      • Description: {vendorProfile.vendorBusinessDescription}
                    </div>
                  )}
                  {vendorProfile?.vendorApprovedAt && (
                    <div>
                      • Approved on:{" "}
                      {new Date(
                        vendorProfile.vendorApprovedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  {vendorProfile?.vendorApprovedBy && (
                    <div>• Approved by: {vendorProfile.vendorApprovedBy}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.productsCount}</div>
            <p className="text-xs text-blue-100">Active listings</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.ordersCount}</div>
            <p className="text-xs text-green-100">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-purple-100">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {stats.customersCount}
            </div>
            <p className="text-xs text-orange-100">Total buyers</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vendor/orders">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>Your latest store activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {index < recentActivity.slice(0, 5).length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 h-fit">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </div>
            <CardDescription>Manage your store efficiently</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3">
              <Link href="/vendor/products/new">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <Package className="mr-3 h-4 w-4 text-green-500" />
                  <span className="font-medium">Add New Product</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>

              <Link href="/vendor/orders">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <ShoppingCart className="mr-3 h-4 w-4 text-blue-500" />
                  <span className="font-medium">View Orders</span>
                  {stats.pendingOrders > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.pendingOrders}
                    </Badge>
                  )}
                  {stats.pendingOrders === 0 && (
                    <ArrowRight className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </Link>

              <Link href="/vendor/products">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                >
                  <Store className="mr-3 h-4 w-4 text-purple-500" />
                  <span className="font-medium">Manage Products</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>

              <Link href="/vendor/analytics">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                >
                  <BarChart3 className="mr-3 h-4 w-4 text-orange-500" />
                  <span className="font-medium">View Analytics</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
