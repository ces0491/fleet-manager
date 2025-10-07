/**
 * Audit Log Model
 *
 * Tracks all data access and modifications for POPIA compliance.
 * Maintains a complete audit trail of who accessed what data and when.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'access_denied';
  resource: 'vehicle' | 'weeklyData' | 'user' | 'report' | 'auth' | 'data_subject_request';
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Anonymous actions (failed logins) won't have userId
    },
    action: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'export', 'login', 'logout', 'access_denied'],
      required: true,
      index: true,
    },
    resource: {
      type: String,
      enum: ['vehicle', 'weeklyData', 'user', 'report', 'auth', 'data_subject_request'],
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: false,
    },
    details: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

// Compound indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

// TTL index for automatic deletion after 2 years (POPIA retention requirement)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
