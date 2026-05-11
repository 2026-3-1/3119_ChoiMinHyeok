import { useState } from "react";
import { Link } from "react-router-dom";
import type { CurriculumChapter } from "../../shared/types";
import { formatDuration } from "../../shared/utils";

type ChapterAccordionProps = {
  chapter: CurriculumChapter;
  canWatch?: boolean;
  courseId?: number;
};

export function ChapterAccordion({ chapter, canWatch, courseId }: ChapterAccordionProps) {
  const [open, setOpen] = useState(true);

  return (
    <article className="chapter-card">
      <button
        type="button"
        className="chapter-card__header"
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          <strong>{chapter.title}</strong>
          <span>
            {chapter.lectures.length}개 강의 · {formatDuration(
              chapter.lectures.reduce((total, lecture) => total + lecture.duration, 0)
            )}
          </span>
        </div>
        <span>{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div className="chapter-card__body">
          {chapter.lectures.length > 0 ? (
            chapter.lectures.map((lecture) =>
              canWatch && courseId ? (
                <Link
                  key={lecture.id}
                  to={`/courses/${courseId}/learn/${lecture.id}`}
                  className="lecture-row lecture-row--link"
                >
                  <div>
                    <strong>{lecture.title}</strong>
                    <span>{formatDuration(lecture.duration)}</span>
                  </div>
                  <span>{lecture.is_published ? "공개" : "비공개"}</span>
                </Link>
              ) : (
                <div key={lecture.id} className="lecture-row">
                  <div>
                    <strong>{lecture.title}</strong>
                    <span>{formatDuration(lecture.duration)}</span>
                  </div>
                  <span>{lecture.is_published ? "공개" : "비공개"}</span>
                </div>
              )
            )
          ) : (
            <div className="lecture-row lecture-row--empty">
              <span>아직 등록된 강의가 없습니다.</span>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
