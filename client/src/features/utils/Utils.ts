import { difficultyLabel } from "../types/types";
import type {
  Category,
  CurriculumChapter,
  Difficulty,
  Lecture,
} from "../types/types";

const difficultyAccentMap: Record<Difficulty, string> = {
  EASY: "#00ff88",
  MEDIUM: "#4dabff",
  HARD: "#ff6b6b",
};

const categoryIconMap: Record<string, string> = {
  web: "W",
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
