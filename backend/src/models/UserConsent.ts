/**
 * User Consent Model
 *
 * Tracks user consent for data processing under POPIA.
 * Maintains audit trail of consent given, withdrawn, and updated.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IUserConsent extends Document {
  userId: mongoose.Types.ObjectId;
  consentType: 'terms_of_service' | 'privacy_policy' | 'data_processing' | 'marketing';
  consentGiven: boolean;
  consentDate: Date;
  consentVersion: string; // Version of terms/policy consented to
  withdrawalDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const UserConsentSchema = new Schema<IUserConsent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    consentType: {
      type: String,
      enum: ['terms_of_service', 'privacy_policy', 'data_processing', 'marketing'],
      required: true,
    },
    consentGiven: {
      type: Boolean,
      required: true,
      default: false,
    },
    consentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    consentVersion: {
      type: String,
      required: true,
      default: '1.0',
    },
    withdrawalDate: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient consent checking
UserConsentSchema.index({ userId: 1, consentType: 1, consentGiven: 1 });
UserConsentSchema.index({ userId: 1, consentDate: -1 });

export default mongoose.model<IUserConsent>('UserConsent', UserConsentSchema);
