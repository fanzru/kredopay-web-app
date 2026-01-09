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

// Deposit Requests Table
export const depositRequests = pgTable(
  "deposit_requests",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    requestedAmount: decimal("requested_amount").notNull(), // Amount user requested (e.g., 1000)
    exactAmount: decimal("exact_amount").notNull(), // Exact amount with unique decimal (e.g., 1000.431)
    currency: text("currency").default("USDC"),
    uniqueCode: text("unique_code").notNull(),
    walletAddress: text("wallet_address"),
    status: text("status").default("pending"), // pending, completed, failed, expired
    cardId: text("card_id").references(() => virtualCards.id, {
      onDelete: "set null",
    }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
    completedAt: bigint("completed_at", { mode: "number" }),
    transactionHash: text("transaction_hash"),
  },
  (table) => ({
    userEmailIdx: index("idx_deposits_user").on(table.userEmail),
    uniqueCodeIdx: index("idx_deposits_code").on(table.uniqueCode),
    statusIdx: index("idx_deposits_status").on(table.status),
  })
);

// Internal Top-Up Requests Table
export const internalTopupRequests = pgTable(
  "internal_topup_requests",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull(),
    requestedAmount: decimal("requested_amount").notNull(), // User's requested amount (e.g., 20.00)
    exactAmount: decimal("exact_amount").notNull(), // Amount with unique 4-digit decimal (e.g., 20.1024)
    decimalCode: text("decimal_code").notNull(), // The 4-digit unique code (e.g., "1024")
    currency: text("currency").default("USDC"),
    userWalletAddress: text("user_wallet_address").notNull(), // User's wallet (for reference)
    solanaWalletAddress: text("solana_wallet_address").notNull(), // Kredo's Solana wallet
    topupMethod: text("topup_method").notNull(), // 'wallet_address' or 'moonpay'
    status: text("status").default("pending"), // pending, approved, rejected, completed
    cardId: text("card_id").references(() => virtualCards.id, {
      onDelete: "set null",
    }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    approvedAt: bigint("approved_at", { mode: "number" }),
    approvedBy: text("approved_by"),
    completedAt: bigint("completed_at", { mode: "number" }),
    rejectedAt: bigint("rejected_at", { mode: "number" }),
    rejectionReason: text("rejection_reason"),
    adminNotes: text("admin_notes"),
    transactionHash: text("transaction_hash"), // Solana transaction hash
    moonpayTransactionId: text("moonpay_transaction_id"),
  },
  (table) => ({
    userEmailIdx: index("idx_internal_topup_user").on(table.userEmail),
    statusIdx: index("idx_internal_topup_status").on(table.status),
    methodIdx: index("idx_internal_topup_method").on(table.topupMethod),
    exactAmountIdx: index("idx_internal_topup_exact_amount").on(
      table.exactAmount
    ),
    decimalCodeIdx: index("idx_internal_topup_decimal_code").on(
      table.decimalCode
    ),
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

export type DepositRequest = typeof depositRequests.$inferSelect;
export type NewDepositRequest = typeof depositRequests.$inferInsert;

export type InternalTopupRequest = typeof internalTopupRequests.$inferSelect;
export type NewInternalTopupRequest = typeof internalTopupRequests.$inferInsert;

// KYC Verifications Table
export const kycVerifications = pgTable(
  "kyc_verifications",
  {
    id: text("id").primaryKey(),
    userEmail: text("user_email").notNull().unique(),
    fullName: text("full_name").notNull(),
    idNumber: text("id_number").notNull(), // ID Card / Passport number
    dateOfBirth: text("date_of_birth"), // Optional: YYYY-MM-DD
    nationality: text("nationality"), // Optional
    selfiePath: text("selfie_path").notNull(), // Cloudflare R2 full path
    idCardPath: text("id_card_path").notNull(), // Cloudflare R2 full path
    status: text("status").default("pending"), // pending, verified, rejected
    submittedAt: bigint("submitted_at", { mode: "number" }).notNull(),
    verifiedAt: bigint("verified_at", { mode: "number" }),
    verifiedBy: text("verified_by"), // Admin email who verified
    rejectedAt: bigint("rejected_at", { mode: "number" }),
    rejectionReason: text("rejection_reason"),
    adminNotes: text("admin_notes"),
  },
  (table) => ({
    userEmailIdx: index("idx_kyc_user").on(table.userEmail),
    statusIdx: index("idx_kyc_status").on(table.status),
  })
);

export type KycVerification = typeof kycVerifications.$inferSelect;
export type NewKycVerification = typeof kycVerifications.$inferInsert;
