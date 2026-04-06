export function CourseCardSkeleton() {
  return (
    <div className="course-card course-card--skeleton" aria-hidden="true">
      <div className="course-card__media skeleton-block" />
      <div className="course-card__body">
        <div className="skeleton-line skeleton-line--sm" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line--md" />
      </div>
    </div>
  );
}
