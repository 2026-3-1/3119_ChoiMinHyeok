import type { Lecture } from "../../types/types";
import { formatDuration } from "../../utils/Utils";

type LecturePlayerSectionProps = {
  lecture: Lecture;
};

export function LecturePlayerSection({ lecture }: LecturePlayerSectionProps) {
  return (
    <main className="player-main">
      <section className="player-video">
        {lecture.video_url ? (
          <video
            key={lecture.id}
            controls
            autoPlay
            poster={lecture.thumbnail_url || undefined}
            className="player-video__element"
          >
            <source src={lecture.video_url} />
          </video>
        ) : (
          <div className="player-video__fallback">영상 주소가 비어 있습니다.</div>
        )}
      </section>

      <section className="player-info">
        <div>
          <p className="eyebrow">현재 강의</p>
          <h1>{lecture.title}</h1>
        </div>

        <div className="player-info__meta">
          <span>재생 시간 {formatDuration(lecture.duration)}</span>
          <span>순서 {lecture.position}</span>
          <span>{lecture.is_published ? "공개" : "비공개"}</span>
        </div>
      </section>
    </main>
  );
}
