import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseBannerSection } from "../features/courses/sections/CourseBannerSection";
import { CourseResultsSection } from "../features/courses/sections/CourseResultsSection";
import { useCategories, useCourses } from "../features/shared/hooks/useCourseList";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { getCategoryName } from "../features/shared/utils";

const PAGE_SIZE = 12;

export default function CoursePage() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { data: categories = [] } = useCategories();
  const { data, isLoading, isFetching } = useCourses({
    categoryId: categoryId ?? undefined,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const courses =
    data?.data.map((course) => ({
      ...course,
      categoryName: getCategoryName(course.category_id, categories),
    })) ?? [];

  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <CourseBannerSection
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          isFetching={isFetching}
          total={total}
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={(nextCategoryId) => {
            setCategoryId(nextCategoryId);
            setPage(1);
          }}
        />

        <CourseResultsSection
          courses={courses}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onCourseClick={(courseId) => navigate(`/courses/${courseId}`)}
          onPrevPage={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          onNextPage={() =>
            setPage((currentPage) => Math.min(totalPages, currentPage + 1))
          }
        />
      </main>

      <SiteFooter />
    </div>
  );
}

