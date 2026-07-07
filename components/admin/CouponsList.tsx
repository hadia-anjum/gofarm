"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tag,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import { format } from "date-fns";
import Link from "next/link";

interface Coupon {
  _id: string;
  name?: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usageLimitPerUser: number;
  timesUsed: number;
  startDate: string;
  expiryDate?: string;
  isActive: boolean;
  isPublic: boolean;
  firstOrderOnly: boolean;
  createdAt: string;
}

export default function CouponsList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const query = defineQuery(`*[_type == "coupon"] | order(createdAt desc) {
        _id,
        name,
        code,
        description,
        discountType,
        discountValue,
        minimumOrderAmount,
        maxDiscountAmount,
        usageLimit,
        usageLimitPerUser,
        timesUsed,
        startDate,
        expiryDate,
        isActive,
        isPublic,
        firstOrderOnly,
        createdAt
      }`);

      const data = await client.fetch(query);
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  };

  const isUsageLimitReached = (coupon: Coupon) => {
    if (coupon.usageLimit === 0) return false;
    return coupon.timesUsed >= coupon.usageLimit;
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === "active") {
      return (
        coupon.isActive && !isExpired(coupon) && !isUsageLimitReached(coupon)
      );
    }
    if (filter === "expired") {
      return (
        isExpired(coupon) || isUsageLimitReached(coupon) || !coupon.isActive
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8 text-gofarm-green" />
            Coupons Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage discount coupons for your customers
          </p>
        </div>
        <Button asChild className="bg-gofarm-green hover:bg-gofarm-green/90">
          <Link href="/studio/structure/coupon">
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {coupons.filter((c) => c.isActive && !isExpired(c)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {coupons.reduce((sum, c) => sum + c.timesUsed, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {coupons.filter((c) => isExpired(c)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          All ({coupons.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
          size="sm"
        >
          Active ({coupons.filter((c) => c.isActive && !isExpired(c)).length})
        </Button>
        <Button
          variant={filter === "expired" ? "default" : "outline"}
          onClick={() => setFilter("expired")}
          size="sm"
        >
          Expired/Inactive (
          {coupons.filter((c) => isExpired(c) || !c.isActive).length})
        </Button>
      </div>

      {/* Coupons List */}
      <div className="grid gap-4">
        {filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No coupons found. Create your first coupon to get started!
            </CardContent>
          </Card>
        ) : (
          filteredCoupons.map((coupon) => (
            <Card
              key={coupon._id}
              className={`${
                !coupon.isActive || isExpired(coupon)
                  ? "opacity-60 bg-gray-50"
                  : "hover:shadow-md transition-shadow"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="text-xl font-bold">
                          {coupon.name || coupon.code}
                        </h3>
                        {coupon.name && (
                          <p className="text-sm text-gray-500 mt-1">
                            Code:{" "}
                            <span className="font-mono font-semibold">
                              {coupon.code}
                            </span>
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={coupon.isActive ? "default" : "secondary"}
                        className={
                          coupon.isActive
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {isExpired(coupon) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {isUsageLimitReached(coupon) && (
                        <Badge variant="destructive">Limit Reached</Badge>
                      )}
                      {coupon.firstOrderOnly && (
                        <Badge variant="outline">First Order Only</Badge>
                      )}
                      {coupon.isPublic && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Public
                        </Badge>
                      )}
                    </div>

                    {coupon.description && (
                      <p className="text-gray-600 mb-3">{coupon.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <TrendingUp className="w-4 h-4" />
                          Discount
                        </div>
                        <div className="font-semibold text-green-600 mt-1">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Users className="w-4 h-4" />
                          Usage
                        </div>
                        <div className="font-semibold mt-1">
                          {coupon.timesUsed}
                          {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Valid Until
                        </div>
                        <div className="font-semibold mt-1">
                          {coupon.expiryDate
                            ? format(
                                new Date(coupon.expiryDate),
                                "MMM dd, yyyy"
                              )
                            : "No expiry"}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <AlertCircle className="w-4 h-4" />
                          Min. Order
                        </div>
                        <div className="font-semibold mt-1">
                          {coupon.minimumOrderAmount > 0
                            ? `$${coupon.minimumOrderAmount}`
                            : "None"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/studio/structure/coupon;${coupon._id}`}
                      target="_blank"
                    >
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
