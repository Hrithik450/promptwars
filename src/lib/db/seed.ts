import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { db } from "./index";
import { bankAccounts, bankTransactions } from "../drizzle/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL configured. Skipping database seeding.");
    return;
  }

  console.log("Seeding BankSim initial accounts and transactions...");

  // Upsert initial bank accounts
  const accountsToSeed = [
    {
      accountType: "checking" as const,
      accountNumber: "****4821",
      balance: "5000.00",
      currency: "USD",
      holderName: "Alex Mercer",
    },
    {
      accountType: "savings" as const,
      accountNumber: "****9912",
      balance: "12000.00",
      currency: "USD",
      holderName: "Alex Mercer",
    },
    {
      accountType: "credit" as const,
      accountNumber: "****1044",
      balance: "-450.00",
      currency: "USD",
      holderName: "Alex Mercer",
    },
  ];

  for (const acct of accountsToSeed) {
    await db
      .insert(bankAccounts)
      .values(acct)
      .onConflictDoUpdate({
        target: bankAccounts.accountType,
        set: {
          balance: acct.balance,
          updatedAt: new Date(),
        },
      });
  }

  // Check existing transactions
  const existingTx = await db.select({ count: sql<number>`count(*)` }).from(bankTransactions);
  const txCount = Number(existingTx[0]?.count || 0);

  if (txCount === 0) {
    await db.insert(bankTransactions).values([
      {
        accountType: "checking",
        recipient: "Whole Foods Market",
        amount: "84.50",
        currency: "USD",
        memo: "Groceries",
      },
      {
        accountType: "checking",
        recipient: "Spotify USA",
        amount: "11.99",
        currency: "USD",
        memo: "Monthly Subscription",
      },
      {
        accountType: "checking",
        recipient: "bob",
        amount: "120.00",
        currency: "USD",
        memo: "Concert tickets",
      },
      {
        accountType: "savings",
        recipient: "Payroll Deposit",
        amount: "3200.00",
        currency: "USD",
        memo: "Bi-weekly direct deposit",
      },
      {
        accountType: "credit",
        recipient: "Blue Bottle Coffee",
        amount: "6.75",
        currency: "USD",
        memo: "Coffee",
      },
    ]);
  }

  console.log("✓ Database seeding complete.");
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
