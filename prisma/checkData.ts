import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("📊 Checking Data...");

  const users = await prisma.user.findMany({
    include: {
      role: true,
      accounts: {
        include: { transactions: true },
      },
    },
  });

  console.dir(users, { depth: null });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());