import type { CurriculumChapter } from "../../shared/types";
import { formatDuration } from "../../shared/utils";

type LectureSidebarSectionProps = {
  curriculum: CurriculumChapter[];
  openChapterIds: number[];
  activeLectureId: number;
  unlockedIds: Set<number>;
  onToggleChapter: (chapterId: number) => void;
  onMoveLecture: (lectureId: number) => void;
};

export function LectureSidebarSection({
  curriculum,
  openChapterIds,
  activeLectureId,
  unlockedIds,
  onToggleChapter,
  onMoveLecture,
}: LectureSidebarSectionProps) {
  return (
    <aside className="player-sidebar">
      <div className="player-sidebar__header">
        <p className="eyebrow">커리큘럼</p>
        <strong>{curriculum.length}개 챕터</strong>
      </div>

      <div className="player-sidebar__body">
        {curriculum.map((chapter) => {
          const isOpen = openChapterIds.includes(chapter.id);
          const isActive = chapter.lectures.some((lecture) => lecture.id === activeLectureId);

          return (
            <section key={chapter.id} className="sidebar-chapter">
              <button
                type="button"
                className={isActive ? "sidebar-chapter__toggle is-active" : "sidebar-chapter__toggle"}
                onClick={() => onToggleChapter(chapter.id)}
              >
                <div>
                  <strong>{chapter.title}</strong>
                  <span>{chapter.lectures.length}개 강의</span>
                </div>
                <span>{isOpen ? "-" : "+"}</span>
              </button>

              {isOpen ? (
                <div className="sidebar-chapter__list">
                  {chapter.lectures.map((lecture) => {
                    const isUnlocked = unlockedIds.has(lecture.id);
                    const isCurrentlyActive = lecture.id === activeLectureId;

                    return (
                      <button
                        key={lecture.id}
                        type="button"
                        className={[
                          "sidebar-lecture",
                          isCurrentlyActive ? "is-active" : "",
                          !isUnlocked ? "is-locked" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => onMoveLecture(lecture.id)}
                        disabled={!isUnlocked}
                        title={!isUnlocked ? "이전 강의를 먼저 완료해야 합니다" : undefined}
                      >
                        <div>
                          <strong>{lecture.title}</strong>
                          <span>{formatDuration(lecture.duration)}</span>
                        </div>
                        <span className="sidebar-lecture__status">
                          {!isUnlocked ? "🔒" : lecture.position}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
