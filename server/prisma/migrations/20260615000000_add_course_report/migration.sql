-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('COPYRIGHT', 'WRONG_INFO', 'OTHER');

-- CreateTable
CREATE TABLE "course_report" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "ReportType" NOT NULL,
    "content" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_report_pkey" PRIMARY KEY ("id")
);
