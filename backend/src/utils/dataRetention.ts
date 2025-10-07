/**
 * Data Retention Policy Implementation
 *
 * Automated cleanup of data based on POPIA retention requirements.
 * Run this as a scheduled job (cron) to comply with data minimization.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import prisma from '../config/database';

/**
 * Data Retention Periods (in days)
 */
export const RETENTION_PERIODS = {
  WEEKLY_DATA: 1825, // 5 years (SARS requirement for financial records)
  AUDIT_LOGS: 730, // 2 years (security monitoring) - handled by TTL index
  DATA_SUBJECT_REQUESTS: 1825, // 5 years (compliance documentation)
  DELETED_USER_DATA: 30, // 30 days (recovery period)
  CONSENT_RECORDS: 2555, // 7 years (legal requirement for consent proof)
};

/**
 * Clean up old weekly data beyond retention period
 */
export async function cleanupOldWeeklyData(): Promise<{
  deleted: number;
  errors: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.WEEKLY_DATA);

    const result = await prisma.weeklyData.deleteMany({
      where: {
        weekStartDate: { lt: cutoffDate }
      }
    });

    console.log(`✅ Deleted ${result.count} old weekly data records (older than ${cutoffDate.toISOString()})`);

    return {
      deleted: result.count,
      errors: 0,
    };
  } catch (error) {
    console.error('❌ Error cleaning up weekly data:', error);
    return {
      deleted: 0,
      errors: 1,
    };
  }
}

/**
 * Clean up old data subject requests beyond retention period
 */
export async function cleanupOldDataSubjectRequests(): Promise<{
  deleted: number;
  errors: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.DATA_SUBJECT_REQUESTS);

    const result = await prisma.dataSubjectRequest.deleteMany({
      where: {
        requestDate: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'REJECTED'] } // Only delete completed/rejected requests
      }
    });

    console.log(`✅ Deleted ${result.count} old data subject requests (older than ${cutoffDate.toISOString()})`);

    return {
      deleted: result.count,
      errors: 0,
    };
  } catch (error) {
    console.error('❌ Error cleaning up data subject requests:', error);
    return {
      deleted: 0,
      errors: 1,
    };
  }
}

/**
 * Clean up old consent records beyond retention period
 * Note: Keep withdrawn consents as proof of consent history
 */
export async function cleanupOldConsentRecords(): Promise<{
  deleted: number;
  errors: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_PERIODS.CONSENT_RECORDS);

    const result = await prisma.userConsent.deleteMany({
      where: {
        consentDate: { lt: cutoffDate }
      }
    });

    console.log(`✅ Deleted ${result.count} old consent records (older than ${cutoffDate.toISOString()})`);

    return {
      deleted: result.count,
      errors: 0,
    };
  } catch (error) {
    console.error('❌ Error cleaning up consent records:', error);
    return {
      deleted: 0,
      errors: 1,
    };
  }
}

/**
 * Run all data retention cleanup tasks
 */
export async function runDataRetentionCleanup(): Promise<{
  totalDeleted: number;
  totalErrors: number;
  details: Record<string, { deleted: number; errors: number }>;
}> {
  console.log('🧹 Starting data retention cleanup...');

  const weeklyDataResult = await cleanupOldWeeklyData();
  const requestsResult = await cleanupOldDataSubjectRequests();
  const consentsResult = await cleanupOldConsentRecords();

  const totalDeleted = weeklyDataResult.deleted + requestsResult.deleted + consentsResult.deleted;
  const totalErrors = weeklyDataResult.errors + requestsResult.errors + consentsResult.errors;

  console.log(`\n📊 Data Retention Cleanup Summary:`);
  console.log(`   Total records deleted: ${totalDeleted}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   - Weekly data: ${weeklyDataResult.deleted} deleted`);
  console.log(`   - Data subject requests: ${requestsResult.deleted} deleted`);
  console.log(`   - Consent records: ${consentsResult.deleted} deleted`);
  console.log(`   - Audit logs: Automatic (TTL index handles cleanup after 2 years)\n`);

  return {
    totalDeleted,
    totalErrors,
    details: {
      weeklyData: weeklyDataResult,
      dataSubjectRequests: requestsResult,
      consentRecords: consentsResult,
    },
  };
}

