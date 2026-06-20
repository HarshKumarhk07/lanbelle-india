import { type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  markPaidByRazorpayOrder,
  markOrderRefunded,
} from "@/services/order.service";
import { success, failure, HttpStatus } from "@/lib/api-response";

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    refund?: { entity?: { id?: string; order_id?: string } };
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return failure("Invalid webhook signature", HttpStatus.UNAUTHORIZED);
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return failure("Invalid payload", HttpStatus.BAD_REQUEST);
  }

  try {
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        if (payment?.order_id && payment.id) {
          await markPaidByRazorpayOrder(payment.order_id, payment.id);
        }
        break;
      }
      case "refund.processed":
      case "refund.created": {
        const refund = event.payload?.refund?.entity;
        if (refund?.order_id) {
          await markOrderRefunded(refund.order_id, refund.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    // Acknowledge to avoid infinite retries; log for investigation.
    console.error("[razorpay:webhook]", error);
  }

  return success(null, "Webhook processed");
}
