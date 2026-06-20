export { Category, type ICategory } from "@/models/category.model";
export { Brand, type IBrand } from "@/models/brand.model";
export { Product, type IProduct, type SkinType } from "@/models/product.model";
export { User, type IUser, type AuthProvider } from "@/models/user.model";
export { Cart, type ICart, type ICartItem } from "@/models/cart.model";
export { Wishlist, type IWishlist } from "@/models/wishlist.model";
export {
  Coupon,
  type ICoupon,
  type CouponType,
  type CouponScope,
} from "@/models/coupon.model";
export {
  Review,
  type IReview,
  type ReviewStatus,
} from "@/models/review.model";
export {
  Order,
  type IOrder,
  type IOrderItem,
  type IStatusHistory,
} from "@/models/order.model";
export {
  Banner,
  type IBanner,
  type BannerPosition,
} from "@/models/banner.model";
export {
  Notification,
  type INotification,
  type NotificationType,
} from "@/models/notification.model";

export type {
  IImage,
  IAddress,
  ISeo,
} from "@/models/_shared";
