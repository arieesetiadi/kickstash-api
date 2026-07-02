import { PrismaClient } from "@/generated/prisma/client";
import { products } from "./data/products";

const SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
const COLORS = ["Black", "White", "Red", "Navy", "Grey", "Green"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomUnique<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function skuFor(productSlug: string, size: string, color: string): string {
  const sizeCode = size.replace("US ", "");
  const colorCode = color.slice(0, 3).toUpperCase();
  return `${productSlug}-${sizeCode}-${colorCode}`.toUpperCase();
}

export async function seedProducts(prisma: PrismaClient): Promise<void> {
  console.log("🌱 Seeding products and variants...");

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const brands = await prisma.brand.findMany();
  const brandBySlug = new Map(brands.map((b) => [b.slug, b.id]));
  const brandNameBySlug = new Map(brands.map((b) => [b.slug, b.name]));

  let variantCount = 0;

  for (const product of products) {
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (!categoryId) {
      console.warn(
        `⚠️ Skipping "${product.name}" — category "${product.categorySlug}" not found. Seed categories first.`,
      );
      continue;
    }

    const brandId = brandBySlug.get(product.brandId);
    const brandName = brandNameBySlug.get(product.brandId) || "Unknown Brand";

    if (!brandId) {
      console.warn(
        `⚠️ Skipping "${product.name}" — brand "${product.brandId}" not found. Seed brands first.`,
      );
      continue;
    }

    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: `${brandName} ${product.name} — a great pick for everyday wear.`,
        brandId: brandId,
        basePrice: product.basePrice,
        images: [],
        isActive: true,
        categoryId,
      },
    });

    // Random amount of variants, capped at 3
    const variantAmount = randomInt(1, 3);
    const sizes = pickRandomUnique(SIZES, variantAmount);
    const colors = pickRandomUnique(COLORS, variantAmount);

    for (let i = 0; i < variantAmount; i++) {
      const size = sizes[i];
      const color = colors[i];
      const sku = skuFor(product.slug, size, color);

      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          size,
          color,
          sku,
          stock: randomInt(0, 50),
          productId: createdProduct.id,
        },
      });

      variantCount++;
    }
  }

  console.log(
    `✅ Seeded ${products.length} products with ${variantCount} variants.`,
  );
}
