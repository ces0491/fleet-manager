/**
 * Data Subject Request Model
 *
 * Tracks POPIA data subject rights requests (access, correction, deletion, etc.)
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IDataSubjectRequest extends Document {
  userId: mongoose.Types.ObjectId;
  requestType: 'access' | 'correction' | 'deletion' | 'portability' | 'restriction' | 'objection' | 'consent_withdrawal';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: Date;
  completionDate?: Date;
  requestDetails?: string;
  responseDetails?: string;
  handledBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

const DataSubjectRequestSchema = new Schema<IDataSubjectRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: ['access', 'correction', 'deletion', 'portability', 'restriction', 'objection', 'consent_withdrawal'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
      required: true,
      index: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completionDate: {
      type: Date,
      required: false,
    },
    requestDetails: {
      type: String,
      required: false,
    },
    responseDetails: {
      type: String,
      required: false,
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    rejectionReason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
DataSubjectRequestSchema.index({ userId: 1, requestDate: -1 });
DataSubjectRequestSchema.index({ status: 1, requestDate: 1 });

export default mongoose.model<IDataSubjectRequest>('DataSubjectRequest', DataSubjectRequestSchema);
