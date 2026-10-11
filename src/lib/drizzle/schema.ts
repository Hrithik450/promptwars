import { pgTable, text, timestamp, uuid, numeric, jsonb } from "drizzle-orm/pg-core";

/**
 * 1. FIREWALL AUDIT LOGS TABLE
 * Stores full pipeline results for every request: verdicts, risk scores,
 * threat categories, and layer breakdowns. Powers /stats and the UI log.
 */
export const firewallLogs = pgTable("firewall_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: text("request_id").notNull(),
  sessionId: text("session_id"),
  userInput: text("user_input").notNull(),
  sanitizedInput: text("sanitized_input").notNull(),
  verdict: text("verdict").notNull().$type<"APPROVED" | "BLOCKED">(),
  riskScore: numeric("risk_score", { precision: 4, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull().$type<"NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL">(),
  threatCategory: text("threat_category").notNull(),
  explanation: text("explanation").notNull(),
  parsedIntent: jsonb("parsed_intent"),
  layerDetails: jsonb("layer_details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. BANK ACCOUNTS TABLE
 * Manages balances for mock accounts: checking, savings, credit.
 */
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountType: text("account_type").notNull().unique().$type<"checking" | "savings" | "credit">(),
  accountNumber: text("account_number").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  holderName: text("holder_name").default("Alex Mercer").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 3. BANK TRANSACTIONS TABLE
 * Ledger storing financial transactions executed ONLY when verdict is APPROVED.
 */
export const bankTransactions = pgTable("bank_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountType: text("account_type").notNull().$type<"checking" | "savings" | "credit">(),
  recipient: text("recipient").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  memo: text("memo"),
  status: text("status").default("COMPLETED").notNull().$type<"COMPLETED" | "PENDING" | "REJECTED">(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
