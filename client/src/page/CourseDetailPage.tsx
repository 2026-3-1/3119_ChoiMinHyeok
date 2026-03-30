import { useNavigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getChapters, getCourseDetail, getLectures } from "../features/hooks/api";
import { useCategories } from "../features/hooks/useCourseList";
import { CourseCurriculumSection } from "../features/courseDetail/sections/CourseCurriculumSection";
import { CourseHeroSection } from "../features/courseDetail/sections/CourseHeroSection";
import { CourseSummarySection } from "../features/courseDetail/sections/CourseSummarySection";
import { SiteFooter } from "../features/layout/sections/SiteFooter";
import { SiteHeader } from "../features/layout/sections/SiteHeader";
import {
  buildCurriculum,
  getCategoryName,
  getCurriculumTotals,
  getDifficultyAccent,
  getFirstLecture,
} from "../features/utils/Utils";

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = Number(courseId);

  const { data: categories = [] } = useCategories();
  const courseQuery = useQuery({
    queryKey: ["course", numericCourseId],
    queryFn: () => getCourseDetail(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", numericCourseId],
    queryFn: () => getChapters(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const lectureQueries = useQueries({
    queries: (chaptersQuery.data ?? []).map((chapter) => ({
      queryKey: ["lectures", chapter.id],
      queryFn: () => getLectures(chapter.id),
      enabled: true,
    })),
  });

  const curriculum = buildCurriculum(
    chaptersQuery.data ?? [],
    lectureQueries.map((query) => query.data ?? [])
  );
  const totals = getCurriculumTotals(curriculum);
  const firstLecture = getFirstLecture(curriculum);
  const course = courseQuery.data;

  if (courseQuery.isLoading) {
    return <div className="app-loading">강의 정보를 불러오는 중...</div>;
  }

  if (!course) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container empty-state">
            <strong>강의를 찾을 수 없습니다.</strong>
            <p>`{courseId}` 에 해당하는 강의 데이터가 없습니다.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const categoryName = getCategoryName(course.category_id, categories);
  const accentColor = getDifficultyAccent(course.difficulty);

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <CourseHeroSection
          course={course}
          categoryName={categoryName}
          accentColor={accentColor}
          lectureCount={totals.lectureCount}
          totalDuration={totals.totalDuration}
          firstLecture={firstLecture}
          onStartLecture={(lectureId) =>
            navigate(`/courses/${course.id}/learn/${lectureId}`)
          }
        />

        <section className="section">
          <div className="site-container detail-layout">
            <CourseCurriculumSection
              curriculum={curriculum}
              lectureCount={totals.lectureCount}
            />
            <CourseSummarySection course={course} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
