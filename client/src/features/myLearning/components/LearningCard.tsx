import { useNavigate } from "react-router-dom";
import type { LearningCourseCard } from "../../shared/types";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export function LearningCard({ course }: { course: LearningCourseCard }) {
  const navigate = useNavigate();

  return (
    <div className="learning-card">
      <div className="learning-card__media">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="learning-card__image" />
        ) : (
          <div className="learning-card__placeholder">SEC</div>
        )}
        <div className="learning-card__progress-overlay">
          <span>{course.progressPercent}%</span>
        </div>
      </div>

      <div className="learning-card__body">
        <strong className="learning-card__title">{course.title}</strong>
        <ProgressBar value={course.progressPercent} />
        <p className="learning-card__meta">진도율 {course.progressPercent}%</p>
        <button
          className="button button--primary"
          style={{ width: "100%", marginTop: 4 }}
          onClick={() =>
            course.lastLectureId
              ? navigate(`/courses/${course.courseId}/learn/${course.lastLectureId}`)
              : navigate(`/courses/${course.courseId}`)
          }
        >
          {course.lastLectureId ? "이어보기" : "강의 시작하기"}
        </button>
      </div>
    </div>
  );
}
