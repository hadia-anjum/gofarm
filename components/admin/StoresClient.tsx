"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Eye,
  Building2,
  Globe,
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import { toast } from "sonner";
import StoreForm from "@/components/admin/StoreForm";

interface Store {
  _id: string;
  name: string;
  address: {
    city: string;
    country: string;
    street: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  isActive: boolean;
  sortOrder?: number;
}

interface StoresClientProps {
  initialStores: Store[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  UK: "United Kingdom",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  JP: "Japan",
  CN: "China",
  IN: "India",
  SG: "Singapore",
  BR: "Brazil",
  MX: "Mexico",
  AE: "United Arab Emirates",
};

const StoresClient = ({ initialStores }: StoresClientProps) => {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingStore) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/stores/${deletingStore._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete store");
      }

      setStores(stores.filter((s) => s._id !== deletingStore._id));
      toast.success("Store deleted successfully");
      setDeletingStore(null);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting store:", error);
      toast.error(error.message || "Failed to delete store");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingStore(null);
    router.refresh();
    // Refresh stores list
    try {
      const response = await fetch("/api/admin/stores");
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error("Error refreshing stores:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Store Locations</CardTitle>
              <CardDescription>
                Manage your physical store locations
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingStore(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stores by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Stores
                    </p>
                    <p className="text-2xl font-bold">{stores.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stores.filter((s) => s.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {stores.filter((s) => !s.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Countries</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Set(stores.map((s) => s.address.country)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No stores found matching your search"
                          : "No stores yet. Add your first store to get started."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell className="font-medium">
                        {store.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div>{store.address.city}</div>
                            <div className="text-muted-foreground">
                              {COUNTRY_NAMES[store.address.country] ||
                                store.address.country}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {store.contact.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {store.contact.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={store.isActive ? "default" : "secondary"}
                        >
                          {store.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{store.sortOrder || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(store)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingStore(store)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Sidebar */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingStore ? "Edit Store" : "Add New Store"}
            </SheetTitle>
            <SheetDescription>
              {editingStore
                ? "Update store information"
                : "Add a new store location"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4">
            <StoreForm
              key={editingStore?._id || "new-store"}
              store={editingStore}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingStore(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingStore}
        onOpenChange={() => setDeletingStore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingStore?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoresClient;
