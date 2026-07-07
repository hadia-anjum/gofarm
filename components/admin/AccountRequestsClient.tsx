"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Building,
  Ban,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface VendorRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  vendorStatus: string;
  vendorAppliedAt?: string;
  vendorApprovedBy?: string;
  vendorApprovedAt?: string;
  vendorRejectedAt?: string;
  vendorRejectionReason?: string;
  vendorSuspendedAt?: string;
  vendorSuspendedBy?: string;
  vendorSuspensionReason?: string;
  vendorBusinessName?: string;
  vendorBusinessDescription?: string;
  isVendor?: boolean;
}

const ApprovedVendorsTable = ({
  vendors,
  setSuspendDialog,
}: {
  vendors: VendorRequest[];
  setSuspendDialog: (dialog: {
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
  }) => void;
}) => {
  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Approved Vendors
          </h3>
          <p className="text-gray-600 text-center">
            There are currently no approved vendors to manage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-green-50 to-emerald-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Approved Vendors ({vendors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Business Name</TableHead>
                <TableHead className="font-semibold">Approved Date</TableHead>
                <TableHead className="font-semibold">Approved By</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Store className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {vendor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {vendor.vendorBusinessName || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {vendor.vendorApprovedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(vendor.vendorApprovedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <span className="text-sm text-gray-600">
                      {vendor.vendorApprovedBy || "-"}
                    </span>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() =>
                          setSuspendDialog({
                            isOpen: true,
                            vendorId: vendor._id,
                            vendorEmail: vendor.email,
                          })
                        }
                        variant="destructive"
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {vendors.map((vendor) => (
            <Card key={vendor._id} className="border border-gray-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Store className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {vendor.firstName} {vendor.lastName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {vendor.vendorBusinessName || "N/A"}
                    </span>
                  </div>
                  {vendor.vendorApprovedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Approved:{" "}
                      {new Date(vendor.vendorApprovedAt).toLocaleDateString()}
                    </div>
                  )}
                  {vendor.vendorApprovedBy && (
                    <div className="text-gray-600">
                      By: {vendor.vendorApprovedBy}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <Button
                    onClick={() =>
                      setSuspendDialog({
                        isOpen: true,
                        vendorId: vendor._id,
                        vendorEmail: vendor.email,
                      })
                    }
                    variant="destructive"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Ban className="w-3 h-3 mr-1" />
                    Suspend
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RejectedVendorsTable = ({
  vendors,
  setCancelDialog,
  actionLoading,
}: {
  vendors: VendorRequest[];
  setCancelDialog: (dialog: {
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
    currentStatus: string;
  }) => void;
  actionLoading: string | null;
}) => {
  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Rejected Vendors
          </h3>
          <p className="text-gray-600 text-center">
            There are currently no rejected vendor applications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-red-50 to-rose-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <XCircle className="w-5 h-5 text-red-600" />
          Rejected Vendors ({vendors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Business Name</TableHead>
                <TableHead className="font-semibold">Rejected Date</TableHead>
                <TableHead className="font-semibold">
                  Rejection Reason
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <Store className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {vendor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {vendor.vendorBusinessName || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {vendor.vendorRejectedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(vendor.vendorRejectedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vendor.vendorRejectionReason || "No reason provided"}
                    </p>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() =>
                          setCancelDialog({
                            isOpen: true,
                            vendorId: vendor._id,
                            vendorEmail: vendor.email,
                            currentStatus: "rejected",
                          })
                        }
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === vendor._id}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {actionLoading === vendor._id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Cancel Status
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {vendors.map((vendor) => (
            <Card
              key={vendor._id}
              className="border-0 rounded-none shadow-none"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 shrink-0">
                    <Store className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {vendor.firstName} {vendor.lastName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">
                      {vendor.vendorBusinessName || "N/A"}
                    </span>
                  </div>
                  {vendor.vendorRejectedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Rejected:{" "}
                      {new Date(vendor.vendorRejectedAt).toLocaleDateString()}
                    </div>
                  )}
                  {vendor.vendorRejectionReason && (
                    <div className="text-gray-600 text-xs">
                      Reason: {vendor.vendorRejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </Badge>
                  <Button
                    onClick={() =>
                      setCancelDialog({
                        isOpen: true,
                        vendorId: vendor._id,
                        vendorEmail: vendor.email,
                        currentStatus: "rejected",
                      })
                    }
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === vendor._id}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {actionLoading === vendor._id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SuspendedVendorsTable = ({
  vendors,
  setCancelDialog,
  actionLoading,
}: {
  vendors: VendorRequest[];
  setCancelDialog: (dialog: {
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
    currentStatus: string;
  }) => void;
  actionLoading: string | null;
}) => {
  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Ban className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Suspended Vendors
          </h3>
          <p className="text-gray-600 text-center">
            There are currently no suspended vendor accounts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-orange-50 to-amber-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ban className="w-5 h-5 text-orange-600" />
          Suspended Vendors ({vendors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Business Name</TableHead>
                <TableHead className="font-semibold">Suspended Date</TableHead>
                <TableHead className="font-semibold">Suspended By</TableHead>
                <TableHead className="font-semibold">
                  Suspension Reason
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Store className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {vendor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {vendor.vendorBusinessName || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {vendor.vendorSuspendedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(
                          vendor.vendorSuspendedAt
                        ).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <span className="text-sm text-gray-600">
                      {vendor.vendorSuspendedBy || "-"}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vendor.vendorSuspensionReason || "No reason provided"}
                    </p>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                      <Ban className="w-3 h-3 mr-1" />
                      Suspended
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() =>
                          setCancelDialog({
                            isOpen: true,
                            vendorId: vendor._id,
                            vendorEmail: vendor.email,
                            currentStatus: "suspended",
                          })
                        }
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === vendor._id}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {actionLoading === vendor._id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Cancel Status
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {vendors.map((vendor) => (
            <Card
              key={vendor._id}
              className="border-0 rounded-none shadow-none"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 shrink-0">
                    <Store className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {vendor.firstName} {vendor.lastName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">
                      {vendor.vendorBusinessName || "N/A"}
                    </span>
                  </div>
                  {vendor.vendorSuspendedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Suspended:{" "}
                      {new Date(vendor.vendorSuspendedAt).toLocaleDateString()}
                    </div>
                  )}
                  {vendor.vendorSuspendedBy && (
                    <div className="text-gray-600">
                      By: {vendor.vendorSuspendedBy}
                    </div>
                  )}
                  {vendor.vendorSuspensionReason && (
                    <div className="text-gray-600 text-xs">
                      Reason: {vendor.vendorSuspensionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    <Ban className="w-3 h-3 mr-1" />
                    Suspended
                  </Badge>
                  <Button
                    onClick={() =>
                      setCancelDialog({
                        isOpen: true,
                        vendorId: vendor._id,
                        vendorEmail: vendor.email,
                        currentStatus: "suspended",
                      })
                    }
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === vendor._id}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {actionLoading === vendor._id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const VendorRequestsTable = ({
  vendors,
  handleApprove,
  setRejectDialog,
  actionLoading,
  getStatusBadge,
}: {
  vendors: VendorRequest[];
  handleApprove: (vendorId: string) => void;
  setRejectDialog: (dialog: {
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
  }) => void;
  actionLoading: string | null;
  getStatusBadge: (status: string) => React.ReactNode;
}) => {
  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Store className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Vendor Requests
          </h3>
          <p className="text-gray-600 text-center">
            There are currently no vendor account requests to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-linear-to-r from-gray-50 to-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Store className="w-5 h-5 text-gofarm-green" />
          Vendor Account Requests ({vendors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Applicant</TableHead>
                <TableHead className="font-semibold">Business Info</TableHead>
                <TableHead className="font-semibold">Applied Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gofarm-light-green/20">
                        <Store className="w-4 h-4 text-gofarm-green" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vendor.firstName} {vendor.lastName}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {vendor.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {vendor.vendorBusinessName || "N/A"}
                        </span>
                      </div>
                      {vendor.vendorBusinessDescription && (
                        <p className="text-xs text-gray-600 line-clamp-2 ml-6">
                          {vendor.vendorBusinessDescription}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    {vendor.vendorAppliedAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(vendor.vendorAppliedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    {getStatusBadge(vendor.vendorStatus)}
                    {vendor.vendorStatus === "rejected" &&
                      vendor.vendorRejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs max-w-xs">
                          <div className="flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-red-700 line-clamp-2">
                              {vendor.vendorRejectionReason}
                            </span>
                          </div>
                        </div>
                      )}
                  </TableCell>

                  <TableCell className="py-4">
                    {vendor.vendorStatus === "pending" && (
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button
                          onClick={() => handleApprove(vendor._id)}
                          disabled={actionLoading === vendor._id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {actionLoading === vendor._id ? "..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() =>
                            setRejectDialog({
                              isOpen: true,
                              vendorId: vendor._id,
                              vendorEmail: vendor.email,
                            })
                          }
                          disabled={actionLoading === vendor._id}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {vendor.vendorStatus !== "pending" && (
                      <div className="text-center text-sm text-gray-500">
                        No actions available
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {vendors.map((vendor) => (
            <Card key={vendor._id} className="border border-gray-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gofarm-light-green/20">
                    <Store className="w-4 h-4 text-gofarm-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {vendor.firstName} {vendor.lastName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                  {getStatusBadge(vendor.vendorStatus)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {vendor.vendorBusinessName || "N/A"}
                    </span>
                  </div>
                  {vendor.vendorBusinessDescription && (
                    <p className="text-xs text-gray-600 pl-6 line-clamp-2">
                      {vendor.vendorBusinessDescription}
                    </p>
                  )}
                  {vendor.vendorAppliedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Applied:{" "}
                      {new Date(vendor.vendorAppliedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {vendor.vendorStatus === "rejected" &&
                  vendor.vendorRejectionReason && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        <span className="text-red-700">
                          {vendor.vendorRejectionReason}
                        </span>
                      </div>
                    </div>
                  )}

                {vendor.vendorStatus === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(vendor._id)}
                      disabled={actionLoading === vendor._id}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {actionLoading === vendor._id ? "..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() =>
                        setRejectDialog({
                          isOpen: true,
                          vendorId: vendor._id,
                          vendorEmail: vendor.email,
                        })
                      }
                      disabled={actionLoading === vendor._id}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AccountRequestsClient() {
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<VendorRequest[]>([]);
  const [rejectedVendors, setRejectedVendors] = useState<VendorRequest[]>([]);
  const [suspendedVendors, setSuspendedVendors] = useState<VendorRequest[]>([]);
  const [allVendorUsers, setAllVendorUsers] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
  }>({
    isOpen: false,
    vendorId: "",
    vendorEmail: "",
  });

  const [suspendDialog, setSuspendDialog] = useState<{
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
  }>({
    isOpen: false,
    vendorId: "",
    vendorEmail: "",
  });

  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean;
    vendorId: string;
    vendorEmail: string;
    currentStatus: string;
  }>({
    isOpen: false,
    vendorId: "",
    vendorEmail: "",
    currentStatus: "",
  });

  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/admin/vendor-requests?t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setVendorRequests(data.vendorRequests || []);
        setApprovedVendors(data.approvedVendorAccounts || []);
        setRejectedVendors(data.rejectedVendorAccounts || []);
        setSuspendedVendors(data.suspendedVendorAccounts || []);
        setAllVendorUsers(data.allVendorUsers || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch vendor requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      setActionLoading(vendorId);
      const response = await fetch("/api/admin/approve-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Vendor approved successfully!");
        // Immediately refresh data
        await fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to approve vendor");
      }
    } catch (error) {
      console.error("Error approving vendor:", error);
      toast.error("Failed to approve vendor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(rejectDialog.vendorId);
      const response = await fetch("/api/admin/reject-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: rejectDialog.vendorId,
          reason: rejectReason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Vendor application rejected");
        setRejectDialog({
          isOpen: false,
          vendorId: "",
          vendorEmail: "",
        });
        setRejectReason("");
        // Immediately refresh data
        await fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to reject vendor");
      }
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      toast.error("Failed to reject vendor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    try {
      setActionLoading(suspendDialog.vendorId);
      const response = await fetch("/api/admin/suspend-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: suspendDialog.vendorId,
          reason: suspendReason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Vendor suspended successfully");
        setSuspendDialog({
          isOpen: false,
          vendorId: "",
          vendorEmail: "",
        });
        setSuspendReason("");
        // Immediately refresh data
        await fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to suspend vendor");
      }
    } catch (error) {
      console.error("Error suspending vendor:", error);
      toast.error("Failed to suspend vendor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(cancelDialog.vendorId);
      const response = await fetch("/api/admin/cancel-vendor-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: cancelDialog.vendorId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Vendor status cancelled successfully");
        setCancelDialog({
          isOpen: false,
          vendorId: "",
          vendorEmail: "",
          currentStatus: "",
        });
        // Immediately refresh data
        await fetchRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to cancel vendor status");
      }
    } catch (error) {
      console.error("Error cancelling vendor status:", error);
      toast.error("Failed to cancel vendor status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 border-amber-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Ban className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalVendorRequests: allVendorUsers.length,
    pendingVendorRequests: vendorRequests.length,
    approvedVendors: approvedVendors.length,
    rejectedVendors: rejectedVendors.length,
    suspendedVendors: suspendedVendors.length,
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Account Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Manage vendor account applications and approvals
          </p>
        </div>
        <Button
          onClick={fetchRequests}
          variant="outline"
          disabled={loading || refreshing}
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 mr-2",
              (loading || refreshing) && "animate-spin"
            )}
          />
          {refreshing ? "Updating..." : "Refresh"}
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 border-gofarm-green bg-linear-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-800">
              Total Requests
            </CardTitle>
            <Store className="h-4 w-4 text-gofarm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.totalVendorRequests}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-linear-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {stats.pendingVendorRequests}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-linear-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-800">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.approvedVendors}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-linear-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-800">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {stats.rejectedVendors}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-linear-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">
              Suspended
            </CardTitle>
            <Ban className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {stats.suspendedVendors}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({vendorRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedVendors.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedVendors.length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Suspended ({suspendedVendors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <VendorRequestsTable
            vendors={vendorRequests}
            handleApprove={handleApprove}
            setRejectDialog={setRejectDialog}
            actionLoading={actionLoading}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ApprovedVendorsTable
            vendors={approvedVendors}
            setSuspendDialog={setSuspendDialog}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <RejectedVendorsTable
            vendors={rejectedVendors}
            setCancelDialog={setCancelDialog}
            actionLoading={actionLoading}
          />
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          <SuspendedVendorsTable
            vendors={suspendedVendors}
            setCancelDialog={setCancelDialog}
            actionLoading={actionLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog({
              isOpen: false,
              vendorId: "",
              vendorEmail: "",
            });
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {rejectDialog.vendorEmail}
              &apos;s vendor account application. This reason will be visible to
              the user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({
                  isOpen: false,
                  vendorId: "",
                  vendorEmail: "",
                });
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                !rejectReason.trim() || actionLoading === rejectDialog.vendorId
              }
            >
              {actionLoading === rejectDialog.vendorId
                ? "Rejecting..."
                : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog
        open={suspendDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendDialog({
              isOpen: false,
              vendorId: "",
              vendorEmail: "",
            });
            setSuspendReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Vendor Account</DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending {suspendDialog.vendorEmail}
              &apos;s vendor account. This will temporarily disable their
              selling capabilities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter suspension reason..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendDialog({
                  isOpen: false,
                  vendorId: "",
                  vendorEmail: "",
                });
                setSuspendReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSuspend}
              disabled={
                !suspendReason.trim() ||
                actionLoading === suspendDialog.vendorId
              }
            >
              {actionLoading === suspendDialog.vendorId
                ? "Suspending..."
                : "Suspend Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Status Dialog */}
      <Dialog
        open={cancelDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialog({
              isOpen: false,
              vendorId: "",
              vendorEmail: "",
              currentStatus: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Vendor Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the {cancelDialog.currentStatus}{" "}
              status for {cancelDialog.vendorEmail}? This will reset their
              vendor status to &quot;none&quot; and allow them to apply again.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  What happens next?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Vendor status will be reset to &quot;none&quot;</li>
                  <li>• All vendor timestamps and reasons will be cleared</li>
                  <li>• The user can submit a new vendor application</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialog({
                  isOpen: false,
                  vendorId: "",
                  vendorEmail: "",
                  currentStatus: "",
                });
              }}
            >
              Go Back
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCancel}
              disabled={actionLoading === cancelDialog.vendorId}
            >
              {actionLoading === cancelDialog.vendorId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancel Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
