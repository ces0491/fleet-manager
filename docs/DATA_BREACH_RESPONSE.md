# Data Breach Response Procedures

**Document Owner:** Sheet Solved - Spreadsheets Solved
**Contact:** cesaire@sheetsolved.com
**Last Updated:** 2025-10-07

## Purpose

This document outlines the procedures for identifying, containing, investigating, and responding to data breaches in compliance with POPIA Section 22.

## 1. What Constitutes a Data Breach

A data breach under POPIA includes any incident where personal information is:
- Accessed without authorization
- Disclosed to unauthorized parties
- Lost or destroyed
- Altered without authorization
- Compromised in any way that poses a risk to data subjects

### Examples of Data Breaches
- Unauthorized access to database
- Stolen laptops/devices with unencrypted data
- Phishing attacks exposing credentials
- Malware/ransomware attacks
- Accidental email to wrong recipients
- Lost backup media
- Insider threats or employee misconduct

## 2. Breach Response Team

**Primary Contact:** Cesaire (cesaire@sheetsolved.com)
**Information Officer:** Cesaire
**Technical Lead:** [Assign as needed]
**Legal Advisor:** [Assign as needed]

## 3. Immediate Response (0-4 hours)

### 3.1 Detection and Identification
- Monitor audit logs for suspicious activity
- Review security alerts and system notifications
- Investigate user reports of unauthorized access

### 3.2 Initial Assessment
- Confirm whether a breach has occurred
- Identify the type of breach (unauthorized access, disclosure, loss, etc.)
- Determine the scope: what data is affected
- Assess the severity: high, medium, low risk

### 3.3 Containment
- Isolate affected systems immediately
- Revoke compromised credentials
- Block unauthorized access points
- Preserve evidence for investigation
- Document all actions taken

### 3.4 Notification to Breach Response Team
- Alert the Information Officer immediately
- Convene breach response team meeting
- Begin incident log documentation

## 4. Investigation Phase (4-24 hours)

### 4.1 Determine Scope
Identify:
- What personal information was compromised
- How many data subjects are affected
- When the breach occurred and was discovered
- How the breach occurred (root cause)
- Whether data was encrypted
- Who may have accessed the data
- Whether data has been misused

### 4.2 Personal Information Assessment

| Data Type | Sensitivity | Risk Level |
|-----------|-------------|------------|
| Names, phone numbers | Medium | Medium |
| Financial records | High | High |
| Passwords (hashed) | High | Low (if properly hashed) |
| User credentials | High | High |
| Vehicle records | Low | Low |
| IP addresses, logs | Low | Low |

### 4.3 Risk Assessment
Evaluate risk to data subjects:
- Identity theft potential
- Financial loss potential
- Reputational harm
- Physical safety concerns
- Discrimination potential
- Other adverse effects

## 5. Notification Requirements (POPIA Section 22)

### 5.1 Notification to Information Regulator

**Timeline:** Within **72 hours** of becoming aware of the breach

**Required Information (Section 22(1)):**
1. Description of breach and circumstances
2. Personal information involved
3. Number of data subjects affected
4. Potential consequences for data subjects
5. Measures taken or proposed to address breach
6. Measures to mitigate adverse effects
7. Contact details for further information

**How to Notify:**
- **Online:** https://inforegulator.org.za
- **Email:** inforeg@justice.gov.za
- **Phone:** 012 406 4818
- **Post:** JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001

### 5.2 Notification to Data Subjects

**Timeline:** As soon as reasonably possible after discovery

**When Required (Section 22(2)):**
When breach is likely to cause harm to data subjects

**Required Information:**
1. Clear description of breach in plain language
2. Type of personal information involved
3. Steps taken to address breach
4. Steps data subjects can take to protect themselves
5. Contact information for questions
6. Our commitment to support affected individuals

**Notification Method:**
- Email to registered email addresses
- In-app notification upon next login
- Phone calls for high-risk situations
- Public notice if contact info unavailable

### 5.3 Sample Notification Email

```
Subject: Important Security Notice - Data Breach Notification

Dear [Name],

We are writing to inform you of a security incident that may affect your personal information.

WHAT HAPPENED:
On [Date], we discovered that [brief description of breach]. We identified the issue on [Date] and immediately took action to secure our systems.

WHAT INFORMATION WAS INVOLVED:
The personal information potentially affected includes: [list specific data types].

WHAT WE ARE DOING:
- We have contained the breach and secured affected systems
- We have launched a full investigation
- We have notified the Information Regulator as required by POPIA
- We are implementing additional security measures to prevent future incidents

WHAT YOU CAN DO:
- Change your password immediately (if credentials affected)
- Monitor your accounts for suspicious activity
- Be alert for phishing emails
- [Other specific recommendations based on breach type]

YOUR RIGHTS:
Under POPIA, you have the right to:
- Request more information about this incident
- Lodge a complaint with the Information Regulator
- Request deletion of your account and data

CONTACT US:
If you have questions or concerns:
Email: cesaire@sheetsolved.com
Subject line: "Data Breach Inquiry"

We sincerely apologize for this incident and any inconvenience caused. We take the security of your personal information very seriously.

Yours sincerely,
Sheet Solved Team

Information Regulator Contact:
Website: https://inforegulator.org.za
Email: inforeg@justice.gov.za
Phone: 012 406 4818
```

