"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { client } from "@/sanity/lib/client";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AE", name: "United Arab Emirates" },
];

const FEATURES = [
  { id: "parking", label: "Parking Available" },
  { id: "wifi", label: "Free WiFi" },
  { id: "wheelchair", label: "Wheelchair Accessible" },
  { id: "petFriendly", label: "Pet Friendly" },
  { id: "driveThrough", label: "Drive-Through" },
  { id: "curbsidePickup", label: "Curbside Pickup" },
  { id: "organicProducts", label: "Organic Products" },
  { id: "bakery", label: "In-Store Bakery" },
  { id: "deli", label: "Deli Counter" },
  { id: "pharmacy", label: "Pharmacy" },
];

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const formSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Slug is required"),
  street: z.string().min(1, "Street is required"),
  houseNumber: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  description: z.string().optional(),
  features: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.string().optional(),
  // Opening hours
  mondayOpen: z.string().optional(),
  mondayClose: z.string().optional(),
  mondayClosed: z.boolean(),
  tuesdayOpen: z.string().optional(),
  tuesdayClose: z.string().optional(),
  tuesdayClosed: z.boolean(),
  wednesdayOpen: z.string().optional(),
  wednesdayClose: z.string().optional(),
  wednesdayClosed: z.boolean(),
  thursdayOpen: z.string().optional(),
  thursdayClose: z.string().optional(),
  thursdayClosed: z.boolean(),
  fridayOpen: z.string().optional(),
  fridayClose: z.string().optional(),
  fridayClosed: z.boolean(),
  saturdayOpen: z.string().optional(),
  saturdayClose: z.string().optional(),
  saturdayClosed: z.boolean(),
  sundayOpen: z.string().optional(),
  sundayClose: z.string().optional(),
  sundayClosed: z.boolean(),
});

