# Password Reset Feature

## Overview

Fully functional password reset system with email-based token verification.

## Features

- Secure crypto token generation (32 bytes, SHA-256 hashed)
- 1-hour token expiration
- Professional HTML email templates
- Mobile-responsive design
- Full audit logging

## User Flow

1. User clicks "Forgot password?" on login page
2. Enters email address
3. Receives email with reset link
4. Clicks link to reset password page
5. Enters new password
6. Redirected to login

## Email Configuration

### Quick Setup (Gmail)

1. Enable 2-Step Verification in Google Account
2. Generate App Password: Security > 2-Step Verification > App passwords
3. Update `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your.email@gmail.com
FRONTEND_URL=http://localhost:5173
```

### Production Setup (SendGrid)

1. Sign up at https://sendgrid.com
2. Create API Key with Mail Send permission
3. Update environment:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Other Providers

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

**Microsoft 365:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
```

## Testing

```bash
# Request reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Reset password (use token from email)
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"token-from-email","newPassword":"newpass123"}'
```

## Security Features

- Tokens hashed in database (SHA-256)
- 1-hour expiration
- Single-use tokens
- Generic responses (no email enumeration)
- Full audit trail
- bcrypt password hashing

## Troubleshooting

**Email not sending:**
- Verify SMTP credentials
- Check firewall settings
- For Gmail, ensure App Password (not regular password)
- Check backend logs for errors

**Email not received:**
- Check spam/junk folder
- Verify email exists in database
- Check token was created in database

**Reset link not working:**
- Token expired (> 1 hour old)
- Token already used
- Check FRONTEND_URL matches actual URL

## Files

- `backend/src/services/emailService.ts` - Email sending
- `backend/src/routes/auth.ts` - Password reset endpoints
- `frontend/src/components/Auth/ForgotPassword.tsx` - Request reset
- `frontend/src/components/Auth/ResetPassword.tsx` - Reset password page

## API Endpoints

### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with that email, you will receive password reset instructions."
}
```

### POST /api/auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "newpass123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```
