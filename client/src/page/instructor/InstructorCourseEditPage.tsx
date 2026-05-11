import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChapters, getInstructorCourses, getInstructorStudents } from "../../features/shared/api/api";
import { useAuth } from "../../features/shared/context/AuthContext";
import { SiteHeader } from "../../features/shared/layout/SiteHeader";
import { SiteFooter } from "../../features/shared/layout/SiteFooter";
import type { InstructorCourse } from "../../features/shared/types";
import { CourseInfoSection } from "../../features/instructor/sections/CourseInfoSection";
import { CourseCurriculumSection } from "../../features/instructor/sections/CourseCurriculumSection";
import { CourseStudentsSection } from "../../features/instructor/sections/CourseStudentsSection";

type Tab = "info" | "curriculum" | "students";

export default function InstructorCourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState<Tab>("info");

  const numericCourseId = Number(courseId);

  const { data: courses = [] } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: getInstructorCourses,
    enabled: isLoggedIn,
  });

  const course = courses.find((c) => c.id === numericCourseId) as InstructorCourse | undefined;

  const { data: chapters = [], refetch: refetchChapters } = useQuery({
    queryKey: ["chapters", numericCourseId],
    queryFn: () => getChapters(numericCourseId),
    enabled: tab === "curriculum" && !!numericCourseId,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["instructor-students", numericCourseId],
    queryFn: () => getInstructorStudents(numericCourseId),
    enabled: tab === "students" && !!numericCourseId,
  });

  if (!isLoggedIn) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: 60 }}>
              <strong>로그인이 필요합니다</strong>
              <button className="button button--primary" onClick={() => navigate("/login")}>
                로그인
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <div className="site-container">
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Instructor</p>
                <h2>{course?.title ?? "강의 편집"}</h2>
              </div>
              <button
                className="button button--ghost"
                onClick={() => navigate("/instructor/courses")}
              >
                ← 내 강의 목록
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 4,
                borderBottom: "1px solid var(--border-subtle)",
                marginBottom: 32,
              }}
            >
              {(["info", "curriculum", "students"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: tab === t ? 600 : 400,
                    color: tab === t ? "var(--accent-primary)" : "var(--text-muted)",
                    borderBottom:
                      tab === t ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t === "info" ? "기본 정보" : t === "curriculum" ? "챕터 / 강의" : "수강생"}
                </button>
              ))}
            </div>

            {tab === "info" && (
              <CourseInfoSection courseId={numericCourseId} course={course} />
            )}
            {tab === "curriculum" && (
              <CourseCurriculumSection
                courseId={numericCourseId}
                chapters={chapters}
                refetchChapters={refetchChapters}
              />
            )}
            {tab === "students" && (
              <CourseStudentsSection courseId={numericCourseId} students={students} />
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
