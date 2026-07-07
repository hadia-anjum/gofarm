"use client";

import VendorProducts from "@/components/admin/vendor-management/VendorProducts";

export default function VendorProductsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Products</h1>
        <p className="text-gray-600 mt-2">
          Review and approve vendor product submissions
        </p>
      </div>
      <VendorProducts />
    </div>
  );
}
