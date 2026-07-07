"use client";

import useCartStore, { CartItem } from "@/store";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { toast } from "sonner";

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

interface UseOrderPlacementProps {
  user: {
    uid?: string;
    email?: string;
  } | null;
}

export function useOrderPlacement({ user }: UseOrderPlacementProps) {
  const {
    items: cart,
    resetCart,
    isPlacingOrder,
    orderStep,
    setOrderPlacementState,
    appliedCoupon,
  } = useCartStore();

  const placeOrder = async (
    selectedAddress: Address,
    selectedPaymentMethod: PaymentMethod,
    subtotal: number,
    shipping: number,
    tax: number,
    total: number,
    productDiscount: number = 0,
    couponDiscount: number = 0,
    businessDiscount: number = 0,
    redirectToCheckout: boolean = false
  ) => {
    if (!selectedAddress) {
      toast.error("Address Required", {
        description: "Please select a shipping address",
        duration: 4000,
      });
      return { success: false };
    }

    if (cart.length === 0) {
      toast.error("Cart is empty", {
        description: "Add some products to your cart first",
        duration: 4000,
      });
      return { success: false };
    }

    const cartSnapshot: CartItem[] = JSON.parse(JSON.stringify(cart));

    setOrderPlacementState(true, "validating");

    try {
      setOrderPlacementState(true, "creating");

      const uid = user?.uid || "guest-uid";
      const orderId = `order_${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      // Prepare order details
      const newOrder = {
        _id: orderId,
        _type: "order",
        orderNumber,
        firebaseUid: uid,
        orderDate: new Date().toISOString(),
        paymentStatus: selectedPaymentMethod === PAYMENT_METHODS.COD ? "pending" : "paid",
        paymentMethod: selectedPaymentMethod,
        totalAmount: total,
        subtotal,
        shipping,
        tax,
        productDiscount,
        couponDiscount,
        businessDiscount,
        status: "processing",
        shippingAddress: {
          name: selectedAddress.name,
          street: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zip,
          country: "United States",
        },
        products: cartSnapshot.map((item) => ({
          _key: `item_${Math.random().toString(36).substr(2, 9)}`,
          quantity: item.quantity,
          product: {
            _id: item.product._id,
            name: item.product.name || "Unknown Product",
            slug: item.product.slug,
            price: item.product.price || 0,
            images: item.product.images || []
          }
        }))
      };

      // Read current orders
      let currentOrders = [];
      if (typeof window !== "undefined") {
        const localOrdersStr = localStorage.getItem(`gofarm-orders-${uid}`) || "[]";
        try {
          currentOrders = JSON.parse(localOrdersStr);
        } catch (e) {
          currentOrders = [];
        }
      }

      // Add new order
      currentOrders.push(newOrder);

      // Save to localStorage & cookie
      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(currentOrders);
        localStorage.setItem(`gofarm-orders-${uid}`, serialized);
        document.cookie = `gofarm-orders-${uid}=${encodeURIComponent(serialized)}; path=/; max-age=360000`;
      }

      setOrderPlacementState(true, "emailing");
      toast.success("Order Placed Successfully! 🎉", {
        description: "Offline confirmation simulated",
        duration: 4000,
      });

      setOrderPlacementState(true, "redirecting");
      resetCart();

      if (selectedPaymentMethod === PAYMENT_METHODS.STRIPE) {
        if (redirectToCheckout) {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/checkout?order_id=${orderId}&orderNumber=${orderNumber}`,
            isCheckoutRedirect: true,
          };
        } else {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/payment-success?orderNumber=${orderNumber}&session_id=mock_stripe_session_${orderId}`,
            isStripeRedirect: true,
          };
        }
      } else if (selectedPaymentMethod === PAYMENT_METHODS.CLERK) {
        return {
          success: true,
          orderId,
          orderNumber,
          redirectTo: `/payment-success?orderNumber=${orderNumber}&session_id=mock_clerk_session_${orderId}`,
          isClerkRedirect: true,
        };
      } else {
        if (redirectToCheckout) {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/checkout?order_id=${orderId}&orderNumber=${orderNumber}`,
            isCheckoutRedirect: true,
          };
        } else {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/success?order_id=${orderId}&orderNumber=${orderNumber}&payment_method=cod`,
            isCOD: true,
          };
        }
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error("Order Failed", {
        description: error.message || "Please try again",
        duration: 5000,
      });
      setOrderPlacementState(false, "validating");
      return { success: false, error: error.message };
    }
  };

  return {
    placeOrder,
    isPlacingOrder,
    orderStep,
    cartSnapshot: cart,
  };
}