/**
 * Get data retention statistics (for compliance reporting)
 */
export async function getDataRetentionStats(): Promise<{
  weeklyDataCount: number;
  oldestWeeklyData: Date | null;
  auditLogCount: number;
  oldestAuditLog: Date | null;
  dataSubjectRequestCount: number;
  consentRecordCount: number;
}> {
  try {
    const [weeklyDataCount, oldestWeeklyDataDoc, auditLogCount, oldestAuditLogDoc, requestCount, consentCount] =
      await Promise.all([
        prisma.weeklyData.count(),
        prisma.weeklyData.findFirst({ orderBy: { weekStartDate: 'asc' }, select: { weekStartDate: true } }),
        prisma.auditLog.count(),
        prisma.auditLog.findFirst({ orderBy: { timestamp: 'asc' }, select: { timestamp: true } }),
        prisma.dataSubjectRequest.count(),
        prisma.userConsent.count(),
      ]);

    return {
      weeklyDataCount,
      oldestWeeklyData: oldestWeeklyDataDoc?.weekStartDate || null,
      auditLogCount,
      oldestAuditLog: oldestAuditLogDoc?.timestamp || null,
      dataSubjectRequestCount: requestCount,
      consentRecordCount: consentCount,
    };
  } catch (error) {
    console.error('Error getting data retention stats:', error);
    throw error;
  }
}

/**
 * Check if any data is overdue for deletion (compliance alert)
 */
export async function checkOverdueData(): Promise<{
  hasOverdueData: boolean;
  overdueCategories: string[];
}> {
  const overdueCategories: string[] = [];

  try {
    // Check weekly data
    const cutoffWeeklyData = new Date();
    cutoffWeeklyData.setDate(cutoffWeeklyData.getDate() - RETENTION_PERIODS.WEEKLY_DATA);
    const overdueWeeklyData = await prisma.weeklyData.count({
      where: {
        weekStartDate: { lt: cutoffWeeklyData }
      }
    });
    if (overdueWeeklyData > 0) {
      overdueCategories.push(`Weekly Data (${overdueWeeklyData} records)`);
    }

    // Check data subject requests
    const cutoffRequests = new Date();
    cutoffRequests.setDate(cutoffRequests.getDate() - RETENTION_PERIODS.DATA_SUBJECT_REQUESTS);
    const overdueRequests = await prisma.dataSubjectRequest.count({
      where: {
        requestDate: { lt: cutoffRequests },
        status: { in: ['COMPLETED', 'REJECTED'] }
      }
    });
    if (overdueRequests > 0) {
      overdueCategories.push(`Data Subject Requests (${overdueRequests} records)`);
    }

    // Check consent records
    const cutoffConsents = new Date();
    cutoffConsents.setDate(cutoffConsents.getDate() - RETENTION_PERIODS.CONSENT_RECORDS);
    const overdueConsents = await prisma.userConsent.count({
      where: {
        consentDate: { lt: cutoffConsents }
      }
    });
    if (overdueConsents > 0) {
      overdueCategories.push(`Consent Records (${overdueConsents} records)`);
    }

    return {
      hasOverdueData: overdueCategories.length > 0,
      overdueCategories,
    };
  } catch (error) {
    console.error('Error checking overdue data:', error);
    throw error;
  }
}

// Export for CLI usage
if (require.main === module) {
  (async () => {
    try {
      await prisma.$connect();
      console.log('📦 Connected to database');

      const result = await runDataRetentionCleanup();

      if (result.totalErrors > 0) {
        console.error('⚠️  Some cleanup tasks failed');
        process.exit(1);
      }

      console.log('✅ Data retention cleanup completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}
