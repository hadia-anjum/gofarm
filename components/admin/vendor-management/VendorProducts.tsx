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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Check,
  X,
  Eye,
  Loader2,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorProduct {
  _id: string;
  name: string;
  vendorEmail: string;
  vendorName: string;
  price: number;
  stock: number;
  profitMargin: number;
  vendorProductStatus: string;
  approvalStatus: string;
  images?: Array<{ asset: { url: string } }>;
  categories?: Array<{ title: string }>;
  brand?: { title: string };
  submittedAt?: string;
  rejectionReason?: string;
}

export default function VendorProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(
    null
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/vendor-products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error("Failed to fetch vendor products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load vendor products");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    if (!user) return;

    setActionLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/vendor-products/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product approved and added to store!");
        // Update the product in the local state immediately
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, vendorProductStatus: "approved" } : p
          )
        );
        // Fetch fresh data to ensure consistency
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      toast.error("Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedProduct || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/vendor-products/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product rejected");
        // Update the product in the local state immediately
        setProducts((prev) =>
          prev.map((p) =>
            p._id === selectedProduct._id
              ? { ...p, vendorProductStatus: "rejected", rejectionReason }
              : p
          )
        );
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedProduct(null);
        // Fetch fresh data to ensure consistency
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      toast.error("Failed to reject product");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      pending: {
        label: "Pending Review",
        className: "bg-yellow-100 text-yellow-800",
      },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true;
    return product.vendorProductStatus === filter;
  });

  const stats = {
    pending: products.filter((p) => p.vendorProductStatus === "pending").length,
    approved: products.filter((p) => p.vendorProductStatus === "approved")
      .length,
    rejected: products.filter((p) => p.vendorProductStatus === "rejected")
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Added to store</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Products</CardTitle>
          <CardDescription>
            Review and approve products submitted by vendors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({stats.rejected})
              </TabsTrigger>
              <TabsTrigger value="all">All ({products.length})</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Profit %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images?.[0]?.asset?.url && (
                              <img
                                src={product.images[0].asset.url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                {product.categories?.[0]?.title ||
                                  "No category"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {product.vendorName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.vendorEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.profitMargin}%</TableCell>
                        <TableCell>
                          {getStatusBadge(product.vendorProductStatus)}
                        </TableCell>
                        <TableCell>
                          {product.submittedAt
                            ? new Date(product.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDetailsSidebar(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {product.vendorProductStatus === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(product._id)}
                                  disabled={actionLoading}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this product is being rejected..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Sidebar */}
      <Sheet open={showDetailsSidebar} onOpenChange={setShowDetailsSidebar}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
            <SheetDescription>
              Review product information and approval status
            </SheetDescription>
          </SheetHeader>
          {selectedProduct && (
            <div className="space-y-6 mt-6 px-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Product Name</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div>
                    {getStatusBadge(selectedProduct.vendorProductStatus)}
                  </div>
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Product Images
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img?.asset?.url || "/placeholder.png"}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Vendor</Label>
                  <p className="font-medium">{selectedProduct.vendorName}</p>
                  <p className="text-sm text-gray-500">
                    {selectedProduct.vendorEmail}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <p className="font-medium">
                    {selectedProduct.categories?.[0]?.title || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Price</Label>
                  <p className="font-medium">${selectedProduct.price}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Stock</Label>
                  <p className="font-medium">{selectedProduct.stock}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Profit Margin</Label>
                  <p className="font-medium">{selectedProduct.profitMargin}%</p>
                </div>
              </div>

              {selectedProduct.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <Label className="text-xs text-red-700">
                    Rejection Reason
                  </Label>
                  <p className="text-sm text-red-600 mt-1">
                    {selectedProduct.rejectionReason}
                  </p>
                </div>
              )}

              {selectedProduct.vendorProductStatus === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedProduct._id);
                      setShowDetailsSidebar(false);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve Product
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsSidebar(false);
                      setShowRejectDialog(true);
                    }}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Product
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
