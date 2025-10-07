/**
 * Audit Logging Middleware
 *
 * Automatically logs all data access and modifications for POPIA compliance.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

interface AuditLogParams {
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'access_denied';
  resource: 'vehicle' | 'weeklyData' | 'user' | 'report' | 'auth' | 'data_subject_request';
  resourceId?: string;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an audit log entry
 */
export const createAuditLog = async (
  req: Request,
  params: AuditLogParams,
  success: boolean = true,
  errorMessage?: string
): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    await AuditLog.create({
      userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      metadata: params.metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error('Failed to create audit log:', error);
  }
};

/**
 * Middleware that wraps route handlers to automatically log actions
 */
export const auditLog = (
  action: AuditLogParams['action'],
  resource: AuditLogParams['resource'],
  getResourceId?: (req: Request) => string | undefined
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (body: any) {
      const resourceId = getResourceId ? getResourceId(req) : undefined;
      const success = res.statusCode >= 200 && res.statusCode < 400;

      // Log the action
      createAuditLog(
        req,
        {
          action,
          resource,
          resourceId,
          details: `${req.method} ${req.originalUrl}`,
          metadata: {
            statusCode: res.statusCode,
            method: req.method,
            path: req.originalUrl,
          },
        },
        success,
        success ? undefined : body?.message || 'Request failed'
      );

      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper function to log authentication attempts
 */
export const logAuthAttempt = async (
  req: Request,
  email: string,
  success: boolean,
  errorMessage?: string
): Promise<void> => {
  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.get('user-agent');

  try {
    await AuditLog.create({
      action: success ? 'login' : 'access_denied',
      resource: 'auth',
      details: `Login attempt for ${email}`,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      timestamp: new Date(),
      metadata: { email },
    });
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
};

/**
 * Helper function to log data exports (critical for POPIA)
 */
export const logDataExport = async (
  req: Request,
  exportType: string,
  recordCount: number
): Promise<void> => {
  const userId = (req as any).user?._id;
  const ipAddress = req.ip || req.socket.remoteAddress;

  try {
    await AuditLog.create({
      userId,
      action: 'export',
      resource: 'report',
      details: `Exported ${recordCount} records as ${exportType}`,
      ipAddress,
      success: true,
      timestamp: new Date(),
      metadata: {
        exportType,
        recordCount,
      },
    });
  } catch (error) {
    console.error('Failed to log data export:', error);
  }
};

/**
 * Helper function to log data subject requests (POPIA rights)
 */
export const logDataSubjectRequest = async (
  req: Request,
  requestType: string,
  targetUserId: string
): Promise<void> => {
  const userId = (req as any).user?._id;
  const ipAddress = req.ip || req.socket.remoteAddress;

  try {
    await AuditLog.create({
      userId,
      action: 'read',
      resource: 'data_subject_request',
      resourceId: targetUserId,
      details: `Data subject request: ${requestType}`,
      ipAddress,
      success: true,
      timestamp: new Date(),
      metadata: {
        requestType,
        targetUserId,
      },
    });
  } catch (error) {
    console.error('Failed to log data subject request:', error);
  }
};
