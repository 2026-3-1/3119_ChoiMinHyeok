import { difficultyLabel } from "../types";
import type {
  Category,
  CurriculumChapter,
  Difficulty,
  Lecture,
} from "../types";

const difficultyAccentMap: Record<Difficulty, string> = {
  EASY: "#00ff88",
  MEDIUM: "#4dabff",
  HARD: "#ff6b6b",
};

const categoryAccentMap: Record<string, string> = {
  web: "#00ff88",
  pwn: "#4dabff",
  pentest: "#ffd166",
  network: "#4dabff",
  forensic: "#ffd166",
  reverse: "#ff6b6b",
  cloud: "#7cfcf7",
  ai: "#9bffb0",
  malware: "#ff8a8a",
};

const categoryIconMap: Record<string, string> = {
  web: "W",
  pwn: "PWN",
  pentest: "PT",
  network: "N",
  forensic: "F",
  reverse: "R",
  cloud: "C",
  ai: "AI",
  malware: "M",
};

export const formatDuration = (seconds: number): string => {
  if (!seconds) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${remainingSeconds}s`;
};

export const formatDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const getDifficultyLabel = (difficulty: Difficulty) =>
  difficultyLabel[difficulty];

export const getDifficultyAccent = (difficulty: Difficulty) =>
  difficultyAccentMap[difficulty];

export const getCategoryName = (
  categoryId: number,
  categories: Category[] | undefined
) => categories?.find((category) => category.id === categoryId)?.name ?? "미분류";

export const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) {
    return "SEC";
  }

  const normalizedName = categoryName.toLowerCase();

  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (normalizedName.includes(key)) {
      return icon;
    }
  }

  return categoryName.slice(0, 2).toUpperCase();
};

export const getCategoryAccent = (categoryName?: string) => {
  if (!categoryName) {
    return "#00ff88";
  }

  const normalizedName = categoryName.toLowerCase();

  for (const [key, accent] of Object.entries(categoryAccentMap)) {
    if (normalizedName.includes(key)) {
      return accent;
    }
  }

  return "#00ff88";
};

export const getYouTubeEmbedUrl = (videoUrl?: string) => {
  if (!videoUrl) {
    return null;
  }

  const match = videoUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);

  if (!match) {
    return null;
  }

  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
};

export const buildCurriculum = (
  chapters: { id: number; course_id: number; title: string; position: number }[],
  lectureGroups: Lecture[][]
): CurriculumChapter[] =>
  [...chapters]
    .sort((left, right) => left.position - right.position)
    .map((chapter, index) => ({
      ...chapter,
      lectures: [...(lectureGroups[index] ?? [])].sort(
        (left, right) => left.position - right.position
      ),
    }));

export const getCurriculumTotals = (curriculum: CurriculumChapter[]) => {
  let lectureCount = 0;
  let totalDuration = 0;

  curriculum.forEach((chapter) => {
    lectureCount += chapter.lectures.length;

    chapter.lectures.forEach((lecture) => {
      totalDuration += lecture.duration;
    });
  });

  return { lectureCount, totalDuration };
};

export const getFirstLecture = (curriculum: CurriculumChapter[]) =>
  curriculum.find((chapter) => chapter.lectures.length > 0)?.lectures[0] ?? null;
