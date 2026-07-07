import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { verifyIPNHash } from "@/lib/sslcommerz";

/**
 * IPN (Instant Payment Notification) handler for SSLCommerz
 * This is called by SSLCommerz server after payment processing
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Convert FormData to object
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Verify IPN hash for security
    const isValid = verifyIPNHash(data);

    if (!isValid) {
      console.error("IPN hash verification failed");
      return NextResponse.json(
        { error: "Invalid IPN signature" },
        { status: 400 }
      );
    }

    const {
      val_id: valId,
      tran_id: tranId,
      amount,
      status,
      value_a: orderId,
      bank_tran_id: bankTranId,
      card_type: cardType,
      tran_date: tranDate,
    } = data;

    if (!orderId || !tranId || !valId) {
      console.error("Missing required IPN parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Only process if payment is successful or valid
    if (status === "VALID" || status === "VALIDATED") {
      // Update order status
      await client
        .patch(orderId)
        .set({
          status: ORDER_STATUSES.PAID,
          paymentStatus: PAYMENT_STATUSES.PAID,
          paymentMethod: "sslcommerz",
          sslcommerzValidationId: valId,
          sslcommerzBankTransactionId: bankTranId,
          sslcommerzCardType: cardType,
          sslcommerzTransactionDate: tranDate,
          paidAt: new Date().toISOString(),
        })
        .commit();
    } else {
      console.log("IPN: Payment not successful, status:", status);
    }

    // Return success response to SSLCommerz
    return NextResponse.json({ success: true, status: "OK" });
  } catch (error) {
    console.error("SSLCommerz IPN handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
