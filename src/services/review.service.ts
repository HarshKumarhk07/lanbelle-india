import { connectDB } from "@/lib/db";
import { Review } from "@/models/review.model";
import { Order } from "@/models/order.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import type { CreateReviewInput } from "@/lib/validations/account";
import type { Paginated, ReviewDTO } from "@/types";

interface PopulatedUser {
  name?: string;
}
interface PopulatedProduct {
  _id: unknown;
  name?: string;
  slug?: string;
  images?: { url: string }[];
}

/** Creates (one per user/product) a review, flagging verified purchases. */
export async function createReview(
  user: { id: string; name: string },
  input: CreateReviewInput,
): Promise<ReviewDTO> {
  await connectDB();

  const existing = await Review.findOne({
    product: input.productId,
    user: user.id,
  });
  if (existing) {
    throw new ApiError(
      "You've already reviewed this product",
      HttpStatus.CONFLICT,
    );
  }

  const purchased = await Order.exists({
    user: user.id,
    "items.product": input.productId,
    status: { $in: ["paid", "processing", "dispatched", "delivered"] },
  });

  const review = await Review.create({
    product: input.productId,
    user: user.id,
    rating: input.rating,
    title: input.title || undefined,
    comment: input.comment,
    isVerifiedPurchase: Boolean(purchased),
    status: "approved",
  });

  return {
    id: String(review._id),
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    userName: user.name,
    isVerifiedPurchase: review.isVerifiedPurchase,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function getProductReviews(
  productId: string,
  page?: number,
  limit?: number,
): Promise<Paginated<ReviewDTO>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 10);

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId, status: "approved" })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate({ path: "user", select: "name" })
      .lean(),
    Review.countDocuments({ product: productId, status: "approved" }),
  ]);

  const items: ReviewDTO[] = reviews.map((r) => ({
    id: String(r._id),
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    userName: (r.user as PopulatedUser)?.name ?? "Lanbel customer",
    isVerifiedPurchase: r.isVerifiedPurchase,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, pagination: buildPagination(total, paging.page, paging.limit) };
}

export async function getUserReviews(userId: string): Promise<ReviewDTO[]> {
  await connectDB();
  const reviews = await Review.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "product", select: "name slug images" })
    .lean();

  return reviews.map((r) => {
    const product = r.product as PopulatedProduct | null;
    return {
      id: String(r._id),
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      userName: "You",
      isVerifiedPurchase: r.isVerifiedPurchase,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt.toISOString(),
      product: product
        ? {
            id: String(product._id),
            name: product.name ?? "Product",
            slug: product.slug ?? "",
            image: product.images?.[0]?.url ?? "",
          }
        : undefined,
    };
  });
}

export async function deleteReview(
  userId: string,
  reviewId: string,
): Promise<void> {
  await connectDB();
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    user: userId,
  });
  if (!review) throw new ApiError("Review not found", HttpStatus.NOT_FOUND);
}
