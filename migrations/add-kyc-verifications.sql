-- Migration: Add KYC Verifications Table
-- Description: Create table for storing user KYC (Know Your Customer) verification data
-- Date: 2026-01-09

-- Create kyc_verifications table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  date_of_birth TEXT,
  nationality TEXT,
  selfie_path TEXT NOT NULL,
  id_card_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at BIGINT NOT NULL,
  verified_at BIGINT,
  verified_by TEXT,
  rejected_at BIGINT,
  rejection_reason TEXT,
  admin_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_email);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);

-- Add comments
COMMENT ON TABLE kyc_verifications IS 'Stores user KYC verification data including identity documents';
COMMENT ON COLUMN kyc_verifications.id IS 'Unique KYC verification ID (format: KYC-{timestamp}-{random})';
COMMENT ON COLUMN kyc_verifications.user_email IS 'User email (unique, one KYC per user)';
COMMENT ON COLUMN kyc_verifications.full_name IS 'Full name as shown on ID';
COMMENT ON COLUMN kyc_verifications.id_number IS 'ID card or passport number';
COMMENT ON COLUMN kyc_verifications.selfie_path IS 'Cloudflare R2 URL for selfie photo';
COMMENT ON COLUMN kyc_verifications.id_card_path IS 'Cloudflare R2 URL for ID card photo';
COMMENT ON COLUMN kyc_verifications.status IS 'Verification status: pending, verified, rejected';
COMMENT ON COLUMN kyc_verifications.submitted_at IS 'Timestamp when KYC was submitted';
COMMENT ON COLUMN kyc_verifications.verified_at IS 'Timestamp when KYC was verified';
COMMENT ON COLUMN kyc_verifications.verified_by IS 'Admin email who verified the KYC';
COMMENT ON COLUMN kyc_verifications.rejected_at IS 'Timestamp when KYC was rejected';
COMMENT ON COLUMN kyc_verifications.rejection_reason IS 'Reason for rejection (if rejected)';
COMMENT ON COLUMN kyc_verifications.admin_notes IS 'Internal admin notes';
