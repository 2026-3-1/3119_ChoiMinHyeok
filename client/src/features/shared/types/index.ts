export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const difficultyLabel: Record<Difficulty, string> = {
  EASY: "입문",
  MEDIUM: "중급",
  HARD: "고급",
};

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
  thumbnail: string;
  difficulty: Difficulty;
  category_id: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CourseListData {
  data: Course[];
  count: number;
  page: number;
  limit: number;
}

export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  position: number;
}

export interface Lecture {
  id: number;
  chapter_id: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  position: number;
  is_published: boolean;
  created_at: string;
}

export interface LectureDetail {
  lecture: Lecture;
  nextLecture: number | null;
  prevLecture: number | null;
}

export interface CurriculumChapter extends Chapter {
  lectures: Lecture[];
}

export interface CategoryBadge {
  icon: string;
  label: string;
}

export interface CourseCardItem {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  thumbnail?: string;
  categoryName?: string;
  learners?: number;
  updated_at?: string;
}

export interface HeroCategory {
  icon: string;
  label: string;
  count: number;
  accent: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface CounterStat {
  end: number;
  suffix: string;
  label: string;
}

export interface RoadmapItem {
  icon: string;
  label: string;
  description: string;
}

export interface NavigationItem {
  label: string;
  to: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
