-- CreateEnum
CREATE TYPE "public"."UserNotifications" AS ENUM ('PUSH', 'EMAIL', 'BOTH', 'NONE');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "notificationMethod" "public"."UserNotifications" NOT NULL DEFAULT 'PUSH';
