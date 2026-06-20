/**
 * Database seed script.
 * Usage: `npm run seed`  (requires MONGODB_URI in .env.local or .env)
 *
 * Idempotent — clears and populates categories, brands and products by slug, and an admin
 * user by email. Safe to run repeatedly.
 */
import { connectDB, mongoose } from "@/lib/db";
import { Category } from "@/models/category.model";
import { Brand } from "@/models/brand.model";
import { Product } from "@/models/product.model";
import { User } from "@/models/user.model";
import { categories as categoryDefs } from "@/lib/site-config";

const brandDefs = [
  { name: "Lanbelle", description: "Premium Korean skincare using natural and safe ingredients." }
];

interface SeedProduct {
  name: string;
  sku: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  shortDescription: string;
  description: string;
  ingredients: string[];
  howToUse: string[];
  benefits: string[];
  skinTypes: string[];
  volume: string;
  images: { url: string; alt: string }[];
  flags?: Partial<{
    isFeatured: boolean;
    isBestSeller: boolean;
    isTrending: boolean;
    isNewArrival: boolean;
  }>;
  rating?: { average: number; count: number };
  unitsSold?: number;
}

const productDefs: SeedProduct[] = [
  {
    name: "Natural Deep Cleansing Oil",
    sku: "LNB-CLEAN-200",
    brand: "Lanbelle",
    category: "cleansers",
    price: 1999,
    mrp: 2499,
    stock: 50,
    shortDescription: "100% natural oils for a gentle but deep cleanse.",
    description:
      "A premium all-natural deep cleansing oil that effectively removes makeup, sebum, and impurities while maintaining skin moisture. Formulated with natural botanical oils like grape seed oil and macadamia seed oil for a nourished and fresh finish.",
    ingredients: ["Grape Seed Oil", "Macadamia Seed Oil", "Lemon Peel Oil", "Lavender Oil", "Eucalyptus Leaf Oil"],
    howToUse: [
      "Pump an appropriate amount onto dry hands.",
      "Gently massage onto dry face to melt away makeup and impurities.",
      "Add water to emulsify and massage.",
      "Rinse thoroughly with lukewarm water."
    ],
    benefits: ["Gentle deep cleansing", "Pore care & sebum control", "Keeps skin moisturized"],
    skinTypes: ["all"],
    volume: "200ml",
    images: [
      { url: "/natural deep cleansing oil.webp", alt: "Lanbelle Natural Deep Cleansing Oil" },
      { url: "/LANBELLE Natural Deep Cleansing Oil 200ml Korea Beauty Made in Korea.jpg", alt: "Lanbelle Natural Deep Cleansing Oil 200ml" },
    ],
    flags: { isFeatured: true, isBestSeller: true, isTrending: true },
    rating: { average: 4.9, count: 128 },
    unitsSold: 500,
  },
  {
    name: "Vita Energy Blemish Clear Ampoule",
    sku: "LNB-VITA-50",
    brand: "Lanbelle",
    category: "serums",
    price: 2499,
    mrp: 2999,
    stock: 35,
    shortDescription: "Vitamin-rich ampoule to clear blemishes and brighten skin.",
    description:
      "A concentrated brightening ampoule formulated to target blemishes, dark spots, and uneven skin tone. Drenched in vitamins to vitalize skin barrier and reveal a radiant, translucent glass-skin complexion.",
    ingredients: ["Sea Buckthorn Extract", "Niacinamide", "Panthenol", "Ascorbic Acid", "Adenosine"],
    howToUse: [
      "After cleansing and toning, apply 2–3 drops to the face.",
      "Gently pat into the skin until fully absorbed.",
      "Follow with your favorite moisturizer."
    ],
    benefits: ["Fades blemishes & dark spots", "Brightens skin tone", "Improves skin elasticity"],
    skinTypes: ["all", "sensitive", "dry"],
    volume: "50ml",
    images: [
      { url: "/Lanbelle vita energy blemish clear ampoule.webp", alt: "Lanbelle Vita Energy Blemish Clear Ampoule" },
    ],
    flags: { isFeatured: true, isTrending: true, isNewArrival: true },
    rating: { average: 4.8, count: 96 },
    unitsSold: 350,
  },
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

async function seed() {
  await connectDB();
  console.log("✓ Connected to MongoDB");

  // Clear existing catalog collections to start fresh
  await Product.deleteMany({});
  await Brand.deleteMany({});
  await Category.deleteMany({});
  console.log("✓ Cleared existing products, brands, and categories from database");

  // Categories
  const categoryMap = new Map<string, string>();
  for (const [i, def] of categoryDefs.entries()) {
    const doc = await Category.findOneAndUpdate(
      { slug: def.slug },
      {
        $set: {
          name: def.name,
          slug: def.slug,
          description: def.description,
          icon: def.icon.displayName ?? def.slug,
          order: i,
          isActive: true,
          isFeatured: true,
        },
      },
      { upsert: true, new: true },
    );
    categoryMap.set(def.slug, String(doc._id));
  }
  console.log(`✓ Seeded ${categoryMap.size} categories`);

  // Brands
  const brandMap = new Map<string, string>();
  for (const def of brandDefs) {
    const doc = await Brand.findOneAndUpdate(
      { name: def.name },
      {
        $set: {
          name: def.name,
          description: def.description,
          country: "South Korea",
          isActive: true,
          isFeatured: true,
        },
      },
      { upsert: true, new: true },
    );
    brandMap.set(def.name, String(doc._id));
  }
  console.log(`✓ Seeded ${brandMap.size} brands`);

  // Products
  let count = 0;
  for (const def of productDefs) {
    const brandId = brandMap.get(def.brand);
    const categoryId = categoryMap.get(def.category);
    if (!brandId || !categoryId) {
      console.warn(`! Skipping ${def.name} — missing brand/category`);
      continue;
    }
    await Product.findOneAndUpdate(
      { sku: def.sku },
      {
        $set: {
          name: def.name,
          slug: slugify(def.name),
          sku: def.sku,
          brand: brandId,
          category: categoryId,
          description: def.description,
          shortDescription: def.shortDescription,
          images: def.images,
          price: def.price,
          mrp: def.mrp,
          stock: def.stock,
          ingredients: def.ingredients,
          howToUse: def.howToUse,
          benefits: def.benefits,
          skinTypes: def.skinTypes,
          volume: def.volume,
          tags: [def.brand.toLowerCase(), def.category],
          ratingAverage: def.rating?.average ?? 0,
          ratingCount: def.rating?.count ?? 0,
          unitsSold: def.unitsSold ?? 0,
          isFeatured: def.flags?.isFeatured ?? false,
          isBestSeller: def.flags?.isBestSeller ?? false,
          isTrending: def.flags?.isTrending ?? false,
          isNewArrival: def.flags?.isNewArrival ?? false,
          isPublished: true,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    count += 1;
  }
  console.log(`✓ Seeded ${count} products`);

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@lanbel.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`✓ Admin already exists (${adminEmail})`);
  } else {
    await User.create({
      name: "Lanbelle Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      provider: "credentials",
      isEmailVerified: true,
    });
    console.log(`✓ Created admin user (${adminEmail})`);
  }

  console.log("\n🌱 Seed complete.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
