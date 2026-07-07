"use client";

import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { useCompareStore } from "@/stores/compareStore";
import { useEffect, useState } from "react";

const CompareButton = () => {
  const { compareProducts } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/compare"
        className="relative p-2 text-gofarm-gray hover:text-gofarm-green transition-colors rounded-full"
      >
        <ArrowLeftRight className="w-5 h-5" />
      </Link>
    );
  }

  const compareCount = compareProducts.length;

  return (
    <Link
      href="/compare"
      className="relative p-2 text-gofarm-gray hover:text-gofarm-green transition-colors rounded-full"
      title="Compare products"
    >
      <ArrowLeftRight className="w-5 h-5" />
      {compareCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gofarm-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {compareCount}
        </span>
      )}
    </Link>
  );
};

export default CompareButton;
