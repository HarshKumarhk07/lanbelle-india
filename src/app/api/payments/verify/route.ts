import { type NextRequest } from "next/server";
import { markOrderPaid } from "@/services/order.service";
import { verifyPaymentSchema } from "@/lib/validations/checkout";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError, ApiError, HttpStatus } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = verifyPaymentSchema.parse(body);

    const valid = verifyPaymentSignature({
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });
    if (!valid) {
      throw new ApiError(
        "Payment verification failed. If you were charged, it will be auto-refunded.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = await markOrderPaid(
      { id: user.id, email: user.email, name: user.name },
      {
        orderId: input.orderId,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
      },
    );

    return success({ order }, "Payment verified");
  } catch (error) {
    return handleApiError(error);
  }
}
