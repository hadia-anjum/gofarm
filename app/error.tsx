"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Caught global runtime error:", error);
    // Agar koi bhi page production par crash ho, to automatic use safely home page par bhej do
    router.replace("/");
  }, [error, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Loading Fresh Farm Platform...</h2>
      <button 
        onClick={() => reset()} 
        className="px-4 py-2 bg-green-600 text-white rounded-md"
      >
        Refresh Page
      </button>
    </div>
  );
}
