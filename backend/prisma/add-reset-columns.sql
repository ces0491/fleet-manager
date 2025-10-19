-- Add reset token columns to User table
-- Safe to run multiple times due to IF NOT EXISTS checks

DO $$
BEGIN
    -- Add resetToken column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'resetToken'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
    END IF;

    -- Add resetTokenExpiry column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'resetTokenExpiry'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);
    END IF;
END $$;

-- Create unique index on resetToken if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'User_resetToken_key'
    ) THEN
        CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
    END IF;
END $$;
