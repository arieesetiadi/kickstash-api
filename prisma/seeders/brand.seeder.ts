import { PrismaClient } from "@/generated/prisma/client";

const brands = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Asics", slug: "asics" },
  { name: "New Balance", slug: "new-balance" },
  { name: "Saucony", slug: "saucony" },
  { name: "Puma", slug: "puma" },
  { name: "Under Armour", slug: "under-armour" },
  { name: "Vans", slug: "vans" },
  { name: "Converse", slug: "converse" },
];

export async function seedBrands(prisma: PrismaClient): Promise<void> {
  console.log("🌱 Seeding brands...");

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }

  console.log(`✅ Seeded ${brands.length} brands.`);
}
