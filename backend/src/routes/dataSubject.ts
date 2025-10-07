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
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import WeeklyData from '../models/WeeklyData';
import AuditLog from '../models/AuditLog';
import UserConsent from '../models/UserConsent';
import DataSubjectRequest from '../models/DataSubjectRequest';
import { logDataSubjectRequest } from '../middleware/auditLogger';

const router = express.Router();

/**
 * GET /api/data-subject/my-data
 * Right of Access - Get all personal data (POPIA Section 23)
 */
router.get('/my-data', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    // Get user data
    const user = await User.findById(userId).select('-password');

    // Get all vehicles associated with this user
    const vehicles = await Vehicle.find({});

    // Get all weekly data submitted by this user
    const weeklyData = await WeeklyData.find({ submittedBy: userId });

    // Get audit logs for this user
    const auditLogs = await AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(100);

    // Get consent records
    const consents = await UserConsent.find({ userId });

    await logDataSubjectRequest(req, 'access', userId.toString());

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
    const userId = (req as any).user._id;
    const format = req.query.format || 'json';

    // Get all user data
    const user = await User.findById(userId).select('-password');
    const weeklyData = await WeeklyData.find({ submittedBy: userId });
    const auditLogs = await AuditLog.find({ userId }).sort({ timestamp: -1 });
    const consents = await UserConsent.find({ userId });

    const exportData = {
      exportMetadata: {
        exportDate: new Date(),
        format,
        userId: userId.toString(),
      },
      personalInformation: user,
      weeklyDataRecords: weeklyData,
      activityLogs: auditLogs,
      consentRecords: consents,
    };

    await logDataSubjectRequest(req, 'portability', userId.toString());

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
    const userId = (req as any).user._id;
    const { reason } = req.body;

    // Create deletion request
    const request = await DataSubjectRequest.create({
      userId,
      requestType: 'deletion',
      status: 'pending',
      requestDetails: reason,
      requestDate: new Date(),
    });

    await logDataSubjectRequest(req, 'deletion', userId.toString());

    res.json({
      message: 'Deletion request submitted successfully',
      request: {
        id: request._id,
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
    const userId = (req as any).user._id;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        message: 'Please confirm deletion by sending: confirmation: "DELETE MY ACCOUNT"'
      });
    }

    // Log the deletion
    await logDataSubjectRequest(req, 'deletion', userId.toString());

    // Delete all user-associated data
    await WeeklyData.deleteMany({ submittedBy: userId });
    await UserConsent.deleteMany({ userId });
    await DataSubjectRequest.deleteMany({ userId });

    // Note: AuditLog has TTL index, will auto-delete after 2 years
    // Note: Vehicles are not deleted as they may be shared across users

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

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
    const userId = (req as any).user._id;
    const { field, currentValue, correctedValue, reason } = req.body;

    const request = await DataSubjectRequest.create({
      userId,
      requestType: 'correction',
      status: 'pending',
      requestDetails: JSON.stringify({ field, currentValue, correctedValue, reason }),
      requestDate: new Date(),
    });

    await logDataSubjectRequest(req, 'correction', userId.toString());

    res.json({
      message: 'Correction request submitted successfully',
      request: {
        id: request._id,
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
    const userId = (req as any).user._id;
    const { processingType, reason } = req.body;

    const request = await DataSubjectRequest.create({
      userId,
      requestType: 'objection',
      status: 'pending',
      requestDetails: JSON.stringify({ processingType, reason }),
      requestDate: new Date(),
    });

    await logDataSubjectRequest(req, 'objection', userId.toString());

    res.json({
      message: 'Objection submitted successfully',
      request: {
        id: request._id,
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
    const userId = (req as any).user._id;
    const { reason } = req.body;

    const request = await DataSubjectRequest.create({
      userId,
      requestType: 'restriction',
      status: 'pending',
      requestDetails: reason,
      requestDate: new Date(),
    });

    await logDataSubjectRequest(req, 'restriction', userId.toString());

    res.json({
      message: 'Restriction request submitted successfully',
      request: {
        id: request._id,
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
    const userId = (req as any).user._id;

    const requests = await DataSubjectRequest.find({ userId })
      .sort({ requestDate: -1 })
      .populate('handledBy', 'name email');

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
    const userId = (req as any).user._id;
    const { consentType } = req.body;

    // Update consent record
    await UserConsent.updateMany(
      { userId, consentType, consentGiven: true },
      {
        $set: {
          consentGiven: false,
          withdrawalDate: new Date()
        }
      }
    );

    // Create data subject request record
    await DataSubjectRequest.create({
      userId,
      requestType: 'consent_withdrawal',
      status: 'completed',
      requestDetails: `Withdrew consent for: ${consentType}`,
      requestDate: new Date(),
      completionDate: new Date(),
    });

    await logDataSubjectRequest(req, 'consent_withdrawal', userId.toString());

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
    const userId = (req as any).user._id;

    const consents = await UserConsent.find({ userId }).sort({ consentDate: -1 });

    res.json({ consents });
  } catch (error: any) {
    console.error('Error fetching consents:', error);
    res.status(500).json({ message: 'Error fetching consent records', error: error.message });
  }
});

export default router;
