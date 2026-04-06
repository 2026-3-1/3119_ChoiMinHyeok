import type { Course } from "../../shared/types";
import { formatDate } from "../../shared/utils";

type CourseSummarySectionProps = {
  course: Course;
};

export function CourseSummarySection({ course }: CourseSummarySectionProps) {
  return (
    <aside className="detail-summary">
      <div className="summary-card">
        <p className="eyebrow">강의 요약</p>
        <ul>
          <li>강의 ID: {course.id}</li>
          <li>카테고리 ID: {course.category_id}</li>
          <li>강사 ID: {course.instructor_id}</li>
          <li>생성일: {formatDate(course.created_at)}</li>
        </ul>
      </div>
    </aside>
  );
}
