-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CourseLifecycleStatus" AS ENUM ('OPEN', 'CANCELED');

-- CreateEnum
CREATE TYPE "CartItemStatus" AS ENUM ('ACTIVE', 'CHECKED_OUT', 'REMOVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'ENROLLED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('TOSS', 'DEMO');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('PAYMENT', 'REFUND', 'CANCEL');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('USER_REQUEST', 'COURSE_CANCELED', 'CAPACITY_EXCEEDED', 'UNDER_ENROLLED', 'OTHER');

-- CreateEnum
CREATE TYPE "EnrollmentHistoryType" AS ENUM ('ENROLLED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LecturePlaybackEventType" AS ENUM ('STARTED', 'PROGRESS', 'RESUMED', 'COMPLETED');

-- AlterTable
ALTER TABLE "course_comment" ADD COLUMN     "star" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "cancel_reason" "CancellationReason",
ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "max_capacity" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "min_enrollment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" "CourseLifecycleStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "lecture_comment" ADD COLUMN     "start" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" "Roles" NOT NULL,
    "description" TEXT DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "status" "CartItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "checked_out_at" TIMESTAMP(3),

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "order_number" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'TOSS',
    "provider_order_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" INTEGER NOT NULL,
    "paid_amount" INTEGER NOT NULL DEFAULT 0,
    "refunded_amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "enrolled_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "refund_amount" INTEGER NOT NULL DEFAULT 0,
    "cancellation_reason" "CancellationReason",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'TOSS',
    "transaction_type" "PaymentTransactionType" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" INTEGER NOT NULL,
    "payment_key" TEXT,
    "transaction_key" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "order_item_id" INTEGER,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_canceled" BOOLEAN NOT NULL DEFAULT false,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceled_at" TIMESTAMP(3),
    "cancellation_reason" "CancellationReason",

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_history" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "event_type" "EnrollmentHistoryType" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lectures_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "last_position" INTEGER NOT NULL DEFAULT 0,
    "watched_seconds" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lectures_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecture_playback_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "event_type" "LecturePlaybackEventType" NOT NULL,
    "from_second" INTEGER NOT NULL DEFAULT 0,
    "to_second" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecture_playback_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecture_bookmark" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "note" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecture_bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cart_items_user_id_status_idx" ON "cart_items"("user_id", "status");

-- CreateIndex
CREATE INDEX "cart_items_course_id_status_idx" ON "cart_items"("course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_status_idx" ON "order_items"("order_id", "status");

-- CreateIndex
CREATE INDEX "order_items_user_id_course_id_idx" ON "order_items"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "payment_transactions_order_id_created_at_idx" ON "payment_transactions"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_user_id_transaction_type_idx" ON "payment_transactions"("user_id", "transaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_order_item_id_key" ON "enrollments"("order_item_id");

-- CreateIndex
CREATE INDEX "enrollments_user_id_course_id_status_idx" ON "enrollments"("user_id", "course_id", "status");

-- CreateIndex
CREATE INDEX "enrollment_history_enrollment_id_created_at_idx" ON "enrollment_history"("enrollment_id", "created_at");

-- CreateIndex
CREATE INDEX "enrollment_history_user_id_course_id_created_at_idx" ON "enrollment_history"("user_id", "course_id", "created_at");

-- CreateIndex
CREATE INDEX "lectures_progress_lecture_id_progress_idx" ON "lectures_progress"("lecture_id", "progress");

-- CreateIndex
CREATE UNIQUE INDEX "lectures_progress_user_id_lecture_id_key" ON "lectures_progress"("user_id", "lecture_id");

-- CreateIndex
CREATE INDEX "lecture_playback_history_user_id_lecture_id_created_at_idx" ON "lecture_playback_history"("user_id", "lecture_id", "created_at");

-- CreateIndex
CREATE INDEX "lecture_bookmark_user_id_lecture_id_created_at_idx" ON "lecture_bookmark"("user_id", "lecture_id", "created_at");

-- CreateIndex
CREATE INDEX "course_comment_course_id_create_at_idx" ON "course_comment"("course_id", "create_at");

-- CreateIndex
CREATE UNIQUE INDEX "course_comment_user_id_course_id_key" ON "course_comment"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_history" ADD CONSTRAINT "enrollment_history_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_history" ADD CONSTRAINT "enrollment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_history" ADD CONSTRAINT "enrollment_history_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_comment" ADD CONSTRAINT "course_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_comment" ADD CONSTRAINT "course_comment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_comment" ADD CONSTRAINT "lecture_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_comment" ADD CONSTRAINT "lecture_comment_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures_progress" ADD CONSTRAINT "lectures_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures_progress" ADD CONSTRAINT "lectures_progress_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_playback_history" ADD CONSTRAINT "lecture_playback_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_playback_history" ADD CONSTRAINT "lecture_playback_history_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_bookmark" ADD CONSTRAINT "lecture_bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_bookmark" ADD CONSTRAINT "lecture_bookmark_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
