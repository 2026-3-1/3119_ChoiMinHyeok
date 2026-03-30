import { Link } from "react-router-dom";
import { CategoryFilter } from "../../courses/components/CategoryFilter";
import { CourseCard } from "../../main/components/CourseCard";
import type { Category, CourseCardItem } from "../../types/types";

type FeaturedCoursesSectionProps = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  courses: CourseCardItem[];
  isLoading: boolean;
  onCourseClick: (courseId: number) => void;
};

export function FeaturedCoursesSection({
  categories,
  selectedCategoryId,
  onSelectCategory,
  courses,
  isLoading,
  onCourseClick,
}: FeaturedCoursesSectionProps) {
  return (
    <section className="section" id="featured-courses">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">최신 강의</p>
            <h2>최신 강의</h2>
          </div>
          <Link to="/courses" className="button button--ghost">
            전체 강의 보기
          </Link>
        </div>

        <CategoryFilter
          categories={categories}
          selected={selectedCategoryId}
          onSelect={onSelectCategory}
        />

        <div className="course-grid">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="course-card course-card--skeleton" />
              ))
            : courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={onCourseClick}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
