import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

const MainPage = lazy(() => import("./page/MainPage"));
const CoursePage = lazy(() => import("./page/CoursePage"));
const CourseDetailPage = lazy(() => import("./page/CourseDetailPage"));
const LecturePage = lazy(() => import("./page/LecturePage"));

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
    <Suspense fallback={<RouterFallback />}>
      <Outlet />
    </Suspense>
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
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