interface StoreFormProps {
  store: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const StoreForm = ({ store, onSuccess, onCancel }: StoreFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [selectAllFeatures, setSelectAllFeatures] = useState(false);
  const [masterHours, setMasterHours] = useState({
    open: "09:00",
    close: "18:00",
    closed: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: store?.name || "",
      slug: store?.slug?.current || "",
      street: store?.address?.street || "",
      houseNumber: store?.address?.houseNumber || "",
      city: store?.address?.city || "",
      state: store?.address?.state || "",
      postalCode: store?.address?.postalCode || "",
      country: store?.address?.country || "",
      latitude: store?.coordinates?.lat?.toString() || "",
      longitude: store?.coordinates?.lng?.toString() || "",
      phone: store?.contact?.phone || "",
      email: store?.contact?.email || "",
      description: store?.description || "",
      features: store?.features || [],
      isActive: store?.isActive ?? true,
      sortOrder: store?.sortOrder?.toString() || "0",
      // Opening hours
      ...(store?.openingHours || DAYS).reduce((acc: any, day: any) => {
        const dayName = typeof day === "string" ? day : day.day;
        const hourData = typeof day === "object" ? day : null;
        acc[`${dayName}Open`] = hourData?.openTime || "09:00";
        acc[`${dayName}Close`] = hourData?.closeTime || "18:00";
        acc[`${dayName}Closed`] = hourData?.isClosed || false;
        return acc;
      }, {}),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        street: values.street,
        houseNumber: values.houseNumber || "",
        city: values.city,
        state: values.state || "",
        postalCode: values.postalCode,
        country: values.country,
        latitude: values.latitude,
        longitude: values.longitude,
        phone: values.phone,
        email: values.email,
        description: values.description || "",
        features: values.features,
        isActive: values.isActive,
        sortOrder: values.sortOrder || "0",
        mondayOpen: values.mondayOpen || "09:00",
        mondayClose: values.mondayClose || "18:00",
        mondayClosed: values.mondayClosed || false,
        tuesdayOpen: values.tuesdayOpen || "09:00",
        tuesdayClose: values.tuesdayClose || "18:00",
        tuesdayClosed: values.tuesdayClosed || false,
        wednesdayOpen: values.wednesdayOpen || "09:00",
        wednesdayClose: values.wednesdayClose || "18:00",
        wednesdayClosed: values.wednesdayClosed || false,
        thursdayOpen: values.thursdayOpen || "09:00",
        thursdayClose: values.thursdayClose || "18:00",
        thursdayClosed: values.thursdayClosed || false,
        fridayOpen: values.fridayOpen || "09:00",
        fridayClose: values.fridayClose || "18:00",
        fridayClosed: values.fridayClosed || false,
        saturdayOpen: values.saturdayOpen || "09:00",
        saturdayClose: values.saturdayClose || "18:00",
        saturdayClosed: values.saturdayClosed || false,
        sundayOpen: values.sundayOpen || "09:00",
        sundayClose: values.sundayClose || "18:00",
        sundayClosed: values.sundayClosed || false,
      };

      if (store?._id) {
        const response = await fetch(`/api/admin/stores/${store._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update store");
        }

        toast.success("Store updated successfully");
      } else {
        const response = await fetch("/api/admin/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create store");
        }

        toast.success("Store created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving store:", error);
      toast.error(error.message || "Failed to save store");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug);
  };

  // Apply master hours to all days
  const handleApplyToAllDays = () => {
    if (applyToAllDays) {
      DAYS.forEach((day) => {
        form.setValue(`${day}Open` as any, masterHours.open);
        form.setValue(`${day}Close` as any, masterHours.close);
        form.setValue(`${day}Closed` as any, masterHours.closed);
      });
      toast.success("Applied hours to all days");
    }
  };

  // Toggle all features
  const handleToggleAllFeatures = () => {
    if (selectAllFeatures) {
      form.setValue(
        "features",
        FEATURES.map((f) => f.id)
      );
    } else {
      form.setValue("features", []);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                      placeholder="Downtown Store"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="downtown-store" />
                  </FormControl>
                  <FormDescription>
                    Auto-generated from store name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="store@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell customers about this store location..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Store</FormLabel>
                      <FormDescription>
                        Show this store on the website
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Main Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="New York" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="NY" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="10001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="40.7128" />
                    </FormControl>
                    <FormDescription>GPS coordinates</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="-74.0060" />
                    </FormControl>
                    <FormDescription>GPS coordinates</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <div className="flex items-center justify-between mb-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="applyToAll"
                    checked={applyToAllDays}
                    onCheckedChange={(checked) =>
                      setApplyToAllDays(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="applyToAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Apply same hours to all days
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Set hours once and apply to all days of the week
                </p>
              </div>
            </div>

            {applyToAllDays && (
              <div className="p-4 border rounded-lg bg-primary/5 space-y-4">
                <h4 className="font-medium text-sm">Set Hours for All Days</h4>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Closed
                    </label>
                    <Checkbox
                      checked={masterHours.closed}
                      onCheckedChange={(checked) =>
                        setMasterHours({
                          ...masterHours,
                          closed: checked as boolean,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Opening Time
                    </label>
                    <Input
                      type="time"
                      value={masterHours.open}
                      onChange={(e) =>
                        setMasterHours({ ...masterHours, open: e.target.value })
                      }
                      disabled={masterHours.closed}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Closing Time
                    </label>
                    <Input
                      type="time"
                      value={masterHours.close}
                      onChange={(e) =>
                        setMasterHours({
                          ...masterHours,
                          close: e.target.value,
                        })
                      }
                      disabled={masterHours.closed}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleApplyToAllDays}
                  className="w-full"
                  variant="secondary"
                >
                  Apply to All Days
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {applyToAllDays
                ? "Individual day settings (you can still customize each day after applying)"
                : "Set opening hours for each day of the week"}
            </p>
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name={`${day}Closed` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="capitalize">{day}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`${day}Open` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          disabled={form.watch(`${day}Closed` as any)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${day}Close` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Close</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          disabled={form.watch(`${day}Closed` as any)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="text-sm text-muted-foreground">
                  {form.watch(`${day}Closed` as any) ? "Closed" : ""}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="flex items-center justify-between mb-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAllFeatures"
                    checked={selectAllFeatures}
                    onCheckedChange={(checked) => {
                      setSelectAllFeatures(checked as boolean);
                      handleToggleAllFeatures();
                    }}
                  />
                  <label
                    htmlFor="selectAllFeatures"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select all features
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Quickly select or deselect all available features
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Store Features</FormLabel>
                    <FormDescription>
                      Select all features available at this store
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {FEATURES.map((feature) => (
                      <FormField
                        key={feature.id}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          feature.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== feature.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {feature.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : store
              ? "Update Store"
              : "Create Store"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StoreForm;
