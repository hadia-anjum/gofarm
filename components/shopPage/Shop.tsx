"use client";
import { BRANDS_QUERYResult, Category, Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Container from "../Container";
import Title from "../Title";
import CategoryList from "./CategoryList";
import { Loader2, Filter, X, CheckCircle2 } from "lucide-react";
import ProductCard from "../ProductCard";
import NoProductAvailable from "../product/NoProductAvailable";
import BrandList from "./BrandList";
import { useSearchParams } from "next/navigation";
import PriceList from "./PriceList";

interface Props {
  categories: Category[];
  brands: BRANDS_QUERYResult;
}

const PRODUCTS_PER_PAGE = 20;

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams?.get("brand");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(
    async (pageNum: number, isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // Extract min and max price from selectedPrice
        let minPrice = 0;
        let maxPrice = 10000; // Default high value

        if (selectedPrice) {
          const [min, max] = selectedPrice.split("-").map(Number);
          minPrice = min;
          maxPrice = max;
        }

        const offset = pageNum * PRODUCTS_PER_PAGE;
        const limit = PRODUCTS_PER_PAGE;

        // Query for products with pagination
        const query = `
      *[_type == 'product' 
        && (!defined($selectedCategory) || references(*[_type == "category" && slug.current == $selectedCategory]._id))
        && (!defined($selectedBrand) || references(*[_type == "brand" && slug.current == $selectedBrand]._id))
        && price >= $minPrice && price <= $maxPrice
      ] 
      | order(name asc) [$offset...$end] {
        ...,"categories": categories[]->title
      }
    `;

        // Query for total count
        const countQuery = `
      count(*[_type == 'product' 
        && (!defined($selectedCategory) || references(*[_type == "category" && slug.current == $selectedCategory]._id))
        && (!defined($selectedBrand) || references(*[_type == "brand" && slug.current == $selectedBrand]._id))
        && price >= $minPrice && price <= $maxPrice
      ])
    `;

        const [data, count] = await Promise.all([
          client.fetch(
            query,
            {
              selectedCategory,
              selectedBrand,
              minPrice,
              maxPrice,
              offset,
              end: offset + limit,
            },
            { next: { revalidate: 0 } }
          ),
          client.fetch(
            countQuery,
            {
              selectedCategory,
              selectedBrand,
              minPrice,
              maxPrice,
            },
            { next: { revalidate: 0 } }
          ),
        ]);

        setTotalCount(count);

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...data]);
        } else {
          setProducts(data);
        }

        // Check if there are more products to load
        setHasMore(offset + data.length < count);
      } catch (error) {
        console.log("Shop product fetching Error", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, selectedBrand, selectedPrice]
  );

  // Initial load and filter changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false);
  }, [selectedCategory, selectedBrand, selectedPrice, fetchProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, page, fetchProducts]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Container className="py-3">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <Title className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Shop Products
              </Title>
              <p className="text-gray-600 text-sm">
                Discover amazing products tailored to your needs
              </p>
            </div>
            {(selectedCategory !== null ||
              selectedBrand !== null ||
              selectedPrice !== null) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSelectedPrice(null);
                }}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || selectedBrand || selectedPrice) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Active filters:
                </span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category:{" "}
                    {
                      categories?.find(
                        (cat) => cat?.slug?.current === selectedCategory
                      )?.title
                    }
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Brand:{" "}
                    {
                      brands?.find(
                        (brand) => brand?.slug?.current === selectedBrand
                      )?.title
                    }
                  </span>
                )}
                {selectedPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Price: ${selectedPrice.replace("-", " - $")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gofarm-green transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
            {(selectedCategory || selectedBrand || selectedPrice) && (
              <span className="ml-2 bg-gofarm-green text-white text-xs px-2 py-1 rounded-full">
                {
                  [selectedCategory, selectedBrand, selectedPrice].filter(
                    Boolean
                  ).length
                }
              </span>
            )}
          </button>
        </div>

        {/* <div className="flex flex-col lg:flex-row gap-6" /> */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                  <BrandList
                    brands={brands}
                    setSelectedBrand={setSelectedBrand}
                    selectedBrand={selectedBrand}
                  />
                  <PriceList
                    setSelectedPrice={setSelectedPrice}
                    selectedPrice={selectedPrice}
                  />
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-gofarm-green text-white py-3 px-4 rounded-lg font-medium hover:bg-gofarm-green/90 transition-colors duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                  <BrandList
                    brands={brands}
                    setSelectedBrand={setSelectedBrand}
                    selectedBrand={selectedBrand}
                  />
                  <PriceList
                    setSelectedPrice={setSelectedPrice}
                    selectedPrice={selectedPrice}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                      >
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products?.length > 0 ? (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                        {totalCount} Product
                        {totalCount !== 1 ? "s" : ""} Found
                      </h2>
                      <div className="text-sm text-gray-600">
                        Showing {products.length} of {totalCount}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {products?.map((product) => (
                        <ProductCard key={product?._id} product={product} />
                      ))}
                    </div>

                    {/* Loading More Indicator */}
                    {hasMore && (
                      <div
                        ref={loadMoreRef}
                        className="flex justify-center items-center py-8 mt-6"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-gofarm-green animate-spin" />
                          <p className="text-sm text-gofarm-gray font-medium">
                            Loading more products...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* All Products Loaded Message */}
                    {!hasMore && products.length > 0 && (
                      <div className="flex justify-center items-center py-8 mt-6 border-t border-gray-100">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gofarm-green/10 p-3 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-gofarm-green" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-semibold text-gofarm-black mb-1">
                              You've seen all products!
                            </p>
                            <p className="text-sm text-gofarm-gray">
                              {products.length}{" "}
                              {products.length === 1 ? "product" : "products"}{" "}
                              displayed
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12">
                    <NoProductAvailable className="bg-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
