import axios from "axios";
import type {
  ApiResponse,
  CartSummary,
  Category,
  CancellationReason,
  Chapter,
  CourseLearningStatus,
  CourseListData,
  CourseReview,
  Course,
  Difficulty,
  Lecture,
  LectureBookmark,
  LectureDetail,
  LecturePlaybackEventType,
  LectureProgress,
  LearningCourseCard,
  Order,
  User,
} from "../types";
import { normalizeSearchInput } from "../utils";

const MAX_COURSE_PAGE_LIMIT = 100;

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const api = axios.create({
  baseURL: configuredBaseUrl ? configuredBaseUrl.replace(/\/$/, "") : "",
  withCredentials: true,
});

/* ─── In-memory access token ─────────────────────────────────────── */

let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

/* ─── Token refresh ──────────────────────────────────────────────── */

let _isRefreshing = false;
let _refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  _refreshSubscribers.push(cb);
}

function notifyRefreshSubscribers(token: string | null) {
  _refreshSubscribers.forEach((cb) => cb(token));
  _refreshSubscribers = [];
}

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${configuredBaseUrl ? configuredBaseUrl.replace(/\/$/, "") : ""}/api/v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = res.data.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
};

/* ─── Interceptors ───────────────────────────────────────────────── */

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      const newToken = await refreshAccessToken();
      _isRefreshing = false;
      notifyRefreshSubscribers(newToken);

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

/* ─── Helpers ────────────────────────────────────────────────────── */

async function unwrapResponse<T>(request: Promise<{ data: ApiResponse<T> }>) {
  const response = await request;
  return response.data.data;
}

/* ─── Categories ─────────────────────────────────────────────────── */

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

/* ─── Courses ────────────────────────────────────────────────────── */

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

/* ─── Chapters ───────────────────────────────────────────────────── */

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

/* ─── Lectures ───────────────────────────────────────────────────── */

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

/* ─── Auth ───────────────────────────────────────────────────────── */

interface AuthResult {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  roles: "STUDENT" | "INSTRUCTOR";
  description?: string;
}

export const register = async (payload: RegisterPayload): Promise<User> => {
  const result = await unwrapResponse(
    api.post<ApiResponse<AuthResult>>("/api/v1/auth/register", payload)
  );
  setAccessToken(result.accessToken);
  return result.user;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (payload: LoginPayload): Promise<User> => {
  const result = await unwrapResponse(
    api.post<ApiResponse<AuthResult>>("/api/v1/auth/login", payload)
  );
  setAccessToken(result.accessToken);
  return result.user;
};

export const logoutApi = async (): Promise<void> => {
  try {
    await api.post("/api/v1/auth/logout");
  } finally {
    setAccessToken(null);
  }
};

export const getUserProfile = async (userId: number): Promise<User> =>
  unwrapResponse(api.get<ApiResponse<User>>(`/api/v1/users/${userId}`));

/* ─── Commerce ───────────────────────────────────────────────────── */

export const getCart = async (userId: number): Promise<CartSummary> =>
  unwrapResponse(api.get<ApiResponse<CartSummary>>("/api/v1/cart", { params: { userId } }));

export const addToCart = async (userId: number, courseId: number): Promise<CartSummary> =>
  unwrapResponse(api.post<ApiResponse<CartSummary>>("/api/v1/cart/items", { userId, courseId }));

export const removeCartItem = async (userId: number, cartItemId: number): Promise<CartSummary> =>
  unwrapResponse(
    api.delete<ApiResponse<CartSummary>>(`/api/v1/cart/items/${cartItemId}`, {
      params: { userId },
    })
  );

export interface CheckoutPayload {
  userId: number;
  cartItemIds: number[];
  provider?: "TOSS" | "DEMO";
  paymentKey?: string;
  providerOrderId?: string;
}

export const checkoutCart = async (payload: CheckoutPayload): Promise<Order> =>
  unwrapResponse(api.post<ApiResponse<Order>>("/api/v1/orders/checkout", payload));

export const getOrders = async (userId: number): Promise<Order[]> =>
  unwrapResponse(api.get<ApiResponse<Order[]>>("/api/v1/orders", { params: { userId } }));

export interface CancelOrderPayload {
  userId: number;
  orderItemIds?: number[];
  reason: CancellationReason;
  reasonDetail?: string;
}

export const cancelOrder = async (orderId: number, payload: CancelOrderPayload): Promise<Order> =>
  unwrapResponse(api.post<ApiResponse<Order>>(`/api/v1/orders/${orderId}/cancel`, payload));

/* ─── Learning ───────────────────────────────────────────────────── */

export const getMyLearning = async (userId: number): Promise<LearningCourseCard[]> =>
  unwrapResponse(
    api.get<ApiResponse<LearningCourseCard[]>>(`/api/v1/users/${userId}/learning`)
  );

export const getCourseLearningStatus = async (
  userId: number,
  courseId: number
): Promise<CourseLearningStatus> =>
  unwrapResponse(
    api.get<ApiResponse<CourseLearningStatus>>(
      `/api/v1/users/${userId}/courses/${courseId}/learning-status`
    )
  );

export const getLectureProgress = async (
  userId: number,
  lectureId: number
): Promise<LectureProgress> =>
  unwrapResponse(
    api.get<ApiResponse<LectureProgress>>(`/api/v1/lectures/${lectureId}/progress`, {
      params: { userId },
    })
  );

export interface UpdateProgressPayload {
  userId: number;
  lastPosition: number;
  watchedSeconds: number;
  eventType: LecturePlaybackEventType;
}

export const updateLectureProgress = async (
  lectureId: number,
  payload: UpdateProgressPayload
): Promise<LectureProgress> =>
  unwrapResponse(
    api.put<ApiResponse<LectureProgress>>(`/api/v1/lectures/${lectureId}/progress`, payload)
  );

export const getLectureBookmarks = async (
  userId: number,
  lectureId: number
): Promise<LectureBookmark[]> =>
  unwrapResponse(
    api.get<ApiResponse<LectureBookmark[]>>(`/api/v1/lectures/${lectureId}/bookmarks`, {
      params: { userId },
    })
  );

export interface AddBookmarkPayload {
  userId: number;
  position: number;
  note?: string;
}

export const createLectureBookmark = async (
  lectureId: number,
  payload: AddBookmarkPayload
): Promise<LectureBookmark[]> =>
  unwrapResponse(
    api.post<ApiResponse<LectureBookmark[]>>(`/api/v1/lectures/${lectureId}/bookmarks`, payload)
  );

export const removeLectureBookmark = async (
  userId: number,
  bookmarkId: number
): Promise<LectureBookmark[]> =>
  unwrapResponse(
    api.delete<ApiResponse<LectureBookmark[]>>(`/api/v1/bookmarks/${bookmarkId}`, {
      params: { userId },
    })
  );

export const getCourseReviews = async (courseId: number): Promise<CourseReview[]> =>
  unwrapResponse(
    api.get<ApiResponse<CourseReview[]>>(`/api/v1/courses/${courseId}/reviews`)
  );

export interface CreateReviewPayload {
  userId: number;
  title: string;
  content: string;
  star: number;
}

export const createCourseReview = async (
  courseId: number,
  payload: CreateReviewPayload
): Promise<CourseReview[]> =>
  unwrapResponse(
    api.post<ApiResponse<CourseReview[]>>(`/api/v1/courses/${courseId}/reviews`, payload)
  );
