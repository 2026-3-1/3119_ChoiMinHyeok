import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { AuthProvider } from "./features/shared/context/AuthContext";

const MainPage = lazy(() => import("./page/MainPage"));
const CoursePage = lazy(() => import("./page/CoursePage"));
const CourseDetailPage = lazy(() => import("./page/CourseDetailPage"));
const LecturePage = lazy(() => import("./page/LecturePage"));
const LoginPage = lazy(() => import("./page/LoginPage"));
const RegisterPage = lazy(() => import("./page/RegisterPage"));
const MyLearningPage = lazy(() => import("./page/MyLearningPage"));
const CartPage = lazy(() => import("./page/CartPage"));

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
      { path: "cart", element: <CartPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
