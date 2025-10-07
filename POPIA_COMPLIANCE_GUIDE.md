# POPIA Compliance Guide

**Document Version:** 1.0
**Last Updated:** 2025-10-07
**Prepared by:** Sheet Solved - Spreadsheets Solved

This guide explains how the Fleet Manager application complies with South Africa's Protection of Personal Information Act (POPIA), and what you need to do to ensure your deployment remains compliant.

## Table of Contents

1. [Overview](#overview)
2. [POPIA Requirements Summary](#popia-requirements-summary)
3. [Implemented Compliance Features](#implemented-compliance-features)
4. [Your Responsibilities](#your-responsibilities)
5. [Deployment Checklist](#deployment-checklist)
6. [Maintenance and Operations](#maintenance-and-operations)
7. [Incident Response](#incident-response)
8. [FAQ](#faq)

## Overview

The Fleet Manager application processes personal information including:
- User account details (names, emails, passwords)
- Driver information (names, phone numbers)
- Financial records (revenue, expenses, profit data)
- Activity logs (login times, data access, modifications)

Under POPIA, you (the organization deploying this software) are the **Responsible Party**, and Sheet Solved is the **Operator** (software provider). You are ultimately responsible for compliance.

## POPIA Requirements Summary

### 8 Conditions for Lawful Processing

| Condition | Requirement | Status |
|-----------|-------------|--------|
| 1. Accountability | Ensure compliance with POPIA conditions | ✅ Documented |
| 2. Processing Limitation | Lawful, reasonable, and transparent processing | ✅ Implemented |
| 3. Purpose Specification | Clear purpose for data collection | ✅ Privacy Policy |
| 4. Further Processing Limitation | Compatible with original purpose | ✅ Enforced |
| 5. Information Quality | Accurate and up-to-date data | ✅ Edit features |
| 6. Openness | Transparent about data practices | ✅ Privacy notices |
| 7. Security Safeguards | Appropriate technical measures | ✅ Encryption, audit logs |
| 8. Data Subject Participation | Rights to access, correct, delete | ✅ API endpoints |

## Implemented Compliance Features

### 1. Privacy Documentation

**Files Created:**
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) - Complete privacy policy
- [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) - Terms with POPIA references
- [DATA_BREACH_RESPONSE.md](DATA_BREACH_RESPONSE.md) - Incident response procedures

**What These Cover:**
- What personal information is collected
- Why it's collected (purpose)
- How long it's retained
- Who it's shared with
- Data subject rights
- Contact information

### 2. Consent Management

**Implementation:**
- [backend/src/models/UserConsent.ts](backend/src/models/UserConsent.ts) - Consent tracking database
- Consent captured during registration
- Consent version tracking
- Withdrawal mechanism
- Audit trail of all consent actions

**Consent Types:**
- Terms of Service acceptance
- Privacy Policy acceptance
- Data Processing consent
- Marketing consent (optional)

**How to View:**
```bash
# Users can view their consents at:
GET /api/data-subject/consents

# Users can withdraw consent:
POST /api/data-subject/withdraw-consent
Body: { "consentType": "marketing" }
```

### 3. Audit Logging

**Implementation:**
- [backend/src/models/AuditLog.ts](backend/src/models/AuditLog.ts) - Audit log database
- [backend/src/middleware/auditLogger.ts](backend/src/middleware/auditLogger.ts) - Logging middleware

**What's Logged:**
- All data access (read operations)
- All data modifications (create, update, delete)
- Authentication attempts (success and failure)
- Data exports
- Data subject requests
- IP addresses and timestamps

**Retention:**
- Audit logs automatically deleted after 2 years (TTL index)

**How to Query:**
```javascript
// Get audit logs for a specific user
AuditLog.find({ userId: userId }).sort({ timestamp: -1 });

// Get all login attempts
AuditLog.find({ action: 'login' });

// Get all data exports
AuditLog.find({ action: 'export' });
```

### 4. Data Subject Rights (POPIA Sections 23-25)

**Implementation:**
- [backend/src/routes/dataSubject.ts](backend/src/routes/dataSubject.ts) - Rights API endpoints
- [frontend/src/components/Privacy/PrivacySettings.tsx](frontend/src/components/Privacy/PrivacySettings.tsx) - User interface

**Available Rights:**

| Right | Endpoint | Description |
|-------|----------|-------------|
| Access (S23) | `GET /api/data-subject/my-data` | View all personal information |
| Portability | `GET /api/data-subject/export` | Download data as JSON |
| Correction (S24) | `POST /api/data-subject/request-correction` | Request data corrections |
| Deletion (S25) | `POST /api/data-subject/request-deletion` | Request account deletion |
| Objection | `POST /api/data-subject/object-processing` | Object to processing |
| Restriction | `POST /api/data-subject/restrict-processing` | Restrict processing |
| Consent Withdrawal | `POST /api/data-subject/withdraw-consent` | Withdraw consent |

**Response Times:**
- All requests acknowledged within 24 hours
- Completed within 30 days (POPIA requirement)

### 5. Data Retention and Minimization

**Implementation:**
- [backend/src/utils/dataRetention.ts](backend/src/utils/dataRetention.ts) - Automated cleanup

**Retention Periods:**

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Financial records | 5 years | SARS requirement |
| Audit logs | 2 years | Security monitoring |
| User accounts | Active + 2 years | Legal requirements |
| Consent records | 7 years | Proof of consent |
| Data subject requests | 5 years | Compliance documentation |

**Automated Cleanup:**
```bash
# Run manually:
cd backend
npm run data-retention-cleanup

# Or schedule with cron (recommended):
# Add to crontab (runs monthly at 2 AM):
0 2 1 * * cd /path/to/backend && npm run data-retention-cleanup
```

**Monitoring:**
```bash
# Check for overdue data:
npm run check-overdue-data

# Get retention statistics:
npm run data-retention-stats
```

### 6. Encryption and Security

**Implementation:**
- [backend/src/utils/encryption.ts](backend/src/utils/encryption.ts) - Encryption utilities

**Security Measures:**

1. **Passwords:**
   - Bcrypt hashing with salt (10 rounds)
   - Never stored in plain text
   - Never logged or transmitted

2. **Sensitive PII (Phone Numbers):**
   - AES-256-GCM encryption at rest
   - Requires ENCRYPTION_KEY in environment
   - Masked in UI (show last 4 digits only)

3. **Data in Transit:**
   - HTTPS/TLS encryption (configure in production)
   - Secure headers (Helmet middleware)

4. **Access Control:**
   - Role-based permissions (admin, manager, viewer)
   - JWT token authentication
   - 7-day token expiration

**Setup Encryption:**
```bash
# Generate encryption key:
cd backend
node -r esbuild-register src/utils/encryption.ts

# Add to .env:
ENCRYPTION_KEY=<generated-key>
```

### 7. Data Breach Response

**Implementation:**
- [DATA_BREACH_RESPONSE.md](DATA_BREACH_RESPONSE.md) - Complete procedures

**Key Requirements:**
1. **72-hour notification** to Information Regulator
2. **Immediate notification** to affected data subjects
3. Documentation of all breach details
4. Remediation and prevention measures

**Breach Response Team:**
- Information Officer: (Assign in your organization)
- Technical Lead: (Assign)
- Legal Advisor: (Assign)

**Contacts:**
- Information Regulator: 012 406 4818 / inforeg@justice.gov.za
- SAPS Cybercrime: 012 393 3727

## Your Responsibilities

### As the Responsible Party (POPIA Section 1)

You must:

1. **Appoint an Information Officer**
   - Required if you employ more than 1 person OR process personal information
   - Can be yourself or a designated employee
   - Contact details must be available to data subjects

2. **Register with Information Regulator**
   - Required if processing special personal information
   - Submit POPIA registration form
   - Website: https://inforegulator.org.za

3. **Conduct Privacy Impact Assessment (PIA)**
   - Assess risks to data subjects
   - Document processing activities
   - Review annually or when changes occur

4. **Provide Privacy Notices**
   - Display privacy policy prominently
   - Make available at point of data collection
   - Ensure staff and drivers are informed

5. **Obtain Valid Consent**
   - Explicit, voluntary, informed
   - Specific to purpose
   - Document consent records
   - Allow easy withdrawal

6. **Handle Data Subject Requests**
   - Respond within 30 days
   - Verify identity before releasing data
   - Keep records of all requests

7. **Report Data Breaches**
   - Notify Information Regulator within 72 hours
   - Notify affected individuals ASAP
   - Document incident and response

8. **Maintain Security**
   - Regular backups
   - Strong passwords
   - Software updates
   - Staff training

## Deployment Checklist

### Pre-Deployment

- [ ] Appoint Information Officer
- [ ] Complete Privacy Impact Assessment
- [ ] Customize PRIVACY_POLICY.md with your organization details
- [ ] Customize TERMS_OF_SERVICE.md
- [ ] Generate and secure ENCRYPTION_KEY
- [ ] Set up HTTPS/TLS certificates
- [ ] Configure environment variables (.env)
- [ ] Review and update retention periods if needed
- [ ] Train staff on POPIA requirements

### Configuration

```bash
# Required environment variables:
MONGODB_URI=mongodb://localhost:27017/fleet-manager
JWT_SECRET=<secure-random-string>
ENCRYPTION_KEY=<generated-encryption-key>
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Post-Deployment

- [ ] Test all data subject rights endpoints
- [ ] Verify audit logging is working
- [ ] Set up automated data retention cleanup (cron)
- [ ] Configure backup procedures
- [ ] Test data breach response procedures
- [ ] Display privacy policy on login page
- [ ] Enable HTTPS and security headers
- [ ] Monitor audit logs regularly
- [ ] Document your data processing register

### Optional but Recommended

- [ ] Register with Information Regulator
- [ ] Obtain cyber insurance
- [ ] Conduct penetration testing
- [ ] Implement rate limiting (already included)
- [ ] Set up intrusion detection
- [ ] Create data processing agreements with third parties
- [ ] Implement two-factor authentication (2FA)

## Maintenance and Operations

### Daily

- Monitor system logs for suspicious activity
- Review failed login attempts

### Weekly

- Review audit logs for unusual patterns
- Check for pending data subject requests

### Monthly

- Run data retention cleanup
- Review access permissions
- Update staff on privacy practices
- Check for software updates

### Quarterly

- Review privacy policy for updates
- Conduct security audit
- Test backup restoration
- Review data processing register

### Annually

- Complete Privacy Impact Assessment
- Review and update retention periods
- Staff training refresh
- Review third-party processors
- Update documentation

### Scheduled Tasks

**Setup Cron Jobs:**

```bash
# Monthly data retention cleanup (1st of month at 2 AM)
0 2 1 * * cd /path/to/fleet-manager/backend && npm run data-retention-cleanup >> /var/log/fleet-manager/retention.log 2>&1

# Weekly backup verification (Sunday at 3 AM)
0 3 * * 0 cd /path/to/fleet-manager && npm run verify-backups >> /var/log/fleet-manager/backups.log 2>&1

# Daily audit log check (every day at 1 AM)
0 1 * * * cd /path/to/fleet-manager/backend && npm run check-audit-logs >> /var/log/fleet-manager/audit-check.log 2>&1
```

## Incident Response

### If You Discover a Data Breach

1. **Immediate (0-4 hours):**
   - Contain the breach
   - Preserve evidence
   - Alert Information Officer
   - Document everything

2. **Investigation (4-24 hours):**
   - Determine scope
   - Identify affected data subjects
   - Assess risk level
   - Prepare notifications

3. **Notification (within 72 hours):**
   - Notify Information Regulator
   - Notify affected data subjects
   - Provide clear information about:
     - What happened
     - What data was affected
     - What you're doing about it
     - What they should do

4. **Remediation:**
   - Fix vulnerability
   - Implement additional controls
   - Update policies
   - Train staff

5. **Documentation:**
   - Complete incident report
   - Add to breach register
   - Conduct post-incident review

**Use:** [DATA_BREACH_RESPONSE.md](DATA_BREACH_RESPONSE.md) for detailed procedures.

## FAQ

### Q: Do I need to register with the Information Regulator?

**A:** Registration is required if you:
- Process special personal information (health, race, religion, etc.)
- Are a public body
- Process personal information for a third party

For fleet management with driver names and phone numbers, registration may not be mandatory but is recommended.

### Q: How long do I need to keep financial records?

**A:** 5 years minimum for SARS (South African Revenue Service) compliance. The application enforces this automatically.

### Q: Can I customize the retention periods?

**A:** Yes. Edit [backend/src/utils/dataRetention.ts](backend/src/utils/dataRetention.ts) and update the `RETENTION_PERIODS` constant. Ensure your custom periods comply with legal requirements.

### Q: What happens if I don't respond to a data subject request within 30 days?

**A:** POPIA Section 23(3) allows the data subject to lodge a complaint with the Information Regulator. You may face enforcement action.

### Q: Do I need consent to collect driver information?

**A:** It depends on your lawful basis. If you have a legitimate business interest (employment/contractor relationship), consent may not be required. However, you must still provide privacy notices and honor data subject rights.

### Q: Can drivers request deletion of their data?

**A:** Yes, but you can refuse if you have legal obligations to retain the data (e.g., financial records for tax purposes). The application allows you to handle deletion requests with this flexibility.

### Q: What if I discover a data breach?

**A:** Follow [DATA_BREACH_RESPONSE.md](DATA_BREACH_RESPONSE.md) procedures. Key point: notify the Information Regulator within 72 hours.

### Q: Is the encryption strong enough?

**A:** Yes. AES-256-GCM is industry-standard encryption. Ensure:
1. You generate a strong ENCRYPTION_KEY
2. The key is stored securely (not in code)
3. You use HTTPS in production

### Q: Can I use this for Uber, Bolt, and other platforms?

**A:** Yes. The application is platform-agnostic. POPIA compliance applies regardless of which ride-hailing platform you use.

### Q: What about drivers' consent?

**A:** You should:
1. Provide a privacy notice when onboarding drivers
2. Obtain consent if not covered by employment/contractor agreement
3. Track consent using the application's consent management system
4. Allow drivers to access and delete their data

### Q: Do I need a lawyer?

**A:** While the application provides compliance tools, consulting with a South African privacy lawyer is recommended for:
- Privacy Impact Assessments
- Data Processing Agreements
- Complex data subject requests
- Breach notifications

### Q: What are the penalties for non-compliance?

**A:** POPIA Section 107-109:
- Administrative fines up to R10 million
- Criminal penalties up to 10 years imprisonment
- Reputational damage
- Civil claims from data subjects

### Q: How do I know if I'm compliant?

**A:** Use this checklist:
- [ ] Privacy policy displayed and current
- [ ] Consent obtained and tracked
- [ ] Data subject rights operational
- [ ] Audit logging enabled
- [ ] Encryption configured
- [ ] Data retention cleanup scheduled
- [ ] Breach response procedures documented
- [ ] Staff trained on POPIA
- [ ] Information Officer appointed
- [ ] Regular reviews conducted

## Support and Assistance

### Technical Support

**Sheet Solved:**
- Email: cesaire@sheetsolved.com
- Website: https://sheetsolved.com

### Legal/Compliance Support

**Information Regulator:**
- Website: https://inforegulator.org.za
- Email: inforeg@justice.gov.za
- Phone: 012 406 4818

**POPIA Resources:**
- Full Act: https://www.gov.za/documents/protection-personal-information-act
- Guidance Notes: Available on Information Regulator website
- POPIA Code of Conduct: Industry-specific codes (if applicable)

### Community

**GitHub Issues:**
- Report bugs: https://github.com/[your-repo]/issues
- Feature requests welcome
- Security issues: Email cesaire@sheetsolved.com (do not post publicly)

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-07 | Initial POPIA compliance implementation |

---

**Disclaimer:** This guide provides general information about POPIA compliance features in the Fleet Manager application. It is not legal advice. Consult with a qualified South African privacy lawyer for advice specific to your circumstances.

**For questions or clarifications, contact cesaire@sheetsolved.com**
