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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UserCheck, X, Eye, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface VendorRequest {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  vendorStatus: string;
  vendorBusinessName?: string;
  vendorBusinessDescription?: string;
  requestedAt?: string;
}

export default function VendorRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const pendingRequests = (data.vendors || []).filter(
          (v: VendorRequest) => v.vendorStatus === "pending"
        );
        setRequests(pendingRequests);
      } else {
        toast.error("Failed to fetch vendor requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load vendor requests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and approve pending vendor applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Requests
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {requests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            Review vendor applications and approve or reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No pending requests</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.firstName || request.lastName
                              ? `${request.firstName || ""} ${
                                  request.lastName || ""
                                }`.trim()
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.vendorBusinessName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {request.requestedAt
                          ? new Date(request.requestedAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
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
            <DialogTitle>Vendor Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Name</Label>
                  <p className="font-medium">
                    {selectedRequest.firstName || selectedRequest.lastName
                      ? `${selectedRequest.firstName || ""} ${
                          selectedRequest.lastName || ""
                        }`.trim()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Business Name</Label>
                <p className="font-medium">
                  {selectedRequest.vendorBusinessName || "N/A"}
                </p>
              </div>

              {selectedRequest.vendorBusinessDescription && (
                <div>
                  <Label className="text-xs text-gray-500">
                    Business Description
                  </Label>
                  <p className="text-sm mt-1">
                    {selectedRequest.vendorBusinessDescription}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </Badge>
                </div>
              </div>

              {selectedRequest.requestedAt && (
                <div>
                  <Label className="text-xs text-gray-500">
                    Requested Date
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.requestedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
