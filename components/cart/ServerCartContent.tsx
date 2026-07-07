"use client";

import React, { useEffect, useState } from "react";
import useCartStore from "@/store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import EmptyCart from "@/components/EmptyCart";
import PriceFormatter from "@/components/PriceFormatter";
import CouponInput from "@/components/CouponInput";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CartItemControls } from "./CartItemControls";
import { AddressSelector } from "./AddressSelector";
import { CheckoutButton } from "./CheckoutButton";
import { Trash2, AlertTriangle, X, LogIn } from "lucide-react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/shared/OrderSummary";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  customerName: string;
  email: string;
}

interface ServerCartContentProps {
  userEmail: string;
  userAddresses: Address[];
  userOrders: UserOrder[];
  onAddressesRefresh?: () => Promise<void>;
  isAuthenticated: boolean;
}

export function ServerCartContent({
  userEmail,
  userAddresses,
  userOrders,
  onAddressesRefresh,
  isAuthenticated,
}: ServerCartContentProps) {
  const {
    items: cart,
    getSubTotalPrice,
    getTotalDiscount,
    resetCart,
    setOrderPlacementState,
    isPlacingOrder,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getCouponDiscount,
  } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    // Small delay to ensure Zustand persist has loaded from localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset order placement state when cart page loads to clear any stale state
  useEffect(() => {
    setOrderPlacementState(false, "validating");
  }, [setOrderPlacementState]);

  const handleResetCart = () => {
    setShowClearModal(true);
  };

  const confirmResetCart = async () => {
    try {
      await resetCart();
      setShowClearModal(false);
      toast.success("Cart cleared successfully from both local and database");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart completely");
      setShowClearModal(false);
    }
  };

  // Set default address on mount
  useEffect(() => {
    const defaultAddress = userAddresses.find((addr) => addr.default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    }
  }, [userAddresses]);

  // New pricing structure:
  // 1. Subtotal = gross amount (sum of original prices before discount)
  // 2. Discount = total discount amount
  // 3. Current subtotal = after product discount
  // 4. Coupon discount
  // 5. Final calculations with shipping and tax
  const grossSubtotal = getSubTotalPrice(); // Gross amount (before discount)
  const totalDiscount = getTotalDiscount(); // Total discount amount (product discounts)
  const currentSubtotal = grossSubtotal - totalDiscount; // After product discount

  // Coupon discount
  const couponDiscount = getCouponDiscount();
  const subtotalAfterCoupon = currentSubtotal - couponDiscount;

  const shipping = subtotalAfterCoupon > 100 ? 0 : 10;
  const tax =
    subtotalAfterCoupon * (parseFloat(process.env.TAX_AMOUNT || "0") || 0);

  // Don't show order placement skeleton in ServerCartContent
  // The overlay is handled by CheckoutButton component instead

  // Show loading while hydrating to prevent flash of empty cart
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gofarm-light-gray rounded-lg p-3 sm:p-4 bg-white animate-pulse"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-md" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="border border-gofarm-light-gray rounded-lg p-4 sm:p-6 bg-white animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show empty cart while placing order to prevent flash during redirect
  if ((!cart || cart.length === 0) && !isPlacingOrder) {
    return (
      <div className="space-y-8">
        <EmptyCart />

        {/* Show recent orders if available */}
        {userOrders.length > 0 && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {userOrders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceFormatter amount={order.totalPrice} />
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" : "secondary"
                      }
                      className="ml-2"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/user/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 lg:items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cart Header - Mobile */}
          <div className="block lg:hidden mb-4">
            <h1 className="text-2xl font-bold text-gofarm-black">
              Cart Details
            </h1>
            <p className="text-sm text-gofarm-gray mt-1">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>
          </div>

          {cart.map((item) => (
            <div
              key={item.product._id}
              className="border border-gofarm-light-gray rounded-lg p-3 sm:p-4 bg-white hover:shadow-md transition-shadow min-h-[140px] sm:min-h-[160px]"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Product Image */}
                <Link href={`/product/${item.product.slug?.current}`}>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                    <Image
                      src={
                        item.product.images?.[0]
                          ? urlFor(item.product.images[0]).url()
                          : "/placeholder.jpg"
                      }
                      alt={item.product.name || "Product"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product.slug?.current}`}>
                        <h3 className="font-semibold text-sm sm:text-base text-gofarm-black hover:text-gofarm-green transition-colors truncate">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.product.categories && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.product.categories?.slice(0, 2).map(
                            (
                              category: {
                                _ref?: string;
                                _type?: string;
                                name?: string;
                                title?: string;
                              },
                              idx: number
                            ) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-gofarm-light-green/10 text-gofarm-green"
                              >
                                {category?.name ||
                                  category?.title ||
                                  "Category"}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-sm sm:text-base text-gofarm-black">
                        <PriceFormatter amount={item.product.price} />
                      </div>
                      <div className="text-xs text-gofarm-gray">per item</div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  {item.product.stock === 0 && (
                    <Badge
                      variant="destructive"
                      className="mt-2 text-xs bg-red-100 text-red-700"
                    >
                      Out of Stock
                    </Badge>
                  )}
                  {item.product.stock &&
                    item.product.stock < 5 &&
                    item.product.stock > 0 && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs text-gofarm-orange border-gofarm-orange"
                      >
                        Only {item.product.stock} left
                      </Badge>
                    )}

                  {/* Controls */}
                  <div className="flex justify-between items-center mt-3 sm:mt-4">
                    <CartItemControls product={item.product} />
                    <div className="font-bold text-base sm:text-lg text-gofarm-green">
                      <PriceFormatter
                        amount={(item.product.price || 0) * item.quantity}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/shop" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gofarm-green text-gofarm-green hover:bg-gofarm-light-green/10"
              >
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleResetCart}
              className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        {/* Right Sidebar - Order Summary */}
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {/* Cart Header - Desktop */}
          <div className="hidden lg:block">
            <h1 className="text-3xl font-bold text-gofarm-black">
              Cart Details
            </h1>
            <p className="text-sm text-gofarm-gray mt-1">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Address Selection - Only show if authenticated */}
          {isAuthenticated && (
            <AddressSelector
              userEmail={userEmail}
              addresses={userAddresses}
              selectedAddress={selectedAddress}
              onAddressSelect={setSelectedAddress}
              onAddressesRefresh={onAddressesRefresh}
            />
          )}

          {/* Sign in prompt for guest users */}
          {!isAuthenticated && (
            <div className="border-2 border-amber-200 rounded-lg p-6 sm:p-8 bg-amber-50/50 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <LogIn className="h-8 w-8 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Sign in to Continue
                  </h3>
                  <p className="text-gray-600 max-w-sm">
                    Please sign in or create an account to view pricing details
                    and complete your purchase
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    asChild
                    className="bg-gofarm-green hover:bg-gofarm-light-green"
                  >
                    <Link href="/sign-in?redirectTo=/cart">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gofarm-green text-gofarm-green hover:bg-gofarm-green/10"
                  >
                    <Link href="/sign-up?redirectTo=/cart">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Input - Only for authenticated users */}
          {isAuthenticated && (
            <div className="border border-gofarm-light-gray rounded-lg p-4 sm:p-6 bg-white shadow-sm">
              <CouponInput
                subtotal={currentSubtotal}
                cartItems={cart.map((item) => ({
                  productId: item.product._id!,
                  quantity: item.quantity,
                  price: item.product.price || 0,
                }))}
                onCouponApplied={(coupon) => {
                  if (coupon) {
                    applyCoupon(coupon);
                  } else {
                    removeCoupon();
                  }
                }}
                appliedCoupon={appliedCoupon}
              />
            </div>
          )}

          {/* Order Summary - Only for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-4">
              <OrderSummary
                data={{
                  subtotal: grossSubtotal,
                  shipping,
                  tax,
                  productDiscount: totalDiscount,
                  couponDiscount,
                  couponCode: appliedCoupon?.code,
                  itemCount: cart.length,
                  showHeader: true,
                  showBreakdown: true,
                  showMessages: true,
                  variant: "detailed",
                }}
              />
              {/* Checkout Button */}
              <CheckoutButton
                cart={cart}
                selectedAddress={selectedAddress}
                isAuthenticated={isAuthenticated}
              />
            </div>
          )}
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>Clear Cart Confirmation</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Clear Cart</h3>
                <p className="text-gray-600 leading-relaxed">
                  You&apos;re about to remove{" "}
                  <span className="font-semibold text-red-600">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </span>{" "}
                  from your cart. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowClearModal(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
              >
                Keep Items
              </Button>
              <Button
                variant="destructive"
                onClick={confirmResetCart}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
