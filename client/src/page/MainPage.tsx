import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  counterStats,
  heroCategories,
  heroStats,
  roadmapItems,
} from "../features/data";
import {
  useCategories,
  useCourses,
  useCoursesByCategory,
} from "../features/hooks/useCourseList";
import { FeaturedCoursesSection } from "../features/home/sections/FeaturedCoursesSection";
import { HeroSection } from "../features/home/sections/HeroSection";
import { RoadmapSection } from "../features/home/sections/RoadmapSection";
import { StatsSection } from "../features/home/sections/StatsSection";
import { SiteFooter } from "../features/layout/sections/SiteFooter";
import { SiteHeader } from "../features/layout/sections/SiteHeader";
import { getCategoryName } from "../features/utils/Utils";

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories = [] } = useCategories();
  const latestCoursesQuery = useCourses({
    page: 1,
    limit: 6,
  }, selectedCategoryId === null);
  const selectedCategoryCoursesQuery = useCoursesByCategory(selectedCategoryId);

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
