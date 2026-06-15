import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./features/shared/context/AuthContext";

const MainPage = lazy(() => import("./page/MainPage"));
const CoursePage = lazy(() => import("./page/CoursePage"));
const CourseDetailPage = lazy(() => import("./page/CourseDetailPage"));
const LecturePage = lazy(() => import("./page/LecturePage"));
const LoginPage = lazy(() => import("./page/LoginPage"));
const RegisterPage = lazy(() => import("./page/RegisterPage"));
const MyLearningPage = lazy(() => import("./page/MyLearningPage"));
const MyPage = lazy(() => import("./page/MyPage"));
const CartPage = lazy(() => import("./page/CartPage"));
const PaymentPage = lazy(() => import("./page/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./page/PaymentSuccessPage"));
const PaymentFailPage = lazy(() => import("./page/PaymentFailPage"));

const InstructorCoursesPage = lazy(() => import("./page/instructor/InstructorCoursesPage"));
const InstructorCourseEditPage = lazy(() => import("./page/instructor/InstructorCourseEditPage"));
const InstructorCreateCoursePage = lazy(() => import("./page/instructor/InstructorCreateCoursePage"));

const BoardPage = lazy(() => import("./page/BoardPage"));
const BoardDetailPage = lazy(() => import("./page/BoardDetailPage"));
const BoardNewPage = lazy(() => import("./page/BoardNewPage"));

const AdminLoginPage = lazy(() => import("./page/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("./page/admin/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./page/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./page/admin/AdminUsersPage"));
const AdminCoursesPage = lazy(() => import("./page/admin/AdminCoursesPage"));
const AdminCategoriesPage = lazy(() => import("./page/admin/AdminCategoriesPage"));
const AdminReportsPage = lazy(() => import("./page/admin/AdminReportsPage"));

function RouterFallback() {
  return (
    <div className="app-loading">
      <div className="app-loading__mark">SEC101</div>
      <p>화면을 준비하는 중입니다...</p>
    </div>
  );
}

function RootLayout() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouterFallback />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "courses", element: <CoursePage /> },
      { path: "courses/:courseId", element: <CourseDetailPage /> },
      { path: "courses/:courseId/learn/:lectureId", element: <LecturePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "my-learning", element: <MyLearningPage /> },
      { path: "my-page", element: <MyPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "payment/success", element: <PaymentSuccessPage /> },
      { path: "payment/fail", element: <PaymentFailPage /> },

      // Board
      { path: "board", element: <BoardPage /> },
      { path: "board/new", element: <BoardNewPage /> },
      { path: "board/:postId", element: <BoardDetailPage /> },

      // Instructor
      { path: "instructor/courses", element: <InstructorCoursesPage /> },
      { path: "instructor/courses/new", element: <InstructorCreateCoursePage /> },
      { path: "instructor/courses/:courseId/edit", element: <InstructorCourseEditPage /> },

      // Admin login (standalone)
      { path: "admin/login", element: <AdminLoginPage /> },

      // Admin panel (with sidebar layout)
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "courses", element: <AdminCoursesPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
          { path: "reports", element: <AdminReportsPage /> },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<p>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>}>
      <RouterProvider router={router} />
    </Sentry.ErrorBoundary>
  );
}
