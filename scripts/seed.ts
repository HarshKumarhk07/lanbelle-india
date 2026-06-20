/**
 * Database seed script.
 * Usage: `npm run seed`  (requires MONGODB_URI in .env.local)
 *
 * Idempotent — upserts categories, brands and products by slug, and an admin
 * user by email. Safe to run repeatedly.
 */
import { connectDB, mongoose } from "@/lib/db";
import { Category } from "@/models/category.model";
import { Brand } from "@/models/brand.model";
import { Product } from "@/models/product.model";
import { User } from "@/models/user.model";
import { categories as categoryDefs } from "@/lib/site-config";

const img = (seed: string) => ({
  url: `https://picsum.photos/seed/${seed}/800/1000`,
  alt: seed.replace(/-/g, " "),
});

const brandDefs = [
  { name: "COSRX", description: "Minimalist, results-driven K-beauty." },
  { name: "Beauty of Joseon", description: "Hanbang skincare, modern formulas." },
  { name: "LANEIGE", description: "Hydration experts from Korea." },
  { name: "Innisfree", description: "Natural ingredients from Jeju Island." },
  { name: "Dr.Jart+", description: "Derma-science skincare." },
  { name: "Mediheal", description: "Korea's #1 sheet mask brand." },
  { name: "SKIN1004", description: "Centella asiatica specialists." },
  { name: "Anua", description: "Heartleaf-powered gentle care." },
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
  seedKey: string;
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
    name: "Snail Mucin 96% Power Repair Essence",
    sku: "CRX-SNAIL-100",
    brand: "COSRX",
    category: "serums",
    price: 1299,
    mrp: 1799,
    stock: 42,
    shortDescription: "96% snail secretion filtrate for deep repair and glow.",
    description:
      "A lightweight essence powered by 96% snail secretion filtrate that repairs the skin barrier, fades blemishes and delivers lasting, dewy hydration. A K-beauty cult classic for visibly smoother, plumper skin.",
    ingredients: ["Snail Secretion Filtrate", "Sodium Hyaluronate", "Panthenol", "Allantoin"],
    howToUse: ["Cleanse and tone.", "Apply 1–2 pumps to the face.", "Pat in gently; follow with moisturizer."],
    benefits: ["Repairs skin barrier", "Boosts hydration", "Fades dark spots"],
    skinTypes: ["all", "dry", "sensitive"],
    volume: "100ml",
    seedKey: "lanbel-serum-1",
    flags: { isFeatured: true, isBestSeller: true },
    rating: { average: 4.9, count: 2841 },
    unitsSold: 9800,
  },
  {
    name: "Rice Glow Deep Cleansing Foam",
    sku: "BOJ-RICE-150",
    brand: "Beauty of Joseon",
    category: "cleansers",
    price: 899,
    mrp: 1199,
    stock: 60,
    shortDescription: "Rice bran water cleanser that softens and brightens.",
    description:
      "A creamy, low-pH foaming cleanser with rice bran water that gently removes impurities while preserving moisture, leaving skin soft, calm and luminous.",
    ingredients: ["Rice Bran Water", "Glycerin", "Niacinamide", "Coconut-derived Surfactants"],
    howToUse: ["Massage onto damp skin.", "Rinse with lukewarm water.", "Use morning and night."],
    benefits: ["Gentle deep cleanse", "Brightening", "Non-stripping"],
    skinTypes: ["all", "normal", "combination"],
    volume: "150ml",
    seedKey: "lanbel-cleanser-1",
    flags: { isTrending: true },
    rating: { average: 4.8, count: 1577 },
    unitsSold: 6400,
  },
  {
    name: "Relief Sun: Rice + Probiotics SPF50+ PA++++",
    sku: "BOJ-SUN-50",
    brand: "Beauty of Joseon",
    category: "sunscreens",
    price: 1099,
    mrp: 1399,
    stock: 25,
    shortDescription: "Organic sunscreen with no white cast.",
    description:
      "A featherlight chemical sunscreen with rice extract and probiotics that protects, hydrates and blends seamlessly into all skin tones — zero white cast, zero stickiness.",
    ingredients: ["Rice Extract", "Probiotics (Lactobacillus)", "Niacinamide"],
    howToUse: ["Apply as the last step of your AM routine.", "Reapply every 2 hours of sun exposure."],
    benefits: ["Broad-spectrum SPF50+", "No white cast", "Hydrating"],
    skinTypes: ["all"],
    volume: "50ml",
    seedKey: "lanbel-sun-1",
    flags: { isBestSeller: true },
    rating: { average: 4.9, count: 3920 },
    unitsSold: 14200,
  },
  {
    name: "Green Tea Seed Hydrating Toner",
    sku: "INF-GT-200",
    brand: "Innisfree",
    category: "toners",
    price: 999,
    mrp: 1299,
    stock: 38,
    shortDescription: "Jeju green tea toner that balances and hydrates.",
    description:
      "An antioxidant-rich toner with Jeju green tea that hydrates, balances pH and preps skin to absorb the rest of your routine.",
    ingredients: ["Green Tea Extract", "Green Tea Seed Oil", "Panthenol"],
    howToUse: ["After cleansing, sweep over face with a cotton pad or hands.", "Follow with serum."],
    benefits: ["Antioxidant protection", "Balances skin", "Lightweight hydration"],
    skinTypes: ["all", "oily", "combination"],
    volume: "200ml",
    seedKey: "lanbel-toner-1",
    flags: { isNewArrival: true },
    rating: { average: 4.7, count: 1043 },
    unitsSold: 3100,
  },
  {
    name: "Ceramidin Barrier Cream",
    sku: "DRJ-CERA-50",
    brand: "Dr.Jart+",
    category: "moisturizers",
    price: 1599,
    mrp: 2099,
    stock: 19,
    shortDescription: "5-Cera complex cream for a resilient barrier.",
    description:
      "A rich yet fast-absorbing moisturizer with a 5-Cera complex that strengthens the skin barrier and locks in moisture for up to 100 hours.",
    ingredients: ["Ceramide Complex", "Panthenol", "Shea Butter", "Glycerin"],
    howToUse: ["Apply to clean skin as the final step.", "Use AM and PM."],
    benefits: ["Long-lasting moisture", "Strengthens barrier", "Soothes dryness"],
    skinTypes: ["dry", "sensitive", "normal"],
    volume: "50ml",
    seedKey: "lanbel-moist-1",
    flags: { isFeatured: true },
    rating: { average: 4.8, count: 876 },
    unitsSold: 2700,
  },
  {
    name: "Lip Sleeping Mask — Berry",
    sku: "LAN-LIP-20",
    brand: "LANEIGE",
    category: "lip-care",
    price: 1349,
    mrp: 1699,
    stock: 7,
    shortDescription: "Overnight lip mask for soft, plump lips by morning.",
    description:
      "An overnight lip treatment with berry extract and Moisture Wrap™ technology that nourishes and exfoliates while you sleep for irresistibly soft lips.",
    ingredients: ["Berry Mix Complex", "Vitamin C", "Shea Butter", "Murumuru Seed Butter"],
    howToUse: ["Apply a generous layer before bed.", "Leave on overnight; wipe off in the morning."],
    benefits: ["Deep overnight nourishment", "Gentle exfoliation", "Softens lips"],
    skinTypes: ["all"],
    volume: "20g",
    seedKey: "lanbel-lip-1",
    flags: { isBestSeller: true, isTrending: true },
    rating: { average: 4.9, count: 5120 },
    unitsSold: 18900,
  },
  {
    name: "Centella Soothing Sheet Mask (10 Pack)",
    sku: "MED-CICA-10",
    brand: "Mediheal",
    category: "face-masks",
    price: 1199,
    mrp: 1599,
    stock: 54,
    shortDescription: "Calming centella sheet masks for stressed skin.",
    description:
      "Soothing tencel sheet masks drenched in centella asiatica essence to calm redness, reduce irritation and restore a healthy, hydrated glow.",
    ingredients: ["Centella Asiatica Extract", "Madecassoside", "Hyaluronic Acid"],
    howToUse: ["Apply mask to clean skin for 15–20 minutes.", "Pat in remaining essence."],
    benefits: ["Calms redness", "Intense hydration", "Soothes sensitivity"],
    skinTypes: ["sensitive", "all", "acne-prone"],
    volume: "10 sheets",
    seedKey: "lanbel-mask-1",
    flags: { isNewArrival: true },
    rating: { average: 4.6, count: 642 },
    unitsSold: 4200,
  },
  {
    name: "Madagascar Centella Ampoule",
    sku: "SK1-CENT-100",
    brand: "SKIN1004",
    category: "serums",
    price: 1149,
    mrp: 1499,
    stock: 33,
    shortDescription: "Single-ingredient centella ampoule for calm skin.",
    description:
      "A pure Madagascar centella asiatica ampoule that soothes, hydrates and supports a balanced, resilient complexion. Minimalist and fragrance-free.",
    ingredients: ["Centella Asiatica Extract (Madagascar)"],
    howToUse: ["Apply a few drops after toner.", "Pat in and follow with moisturizer."],
    benefits: ["Soothes irritation", "Lightweight hydration", "Barrier support"],
    skinTypes: ["sensitive", "acne-prone", "all"],
    volume: "100ml",
    seedKey: "lanbel-serum-2",
    flags: { isTrending: true },
    rating: { average: 4.8, count: 1320 },
    unitsSold: 5300,
  },
  {
    name: "Heartleaf 77% Soothing Toner",
    sku: "ANU-HEART-250",
    brand: "Anua",
    category: "toners",
    price: 1249,
    mrp: 1599,
    stock: 0,
    shortDescription: "Heartleaf toner that calms and refines pores.",
    description:
      "A gentle, fragrance-free toner with 77% heartleaf extract that calms redness, controls excess oil and refines the look of pores.",
    ingredients: ["Houttuynia Cordata (Heartleaf) Extract", "Panthenol", "Betaine"],
    howToUse: ["Apply after cleansing with hands or a cotton pad.", "Layer for extra hydration."],
    benefits: ["Calms redness", "Pore care", "Oil balance"],
    skinTypes: ["oily", "combination", "sensitive"],
    volume: "250ml",
    seedKey: "lanbel-toner-2",
    flags: { isBestSeller: true },
    rating: { average: 4.8, count: 2210 },
    unitsSold: 8700,
  },
  {
    name: "Advanced Snail 92 All-in-One Cream",
    sku: "CRX-SNAIL-CR",
    brand: "COSRX",
    category: "moisturizers",
    price: 1399,
    mrp: 1799,
    stock: 28,
    shortDescription: "92% snail mucin cream for elastic, dewy skin.",
    description:
      "A bouncy gel-cream with 92% snail mucin that intensely hydrates, improves elasticity and leaves a healthy, dewy finish without greasiness.",
    ingredients: ["Snail Secretion Filtrate", "Betaine", "Sodium Hyaluronate"],
    howToUse: ["Apply as the final step of your routine.", "Use AM and PM."],
    benefits: ["Improves elasticity", "Dewy hydration", "Non-greasy"],
    skinTypes: ["all", "dry", "combination"],
    volume: "100g",
    seedKey: "lanbel-moist-2",
    flags: { isFeatured: true },
    rating: { average: 4.7, count: 1890 },
    unitsSold: 6100,
  },
  {
    name: "Glow Deep Serum: Rice + Alpha Arbutin",
    sku: "BOJ-GLOW-30",
    brand: "Beauty of Joseon",
    category: "serums",
    price: 1199,
    mrp: 1499,
    stock: 47,
    shortDescription: "Brightening serum with rice and alpha arbutin.",
    description:
      "A radiance-boosting serum combining 30% rice extract and 2% niacinamide with alpha arbutin to brighten, even tone and add a luminous glow.",
    ingredients: ["Rice Extract", "Niacinamide", "Alpha Arbutin", "Hyaluronic Acid"],
    howToUse: ["Apply after toner, before moisturizer.", "Use AM and PM."],
    benefits: ["Brightens tone", "Evens complexion", "Adds glow"],
    skinTypes: ["all", "normal", "combination"],
    volume: "30ml",
    seedKey: "lanbel-serum-3",
    flags: { isNewArrival: true, isFeatured: true },
    rating: { average: 4.8, count: 1455 },
    unitsSold: 4900,
  },
  {
    name: "Perfect Repair Hair Treatment",
    sku: "MES-HAIR-180",
    brand: "Innisfree",
    category: "hair-care",
    price: 749,
    mrp: 999,
    stock: 31,
    shortDescription: "Deep repair treatment for damaged hair.",
    description:
      "An intensive treatment that repairs split ends and restores softness and shine to dry, damaged hair with camellia and argan oils.",
    ingredients: ["Camellia Oil", "Argan Oil", "Hydrolyzed Keratin"],
    howToUse: ["Apply to towel-dried hair, focusing on ends.", "Leave 3–5 minutes, rinse."],
    benefits: ["Repairs damage", "Smooths frizz", "Adds shine"],
    skinTypes: ["all"],
    volume: "180ml",
    seedKey: "lanbel-hair-1",
    flags: { isTrending: true },
    rating: { average: 4.7, count: 388 },
    unitsSold: 1800,
  },
];

async function seed() {
  await connectDB();
  console.log("✓ Connected to MongoDB");

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
          isFeatured: i < 4,
        },
      },
      { upsert: true, new: true },
    );
    categoryMap.set(def.slug, String(doc._id));
  }
  console.log(`✓ Seeded ${categoryMap.size} categories`);

  // Brands
  const brandMap = new Map<string, string>();
  for (const [i, def] of brandDefs.entries()) {
    const doc = await Brand.findOneAndUpdate(
      { name: def.name },
      {
        $set: {
          name: def.name,
          description: def.description,
          country: "South Korea",
          isActive: true,
          isFeatured: i < 4,
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
          sku: def.sku,
          brand: brandId,
          category: categoryId,
          description: def.description,
          shortDescription: def.shortDescription,
          images: [img(def.seedKey), img(`${def.seedKey}-2`)],
          price: def.price,
          mrp: def.mrp,
          stock: def.stock,
          ingredients: def.ingredients,
          howToUse: def.howToUse,
          benefits: def.benefits,
          skinTypes: def.skinTypes,
          volume: def.volume,
          tags: [def.brand, def.category],
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
      name: "Lanbel Admin",
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
