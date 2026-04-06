import {
  formatDate,
  getCategoryIcon,
  getDifficultyAccent,
  getDifficultyLabel,
} from "../utils";
import type { CourseCardItem } from "../types";

type CourseCardProps = {
  course: CourseCardItem;
  onClick?: (courseId: number) => void;
};

export function CourseCard({ course, onClick }: CourseCardProps) {
  const accentColor = getDifficultyAccent(course.difficulty);
  const categoryIcon = getCategoryIcon(course.categoryName);

  return (
    <button
      type="button"
      className="course-card"
      onClick={() => onClick?.(course.id)}
    >
      <div className="course-card__media">
        {course.thumbnail ? (
          <img
            className="course-card__image"
            src={course.thumbnail}
            alt={course.title}
          />
        ) : (
          <div className="course-card__placeholder">{categoryIcon}</div>
        )}

        <span
          className="course-card__badge"
          style={{
            borderColor: `${accentColor}66`,
            backgroundColor: `${accentColor}1a`,
            color: accentColor,
          }}
        >
          {getDifficultyLabel(course.difficulty)}
        </span>
      </div>

      <div className="course-card__body">
        <div className="course-card__meta">
          <span>{course.categoryName ?? "보안"}</span>
          <span>{formatDate(course.updated_at)}</span>
        </div>

        <h3>{course.title}</h3>
        <p>{course.description}</p>

        <div className="course-card__footer">
          <span className="course-card__symbol">{categoryIcon}</span>
          <span>
            {course.learners ? `${course.learners.toLocaleString()}명 수강` : "바로 학습 가능"}
          </span>
        </div>
      </div>
    </button>
  );
}
