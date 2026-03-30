import type { CurriculumChapter } from "../../types/types";
import { formatDuration } from "../../utils/Utils";

type LectureSidebarSectionProps = {
  curriculum: CurriculumChapter[];
  openChapterIds: number[];
  activeLectureId: number;
  onToggleChapter: (chapterId: number) => void;
  onMoveLecture: (lectureId: number) => void;
};

export function LectureSidebarSection({
  curriculum,
  openChapterIds,
  activeLectureId,
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
                  {chapter.lectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      type="button"
                      className={
                        lecture.id === activeLectureId
                          ? "sidebar-lecture is-active"
                          : "sidebar-lecture"
                      }
                      onClick={() => onMoveLecture(lecture.id)}
                    >
                      <div>
                        <strong>{lecture.title}</strong>
                        <span>{formatDuration(lecture.duration)}</span>
                      </div>
                      <span>{lecture.position}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
