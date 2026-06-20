import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllProductSlugs, getAllCategories } from "@/services/catalog.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes = [
    "",
    "/shop",
    "/best-sellers",
    "/categories",
    "/about",
    "/contact",
    "/shipping",
    "/refunds",
    "/faqs",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let productSlugs: string[] = [];
  let categorySlugs: string[] = [];
  try {
    [productSlugs, categorySlugs] = await Promise.all([
      getAllProductSlugs(),
      getAllCategories().then((c) => c.map((cat) => cat.slug)),
    ]);
  } catch {
    /* fall back to static routes only */
  }

  const productRoutes = productSlugs.map((slug) => ({
    url: `${base}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${base}/shop?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
