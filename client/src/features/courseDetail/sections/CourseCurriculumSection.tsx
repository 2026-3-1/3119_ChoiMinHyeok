import { ChapterAccordion } from "../components/ChapterAccordion";
import type { CurriculumChapter } from "../../shared/types";

type CourseCurriculumSectionProps = {
  curriculum: CurriculumChapter[];
  lectureCount: number;
};

export function CourseCurriculumSection({
  curriculum,
  lectureCount,
}: CourseCurriculumSectionProps) {
  return (
    <div className="detail-main">
      <div className="section-heading">
        <div>
          <p className="eyebrow">커리큘럼</p>
          <h2>챕터와 강의 구성</h2>
        </div>
        <p className="section-copy">
          총 {curriculum.length}개 챕터 / {lectureCount}개 강의
        </p>
      </div>

      <div className="chapter-list">
        {curriculum.length > 0 ? (
          curriculum.map((chapter) => (
            <ChapterAccordion key={chapter.id} chapter={chapter} />
          ))
        ) : (
          <div className="empty-state">
            <strong>커리큘럼이 아직 비어 있습니다.</strong>
            <p>서버에 챕터와 강의가 추가되면 이 영역에서 바로 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
