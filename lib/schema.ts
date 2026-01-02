import {
  pgTable,
  text,
  decimal,
  bigint,
  boolean,
  bigserial,
  index,
} from "drizzle-orm/pg-core";

// Virtual Cards Table
export const virtualCards = pgTable(
  "virtual_cards",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    name: text("name").notNull(),
    cardNumber: text("card_number").notNull(),
    expiryDate: text("expiry_date").notNull(),
    cvv: text("cvv").notNull(),
    balance: decimal("balance").default("0"),
    currency: text("currency").default("USDC"),
    status: text("status").default("active"),
    spendingLimit: decimal("spending_limit"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    lastUsed: bigint("last_used", { mode: "number" }),
  },
  (table) => ({
    userEmailIdx: index("idx_cards_user").on(table.userEmail),
  })
);

// Transactions Table
export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => virtualCards.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    type: text("type").notNull(),
    amount: decimal("amount").notNull(),
    merchant: text("merchant").notNull(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    status: text("status").default("completed"),
  },
  (table) => ({
    cardIdIdx: index("idx_transactions_card").on(table.cardId),
    userEmailIdx: index("idx_transactions_user").on(table.userEmail),
  })
);

// Spending Intents Table
export const spendingIntents = pgTable(
  "spending_intents",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    amount: decimal("amount").notNull(),
    currency: text("currency").default("USDC"),
    status: text("status").default("pending_proof"),
    merchant: text("merchant"),
    category: text("category"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }),
    proofHash: text("proof_hash"),
    executedAt: bigint("executed_at", { mode: "number" }),
  },
  (table) => ({
    userEmailIdx: index("idx_intents_user").on(table.userEmail),
    statusIdx: index("idx_intents_status").on(table.status),
  })
);

// OTP Codes Table
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    email: text("email").notNull(),
    otpCode: text("otp_code").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
    used: boolean("used").default(false),
  },
  (table) => ({
    emailIdx: index("idx_otp_email").on(table.email),
    expiresIdx: index("idx_otp_expires").on(table.expiresAt),
  })
);

// Type exports for TypeScript
export type VirtualCard = typeof virtualCards.$inferSelect;
export type NewVirtualCard = typeof virtualCards.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type SpendingIntent = typeof spendingIntents.$inferSelect;
export type NewSpendingIntent = typeof spendingIntents.$inferInsert;

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
