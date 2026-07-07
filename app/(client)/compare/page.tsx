"use client";

import { useEffect, useState } from "react";
import { useCompareStore } from "@/stores/compareStore";
import { Product } from "@/sanity.types";
import Container from "@/components/Container";
import {
  X,
  ShoppingCart,
  ArrowLeft,
  Search,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PriceView from "@/components/PriceView";
import AddToCartButton from "@/components/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import { image } from "@/sanity/image";
import { StarIcon } from "@sanity/icons";
import { client } from "@/sanity/lib/client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";

export default function ComparePage() {
  const { compareProducts, removeFromCompare, clearCompare, addToCompare } =
    useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [enrichedProducts, setEnrichedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch full product details with expanded references
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!mounted || compareProducts.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const productIds = compareProducts.map((p) => p._id);
        const query = `*[_type == "product" && _id in $productIds]{
          _id,
          name,
          slug,
          price,
          discount,
          images,
          stock,
          status,
          baseWeight,
          description,
          isFeatured,
          hasWeights,
          hasVariants,
          averageRating,
          totalReviews,
          brand->{
            _id,
            name,
            title
          },
          categories[]->{
            _id,
            name,
            title
          },
          variant->{
            _id,
            name,
            title
          }
        }`;
        const results = await client.fetch(query, { productIds });
        setEnrichedProducts(results);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [mounted, compareProducts]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const query = `*[_type == "product" && name match $searchQuery + "*"][0...5]{
          _id,
          name,
          slug,
          price,
          discount,
          images,
          stock,
          status,
          baseWeight,
          brand->{name},
          categories[]->{name},
          variant->{name},
          averageRating,
          totalReviews,
          description,
          isFeatured,
          hasWeights,
          hasVariants
        }`;
        const results = await client.fetch(query, { searchQuery });
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  if (!mounted) {
    return (
      <Container className="py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (compareProducts.length === 0) {
    return (
      <Container className="py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-8 max-w-3xl mx-auto"
        >
          {/* Icon */}
          <div className="relative">
            <div className="w-32 h-32 bg-linear-to-br from-gofarm-light-green/20 via-gofarm-light-orange/20 to-gofarm-light-green/20 rounded-full flex items-center justify-center">
              <Scale className="w-16 h-16 text-gofarm-green" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gofarm-light-orange/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gofarm-orange" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold text-gofarm-black">
              No Products to Compare
            </h2>
            <p className="text-gofarm-gray text-lg max-w-md mx-auto">
              Add products from the shop to compare their features, prices, and
              specifications side by side.
            </p>
          </div>

          {/* Search Bar */}
          <Card className="w-full max-w-xl border-gofarm-light-green/20 shadow-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gofarm-gray" />
                <Input
                  type="text"
                  placeholder="Search products to add to comparison..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base border-gofarm-light-green/30 focus:border-gofarm-green focus:ring-gofarm-green"
                />
              </div>

              <AnimatePresence>
                {searchQuery && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 bg-gofarm-white border border-gofarm-light-green/20 rounded-xl shadow-lg max-h-80 overflow-y-auto"
                  >
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => {
                          addToCompare(product);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gofarm-light-green/10 border-b border-gofarm-light-green/10 last:border-b-0 text-left transition-colors"
                      >
                        {product.images && product.images[0] && (
                          <img
                            src={image(product.images[0]).size(60, 60).url()}
                            alt={product.name || "Product"}
                            className="w-14 h-14 object-cover rounded-lg border border-gofarm-light-green/20"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-gofarm-black truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gofarm-green font-medium">
                            ${product.price?.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {isSearching && (
                <div className="mt-4 bg-gofarm-white border border-gofarm-light-green/20 rounded-xl shadow-lg p-4 text-center text-gofarm-gray">
                  Searching...
                </div>
              )}
            </CardContent>
          </Card>

          <Link href="/shop">
            <Button className="bg-gofarm-green hover:bg-gofarm-green/90 text-white px-8 py-6 text-base rounded-xl shadow-lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </motion.div>
      </Container>
    );
  }

  // Characteristics will be added in future when schema includes them
  const characteristics: string[] = [];

  // Show loading state while fetching product details
  if (isLoading && compareProducts.length > 0) {
    return (
      <Container className="py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareProducts.map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  // Use enriched products if available, otherwise use original
  const displayProducts =
    enrichedProducts.length > 0 ? enrichedProducts : compareProducts;

  const gridCols =
    {
      1: "grid-cols-2",
      2: "grid-cols-3",
      3: "grid-cols-4",
      4: "grid-cols-5",
    }[displayProducts.length] || "grid-cols-5";

  return (
    <Container className="py-8 lg:py-12">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-linear-to-r from-gofarm-light-green to-gofarm-green rounded-full"></div>
          <Scale className="w-8 h-8 text-gofarm-green" />
          <h1 className="text-3xl lg:text-4xl font-bold text-gofarm-black">
            Compare Products
          </h1>
          <Scale className="w-8 h-8 text-gofarm-green" />
          <div className="h-1 w-12 bg-linear-to-l from-gofarm-light-green to-gofarm-green rounded-full"></div>
        </div>
        <p className="text-gofarm-gray text-lg max-w-2xl mx-auto">
          Comparing {displayProducts.length} of 4 products side by side
        </p>
      </motion.div>

      {/* Controls Card */}
      <Card className="mb-8 border-gofarm-light-green/20 shadow-lg bg-linear-to-br from-gofarm-white via-gofarm-light-orange/5 to-gofarm-light-green/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gofarm-gray" />
              <Input
                type="text"
                placeholder="Search products to add to comparison..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base border-gofarm-light-green/30 focus:border-gofarm-green focus:ring-gofarm-green rounded-xl"
              />

              <AnimatePresence>
                {searchQuery && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-gofarm-white border border-gofarm-light-green/20 rounded-xl shadow-xl z-20 max-h-80 overflow-y-auto"
                  >
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => {
                          addToCompare(product);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gofarm-light-green/10 border-b border-gofarm-light-green/10 last:border-b-0 text-left transition-colors"
                      >
                        {product.images && product.images[0] && (
                          <img
                            src={image(product.images[0]).size(60, 60).url()}
                            alt={product.name || "Product"}
                            className="w-14 h-14 object-cover rounded-lg border border-gofarm-light-green/20"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-gofarm-black truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gofarm-green font-medium">
                            ${product.price?.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {isSearching && (
                <div className="absolute top-full mt-2 w-full bg-gofarm-white border border-gofarm-light-green/20 rounded-xl shadow-lg p-4 text-center text-gofarm-gray">
                  Searching...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              <Link href="/shop" className="flex-1 md:flex-initial">
                <Button
                  variant="outline"
                  className="w-full border-gofarm-light-green/30 text-gofarm-green hover:bg-gofarm-light-green/10 rounded-xl px-6 py-6"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Shop
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={clearCompare}
                className="flex-1 md:flex-initial bg-red-500 hover:bg-red-600 rounded-xl px-6 py-6"
              >
                <X className="w-5 h-5 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table - Desktop View */}
      <div className="hidden lg:block">
        <Card className="border-gofarm-light-green/20 shadow-lg overflow-hidden">
          <div className={`grid ${gridCols}`}>
            {/* Attributes Column */}
            <div className="bg-linear-to-br from-gofarm-light-green/10 to-gofarm-light-orange/10 border-r border-gofarm-light-green/20">
              {/* Product Images Placeholder */}
              <div className="p-6 border-b border-gofarm-light-green/20 min-h-[280px] flex items-end">
                <span className="font-bold text-lg text-gofarm-black">
                  Attributes
                </span>
              </div>

              {/* Attribute Labels */}
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">Status</span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">Price</span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">Rating</span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">Reviews</span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Availability
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Stock Qty
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Base Weight
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">Brand</span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Categories
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Variant Type
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Has Weights
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Has Variants
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Featured
                </span>
              </div>
              <div className="p-4 border-b border-gofarm-light-green/20 min-h-20 flex items-center">
                <span className="font-semibold text-gofarm-black">
                  Description
                </span>
              </div>
              <div className="p-4 min-h-20 flex items-center">
                <span className="font-semibold text-gofarm-black">Action</span>
              </div>
            </div>

            {/* Product Columns */}
            {displayProducts.map((product, index) => {
              const averageRating = Math.round(product.averageRating || 0);
              const isLast = index === displayProducts.length - 1;
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${
                    !isLast ? "border-r border-gofarm-light-green/20" : ""
                  }`}
                >
                  {/* Product Header with Image */}
                  <div className="p-6 border-b border-gofarm-light-green/20 min-h-[280px] bg-linear-to-br from-gofarm-white to-gofarm-light-orange/5">
                    <div className="relative h-full flex flex-col">
                      <button
                        onClick={() => removeFromCompare(product._id as string)}
                        className="absolute top-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 hover:shadow-xl transition-all z-20 border border-gofarm-light-green/20"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                      {product.images && (
                        <Link
                          href={`/product/${product.slug?.current}`}
                          className="mb-3 block group"
                        >
                          <div className="overflow-hidden rounded-xl border border-gofarm-light-green/20">
                            <img
                              src={image(product.images[0])
                                .size(300, 300)
                                .url()}
                              alt={product.name || "Product"}
                              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                      )}
                      <Link
                        href={`/product/${product.slug?.current}`}
                        className="mt-auto"
                      >
                        <h3 className="font-bold text-gofarm-black hover:text-gofarm-green transition-colors line-clamp-2 text-sm">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    {product.status && (
                      <Badge
                        className={`
                          ${
                            product.status === "sale"
                              ? "bg-gofarm-orange text-white"
                              : ""
                          }
                          ${
                            product.status === "new"
                              ? "bg-gofarm-green text-white"
                              : ""
                          }
                          ${
                            product.status === "hot"
                              ? "bg-red-500 text-white"
                              : ""
                          }
                          font-semibold uppercase text-xs
                        `}
                      >
                        {product.status}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <PriceView
                      price={product.price}
                      discount={product.discount}
                      className="text-lg font-bold text-gofarm-green"
                    />
                  </div>

                  {/* Rating */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, idx) => {
                          const isFilled = idx < averageRating;
                          return (
                            <StarIcon
                              key={idx}
                              className={`w-4 h-4 ${
                                isFilled ? "text-amber-400" : "text-gray-300"
                              }`}
                              fill={isFilled ? "#fbbf24" : "#d1d5db"}
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm font-medium text-gofarm-black">
                        {product.averageRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>

                  {/* Reviews Count */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <span className="text-gofarm-gray text-sm">
                      {product.totalReviews || 0} review
                      {(product.totalReviews || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Availability */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    {product.stock === 0 ? (
                      <Badge variant="destructive" className="font-semibold">
                        Out of Stock
                      </Badge>
                    ) : (product.stock as number) <= 10 ? (
                      <Badge className="bg-gofarm-orange/20 text-gofarm-orange border-gofarm-orange/30 font-semibold">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-gofarm-light-green/20 text-gofarm-green border-gofarm-light-green/30 font-semibold">
                        In Stock
                      </Badge>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <span className="text-gofarm-black text-sm font-medium">
                      {product.stock || 0} units
                    </span>
                  </div>

                  {/* Base Weight */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <span className="text-gofarm-black text-sm">
                      {product.baseWeight ? (
                        product.baseWeight >= 1000 ? (
                          <span className="font-medium">
                            {(product.baseWeight / 1000).toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="font-medium">
                            {product.baseWeight} g
                          </span>
                        )
                      ) : (
                        <span className="text-gofarm-gray">N/A</span>
                      )}
                    </span>
                  </div>

                  {/* Brand */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <span className="text-gofarm-black text-sm font-medium">
                      {(product.brand as any)?.name ||
                        (product.brand as any)?.title || (
                          <span className="text-gofarm-gray">N/A</span>
                        )}
                    </span>
                  </div>

                  {/* Categories */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <div className="flex flex-wrap gap-1">
                      {product.categories && product.categories.length > 0 ? (
                        product.categories
                          .slice(0, 2)
                          .map((cat: any, idx: number) => (
                            <Badge
                              key={idx}
                              className="bg-gofarm-light-green/20 text-gofarm-green border-gofarm-light-green/30 text-xs"
                            >
                              {cat.name || cat.title}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-gofarm-gray text-sm">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Variant Type */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    <span className="text-gofarm-black text-sm font-medium">
                      {(product.variant as any)?.name ||
                        (product.variant as any)?.title || (
                          <span className="text-gofarm-gray">N/A</span>
                        )}
                    </span>
                  </div>

                  {/* Has Weights */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    {product.hasWeights ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 font-semibold">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold">
                        No
                      </Badge>
                    )}
                  </div>

                  {/* Has Variants */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    {product.hasVariants ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold">
                        No
                      </Badge>
                    )}
                  </div>

                  {/* Featured */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-[60px] flex items-center hover:bg-gofarm-light-green/5 transition-colors">
                    {product.isFeatured ? (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-semibold">
                        Regular
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div className="p-4 border-b border-gofarm-light-green/20 min-h-20 hover:bg-gofarm-light-green/5 transition-colors">
                    <p className="text-sm text-gofarm-gray line-clamp-3">
                      {product.description || (
                        <span className="text-gofarm-gray/60 italic">
                          No description available
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="p-4 min-h-20 flex items-center">
                    <AddToCartButton product={product} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Mobile Responsive Card View */}
      <div className="lg:hidden space-y-6">
        <AnimatePresence>
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-gofarm-light-green/20 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Header */}
                  <div className="relative p-6 bg-linear-to-br from-gofarm-white to-gofarm-light-orange/10">
                    <button
                      onClick={() => removeFromCompare(product._id as string)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-all z-20 border border-gofarm-light-green/20"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                    <div className="flex gap-4">
                      {product.images && (
                        <Link
                          href={`/product/${product.slug?.current}`}
                          className="shrink-0"
                        >
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-gofarm-light-green/20">
                            <img
                              src={image(product.images[0])
                                .size(200, 200)
                                .url()}
                              alt={product.name || "Product"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                      )}
                      <div className="flex-1">
                        <Link href={`/product/${product.slug?.current}`}>
                          <h3 className="font-bold text-gofarm-black hover:text-gofarm-green transition-colors mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          {product.status && (
                            <Badge
                              className={`
                                ${
                                  product.status === "sale"
                                    ? "bg-gofarm-orange text-white"
                                    : ""
                                }
                                ${
                                  product.status === "new"
                                    ? "bg-gofarm-green text-white"
                                    : ""
                                }
                                ${
                                  product.status === "hot"
                                    ? "bg-red-500 text-white"
                                    : ""
                                }
                                font-semibold uppercase text-xs
                              `}
                            >
                              {product.status}
                            </Badge>
                          )}
                        </div>
                        <PriceView
                          price={product.price}
                          discount={product.discount}
                          className="text-xl font-bold text-gofarm-green"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gofarm-light-green/20" />

                  {/* Product Details Grid */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-semibold text-gofarm-black block mb-1">
                          Rating
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => {
                            const isFilled =
                              idx < Math.round(product.averageRating || 0);
                            return (
                              <StarIcon
                                key={idx}
                                className={`w-4 h-4 ${
                                  isFilled ? "text-amber-400" : "text-gray-300"
                                }`}
                                fill={isFilled ? "#fbbf24" : "#d1d5db"}
                              />
                            );
                          })}
                          <span className="text-sm ml-1 text-gofarm-gray">
                            ({product.totalReviews || 0})
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-semibold text-gofarm-black block mb-1">
                          Availability
                        </span>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (product.stock as number) <= 10 ? (
                          <Badge className="bg-gofarm-orange/20 text-gofarm-orange border-gofarm-orange/30">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-gofarm-light-green/20 text-gofarm-green border-gofarm-light-green/30">
                            In Stock ({product.stock})
                          </Badge>
                        )}
                      </div>

                      {product.baseWeight && (
                        <div>
                          <span className="text-sm font-semibold text-gofarm-black block mb-1">
                            Weight
                          </span>
                          <span className="text-sm text-gofarm-gray">
                            {product.baseWeight >= 1000
                              ? `${(product.baseWeight / 1000).toFixed(1)} kg`
                              : `${product.baseWeight} g`}
                          </span>
                        </div>
                      )}

                      {((product.brand as any)?.name ||
                        (product.brand as any)?.title) && (
                        <div>
                          <span className="text-sm font-semibold text-gofarm-black block mb-1">
                            Brand
                          </span>
                          <span className="text-sm text-gofarm-gray">
                            {(product.brand as any)?.name ||
                              (product.brand as any)?.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {product.categories && product.categories.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gofarm-black block mb-2">
                          Categories
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {product.categories
                            .slice(0, 3)
                            .map((cat: any, idx: number) => (
                              <Badge
                                key={idx}
                                className="bg-gofarm-light-green/20 text-gofarm-green border-gofarm-light-green/30"
                              >
                                {cat.name || cat.title}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {product.description && (
                      <div>
                        <span className="text-sm font-semibold text-gofarm-black block mb-1">
                          Description
                        </span>
                        <p className="text-sm text-gofarm-gray line-clamp-3">
                          {product.description}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {product.isFeatured && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {product.hasWeights && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Has Weights
                        </Badge>
                      )}
                      {product.hasVariants && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Has Variants
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-gofarm-light-green/20" />

                  <div className="p-6">
                    <AddToCartButton product={product} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Informational Section */}
      <Card className="mt-12 border-gofarm-light-green/20 shadow-lg overflow-hidden">
        <div className="bg-linear-to-br from-gofarm-light-green/10 via-gofarm-white to-gofarm-light-orange/10 p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gofarm-black mb-4 text-center">
            Why Compare Products?
          </h2>
          <p className="text-gofarm-gray text-center mb-8 leading-relaxed max-w-3xl mx-auto">
            Make informed purchasing decisions by comparing multiple products
            side by side. Our comparison tool helps you evaluate key features,
            prices, ratings, and specifications to find the perfect product that
            meets your needs and budget.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gofarm-light-green/20 bg-gofarm-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-linear-to-br from-gofarm-light-green to-gofarm-green rounded-full flex items-center justify-center mb-4">
                    <Scale className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gofarm-black mb-2 text-lg">
                    Easy Comparison
                  </h3>
                  <p className="text-sm text-gofarm-gray">
                    View all product details in one place with a clear,
                    organized layout
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gofarm-light-green/20 bg-gofarm-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gofarm-black mb-2 text-lg">
                    Quick Search
                  </h3>
                  <p className="text-sm text-gofarm-gray">
                    Add products to compare using our fast search feature
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gofarm-light-green/20 bg-gofarm-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <StarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gofarm-black mb-2 text-lg">
                    Detailed Insights
                  </h3>
                  <p className="text-sm text-gofarm-gray">
                    Compare ratings, reviews, and detailed specifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </Container>
  );
}
