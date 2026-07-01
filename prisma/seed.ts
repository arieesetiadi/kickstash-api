import { seedCategories } from "./seeders/category.seeder";
import { prisma } from "@/lib/prisma";

async function main(): Promise<void> {
  console.log("🚀 Starting database seeding...\n");

  await seedCategories(prisma);

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
