import axios from "axios";
import type {
  ApiResponse,
  Category,
  Chapter,
  Course,
  CourseListData,
  Difficulty,
  Lecture,
  LectureDetail,
} from "../types";
import { normalizeSearchInput } from "../utils";

const MAX_COURSE_PAGE_LIMIT = 100;

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const api = axios.create({
  baseURL: configuredBaseUrl ? configuredBaseUrl.replace(/\/$/, "") : "",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;
  return response.data.data;
}

export const getCategories = async (): Promise<Category[]> =>
  unwrapResponse(api.get<ApiResponse<Category[]>>("/api/v1/categories"));

export interface CreateCategoryPayload {
  name: string;
}

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<void> =>
  unwrapResponse(api.post<ApiResponse<void>>("/api/v1/categories", payload));

export const getCourseByCategory = async (categoryId: number): Promise<Course[]> =>
  unwrapResponse(
    api.get<ApiResponse<Course[]>>(`/api/v1/categories/${categoryId}/courses`)
  );

export interface GetCoursesParams {
  search?: string;
  categoryId?: number;
  page: number;
  limit: number;
}

const normalizeGetCoursesParams = (
  params: GetCoursesParams
): GetCoursesParams => {
  const normalizedSearch = normalizeSearchInput(params.search ?? "").value.trim();
  const normalizedCategoryId =
    typeof params.categoryId === "number" &&
    Number.isInteger(params.categoryId) &&
    params.categoryId > 0
      ? params.categoryId
      : undefined;
  const normalizedPage =
    Number.isInteger(params.page) && params.page > 0 ? params.page : 1;
  const normalizedLimit =
    Number.isInteger(params.limit) && params.limit > 0
      ? Math.min(params.limit, MAX_COURSE_PAGE_LIMIT)
      : 12;

  return {
    search: normalizedSearch || undefined,
    categoryId: normalizedCategoryId,
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

export const getCourses = async (
  params: GetCoursesParams
): Promise<CourseListData> =>
  unwrapResponse(
    api.get<ApiResponse<CourseListData>>("/api/v1/courses", {
      params: normalizeGetCoursesParams(params),
    })
  );

export const getCourseDetail = async (courseId: number): Promise<Course> =>
  unwrapResponse(api.get<ApiResponse<Course>>(`/api/v1/courses/${courseId}`));

export interface CreateCoursePayload {
  title: string;
  description: string;
  instructorId: number;
  thumbnail: string;
  slug: string;
  difficulty: Difficulty;
  categoryId: number;
}

export const createCourse = async (payload: CreateCoursePayload): Promise<void> =>
  unwrapResponse(api.post<ApiResponse<void>>("/api/v1/courses", payload));

export const getChapters = async (courseId: number): Promise<Chapter[]> =>
  unwrapResponse(
    api.get<ApiResponse<Chapter[]>>(`/api/v1/courses/${courseId}/chapters`)
  );

export const getChapter = async (chapterId: number): Promise<Chapter> =>
  unwrapResponse(api.get<ApiResponse<Chapter>>(`/api/v1/chapters/${chapterId}`));

export interface CreateChapterPayload {
  title: string;
  courseId: number;
  position: number;
}

export const createChapter = async (payload: CreateChapterPayload): Promise<void> =>
  unwrapResponse(api.post<ApiResponse<void>>("/api/v1/chapters", payload));

export const getLectures = async (chapterId: number): Promise<Lecture[]> =>
  unwrapResponse(
    api.get<ApiResponse<Lecture[]>>(`/api/v1/chapters/${chapterId}/lectures`)
  );

export const getLecture = async (lectureId: number): Promise<LectureDetail> =>
  unwrapResponse(
    api.get<ApiResponse<LectureDetail>>(`/api/v1/lectures/${lectureId}`)
  );

export interface CreateLecturePayload {
  title: string;
  videoUrl: string;
  chapterId: number;
  thumbnailUrl: string;
  position: number;
  duration: number;
  isPublished: boolean;
}

export const createLecture = async (payload: CreateLecturePayload): Promise<void> =>
  unwrapResponse(api.post<ApiResponse<void>>("/api/v1/lectures", payload));

