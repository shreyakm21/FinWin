import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // --- Roles ---
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "Customer" },
    update: {},
    create: { name: "Customer" },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: "Cashier" },
    update: {},
    create: { name: "Cashier" },
  });

  // --- Users ---
  const john = await prisma.user.upsert({
    where: { email: "john@bank.com" },
    update: {},
    create: {
      email: "john@bank.com",
      password: "hashed123",
      fullName: "John Doe",
      roleId: customerRole.roleId,
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@bank.com" },
    update: {},
    create: {
      email: "alice@bank.com",
      password: "hashed456",
      fullName: "Alice Smith",
      roleId: customerRole.roleId,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@bank.com" },
    update: {},
    create: {
      email: "admin@bank.com",
      password: "secureadmin",
      fullName: "Bank Admin",
      roleId: adminRole.roleId,
    },
  });

  // --- Accounts ---
  const johnSavings = await prisma.account.upsert({
    where: { accountNumber: "ACC1001" },
    update: {},
    create: {
      accountNumber: "ACC1001",
      type: "Savings",
      balance: 5000,
      userId: john.userId,
    },
  });

  const johnCurrent = await prisma.account.upsert({
    where: { accountNumber: "ACC1002" },
    update: {},
    create: {
      accountNumber: "ACC1002",
      type: "Current",
      balance: 2000,
      userId: john.userId,
    },
  });

  const aliceSavings = await prisma.account.upsert({
    where: { accountNumber: "ACC2001" },
    update: {},
    create: {
      accountNumber: "ACC2001",
      type: "Savings",
      balance: 8000,
      userId: alice.userId,
    },
  });

  // --- Transactions (always add new) ---
  await prisma.transaction.createMany({
    data: [
      { accountId: johnSavings.accountId, amount: 1000, type: "credit", mode: "cash" },
      { accountId: johnSavings.accountId, amount: 500, type: "debit", mode: "UPI" },
      { accountId: aliceSavings.accountId, amount: 2000, type: "credit", mode: "cheque" },
      { accountId: johnCurrent.accountId, amount: 1000, type: "credit", mode: "card" },
    ],
    skipDuplicates: true, // 👈 avoids duplicate inserts if same record exists
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
