"use client";

import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";

export default function WishlistPage() {
  const { items, clear } = useWishlist();
  const { addItem } = useCart();

  const moveAllToCart = () => {
    const inStock = items.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      toast.error("No in-stock items to add");
      return;
    }
    inStock.forEach((p) => addItem(p));
  };

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto flex max-w-xl flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-accent/60 text-primary">
          <Heart className="size-9" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            Your wishlist is empty
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your favourite K-beauty products to revisit them anytime.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/shop">
            Explore products <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">My wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={moveAllToCart}>
            <ShoppingBag className="size-4" /> Add all to cart
          </Button>
          <Button
            variant="ghost"
            onClick={clear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {items.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
