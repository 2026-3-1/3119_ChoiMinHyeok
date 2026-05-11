-- CreateTable
CREATE TABLE "lecture_attachment" (
    "id" SERIAL NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecture_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lecture_attachment_stored_name_key" ON "lecture_attachment"("stored_name");

-- CreateIndex
CREATE INDEX "lecture_attachment_lecture_id_idx" ON "lecture_attachment"("lecture_id");

-- AddForeignKey
ALTER TABLE "lecture_attachment" ADD CONSTRAINT "lecture_attachment_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
