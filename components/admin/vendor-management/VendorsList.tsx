"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Store, Eye, Package, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Vendor {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVendor: boolean;
  vendorStatus: string;
  vendorBusinessName?: string;
  vendorBusinessDescription?: string;
  vendorApprovedAt?: string;
  totalProducts?: number;
  pendingProducts?: number;
  approvedProducts?: number;
  totalRevenue?: number;
}

export default function VendorsList() {
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      } else {
        toast.error("Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      suspended: { label: "Suspended", className: "bg-red-100 text-red-800" },
      rejected: { label: "Rejected", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const activeVendors = vendors.filter((v) => v.vendorStatus === "active");
  const totalProducts = vendors.reduce(
    (sum, v) => sum + (v.totalProducts || 0),
    0
  );
  const totalRevenue = vendors.reduce(
    (sum, v) => sum + (v.totalRevenue || 0),
    0
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vendors
            </CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVendors.length}</div>
            <p className="text-xs text-muted-foreground">
              Out of {vendors.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">From all vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Vendor sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>Manage and monitor vendor accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Approved Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No vendors found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {vendor.firstName || vendor.lastName
                              ? `${vendor.firstName || ""} ${
                                  vendor.lastName || ""
                                }`.trim()
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vendor.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.vendorBusinessName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(vendor.vendorStatus)}
                      </TableCell>
                      <TableCell>{vendor.totalProducts || 0}</TableCell>
                      <TableCell>
                        {vendor.pendingProducts ||
                          (0 > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {vendor.pendingProducts}
                            </Badge>
                          ))}
                        {(!vendor.pendingProducts ||
                          vendor.pendingProducts === 0) && (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        ${(vendor.totalRevenue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {vendor.vendorApprovedAt
                          ? new Date(
                              vendor.vendorApprovedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Name</Label>
                  <p className="font-medium">
                    {selectedVendor.firstName || selectedVendor.lastName
                      ? `${selectedVendor.firstName || ""} ${
                          selectedVendor.lastName || ""
                        }`.trim()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Business Name</Label>
                  <p className="font-medium">
                    {selectedVendor.vendorBusinessName || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div>{getStatusBadge(selectedVendor.vendorStatus)}</div>
                </div>
              </div>

              {selectedVendor.vendorBusinessDescription && (
                <div>
                  <Label className="text-xs text-gray-500">
                    Business Description
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedVendor.vendorBusinessDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">
                    Total Products
                  </Label>
                  <p className="font-medium text-lg">
                    {selectedVendor.totalProducts || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Pending Products
                  </Label>
                  <p className="font-medium text-lg">
                    {selectedVendor.pendingProducts || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Total Revenue</Label>
                  <p className="font-medium text-lg">
                    ${(selectedVendor.totalRevenue || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedVendor.vendorApprovedAt && (
                <div>
                  <Label className="text-xs text-gray-500">Approved Date</Label>
                  <p className="text-sm">
                    {new Date(selectedVendor.vendorApprovedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
