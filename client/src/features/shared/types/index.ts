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

/* ─── User / Auth ──────────────────────────────────────────────── */

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole;
  description: string | null;
  created_at: string;
}

/* ─── Commerce ──────────────────────────────────────────────────── */

export type CartItemStatus = "ACTIVE" | "CHECKED_OUT" | "REMOVED";
export type OrderStatus = "PENDING" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "CANCELED";
export type OrderItemStatus = "ENROLLED" | "REFUNDED" | "CANCELED";
export type PaymentProvider = "TOSS" | "DEMO";
export type PaymentTransactionType = "PAYMENT" | "REFUND" | "CANCEL";
export type PaymentTransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type CancellationReason =
  | "USER_REQUEST"
  | "UNDER_ENROLLED"
  | "INSTRUCTOR_REQUEST"
  | "ADMIN_DECISION"
  | "SYSTEM";

export interface CommerceCourse {
  id: number;
  title: string;
  slug: string;
  price: number;
  thumbnail: string;
}

export interface CartItemResponse {
  id: number;
  status: CartItemStatus;
  added_at: string;
  course: CommerceCourse;
}

export interface CartSummary {
  items: CartItemResponse[];
  totalCount: number;
  totalAmount: number;
}

export interface PaymentTransactionResponse {
  id: number;
  provider: PaymentProvider;
  transaction_type: PaymentTransactionType;
  status: PaymentTransactionStatus;
  amount: number;
  payment_key: string | null;
  reason: string | null;
  created_at: string;
}

export interface OrderItemResponse {
  id: number;
  status: OrderItemStatus;
  price: number;
  refund_amount: number;
  cancellation_reason: CancellationReason | null;
  enrolled_at: string | null;
  course: CommerceCourse;
}

export interface Order {
  id: number;
  order_number: string;
  provider: PaymentProvider;
  status: OrderStatus;
  total_amount: number;
  paid_amount: number;
  refunded_amount: number;
  items: OrderItemResponse[];
  payment_transactions: PaymentTransactionResponse[];
  created_at: string;
}

/* ─── Learning ──────────────────────────────────────────────────── */

export interface LearningCourseCard {
  courseId: number;
  title: string;
  thumbnail: string;
  progressPercent: number;
  lastLectureId: number | null;
  lastPosition: number | null;
}

export interface CourseLearningStatus {
  userId: number;
  courseId: number;
  isEnrolled: boolean;
  progressPercent: number;
  totalWatchedSeconds: number;
  lectureCount: number;
  lastLectureId: number | null;
  lastPosition: number | null;
  canWriteReview: boolean;
  bookmarkCount: number;
}

export interface LectureProgress {
  userId: number;
  lectureId: number;
  lastPosition: number;
  watchedSeconds: number;
  progress: number;
  isCompleted: boolean;
}

export type LecturePlaybackEventType = "START" | "PROGRESS" | "PAUSE" | "SEEK" | "COMPLETE";

export interface LectureBookmark {
  id: number;
  position: number;
  note: string | null;
  created_at: string;
}

export interface ReviewUser {
  id: number;
  name: string;
  roles: UserRole;
}

export interface CourseReview {
  id: number;
  title: string;
  content: string;
  star: number;
  user: ReviewUser;
  created_at: string;
}
