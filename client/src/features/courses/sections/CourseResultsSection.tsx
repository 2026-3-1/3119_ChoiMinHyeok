import { CourseCardSkeleton } from "../../shared/components/CourseCardSkeleton";
import { CourseCard } from "../../shared/components/CourseCard";
import type { CourseCardItem } from "../../shared/types";

type CourseResultsSectionProps = {
  courses: CourseCardItem[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onCourseClick: (courseId: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function CourseResultsSection({
  courses,
  isLoading,
  isError,
  page,
  totalPages,
  onCourseClick,
  onPrevPage,
  onNextPage,
}: CourseResultsSectionProps) {
  return (
    <section className="section">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">검색 결과</p>
            <h2>필터링된 강의 결과</h2>
          </div>
          <p className="section-copy">
            {page} / {totalPages} 페이지
          </p>
        </div>

        {isError ? (
          <div className="empty-state">
            <strong>강의 목록을 불러오지 못했습니다</strong>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        ) : (
          <div className="course-grid">
            {isLoading
              ? Array.from({ length: 12 }, (_, index) => <CourseCardSkeleton key={index} />)
              : courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={onCourseClick}
                  />
                ))}
          </div>
        )}

        {!isLoading && !isError && courses.length === 0 ? (
          <div className="empty-state">
            <strong>조건에 맞는 강의가 없습니다.</strong>
            <p>검색어를 바꾸거나 카테고리 필터를 해제해서 다시 확인해 보세요.</p>
          </div>
        ) : null}

        <div className="pagination">
          <button
            type="button"
            className="button button--ghost"
            disabled={page <= 1}
            onClick={onPrevPage}
          >
            이전
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            type="button"
            className="button button--ghost"
            disabled={page >= totalPages}
            onClick={onNextPage}
          >
            다음
          </button>
        </div>
      </div>
    </section>
  );
}
