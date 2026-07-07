import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getCurrentUser } from "@/lib/firebase-admin-auth";
import { getMyOrders } from "@/sanity/helpers";
import { writeClient } from "@/sanity/lib/client";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/orderStatus";
import crypto from "crypto";
import { sendOrderStatusNotification } from "@/lib/notificationService";

interface CartItem {
  product: {
    _id: string;
    name?: string;
    price?: number;
    category?: string;
  };
  quantity: number;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getMyOrders(userId);

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = async (request: NextRequest) => {
  try {
    // Check authentication
    const userId = await getAuthUserId();
    const user = await getCurrentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      subtotal,
      shipping,
      tax,
      coupon,
      productDiscount,
      businessDiscount,
    } = reqBody;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (
      !paymentMethod ||
      !Object.values(PAYMENT_METHODS).includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const userEmail = user.email || "";
    const userName = user.displayName || "User";
    const userPhone = user.phoneNumber || shippingAddress.phone || "";

    // Create order object
    const orderData = {
      _type: "order" as const,
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      firebaseUid: userId,
      products: items.map(
        (item: { product: { _id: string }; quantity: number }) => ({
          _key: crypto.randomUUID(), // Generate unique key for each product item
          product: {
            _type: "reference",
            _ref: item.product._id,
          },
          quantity: item.quantity,
        })
      ),
      totalPrice: totalAmount,
      currency: "USD",
      productDiscount: productDiscount || 0,
      amountDiscount: coupon?.discountAmount || 0,
      businessDiscount: businessDiscount || 0,
      ...(coupon && {
        coupon: {
          _type: "object",
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: coupon.discountAmount,
          couponRef: {
            _type: "reference",
            _ref: coupon._id,
          },
        },
      }),
      address: {
        _type: "object",
        name: shippingAddress.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
      },
      status: ORDER_STATUSES.PENDING,
      orderDate: new Date().toISOString(),
      paymentMethod,
      paymentStatus:
        paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY
          ? PAYMENT_STATUSES.PENDING
          : PAYMENT_STATUSES.PENDING,
      subtotal,
      shipping,
      tax,
      // Add payment-specific fields based on payment method
      ...(paymentMethod === PAYMENT_METHODS.STRIPE && {
        stripeCustomerId: "", // Will be populated when needed for invoicing
        stripePaymentIntentId: "", // Will be populated for Stripe payments
        stripeCheckoutSessionId: "", // Will be populated for Stripe payments
      }),
      ...(paymentMethod === PAYMENT_METHODS.CLERK && {
        clerkPaymentId: "", // Will be populated for Clerk payments
        clerkPaymentStatus: "pending", // Initial status
      }),
      ...(paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && {
        stripePaymentIntentId: `cod_${orderNumber}`,
      }),
    };

    // Create order in Sanity using writeClient (has create permissions)
    const createdOrder = await writeClient.create(orderData);

    // Increment coupon usage if coupon was applied
    if (coupon?._id) {
      try {
        await writeClient.patch(coupon._id).inc({ timesUsed: 1 }).commit();
      } catch (couponError) {
        console.error("Failed to increment coupon usage:", couponError);
        // Don't fail the order if coupon update fails
      }
    }

    // Track order placed event
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/analytics/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "order_placed",
            eventParams: {
              orderId: createdOrder._id,
              orderNumber: createdOrder.orderNumber,
              amount: totalAmount,
              status: createdOrder.status,
              userId: userId,
              paymentMethod: paymentMethod,
              itemCount: items.length,
              subtotal: subtotal,
              shipping: shipping,
              tax: tax,
              customerEmail: userEmail,
              products: items.map((item: CartItem) => ({
                productId: item.product._id,
                name: item.product.name || "Unknown Product",
                quantity: item.quantity,
                price: item.product.price || 0,
              })),
            },
          }),
        }
      );

      // Also track purchase event for e-commerce analytics
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/analytics/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "purchase",
            eventParams: {
              orderId: createdOrder._id,
              value: totalAmount,
              currency: "USD",
              items: items.map((item: CartItem) => ({
                productId: item.product._id,
                name: item.product.name || "Unknown Product",
                category: item.product.category || "Uncategorized",
                quantity: item.quantity,
                price: item.product.price || 0,
              })),
              userId: userId,
            },
          }),
        }
      );
    } catch (analyticsError) {
      console.error("Failed to track order placed event:", analyticsError);
    }

    // Send order confirmation notification to user
    try {
      await sendOrderStatusNotification({
        firebaseUid: userId,
        orderNumber: createdOrder.orderNumber,
        orderId: createdOrder._id,
        status: ORDER_STATUSES.PENDING,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send order confirmation notification:",
        notificationError
      );
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        paymentMethod: createdOrder.paymentMethod,
        totalPrice: createdOrder.totalPrice,
        currency: createdOrder.currency,
      },
      message: "Order created successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Order creation error:", error);
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json(
      {
        error: errorMessage || "Failed to create order",
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
};
