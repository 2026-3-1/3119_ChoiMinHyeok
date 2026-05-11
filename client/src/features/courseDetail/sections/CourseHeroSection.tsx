import { Link } from "react-router-dom";
import type { Course, Lecture } from "../../shared/types";
import { formatDate, formatDuration, getDifficultyLabel } from "../../shared/utils";

type CourseHeroSectionProps = {
  course: Course;
  categoryName: string;
  accentColor: string;
  lectureCount: number;
  totalDuration: number;
  firstLecture: Lecture | null;
  isEnrolled?: boolean;
  isInCart?: boolean;
  progressPercent?: number;
  cartButtonLabel?: string;
  onCartAction?: () => void;
  onStartLecture: (lectureId: number) => void;
};

export function CourseHeroSection({
  course,
  categoryName,
  accentColor,
  lectureCount,
  totalDuration,
  firstLecture,
  isEnrolled = false,
  isInCart = false,
  progressPercent,
  cartButtonLabel,
  onCartAction,
  onStartLecture,
}: CourseHeroSectionProps) {
  return (
    <section className="page-banner">
      <div className="site-container detail-hero">
        <div className="detail-hero__content">
          <p className="eyebrow">강의 상세</p>
          <div className="detail-hero__meta">
            <span>{categoryName}</span>
            <span
              className="difficulty-pill"
              style={{
                borderColor: `${accentColor}66`,
                color: accentColor,
                backgroundColor: `${accentColor}1a`,
              }}
            >
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>

          <div className="detail-stats">
            <span>{lectureCount}개 강의</span>
            <span>{formatDuration(totalDuration)}</span>
            <span>최근 수정 {formatDate(course.updated_at)}</span>
            <span>슬러그 {course.slug}</span>
          </div>

          {isEnrolled && progressPercent !== undefined && (
            <div style={{ marginTop: 16 }}>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <p style={{ color: "#90a7bf", fontSize: "0.88rem", marginTop: 6 }}>
                진도율 {progressPercent}%
              </p>
            </div>
          )}
        </div>

        <aside className="detail-sidebar">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="detail-sidebar__image" />
          ) : (
            <div className="detail-sidebar__fallback">SEC101</div>
          )}

          <div className="detail-sidebar__panel">
            {isEnrolled ? (
              <>
                <strong>수강 중</strong>
                <p>이 강의를 수강 중입니다. 이어보기 버튼으로 학습을 계속하세요.</p>
              </>
            ) : isInCart ? (
              <>
                <strong>장바구니에 담겨 있습니다</strong>
                <p>결제 후 바로 학습을 시작할 수 있습니다.</p>
              </>
            ) : (
              <>
                <strong>학습 시작</strong>
                <p>장바구니에 담고 결제하면 바로 수강할 수 있습니다.</p>
              </>
            )}

            {onCartAction && cartButtonLabel ? (
              <button
                type="button"
                className="button button--primary"
                disabled={cartButtonLabel === "불러오는 중..." || cartButtonLabel === "강사 계정은 구매할 수 없습니다"}
                onClick={onCartAction}
              >
                {cartButtonLabel}
              </button>
            ) : (
              <button
                type="button"
                className="button button--primary"
                disabled={!firstLecture}
                onClick={() => firstLecture && onStartLecture(firstLecture.id)}
              >
                {firstLecture ? "첫 강의 보기" : "이용 가능한 강의 없음"}
              </button>
            )}

            <Link to="/courses" className="button button--ghost">
              목록으로 돌아가기
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
