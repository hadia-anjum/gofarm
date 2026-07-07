"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

interface Category {
  _id: string;
  title: string;
}

interface Brand {
  _id: string;
  title: string;
}

interface Weight {
  _id: string;
  weight: string;
  value: number;
  unit: string;
}

interface Size {
  _id: string;
  size: string;
  order: number;
}

interface Color {
  _id: string;
  color: string;
  hexCode: string;
}

interface Variant {
  _id: string;
  variant: string;
  weight: number;
  order: number;
}

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [weights, setWeights] = useState<Weight[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    baseWeight: product?.baseWeight || "",
    discount: product?.discount || "0",
    stock: product?.stock || "",
    profitMargin: product?.profitMargin || "10",
    categories: product?.categories?.map((c: any) => c._id) || [],
    brand: product?.brand?._id || "",
    variant: product?.variant?._id || "",
    status: product?.status || "",
    hasWeights: product?.hasWeights || false,
    useAllWeights: product?.useAllWeights || false,
    selectedWeights: product?.weights?.map((w: any) => w._id) || [],
    hasVariants: product?.hasVariants || false,
    useAllSizes: product?.useAllSizes || false,
    selectedSizes: product?.sizes?.map((s: any) => s._id) || [],
    useAllColors: product?.useAllColors || false,
    selectedColors: product?.colors?.map((c: any) => c._id) || [],
    isFeatured: product?.isFeatured || false,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const [
        categoriesRes,
        brandsRes,
        weightsRes,
        sizesRes,
        colorsRes,
        variantsRes,
      ] = await Promise.all([
        fetch("/api/vendor/categories"),
        fetch("/api/vendor/brands"),
        fetch("/api/vendor/weights"),
        fetch("/api/vendor/sizes"),
        fetch("/api/vendor/colors"),
        fetch("/api/vendor/variants"),
      ]);

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData.categories || []);
      } else {
        console.error("Failed to fetch categories:", categoriesRes.status);
      }

      if (brandsRes.ok) {
        const brandData = await brandsRes.json();
        setBrands(brandData.brands || []);
      } else {
        console.error("Failed to fetch brands:", brandsRes.status);
      }

      if (weightsRes.ok) {
        const weightData = await weightsRes.json();
        setWeights(weightData.weights || []);
      }

      if (sizesRes.ok) {
        const sizeData = await sizesRes.json();
        setSizes(sizeData.sizes || []);
      }

      if (colorsRes.ok) {
        const colorData = await colorsRes.json();
        setColors(colorData.colors || []);
      }

      if (variantsRes.ok) {
        const variantData = await variantsRes.json();
        setVariants(variantData.variants || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load form data. Please refresh and try again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!asDraft && imageFiles.length === 0 && !product) {
      toast.error("Please upload at least one product image");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("baseWeight", formData.baseWeight);
      submitData.append("discount", formData.discount);
      submitData.append("stock", formData.stock);
      submitData.append("profitMargin", formData.profitMargin);
      submitData.append("categories", JSON.stringify(formData.categories));
      submitData.append("brand", formData.brand);
      submitData.append("variant", formData.variant);
      submitData.append("status", formData.status);
      submitData.append("hasWeights", String(formData.hasWeights));
      submitData.append("useAllWeights", String(formData.useAllWeights));
      submitData.append(
        "selectedWeights",
        JSON.stringify(formData.selectedWeights)
      );
      submitData.append("hasVariants", String(formData.hasVariants));
      submitData.append("useAllSizes", String(formData.useAllSizes));
      submitData.append(
        "selectedSizes",
        JSON.stringify(formData.selectedSizes)
      );
      submitData.append("useAllColors", String(formData.useAllColors));
      submitData.append(
        "selectedColors",
        JSON.stringify(formData.selectedColors)
      );
      submitData.append("isFeatured", String(formData.isFeatured));
      submitData.append("vendorProductStatus", asDraft ? "draft" : "pending");

      if (product?._id) {
        submitData.append("productId", product._id);
      }

      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      const response = await fetch("/api/vendor/products", {
        method: product ? "PUT" : "POST",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          asDraft
            ? "Product saved as draft"
            : product
            ? "Product updated successfully"
            : "Product submitted for approval"
        );
        onSuccess();
      } else {
        toast.error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8 py-6 px-4">
      {/* Product Images Section */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Product Images *</Label>
          <p className="text-sm text-gray-500 mt-1">
            Upload high-quality images (max 5)
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-green-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {imagePreviews.length < 5 && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2 transition-colors" />
              <span className="text-xs text-gray-500 group-hover:text-green-600 font-medium">
                Add Image
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Product Details
        </h3>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Product Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Organic Fresh Tomatoes"
            className="h-11"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe your product in detail..."
            rows={5}
            className="resize-none"
            required
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Pricing & Stock
        </h3>

        {/* Price and Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price ($) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-medium">
              Discount ($)
            </Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              placeholder="0.00"
              className="h-11"
            />
          </div>
        </div>

        {/* Base Weight (conditional) */}
        {formData.hasWeights && (
          <div className="space-y-2">
            <Label htmlFor="baseWeight" className="text-sm font-medium">
              Base Weight (grams)
            </Label>
            <Input
              id="baseWeight"
              type="number"
              value={formData.baseWeight}
              onChange={(e) =>
                setFormData({ ...formData, baseWeight: e.target.value })
              }
              placeholder="e.g., 500 for 500gm"
              className="h-11"
            />
            <p className="text-xs text-gray-500">
              Base weight in grams for price calculation
            </p>
          </div>
        )}

        {/* Stock and Profit Margin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock" className="text-sm font-medium">
              Stock Quantity *
            </Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="0"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profitMargin" className="text-sm font-medium">
              Profit Margin (%) *
            </Label>
            <Input
              id="profitMargin"
              type="number"
              step="0.1"
              value={formData.profitMargin}
              onChange={(e) =>
                setFormData({ ...formData, profitMargin: e.target.value })
              }
              placeholder="10"
              className="h-11"
              required
            />
            <p className="text-xs text-gray-500">
              Your profit percentage on each sale
            </p>
          </div>
        </div>
      </div>

      {/* Category & Brand Section */}
      <div className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Category, Brand & Type
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.categories[0] || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, categories: [value] })
              }
              disabled={dataLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={
                    dataLoading ? "Loading categories..." : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {dataLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium">
              Brand
            </Label>
            <Select
              value={formData.brand}
              onValueChange={(value) =>
                setFormData({ ...formData, brand: value })
              }
              disabled={dataLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue
                  placeholder={
                    dataLoading ? "Loading brands..." : "Select brand"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {dataLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : brands.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No brands available
                  </SelectItem>
                ) : (
                  brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product Variant */}
          <div className="space-y-2">
            <Label htmlFor="variant" className="text-sm font-medium">
              Product Type/Variant
            </Label>
            <Select
              value={formData.variant}
              onValueChange={(value) =>
                setFormData({ ...formData, variant: value })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {variants.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No variants available
                  </SelectItem>
                ) : (
                  variants.map((variant) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.variant}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              e.g., Organic, Fresh, Frozen
            </p>
          </div>

          {/* Product Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Product Status
            </Label>
            <Select
              value={formData.status || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Display badge on product</p>
          </div>
        </div>
      </div>

      {/* Product Options Section */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Product Options
        </h3>

        {/* Weight Options */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
            <Checkbox
              id="hasWeights"
              checked={formData.hasWeights}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasWeights: checked as boolean })
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="hasWeights"
                className="cursor-pointer font-medium"
              >
                Has weight options
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Enable if product has multiple weight options
              </p>
            </div>
          </div>

          {formData.hasWeights && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                <Checkbox
                  id="useAllWeights"
                  checked={formData.useAllWeights}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      useAllWeights: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="useAllWeights"
                  className="cursor-pointer text-sm"
                >
                  Use all available weights
                </Label>
              </div>

              {!formData.useAllWeights && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Weights</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-white">
                    {weights.map((weight) => (
                      <div
                        key={weight._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`weight-${weight._id}`}
                          checked={formData.selectedWeights.includes(
                            weight._id
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                selectedWeights: [
                                  ...formData.selectedWeights,
                                  weight._id,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedWeights:
                                  formData.selectedWeights.filter(
                                    (id: string) => id !== weight._id
                                  ),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`weight-${weight._id}`}
                          className="cursor-pointer text-sm"
                        >
                          {weight.weight}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size/Color Variants */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
            <Checkbox
              id="hasVariants"
              checked={formData.hasVariants}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasVariants: checked as boolean })
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="hasVariants"
                className="cursor-pointer font-medium"
              >
                Has size/color variants
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Enable for different sizes, colors, or styles
              </p>
            </div>
          </div>

          {formData.hasVariants && (
            <div className="ml-8 space-y-4">
              {/* Sizes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                  <Checkbox
                    id="useAllSizes"
                    checked={formData.useAllSizes}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        useAllSizes: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="useAllSizes"
                    className="cursor-pointer text-sm"
                  >
                    Use all available sizes
                  </Label>
                </div>

                {!formData.useAllSizes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Sizes</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-white">
                      {sizes.map((size) => (
                        <div
                          key={size._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`size-${size._id}`}
                            checked={formData.selectedSizes.includes(size._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedSizes: [
                                    ...formData.selectedSizes,
                                    size._id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedSizes: formData.selectedSizes.filter(
                                    (id: string) => id !== size._id
                                  ),
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`size-${size._id}`}
                            className="cursor-pointer text-sm"
                          >
                            {size.size}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                  <Checkbox
                    id="useAllColors"
                    checked={formData.useAllColors}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        useAllColors: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="useAllColors"
                    className="cursor-pointer text-sm"
                  >
                    Use all available colors
                  </Label>
                </div>

                {!formData.useAllColors && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Colors</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-white">
                      {colors.map((color) => (
                        <div
                          key={color._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`color-${color._id}`}
                            checked={formData.selectedColors.includes(
                              color._id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedColors: [
                                    ...formData.selectedColors,
                                    color._id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedColors:
                                    formData.selectedColors.filter(
                                      (id: string) => id !== color._id
                                    ),
                                });
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            <Label
                              htmlFor={`color-${color._id}`}
                              className="cursor-pointer text-sm"
                            >
                              {color.color}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Featured Product */}
        <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
          <Checkbox
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isFeatured: checked as boolean })
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label htmlFor="isFeatured" className="cursor-pointer font-medium">
              Featured Product
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Mark as featured to highlight on homepage
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 order-3 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
          className="h-11 border-green-300 text-green-700 hover:bg-green-50 order-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save as Draft"
          )}
        </Button>
        <Button
          type="submit"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 h-11 shadow-md hover:shadow-lg transition-shadow order-1 sm:order-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit for Approval"
          )}
        </Button>
      </div>
    </form>
  );
}
