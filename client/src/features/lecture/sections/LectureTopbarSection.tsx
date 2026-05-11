import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type LectureTopbarSectionProps = {
  courseId?: string;
  courseTitle?: string;
  categoryName: string;
  lectureTitle: string;
  canMovePrev: boolean;
  canMoveNext: boolean;
  onPrevLecture: () => void;
  onNextLecture: () => void;
  extraActions?: ReactNode;
};

export function LectureTopbarSection({
  courseId,
  courseTitle,
  categoryName,
  lectureTitle,
  canMovePrev,
  canMoveNext,
  onPrevLecture,
  onNextLecture,
  extraActions,
}: LectureTopbarSectionProps) {
  const navigate = useNavigate();

  return (
    <header className="player-topbar">
      <div>
        <button
          type="button"
          className="player-topbar__back"
          onClick={() => navigate(courseId ? `/courses/${courseId}` : "/courses")}
        >
          ← 강의 상세로 돌아가기
        </button>
        <strong>{courseTitle ?? "강의 재생"}</strong>
        <span>
          {categoryName} · {lectureTitle}
        </span>
      </div>

      <div className="player-topbar__actions">
        {extraActions}
        <button
          type="button"
          className="button button--ghost"
          disabled={!canMovePrev}
          onClick={onPrevLecture}
        >
          이전
        </button>
        <button
          type="button"
          className="button button--primary"
          disabled={!canMoveNext}
          onClick={onNextLecture}
        >
          다음
        </button>
      </div>
    </header>
  );
}
