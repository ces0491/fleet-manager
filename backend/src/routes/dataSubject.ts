/**
 * Data Subject Rights Routes (POPIA Compliance)
 *
 * Implements POPIA data subject rights:
 * - Right of Access (Section 23)
 * - Right to Correction (Section 24)
 * - Right to Deletion (Section 25)
 * - Right to Data Portability
 * - Right to Object
 * - Right to Restrict Processing
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import prisma from '../config/database';
import { logDataSubjectRequest } from '../middleware/auditLogger';

const router = express.Router();

/**
 * GET /api/data-subject/my-data
 * Right of Access - Get all personal data (POPIA Section 23)
 */
router.get('/my-data', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get all weekly data submitted by this user
    const weeklyData = await prisma.weeklyData.findMany({
      where: { submittedBy: userId }
    });

    // Get audit logs for this user
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Get consent records
    const consents = await prisma.userConsent.findMany({
      where: { userId }
    });

    await logDataSubjectRequest(req, 'access', userId);

    res.json({
      message: 'Your personal data',
      data: {
        user,
        weeklyDataRecords: weeklyData,
        recentActivity: auditLogs,
        consents,
        dataCategories: {
          personalInfo: ['name', 'email', 'role'],
          activityData: ['weeklyData submissions', 'audit logs'],
          consentRecords: ['terms acceptance', 'privacy policy acceptance'],
        },
      },
      exportDate: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching your data', error: error.message });
  }
});

/**
 * GET /api/data-subject/export
 * Right to Data Portability - Export all data in machine-readable format
 */
