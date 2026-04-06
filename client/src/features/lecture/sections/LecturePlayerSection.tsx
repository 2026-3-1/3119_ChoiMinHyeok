import type { Lecture } from "../../shared/types";
import { formatDuration, getYouTubeEmbedUrl } from "../../shared/utils";

type LecturePlayerSectionProps = {
  lecture: Lecture;
};

export function LecturePlayerSection({ lecture }: LecturePlayerSectionProps) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(lecture.video_url);

  return (
    <main className="player-main">
      <section className="player-video">
        {youtubeEmbedUrl ? (
          <iframe
            key={lecture.id}
            className="player-video__element"
            src={youtubeEmbedUrl}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : lecture.video_url ? (
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
          {lecture.video_url ? (
            <a href={lecture.video_url} target="_blank" rel="noreferrer">
              원본 링크 열기
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
