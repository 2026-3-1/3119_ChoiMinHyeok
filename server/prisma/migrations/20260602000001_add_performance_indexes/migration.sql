-- courses: 목록 조회 최적화 (status+created_at, category_id+status, instructor_id)
CREATE INDEX IF NOT EXISTS "courses_status_created_at_idx"   ON "courses"("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "courses_category_id_status_idx"  ON "courses"("category_id", "status");
CREATE INDEX IF NOT EXISTS "courses_instructor_id_idx"       ON "courses"("instructor_id");

-- lectures: 챕터별 조회 최적화
CREATE INDEX IF NOT EXISTS "lectures_chapter_id_idx"         ON "lectures"("chapter_id");
