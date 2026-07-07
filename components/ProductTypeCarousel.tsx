"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ALL_PRODUCTS_QUERYResult } from "@/sanity.types";

interface ProductTypeCarouselProps {
  variantId: string;
  variantTitle: string;
  variantSlug: string;
  products: ALL_PRODUCTS_QUERYResult;
}

const ProductTypeCarousel = ({
  variantId,
  variantTitle,
  variantSlug,
  products,
}: ProductTypeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        // xl
        setItemsPerView(5);
      } else if (width >= 1024) {
        // lg
        setItemsPerView(4);
      } else if (width >= 768) {
        // md
        setItemsPerView(3);
      } else if (width >= 640) {
        // sm
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-12 bg-gofarm-white rounded-2xl border border-gofarm-light-gray/30 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gofarm-light-gray">
        <div className="flex items-center gap-4">
          <h3 className="text-xl lg:text-2xl font-bold text-gofarm-black capitalize">
            {variantTitle}
          </h3>
          <span className="px-3 py-1 bg-gofarm-light-orange text-gofarm-green text-sm font-semibold rounded-full">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        <Link
          href={`/products/${variantSlug}`}
          className="flex items-center gap-2 text-gofarm-green hover:text-gofarm-light-green font-semibold text-sm lg:text-base hoverEffect group"
        >
          View More
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
          <Button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`h-10 w-10 rounded-full p-0 shadow-lg transition-all duration-300 ${
              canGoPrev
                ? "bg-gofarm-white hover:bg-gofarm-green text-gofarm-green hover:text-gofarm-white border-2 border-gofarm-green"
                : "bg-gofarm-light-gray text-gofarm-gray cursor-not-allowed opacity-50"
            }`}
            aria-label="Previous products"
          >
            <ChevronLeft size={20} />
          </Button>
        </div>

        <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`h-10 w-10 rounded-full p-0 shadow-lg transition-all duration-300 ${
              canGoNext
                ? "bg-gofarm-white hover:bg-gofarm-green text-gofarm-green hover:text-gofarm-white border-2 border-gofarm-green"
                : "bg-gofarm-light-gray text-gofarm-gray cursor-not-allowed opacity-50"
            }`}
            aria-label="Next products"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="overflow-hidden w-full" ref={containerRef}>
          <motion.div
            className="flex gap-4"
            animate={{
              x: `-${currentIndex * (100 / itemsPerView)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: `${(products.length / itemsPerView) * 100}%`,
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="shrink-0"
                // style={{ width: `calc(${100 / itemsPerView}% - ${(16 * (itemsPerView - 1)) / itemsPerView}px)` }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Progress Indicator */}
        {products.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({
              length: Math.ceil(products.length / itemsPerView),
            }).map((_, index) => {
              const isActive =
                index === Math.floor(currentIndex / itemsPerView);
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * itemsPerView)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 bg-gofarm-green"
                      : "w-2 bg-gofarm-light-gray hover:bg-gofarm-gray"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTypeCarousel;
