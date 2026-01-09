# KYC (Know Your Customer) Implementation

## Overview
Implementasi KYC untuk aktivasi virtual card dengan upload selfie dan ID card ke Cloudflare R2.

## Features
1. **KYC Submission Form**
   - Personal information (Full Name, ID Number, DOB, Nationality)
   - Selfie photo capture/upload
   - ID Card photo capture/upload
   - Camera integration untuk mobile
   
2. **Status Tracking**
   - `not_submitted`: Belum submit KYC
   - `pending`: Sedang dalam proses verifikasi (ETA 10-14 hari)
   - `verified`: KYC sudah diverifikasi
   - `rejected`: KYC ditolak (dengan alasan)

3. **Image Storage**
   - Upload ke Cloudflare R2
   - Path format: `kyc/{userEmail}/selfie-{timestamp}.jpg`
   - Full URL disimpan di database

## Database Schema

### Table: `kyc_verifications`
```sql
CREATE TABLE kyc_verifications (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  date_of_birth TEXT,
  nationality TEXT,
  selfie_path TEXT NOT NULL,  -- Cloudflare R2 URL
  id_card_path TEXT NOT NULL, -- Cloudflare R2 URL
  status TEXT DEFAULT 'pending', -- pending | verified | rejected
  submitted_at BIGINT NOT NULL,
  verified_at BIGINT,
  verified_by TEXT,
  rejected_at BIGINT,
  rejection_reason TEXT,
  admin_notes TEXT
);
```

## API Endpoints

### POST `/api/kyc/submit`
Submit KYC verification dengan upload images.

**Request:** `multipart/form-data`
```
fullName: string
idNumber: string
dateOfBirth: string (optional)
nationality: string (optional)
selfie: File
idCard: File
```

**Response:**
```json
{
  "success": true,
  "message": "KYC submitted successfully",
  "kycId": "KYC-1234567890-abc123"
}
```

### GET `/api/kyc/status`
Get KYC status untuk current user.

**Response:**
```json
{
  "status": "pending",
  "fullName": "John Doe",
  "idNumber": "1234567890",
  "submittedAt": 1234567890000,
  "verifiedAt": null,
  "rejectedAt": null,
  "rejectionReason": null
}
```

## Environment Variables

Add to `.env.local`:
```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=kredopay-kyc
R2_PUBLIC_URL=https://your-r2-bucket.r2.dev
```

## UI Components

### 1. KYC Banner (Overview Page)
- Muncul di `/dashboard` jika user belum KYC
- CTA button ke `/dashboard/identity`

### 2. Identity Page (`/dashboard/identity`)
- Form untuk submit KYC
- Camera capture untuk selfie & ID card
- File upload alternatif
- Status display (pending/verified/rejected)

## User Flow

1. User membuat virtual card
2. Melihat banner "Activate Your Card with KYC"
3. Klik "Complete KYC Verification"
4. Redirect ke `/dashboard/identity`
5. Isi form personal info
6. Upload/capture selfie
7. Upload/capture ID card
8. Submit
9. Status berubah menjadi "pending"
10. Admin verify (manual) dalam 10-14 hari
11. Status berubah menjadi "verified" atau "rejected"

## Admin Verification (Future)

Untuk admin panel, buat endpoint:
- `GET /api/admin/kyc/pending` - List semua pending KYC
- `POST /api/admin/kyc/verify` - Approve KYC
- `POST /api/admin/kyc/reject` - Reject KYC dengan reason

## Security Notes

1. **Authentication**: Semua endpoint require user login (check cookie)
2. **File Validation**: Validate file type (image only)
3. **Rate Limiting**: Implement rate limit untuk prevent abuse
4. **Data Privacy**: Image URLs hanya accessible by authorized users
5. **Unique Submission**: User hanya bisa submit KYC 1x (check existing)

## Testing Checklist

- [ ] Camera permission works on mobile
- [ ] File upload works
- [ ] Form validation works
- [ ] R2 upload successful
- [ ] Database insert successful
- [ ] Status fetch works
- [ ] Banner shows/hides correctly
- [ ] Responsive design works
- [ ] Error handling works

## Migration

Run migration untuk create table:
```bash
bun run db:push
```

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.x.x"
}
```