## 6. Remediation Phase (24-72 hours)

### 6.1 Technical Remediation
- Patch vulnerabilities that caused breach
- Implement additional security controls
- Reset compromised credentials
- Review and update access controls
- Enhance monitoring and alerting

### 6.2 Process Improvements
- Review and update security policies
- Conduct staff training
- Update incident response procedures
- Implement lessons learned

## 7. Documentation Requirements

### 7.1 Incident Log
Maintain detailed records including:
- Timeline of events
- Actions taken and by whom
- People notified and when
- Evidence collected
- Decisions made and rationale

### 7.2 Breach Register
Maintain a register of all breaches (required by POPIA):
- Date of breach
- Nature of breach
- Personal information affected
- Number of data subjects
- Notifications sent
- Remediation actions

### 7.3 Retention
Retain breach documentation for **5 years** minimum.

## 8. Post-Breach Review (1-2 weeks)

### 8.1 Root Cause Analysis
- Identify how breach occurred
- Determine contributing factors
- Assess effectiveness of response
- Identify preventable failures

### 8.2 Improvement Plan
- Document lessons learned
- Update security controls
- Revise policies and procedures
- Schedule follow-up security audit
- Implement additional training

## 9. Prevention Measures

### 9.1 Technical Controls
- Encryption at rest and in transit
- Strong access controls and authentication
- Regular security updates and patching
- Intrusion detection systems
- Audit logging and monitoring
- Regular backups
- Network segmentation

### 9.2 Administrative Controls
- Security awareness training
- Background checks for employees
- Clear security policies
- Incident response drills
- Regular security audits
- Vendor security assessments
- Data minimization practices

### 9.3 Monitoring and Detection
- Real-time security monitoring
- Automated anomaly detection
- Regular log review
- Penetration testing
- Vulnerability scanning

## 10. Communication Templates

### 10.1 Internal Alert Template
```
TO: Breach Response Team
FROM: [Your Name]
DATE: [Date/Time]
SUBJECT: URGENT - Potential Data Breach

INCIDENT SUMMARY:
- Type of incident: [Unauthorized access/loss/disclosure]
- Systems affected: [Database/server/application]
- Discovery time: [Date/Time]
- Estimated impact: [Number of records/users]

IMMEDIATE ACTIONS TAKEN:
- [List containment steps]

NEXT STEPS:
- [Investigation priorities]

STATUS: [Active/Contained/Under Investigation]
```

### 10.2 Information Regulator Notification Template
```
TO: Information Regulator (South Africa)
DATE: [Date]
SUBJECT: Data Breach Notification - POPIA Section 22(1)

RESPONSIBLE PARTY DETAILS:
Name: Sheet Solved - Spreadsheets Solved
Contact: cesaire@sheetsolved.com
Information Officer: Cesaire

BREACH DETAILS:
1. Description: [Full description of breach and circumstances]
2. Personal Information Involved: [List categories of data]
3. Data Subjects Affected: [Number and categories]
4. Discovery Date: [Date]
5. Breach Occurrence Date: [Estimated date]

POTENTIAL CONSEQUENCES:
[Assessment of harm to data subjects]

REMEDIATION MEASURES:
[Steps taken to address breach and prevent recurrence]

MITIGATION MEASURES:
[Steps to mitigate adverse effects on data subjects]

DATA SUBJECT NOTIFICATION:
Status: [Completed/In Progress/Not Required]
Method: [Email/Phone/Public Notice]
Date: [Date notifications sent]

CONTACT FOR FURTHER INFORMATION:
Cesaire
Email: cesaire@sheetsolved.com
```

## 11. Reporting Hierarchy

```
Discovery → Information Officer → Breach Response Team → Investigation
                    ↓
            Risk Assessment
                    ↓
    ┌──────────────┴──────────────┐
    ↓                              ↓
Information Regulator      Data Subjects
(within 72 hours)         (as soon as possible)
    ↓                              ↓
Documentation & Remediation → Post-Breach Review
```

## 12. Legal and Regulatory References

- **POPIA Section 22:** Notification of security compromises
- **POPIA Section 19:** Security safeguards
- **POPIA Section 14:** Records of processing operations
- **POPIA Section 107-109:** Penalties for non-compliance

## 13. Emergency Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Information Officer | Cesaire | cesaire@sheetsolved.com | [Phone] |
| Technical Lead | [Name] | [Email] | [Phone] |
| Legal Advisor | [Name] | [Email] | [Phone] |

**External Contacts:**
- **Information Regulator:** 012 406 4818 / inforeg@justice.gov.za
- **SAPS Cybercrime:** 012 393 3727
- **Managed Security Provider:** [If applicable]

## 14. Training and Awareness

All users with administrative access must:
- Complete annual data protection training
- Review this document annually
- Participate in breach response drills
- Report suspicious activity immediately

## 15. Review and Updates

This document must be reviewed and updated:
- Annually (minimum)
- After each breach incident
- When regulations change
- When systems or processes change significantly

**Next Scheduled Review:** 2026-10-07

---

**This document is part of our POPIA compliance framework. For questions, contact cesaire@sheetsolved.com**