router.get('/export', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const format = req.query.format || 'json';

    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });
    const weeklyData = await prisma.weeklyData.findMany({ where: { submittedBy: userId } });
    const auditLogs = await prisma.auditLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } });
    const consents = await prisma.userConsent.findMany({ where: { userId } });

    const exportData = {
      exportMetadata: {
        exportDate: new Date(),
        format,
        userId: userId,
      },
      personalInformation: user,
      weeklyDataRecords: weeklyData,
      activityLogs: auditLogs,
      consentRecords: consents,
    };

    await logDataSubjectRequest(req, 'portability', userId);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="my-data-${Date.now()}.json"`);
      res.json(exportData);
    } else {
      res.status(400).json({ message: 'Unsupported format. Use format=json' });
    }
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ message: 'Error exporting your data', error: error.message });
  }
});

/**
 * POST /api/data-subject/request-deletion
 * Right to Deletion (POPIA Section 25) - Request account and data deletion
 */
router.post('/request-deletion', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { reason } = req.body;

    // Create deletion request
    const request = await prisma.dataSubjectRequest.create({
      data: {
        userId,
        requestType: 'DELETION',
        status: 'PENDING',
        requestDetails: reason,
        requestDate: new Date(),
      }
    });

    await logDataSubjectRequest(req, 'deletion', userId);

    res.json({
      message: 'Deletion request submitted successfully',
      request: {
        id: request.id,
        status: request.status,
        requestDate: request.requestDate,
      },
      nextSteps: [
        'Your request will be reviewed within 30 days',
        'You will receive confirmation via email',
        'Data will be retained for 30 days to allow recovery of accidental requests',
        'After 30 days, all your data will be permanently deleted',
      ],
      note: 'Some data may be retained for legal obligations (e.g., financial records for tax purposes)',
    });
  } catch (error: any) {
    console.error('Error creating deletion request:', error);
    res.status(500).json({ message: 'Error submitting deletion request', error: error.message });
  }
});

/**
 * DELETE /api/data-subject/delete-account
 * Immediate account deletion (self-service)
 */
router.delete('/delete-account', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        message: 'Please confirm deletion by sending: confirmation: "DELETE MY ACCOUNT"'
      });
    }

    // Log the deletion
    await logDataSubjectRequest(req, 'deletion', userId);

    // Delete all user-associated data
    await prisma.weeklyData.deleteMany({ where: { submittedBy: userId } });
    await prisma.userConsent.deleteMany({ where: { userId } });
    await prisma.dataSubjectRequest.deleteMany({ where: { userId } });

    // Note: AuditLog entries remain for security (set to null via onDelete: SetNull)
    // Note: Vehicles are not deleted as they may be shared across users

    // Finally, delete the user account
    await prisma.user.delete({ where: { id: userId } });

    res.json({
      message: 'Account deleted successfully',
      deletedData: [
        'User account',
        'Weekly data submissions',
        'Consent records',
        'Data subject requests',
      ],
      retainedData: [
        'Audit logs (retained for 2 years for security)',
        'Financial records required by law (if applicable)',
      ],
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

/**
 * POST /api/data-subject/request-correction
 * Right to Correction (POPIA Section 24)
 */
router.post('/request-correction', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { field, currentValue, correctedValue, reason } = req.body;

    const request = await prisma.dataSubjectRequest.create({
      data: {
        userId,
        requestType: 'CORRECTION',
        status: 'PENDING',
        requestDetails: JSON.stringify({ field, currentValue, correctedValue, reason }),
        requestDate: new Date(),
      }
    });

    await logDataSubjectRequest(req, 'correction', userId);

    res.json({
      message: 'Correction request submitted successfully',
      request: {
        id: request.id,
        status: request.status,
        field,
        requestDate: request.requestDate,
      },
      note: 'You can also update most information directly in your account settings',
    });
  } catch (error: any) {
    console.error('Error creating correction request:', error);
    res.status(500).json({ message: 'Error submitting correction request', error: error.message });
  }
});

/**
 * POST /api/data-subject/object-processing
 * Right to Object (POPIA Section 11(3))
 */
router.post('/object-processing', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { processingType, reason } = req.body;

    const request = await prisma.dataSubjectRequest.create({
      data: {
        userId,
        requestType: 'OBJECTION',
        status: 'PENDING',
        requestDetails: JSON.stringify({ processingType, reason }),
        requestDate: new Date(),
      }
    });

    await logDataSubjectRequest(req, 'objection', userId);

    res.json({
      message: 'Objection submitted successfully',
      request: {
        id: request.id,
        status: request.status,
        requestDate: request.requestDate,
      },
      note: 'We will review your objection and respond within 30 days',
    });
  } catch (error: any) {
    console.error('Error creating objection:', error);
    res.status(500).json({ message: 'Error submitting objection', error: error.message });
  }
});

/**
 * POST /api/data-subject/restrict-processing
 * Right to Restrict Processing
 */
router.post('/restrict-processing', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { reason } = req.body;

    const request = await prisma.dataSubjectRequest.create({
      data: {
        userId,
        requestType: 'RESTRICTION',
        status: 'PENDING',
        requestDetails: reason,
        requestDate: new Date(),
      }
    });

    await logDataSubjectRequest(req, 'restriction', userId);

    res.json({
      message: 'Restriction request submitted successfully',
      request: {
        id: request.id,
        status: request.status,
        requestDate: request.requestDate,
      },
      note: 'Processing will be restricted while we review your request',
    });
  } catch (error: any) {
    console.error('Error creating restriction request:', error);
    res.status(500).json({ message: 'Error submitting restriction request', error: error.message });
  }
});

/**
 * GET /api/data-subject/my-requests
 * View all data subject requests made by the user
 */
router.get('/my-requests', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const requests = await prisma.dataSubjectRequest.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
      include: {
        handler: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    res.json({ requests });
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching your requests', error: error.message });
  }
});

/**
 * POST /api/data-subject/withdraw-consent
 * Withdraw consent for data processing
 */
router.post('/withdraw-consent', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { consentType } = req.body;

    // Update consent record
    await prisma.userConsent.updateMany({
      where: {
        userId,
        consentType: consentType.toUpperCase(),
        consentGiven: true
      },
      data: {
        consentGiven: false,
        withdrawalDate: new Date()
      }
    });

    // Create data subject request record
    await prisma.dataSubjectRequest.create({
      data: {
        userId,
        requestType: 'CONSENT_WITHDRAWAL',
        status: 'COMPLETED',
        requestDetails: `Withdrew consent for: ${consentType}`,
        requestDate: new Date(),
        completionDate: new Date(),
      }
    });

    await logDataSubjectRequest(req, 'consent_withdrawal', userId);

    res.json({
      message: 'Consent withdrawn successfully',
      consentType,
      note: 'This may affect your ability to use certain features of the service',
    });
  } catch (error: any) {
    console.error('Error withdrawing consent:', error);
    res.status(500).json({ message: 'Error withdrawing consent', error: error.message });
  }
});

/**
 * GET /api/data-subject/consents
 * View all consent records
 */
router.get('/consents', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const consents = await prisma.userConsent.findMany({
      where: { userId },
      orderBy: { consentDate: 'desc' }
    });

    res.json({ consents });
  } catch (error: any) {
    console.error('Error fetching consents:', error);
    res.status(500).json({ message: 'Error fetching consent records', error: error.message });
  }
});

export default router;
