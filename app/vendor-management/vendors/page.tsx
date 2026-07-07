"use client";

import VendorsList from "@/components/admin/vendor-management/VendorsList";

export default function VendorsListPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendors List</h1>
        <p className="text-gray-600 mt-2">
          Manage all vendor accounts and monitor their performance
        </p>
      </div>
      <VendorsList />
    </div>
  );
}
