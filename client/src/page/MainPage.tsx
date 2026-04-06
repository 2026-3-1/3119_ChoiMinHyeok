import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCourseByCategory } from "../features/shared/api/api";
import { roadmapItems } from "../features/shared/constants/data";
import {
  useCategories,
  useCourses,
  useCoursesByCategory,
} from "../features/shared/hooks/useCourseList";
import { FeaturedCoursesSection } from "../features/home/sections/FeaturedCoursesSection";
import { HeroSection } from "../features/home/sections/HeroSection";
import { RoadmapSection } from "../features/home/sections/RoadmapSection";
import { StatsSection } from "../features/home/sections/StatsSection";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import {
  getCategoryAccent,
  getCategoryIcon,
  getCategoryName,
} from "../features/shared/utils";

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories = [] } = useCategories();
  const catalogQuery = useCourses({
    page: 1,
    limit: 1,
  });
  const latestCoursesQuery = useCourses(
    {
      page: 1,
      limit: 6,
    },
    selectedCategoryId === null
  );
  const selectedCategoryCoursesQuery = useCoursesByCategory(selectedCategoryId);
  const categoryCourseQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["courses", "category", category.id, "hero"],
      queryFn: () => getCourseByCategory(category.id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const courses =
    selectedCategoryId === null
      ? latestCoursesQuery.data?.data ?? []
      : (selectedCategoryCoursesQuery.data ?? []).slice(0, 6);
  const isLoading =
    selectedCategoryId === null
      ? latestCoursesQuery.isLoading
      : selectedCategoryCoursesQuery.isLoading;

  const latestCourses = courses.map((course) => ({
    ...course,
    categoryName: getCategoryName(course.category_id, categories),
  }));

  const heroCategories = categories.map((category, index) => ({
    icon: getCategoryIcon(category.name),
    label: category.name.toUpperCase(),
    count: categoryCourseQueries[index]?.data?.length ?? 0,
    accent: getCategoryAccent(category.name),
  }));

  const totalCourses =
    catalogQuery.data?.count ?? heroCategories.reduce((sum, item) => sum + item.count, 0);

  const heroStats = useMemo(
    () => [
      { value: `${categories.length}`, label: "카테고리" },
      { value: `${totalCourses}`, label: "등록 코스" },
      { value: `${latestCourses.length}`, label: "메인 노출" },
    ],
    [categories.length, latestCourses.length, totalCourses]
  );

  const counterStats = useMemo(
    () => [
      { end: categories.length, suffix: "", label: "카테고리 수" },
      { end: totalCourses, suffix: "", label: "전체 코스 수" },
      { end: heroCategories.reduce((sum, item) => sum + item.count, 0), suffix: "", label: "카테고리별 코스 합계" },
      { end: latestCourses.length, suffix: "", label: "메인 표시 코스" },
    ],
    [categories.length, heroCategories, latestCourses.length, totalCourses]
  );

  return (
    <div className="page-shell">
      <SiteHeader />

      <main>
        <HeroSection stats={heroStats} categories={heroCategories} />
        <StatsSection stats={counterStats} />
        <FeaturedCoursesSection
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          courses={latestCourses}
          isLoading={isLoading}
          onCourseClick={(courseId) => navigate(`/courses/${courseId}`)}
        />
        <RoadmapSection items={roadmapItems} />
      </main>

      <SiteFooter />
    </div>
  );
}
