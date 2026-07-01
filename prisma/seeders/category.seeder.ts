import { PrismaClient } from "@/generated/prisma/client";

const categories = [
  { name: "Sneakers", slug: "sneakers" },
  { name: "Running", slug: "running" },
  { name: "Basketball", slug: "basketball" },
  { name: "Lifestyle", slug: "lifestyle" },
  { name: "Tennis", slug: "tennis" },
];

export async function seedCategories(prisma: PrismaClient): Promise<void> {
  console.log("🌱 Seeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`✅ Seeded ${categories.length} categories.`);
}
