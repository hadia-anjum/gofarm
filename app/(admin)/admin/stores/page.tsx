import { Suspense } from "react";
import { getAllStores } from "@/sanity/queries";
import StoresClient from "@/components/admin/StoresClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StoresPage = async () => {
  const stores = await getAllStores();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Management</h1>
          <p className="text-muted-foreground">
            Manage your store locations and details
          </p>
        </div>
      </div>

      <Suspense fallback={<StoresSkeleton />}>
        <StoresClient initialStores={stores} />
      </Suspense>
    </div>
  );
};

const StoresSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>
        <Skeleton className="h-8 w-48" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default StoresPage;
