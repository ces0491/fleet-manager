-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED');

-- CreateEnum
CREATE TYPE "AuditResource" AS ENUM ('VEHICLE', 'WEEKLY_DATA', 'USER', 'REPORT', 'AUTH', 'DATA_SUBJECT_REQUEST');

-- CreateEnum
CREATE TYPE "DataSubjectRequestType" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY', 'RESTRICTION', 'OBJECTION', 'CONSENT_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'DATA_PROCESSING', 'MARKETING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyData" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "cashCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onlineEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dieselExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tollsParking" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenanceRepairs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrips" INTEGER,
    "totalDistance" DOUBLE PRECISION,
    "averageRating" DOUBLE PRECISION,
    "notes" TEXT,
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource" "AuditResource" NOT NULL,
    "resourceId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSubjectRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "DataSubjectRequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "requestDetails" TEXT,
    "responseDetails" TEXT,
    "handledBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSubjectRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "withdrawalDate" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleNumber_idx" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_driverName_idx" ON "Vehicle"("driverName");

-- CreateIndex
CREATE INDEX "WeeklyData_weekStartDate_weekEndDate_idx" ON "WeeklyData"("weekStartDate", "weekEndDate");

-- CreateIndex
CREATE INDEX "WeeklyData_vehicleId_createdAt_idx" ON "WeeklyData"("vehicleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyData_vehicleId_weekStartDate_key" ON "WeeklyData"("vehicleId", "weekStartDate");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_timestamp_idx" ON "AuditLog"("resource", "resourceId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_timestamp_idx" ON "AuditLog"("action", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_userId_requestDate_idx" ON "DataSubjectRequest"("userId", "requestDate");

-- CreateIndex
CREATE INDEX "DataSubjectRequest_status_requestDate_idx" ON "DataSubjectRequest"("status", "requestDate");

-- CreateIndex
CREATE INDEX "UserConsent_userId_consentType_consentGiven_idx" ON "UserConsent"("userId", "consentType", "consentGiven");

-- CreateIndex
CREATE INDEX "UserConsent_userId_consentDate_idx" ON "UserConsent"("userId", "consentDate");

-- AddForeignKey
ALTER TABLE "WeeklyData" ADD CONSTRAINT "WeeklyData_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyData" ADD CONSTRAINT "WeeklyData_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "DataSubjectRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSubjectRequest" ADD CONSTRAINT "DataSubjectRequest_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
