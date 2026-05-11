import YouTube, { type YouTubeEvent } from "react-youtube";

type Props = {
  videoId: string;
  onDuration: (seconds: number) => void;
};

export function YouTubeDurationDetector({ videoId, onDuration }: Props) {
  const handleReady = (e: YouTubeEvent) => {
    const duration = Math.round(e.target.getDuration());
    if (duration > 0) {
      onDuration(duration);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <YouTube
        key={videoId}
        videoId={videoId}
        opts={{ width: "200", height: "112", playerVars: { autoplay: 0 } }}
        onReady={handleReady}
      />
    </div>
  );
}
