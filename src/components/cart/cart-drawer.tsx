"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X, Trash2, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/utils/pricing";

export function CartDrawer() {
  const {
    items,
    totals,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  const progress = Math.min(
    100,
    Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-card shadow-lift"
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
                <ShoppingBag className="size-5 text-primary" />
                Your cart ({totals.itemCount})
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-accent/60 text-primary">
                  <ShoppingBag className="size-7" />
                </div>
                <div>
                  <p className="font-medium">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add some K-beauty essentials to get started.
                  </p>
                </div>
                <Button asChild onClick={closeCart}>
                  <Link href="/shop">Browse products</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-border px-5 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="size-3.5 text-primary" />
                    {totals.freeShippingEligible ? (
                      <span className="font-medium text-success">
                        You&apos;ve unlocked free shipping!
                      </span>
                    ) : (
                      <span>
                        Add {formatPrice(totals.amountToFreeShipping)} more for
                        free shipping
                      </span>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item.productId} className="flex gap-3">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeCart}
                              className="line-clamp-2 text-sm font-medium hover:text-primary"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.productId)}
                              aria-label="Remove item"
                              className="text-muted-foreground transition hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-sm font-semibold">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-auto pt-2">
                            <QuantityStepper
                              size="sm"
                              value={item.quantity}
                              max={item.stock}
                              onChange={(q) => updateQuantity(item.productId, q)}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="border-t border-border px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">
                      {formatPrice(totals.subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Shipping &amp; taxes calculated at checkout.
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Button asChild size="lg" onClick={closeCart}>
                      <Link href="/checkout">
                        Checkout <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      onClick={closeCart}
                    >
                      <Link href="/cart">View cart</Link>
                    </Button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
