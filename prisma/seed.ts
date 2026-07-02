import { seedCategories } from "./seeders/category.seeder";
import { prisma } from "@/lib/prisma";
import { seedProducts } from "./seeders/product.seeder";
import { seedBrands } from "./seeders/brand.seeder";

async function main(): Promise<void> {
  console.log("🚀 Starting database seeding...\n");

  await seedCategories(prisma);
  await seedBrands(prisma);
  await seedProducts(prisma);

  console.log("\n🎉 Database seeding completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
