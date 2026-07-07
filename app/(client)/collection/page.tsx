"use client";

import { useState, useEffect } from "react";
import { Product } from "@/sanity.types";
import Container from "@/components/Container";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Grid3x3,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Search,
  Star,
  TrendingUp,
  Crown,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ProductCardsGridSkeleton } from "@/components/ProductSkeletons";
import { client } from "@/sanity/lib/client";

type ViewMode = "grid-3" | "grid-4" | "grid-5" | "list";
type FilterType = "all" | "featured" | "new" | "sale" | "hot";
type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating";

const PRODUCTS_PER_PAGE = 25;

const CollectionPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid-5");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const query = `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
          _id,
          _createdAt,
          name,
          slug,
          price,
          discount,
          images,
          stock,
          status,
          isFeatured,
          averageRating,
          totalReviews,
          description,
          brand->{name, title},
          categories[]->{name, title}
        }`;

        const fetchedProducts = await client.fetch(query);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply filter type
    if (filterType !== "all") {
      if (filterType === "featured") {
        result = result.filter((p) => p.isFeatured);
      } else {
        result = result.filter((p) => p.status === filterType);
      }
    }

    // Apply search
    if (searchQuery) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range
    result = result.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, filterType, sortBy, searchQuery, priceRange]);

  // Update displayed products based on pagination
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gridCols = {
    "grid-3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "grid-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    "grid-5":
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    list: "grid-cols-1",
  }[viewMode];

  const filterOptions: { value: FilterType; label: string; icon: any }[] = [
    { value: "all", label: "All Products", icon: LayoutGrid },
    { value: "featured", label: "Featured", icon: Crown },
    { value: "new", label: "New Arrivals", icon: Sparkles },
    { value: "sale", label: "On Sale", icon: TrendingUp },
    { value: "hot", label: "Hot Deals", icon: Award },
  ];

  return (
    <div className="bg-linear-to-b from-gofarm-light-green/5 via-gofarm-white to-gofarm-light-orange/5 min-h-screen">
      <Container className="py-8 lg:py-12">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-linear-to-r from-gofarm-light-green to-gofarm-green rounded-full"></div>
            <Sparkles className="w-8 h-8 text-gofarm-green" />
            <h1 className="text-3xl lg:text-5xl font-bold text-gofarm-black">
              Product Collection
            </h1>
            <Sparkles className="w-8 h-8 text-gofarm-green" />
            <div className="h-1 w-12 bg-linear-to-l from-gofarm-light-green to-gofarm-green rounded-full"></div>
          </div>
          <p className="text-gofarm-gray text-lg max-w-2xl mx-auto">
            Discover our curated collection of premium products
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className="bg-gofarm-light-green/20 text-gofarm-green border-gofarm-light-green/30 text-base px-4 py-2">
              {filteredProducts.length} Products
            </Badge>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <Card className="mb-8 border-gofarm-light-green/20 shadow-lg bg-linear-to-br from-gofarm-white via-gofarm-light-orange/5 to-gofarm-light-green/5">
          <CardContent className="p-6">
            {/* Top Row: Search and View Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gofarm-gray" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base border-gofarm-light-green/30 focus:border-gofarm-green focus:ring-gofarm-green rounded-xl"
                />
              </div>

              {/* View Mode Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid-3" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid-3")}
                  title="3 columns"
                  className={`${
                    viewMode === "grid-3"
                      ? "bg-gofarm-green hover:bg-gofarm-green/90"
                      : "border-gofarm-light-green/30 hover:bg-gofarm-light-green/10"
                  } rounded-xl h-12 w-12`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "grid-4" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid-4")}
                  title="4 columns"
                  className={`${
                    viewMode === "grid-4"
                      ? "bg-gofarm-green hover:bg-gofarm-green/90"
                      : "border-gofarm-light-green/30 hover:bg-gofarm-light-green/10"
                  } rounded-xl h-12 w-12`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "grid-5" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid-5")}
                  title="5 columns"
                  className={`${
                    viewMode === "grid-5"
                      ? "bg-gofarm-green hover:bg-gofarm-green/90"
                      : "border-gofarm-light-green/30 hover:bg-gofarm-light-green/10"
                  } rounded-xl h-12 w-12`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="2" width="4" height="4" />
                    <rect x="10" y="2" width="4" height="4" />
                    <rect x="18" y="2" width="4" height="4" />
                    <rect x="2" y="10" width="4" height="4" />
                    <rect x="10" y="10" width="4" height="4" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  title="List view"
                  className={`${
                    viewMode === "list"
                      ? "bg-gofarm-green hover:bg-gofarm-green/90"
                      : "border-gofarm-light-green/30 hover:bg-gofarm-light-green/10"
                  } rounded-xl h-12 w-12`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 border border-gofarm-light-green/30 rounded-xl bg-gofarm-white text-gofarm-black focus:outline-none focus:border-gofarm-green focus:ring-2 focus:ring-gofarm-green/20"
              >
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gofarm-light-green/30 hover:bg-gofarm-light-green/10 rounded-xl px-6 py-6"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-gofarm-light-green/20">
                    <h3 className="font-bold text-gofarm-black mb-4 flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      Filter by Category
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {filterOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setFilterType(option.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              filterType === option.value
                                ? "border-gofarm-green bg-gofarm-light-green/20 text-gofarm-green"
                                : "border-gofarm-light-green/20 hover:border-gofarm-light-green hover:bg-gofarm-light-green/10 text-gofarm-gray"
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-semibold block">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Range */}
                    <div className="mt-6">
                      <h3 className="font-bold text-gofarm-black mb-4">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                      </h3>
                      <div className="flex gap-4 items-center">
                        <Input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              parseInt(e.target.value),
                              priceRange[1],
                            ])
                          }
                          className="flex-1"
                        />
                        <Input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value),
                            ])
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <ProductCardsGridSkeleton />
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto border-gofarm-light-green/20 shadow-lg">
              <CardContent className="p-12">
                <div className="w-24 h-24 bg-linear-to-br from-gofarm-light-green/20 to-gofarm-light-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gofarm-gray" />
                </div>
                <h3 className="text-2xl font-bold text-gofarm-black mb-3">
                  No Products Found
                </h3>
                <p className="text-gofarm-gray mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button
                  onClick={() => {
                    setFilterType("all");
                    setSearchQuery("");
                    setPriceRange([0, 1000]);
                  }}
                  className="bg-gofarm-green hover:bg-gofarm-green/90 rounded-xl px-8 py-6"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`grid ${gridCols} gap-6`}>
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 space-y-6">
                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="bg-gofarm-green hover:bg-gofarm-green/90 text-white px-12 py-6 rounded-xl text-base shadow-lg"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More Products
                          <span className="ml-2 text-sm opacity-80">
                            ({displayedProducts.length} of{" "}
                            {filteredProducts.length})
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Page Numbers */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border-gofarm-light-green/30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        onClick={() => goToPage(pageNum)}
                        className={`${
                          currentPage === pageNum
                            ? "bg-gofarm-green hover:bg-gofarm-green/90"
                            : "border-gofarm-light-green/30 hover:bg-gofarm-light-green/10"
                        } rounded-xl min-w-12`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      goToPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl border-gofarm-light-green/30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Results Info */}
                <div className="text-center">
                  <p className="text-gofarm-gray">
                    Showing{" "}
                    <span className="font-semibold text-gofarm-black">
                      {displayedProducts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gofarm-black">
                      {filteredProducts.length}
                    </span>{" "}
                    products
                    {filteredProducts.length !== products.length && (
                      <span className="text-sm ml-1">
                        (filtered from {products.length} total)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Card */}
        {!isLoading && filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card className="border-gofarm-light-green/20 shadow-lg overflow-hidden">
              <div className="bg-linear-to-br from-gofarm-light-green/10 via-gofarm-white to-gofarm-light-orange/10 p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="w-16 h-16 bg-linear-to-br from-gofarm-light-green to-gofarm-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutGrid className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gofarm-black mb-2">
                      {filteredProducts.length}
                    </h3>
                    <p className="text-gofarm-gray">Total Products</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gofarm-black mb-2">
                      {filteredProducts.filter((p) => p.isFeatured).length}
                    </h3>
                    <p className="text-gofarm-gray">Featured Items</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-linear-to-br from-gofarm-orange to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gofarm-black mb-2">
                      {
                        filteredProducts.filter((p) => p.status === "sale")
                          .length
                      }
                    </h3>
                    <p className="text-gofarm-gray">On Sale</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gofarm-black mb-2">
                      {(
                        filteredProducts.reduce(
                          (acc, p) => acc + (p.averageRating || 0),
                          0
                        ) / filteredProducts.length
                      ).toFixed(1)}
                    </h3>
                    <p className="text-gofarm-gray">Avg Rating</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </Container>
    </div>
  );
};

export default CollectionPage;
