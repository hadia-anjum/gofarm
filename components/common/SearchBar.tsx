"use client";
import { Loader2, Search, X, TrendingUp, Clock, Star } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { Input } from "../ui/input";
import AddToCartButton from "../AddToCartButton";
import { urlFor } from "@/sanity/lib/image";
import { Product } from "@/sanity.types";
import PriceView from "../PriceView";
import Image from "next/image";
import Link from "next/link";
import { useOutsideClick } from "@/hooks";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [saleProducts, setSaleProducts] = useState([]);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useOutsideClick<HTMLDivElement>(() => setShowSearch(false));

  // Detect if user is on Mac
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const fetchSaleProducts = useCallback(async () => {
    try {
      const query = `*[_type == "product" && status == "sale"] | order(name asc)[0...12]`;
      const response = await client.fetch(query);
      setSaleProducts(response);
    } catch (error) {
      console.error("Error fetching sale products:", error);
    }
  }, []);

  useEffect(() => {
    if (showSearch === true) {
      fetchSaleProducts();
      // Focus input when modal opens
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [showSearch, fetchSaleProducts]);

  // Handle escape key to close modal and Ctrl+K to open modal
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Handle Escape key to close modal
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        return;
      }

      // Handle Ctrl+K (or Cmd+K on Mac) to open search modal
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); // Prevent browser's default search behavior
        setShowSearch(true);
        return;
      }
    };

    // Always listen for global keyboard shortcuts
    document.addEventListener("keydown", handleKeydown);

    // Handle body scroll lock only when modal is open
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
    };
  }, [showSearch]);

  // Fetch products from Sanity based on search input
  const fetchProducts = useCallback(async () => {
    // Require at least 2 characters to search
    if (!search || search.trim().length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = `*[_type == "product" && name match $search] | order(name asc)`;
      const params = { search: `${search}*` };
      const response = await client.fetch(query, params);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce input changes to reduce API calls - increased to 300ms
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300); // Delay of 300ms

    return () => clearTimeout(debounceTimer); // Cleanup the timer
  }, [fetchProducts]);
  return (
    <>
      {/* Search Trigger Button - Modern Input Style */}
      <div className="flex flex-1">
        {/* Desktop Version - Full Input Style */}
        <button
          onClick={() => setShowSearch(true)}
          className="group flex items-center w-full gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gofarm-light-green rounded-lg px-3 py-2 transition-all duration-200 min-w-[200px] md:min-w-60"
          aria-label={`Open search (${isMac ? "Cmd" : "Ctrl"}+K)`}
        >
          {/* Search Icon */}
          <Search className="w-4 h-4 text-gray-400 group-hover:text-gofarm-green transition-colors duration-200 shrink-0" />

          {/* Placeholder Text */}
          <span className="sm:text-xs md:text-md text-gray-500 group-hover:text-gray-700 transition-colors duration-200 flex-1 text-left">
            Search <span className="hidden md:inline-block">products...</span>
          </span>

          {/* Keyboard Shortcut Badge */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 group-hover:border-gray-300 px-2 py-1 rounded text-xs text-gray-500 font-mono shrink-0 transition-colors duration-200">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span>K</span>
          </div>
        </button>

        {/* Mobile Version - Icon Only */}
        {/* <button
          onClick={() => setShowSearch(true)}
          className="group flex sm:hidden items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gofarm-green rounded-lg hoverEffect"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-gofarm-green transition-colors duration-200" />
        </button> */}
      </div>

      {/* Search Modal Overlay */}
      {showSearch && (
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 search-modal-overlay ${
            showSearch ? "animate-fadeIn" : "animate-fadeOut"
          }`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 w-full h-screen bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            ref={modalRef}
            className={`relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden search-modal-content ${
              showSearch ? "animate-scaleIn" : "animate-scaleOut"
            }`}
          >
            {/* Header */}
            <div className="bg-linear-to-br from-gofarm-green via-gofarm-light-green to-emerald-500 p-6 text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>

              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl border border-white/30 shadow-lg">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold drop-shadow-sm">
                      Search Products
                    </h2>
                    <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
                      <span className="text-xs font-mono font-semibold">
                        {isMac ? "⌘" : "Ctrl"}
                      </span>
                      <span className="text-xs">+</span>
                      <span className="text-xs font-mono font-semibold">K</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 backdrop-blur-sm border border-transparent hover:border-white/20"
                  aria-label="Close search (Escape)"
                  title="Close (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-white/20 to-white/30 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type product name, category, or keyword..."
                      className="w-full pl-14 pr-24 py-5 text-lg bg-white/90 backdrop-blur-xl border-2 border-white/40 placeholder:text-gray-500 text-gray-800 focus:bg-white focus:border-white/60 rounded-md shadow-xl hover:shadow-2xl transition-all duration-200 font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                      <Search className="w-5 h-5 text-gofarm-green" />
                    </div>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group/clear"
                        title="Clear search"
                      >
                        <X className="w-5 h-5 text-gray-500 group-hover/clear:text-red-500 transition-colors" />
                      </button>
                    )}
                  </div>
                  {/* Search suggestions hint */}
                  <div className="mt-2 flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Press Enter to search
                    </span>
                    <span className="flex items-center gap-1">
                      {search
                        ? `${search.length} characters`
                        : "Start typing to search"}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Content */}
            <div className="max-h-[65vh] min-h-[50vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gofarm-green">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-gofarm-green/20 rounded-full"></div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    Searching products...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Finding the best matches for you
                  </p>
                </div>
              ) : search.trim().length > 0 && search.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="bg-blue-50 rounded-2xl p-8 mx-6 max-w-md">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Search className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                      Keep Typing...
                    </h3>
                    <p className="text-gray-600 text-center">
                      Please enter at least{" "}
                      <span className="font-bold text-blue-600">
                        2 characters
                      </span>{" "}
                      to search for products
                    </p>
                  </div>
                </div>
              ) : products?.length > 0 ? (
                <div className="px-2 sm:px-4">
                  {/* Results Header */}
                  <div className="py-4 px-4 border-b-2 border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-gofarm-green p-1.5 rounded-lg">
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">
                          Search Results
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                        <span className="font-bold text-gofarm-green">
                          {products.length}
                        </span>{" "}
                        {products.length === 1 ? "Product" : "Products"} Found
                      </span>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="divide-y-2 divide-gray-100">
                    {products.map((product: Product, index) => (
                      <div
                        key={product?._id}
                        className="p-4 sm:p-6 hover:bg-linear-to-r hover:from-gofarm-green/5 hover:to-transparent transition-all duration-200 group"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Product Image */}
                          <Link
                            href={`/product/${product?.slug?.current}`}
                            onClick={() => setShowSearch(false)}
                            className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-lg border-2 border-gray-200 group-hover:border-gofarm-green transition-all duration-200 shadow-md group-hover:shadow-lg"
                          >
                            {product?.images && (
                              <Image
                                width={112}
                                height={112}
                                src={urlFor(product?.images[0]).url()}
                                alt={product.name || "Product"}
                                className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-300 ${
                                  product?.stock === 0
                                    ? "opacity-50 grayscale"
                                    : ""
                                }`}
                              />
                            )}
                            {product?.discount && product.discount > 0 && (
                              <div className="absolute -top-2 -right-2 bg-linear-to-br from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-lg font-bold shadow-lg">
                                -{product.discount}%
                              </div>
                            )}
                            {product?.stock === 0 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded-md">
                                  OUT OF STOCK
                                </span>
                              </div>
                            )}
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 w-full">
                            {/* Product Name */}
                            <Link
                              href={`/product/${product?.slug?.current}`}
                              onClick={() => setShowSearch(false)}
                              className="block group-hover:text-gofarm-green transition-colors duration-200 mb-2"
                            >
                              <h3 className="font-bold text-lg sm:text-xl line-clamp-2 text-gray-800">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Product Status Badges */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {product?.status === "hot" && (
                                <span className="inline-flex items-center gap-1 bg-linear-to-r from-red-500 to-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                                  <TrendingUp className="w-3 h-3" />
                                  Hot Deal
                                </span>
                              )}
                              {product?.status === "new" && (
                                <span className="inline-flex items-center gap-1 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                                  <Clock className="w-3 h-3" />
                                  New Arrival
                                </span>
                              )}
                              {product?.status === "sale" && (
                                <span className="inline-flex items-center gap-1 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                                  <Star className="w-3 h-3" />
                                  On Sale
                                </span>
                              )}
                              {product?.isFeatured && (
                                <span className="inline-flex items-center gap-1 bg-linear-to-r from-yellow-400 to-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                                  <Star className="w-3 h-3" />
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Price and Action Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <PriceView
                                  price={product?.price}
                                  discount={product?.discount}
                                  className="text-base sm:text-lg font-bold"
                                />
                                {product?.stock !== undefined &&
                                  product?.stock > 0 && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {product.stock} in stock
                                    </span>
                                  )}
                              </div>

                              {/* Add to Cart Button */}
                              <div className="flex items-center gap-2">
                                {product?.stock === 0 ? (
                                  <span className="text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                                    Out of Stock
                                  </span>
                                ) : (
                                  <AddToCartButton
                                    product={product}
                                    className="px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  {search === "" || search.trim().length < 2 ? (
                    <div className="px-6">
                      <div className="mb-6 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-linear-to-br from-gofarm-green to-gofarm-light-green p-4 rounded-2xl shadow-lg">
                            <Search className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          Discover Amazing Products
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Start typing to search through thousands of products
                          or explore our sale items below
                        </p>
                      </div>

                      {/* Sale Products - Table Format */}
                      {saleProducts?.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gofarm-green/30 to-transparent" />
                            <div className="flex items-center gap-2 bg-linear-to-r from-gofarm-green to-gofarm-light-green px-4 py-2 rounded-full shadow-md">
                              <Star className="w-4 h-4 text-white animate-pulse" />
                              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                                Products On Sale
                              </h4>
                              <Star className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gofarm-green/30 to-transparent" />
                          </div>

                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-hidden border-2 border-gray-200 rounded-2xl shadow-lg">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-linear-to-r from-gofarm-green to-gofarm-light-green text-white">
                                  <th className="text-left py-4 px-4 font-bold text-sm uppercase tracking-wide">
                                    Image
                                  </th>
                                  <th className="text-left py-4 px-4 font-bold text-sm uppercase tracking-wide">
                                    Product Name
                                  </th>
                                  <th className="text-left py-4 px-4 font-bold text-sm uppercase tracking-wide">
                                    Price
                                  </th>
                                  <th className="text-left py-4 px-4 font-bold text-sm uppercase tracking-wide">
                                    Status
                                  </th>
                                  <th className="text-right py-4 px-4 font-bold text-sm uppercase tracking-wide">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {saleProducts.map((item: Product, index) => (
                                  <tr
                                    key={item?._id}
                                    className={`group hover:bg-linear-to-r hover:from-gofarm-green/5 hover:to-transparent transition-all duration-200 ${
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/50"
                                    }`}
                                  >
                                    {/* Image */}
                                    <td className="py-3 px-4">
                                      <Link
                                        href={`/product/${item?.slug?.current}`}
                                        onClick={() => setShowSearch(false)}
                                        className="block"
                                      >
                                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-gofarm-green transition-all duration-300 shadow-sm group-hover:shadow-md">
                                          {item?.images && (
                                            <Image
                                              width={64}
                                              height={64}
                                              src={urlFor(
                                                item?.images[0]
                                              ).url()}
                                              alt={item.name || "Product"}
                                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                            />
                                          )}
                                          {item?.discount &&
                                            item.discount > 0 && (
                                              <div className="absolute -top-1 -right-1 bg-linear-to-br from-red-500 to-red-600 text-white text-xs px-1.5 py-0.5 rounded-md font-bold shadow-md">
                                                -{item.discount}%
                                              </div>
                                            )}
                                        </div>
                                      </Link>
                                    </td>

                                    {/* Product Name */}
                                    <td className="py-3 px-4">
                                      <Link
                                        href={`/product/${item?.slug?.current}`}
                                        onClick={() => setShowSearch(false)}
                                        className="block"
                                      >
                                        <h5 className="font-bold text-gray-800 group-hover:text-gofarm-green line-clamp-2 transition-colors duration-200">
                                          {item?.name}
                                        </h5>
                                      </Link>
                                    </td>

                                    {/* Price */}
                                    <td className="py-3 px-4">
                                      <PriceView
                                        price={item?.price}
                                        discount={item?.discount}
                                        className="text-sm font-bold"
                                      />
                                    </td>

                                    {/* Status Badges */}
                                    <td className="py-3 px-4">
                                      <div className="flex flex-wrap gap-1">
                                        <span className="inline-flex items-center gap-1 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                          <Star className="w-3 h-3" />
                                          SALE
                                        </span>
                                        {item?.status === "hot" && (
                                          <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                            <TrendingUp className="w-3 h-3" />
                                            Hot
                                          </span>
                                        )}
                                        {item?.status === "new" && (
                                          <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                            <Clock className="w-3 h-3" />
                                            New
                                          </span>
                                        )}
                                        {item?.isFeatured && (
                                          <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                            <Star className="w-3 h-3" />
                                            Featured
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Action */}
                                    <td className="py-3 px-4 text-right">
                                      <button
                                        onClick={() =>
                                          setSearch(item?.name as string)
                                        }
                                        className="inline-flex items-center gap-2 bg-gofarm-green hover:bg-gofarm-light-green text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                                      >
                                        <Search className="w-4 h-4" />
                                        Search
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Card View */}
                          <div className="md:hidden space-y-3">
                            {saleProducts.map((item: Product) => (
                              <div
                                key={item?._id}
                                className="bg-white border-2 border-gray-200 hover:border-gofarm-green rounded-2xl p-4 transition-all duration-300 shadow-md hover:shadow-xl group"
                              >
                                <div className="flex gap-3 mb-3">
                                  {/* Image */}
                                  <Link
                                    href={`/product/${item?.slug?.current}`}
                                    onClick={() => setShowSearch(false)}
                                    className="shrink-0"
                                  >
                                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-gofarm-green transition-all duration-300 shadow-sm">
                                      {item?.images && (
                                        <Image
                                          width={80}
                                          height={80}
                                          src={urlFor(item?.images[0]).url()}
                                          alt={item.name || "Product"}
                                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                        />
                                      )}
                                      {item?.discount && item.discount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-linear-to-br from-red-500 to-red-600 text-white text-xs px-1.5 py-0.5 rounded-md font-bold shadow-md">
                                          -{item.discount}%
                                        </div>
                                      )}
                                    </div>
                                  </Link>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={`/product/${item?.slug?.current}`}
                                      onClick={() => setShowSearch(false)}
                                      className="block mb-2"
                                    >
                                      <h5 className="font-bold text-gray-800 group-hover:text-gofarm-green line-clamp-2 transition-colors duration-200">
                                        {item?.name}
                                      </h5>
                                    </Link>
                                    <PriceView
                                      price={item?.price}
                                      discount={item?.discount}
                                      className="text-sm font-bold mb-2"
                                    />
                                  </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  <span className="inline-flex items-center gap-1 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                    <Star className="w-3 h-3" />
                                    SALE
                                  </span>
                                  {item?.status === "hot" && (
                                    <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                      <TrendingUp className="w-3 h-3" />
                                      Hot
                                    </span>
                                  )}
                                  {item?.status === "new" && (
                                    <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                      <Clock className="w-3 h-3" />
                                      New
                                    </span>
                                  )}
                                  {item?.isFeatured && (
                                    <span className="inline-flex items-center gap-0.5 bg-linear-to-r from-yellow-400 to-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                      <Star className="w-3 h-3" />
                                      Featured
                                    </span>
                                  )}
                                </div>

                                {/* Action Button */}
                                <button
                                  onClick={() =>
                                    setSearch(item?.name as string)
                                  }
                                  className="w-full inline-flex items-center justify-center gap-2 bg-gofarm-green hover:bg-gofarm-light-green text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <Search className="w-4 h-4" />
                                  Search This Product
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* View All Link */}
                          <div className="pt-4 border-t-2 border-gray-200">
                            <p className="text-sm text-gray-600 text-center">
                              Showing{" "}
                              <span className="font-bold text-gofarm-green">
                                {saleProducts.length}
                              </span>{" "}
                              products on sale
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-red-50 rounded-2xl p-8 mx-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-red-100 p-3 rounded-full">
                            <X className="w-8 h-8 text-red-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          No Results Found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Sorry, we couldn&apos;t find any products matching{" "}
                          <span className="font-semibold text-red-600">
                            &quot;{search}&quot;
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Try using different keywords or check the spelling
                        </p>
                        <button
                          onClick={() => setSearch("")}
                          className="bg-gofarm-green hover:bg-gofarm-light-green text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
                        >
                          Clear Search
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
