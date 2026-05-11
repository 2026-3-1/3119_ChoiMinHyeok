import { useRef } from "react";
import YouTube, { type YouTubePlayer, type YouTubeEvent } from "react-youtube";
import type { Lecture, LectureAttachment } from "../../shared/types";
import { formatDuration } from "../../shared/utils";

type LecturePlayerSectionProps = {
  lecture: Lecture;
  initialPosition?: number;
  onPositionChange?: (seconds: number) => void;
  onLectureEnd?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  attachments?: LectureAttachment[];
  onDownload?: (id: number, filename: string) => void;
};

// YouTube video ID 추출
function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function LecturePlayerSection({
  lecture,
  initialPosition,
  onPositionChange,
  onLectureEnd,
  onPlayStateChange,
  attachments = [],
  onDownload,
}: LecturePlayerSectionProps) {
  const videoId = extractYouTubeId(lecture.video_url);
  const playerRef = useRef<YouTubePlayer>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const positionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endFiredRef = useRef(false);

  // 강의 바뀌면 플래그 초기화는 key로 해결 (아래 key={lecture.id} 참고)

  const stopPositionTimer = () => {
    if (positionTimerRef.current) {
      clearInterval(positionTimerRef.current);
      positionTimerRef.current = null;
    }
  };

  const startPositionTimer = (player: YouTubePlayer) => {
    stopPositionTimer();
    positionTimerRef.current = setInterval(async () => {
      const currentTime = await player.getCurrentTime();
      onPositionChange?.(Math.floor(currentTime));
    }, 1000);
  };

  const handleReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
    // initialPosition이 있으면 해당 위치로 이동 후 재생
    if (initialPosition && initialPosition > 5) {
      e.target.seekTo(initialPosition, true);
    }
    e.target.playVideo();
  };

  const handlePlay = (e: YouTubeEvent) => {
    onPlayStateChange?.(true);
    startPositionTimer(e.target);
  };

  const handlePause = (e: YouTubeEvent) => {
    onPlayStateChange?.(false);
    stopPositionTimer();
    // 정확한 현재 위치 한 번 더 저장
    const t = e.target.getCurrentTime();
    onPositionChange?.(Math.floor(t));
  };

  const handleEnd = () => {
    onPlayStateChange?.(false);
    stopPositionTimer();
    if (!endFiredRef.current) {
      endFiredRef.current = true;
      onLectureEnd?.();
    }
  };

  const handleNativeEnded = () => {
    onPlayStateChange?.(false);
    if (!endFiredRef.current) {
      endFiredRef.current = true;
      onLectureEnd?.();
    }
  };

  return (
    <main className="player-main">
      <section className="player-video">
        {videoId ? (
          <YouTube
            key={lecture.id}
            videoId={videoId}
            className="player-video__element"
            iframeClassName="player-video__element"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 1,
                rel: 0,
                // start= 는 seekTo로 처리하므로 여기선 생략
              },
            }}
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnd={handleEnd}
          />
        ) : lecture.video_url ? (
          <video
            key={lecture.id}
            ref={videoRef}
            controls
            autoPlay
            poster={lecture.thumbnail_url || undefined}
            className="player-video__element"
            onLoadedMetadata={() => {
              if (initialPosition && initialPosition > 5 && videoRef.current) {
                videoRef.current.currentTime = initialPosition;
              }
            }}
            onPlay={() => onPlayStateChange?.(true)}
            onPause={() => onPlayStateChange?.(false)}
            onTimeUpdate={(e) => {
              onPositionChange?.(Math.floor(e.currentTarget.currentTime));
            }}
            onEnded={handleNativeEnded}
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

      {attachments.length > 0 && (
        <section className="player-attachments">
          <h3 className="player-attachments__title">강의 자료</h3>
          <ul className="player-attachments__list">
            {attachments.map((att) => (
              <li key={att.id} className="player-attachments__item">
                <span className="player-attachments__filename">{att.filename}</span>
                <span className="player-attachments__size">
                  {att.size < 1024 * 1024
                    ? `${(att.size / 1024).toFixed(1)} KB`
                    : `${(att.size / 1024 / 1024).toFixed(1)} MB`}
                </span>
                <button
                  className="button button--ghost"
                  style={{ minHeight: 32, padding: "0 12px", fontSize: "0.85rem" }}
                  onClick={() => onDownload?.(att.id, att.filename)}
                >
                  다운로드
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}