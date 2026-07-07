"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Store,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export default function VendorManagementPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingRequests: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();

      // Fetch vendors stats
      const vendorsResponse = await fetch("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch products stats
      const productsResponse = await fetch("/api/admin/vendor-products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (vendorsResponse.ok && productsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        const productsData = await productsResponse.json();

        const vendors = vendorsData.vendors || [];
        const products = productsData.products || [];

        setStats({
          totalVendors: vendors.length,
          activeVendors: vendors.filter((v: any) => v.vendorStatus === "active")
            .length,
          pendingRequests: vendors.filter(
            (v: any) => v.vendorStatus === "pending"
          ).length,
          totalProducts: products.length,
          pendingProducts: products.filter(
            (p: any) => p.vendorProductStatus === "pending"
          ).length,
          approvedProducts: products.filter(
            (p: any) => p.vendorProductStatus === "approved"
          ).length,
          rejectedProducts: products.filter(
            (p: any) => p.vendorProductStatus === "rejected"
          ).length,
          totalRevenue: vendors.reduce(
            (sum: number, v: any) => sum + (v.totalRevenue || 0),
            0
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Vendor Management Overview
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all vendor activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vendors */}
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Vendors
            </CardTitle>
            <Store className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalVendors}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.activeVendors} active
            </p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Requests
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.pendingRequests}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {stats.pendingProducts} pending review
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From all vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Pending Products
            </CardTitle>
            <CardDescription>Products awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">
              {stats.pendingProducts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Approved Products
            </CardTitle>
            <CardDescription>Products in the store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {stats.approvedProducts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Rejected Products
            </CardTitle>
            <CardDescription>Products not approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {stats.rejectedProducts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common vendor management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/vendor-management/products"
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-gray-900">
                    Review Products
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.pendingProducts} pending approval
                  </div>
                </div>
              </div>
            </a>

            <a
              href="/admin/vendor-management/requests"
              className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-yellow-600 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-gray-900">
                    Vendor Requests
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.pendingRequests} pending requests
                  </div>
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
