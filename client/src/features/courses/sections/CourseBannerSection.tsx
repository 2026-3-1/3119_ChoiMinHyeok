import { CategoryFilter } from "../../shared/components/CategoryFilter";
import type { Category } from "../../shared/types";

type CourseBannerSectionProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isFetching: boolean;
  total: number;
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export function CourseBannerSection({
  searchInput,
  onSearchInputChange,
  isFetching,
  total,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CourseBannerSectionProps) {
  return (
    <section className="page-banner">
      <div className="site-container">
        <p className="eyebrow">강의 탐색</p>
        <h1>강의 목록</h1>
        <p>
          검색어, 카테고리 필터, 페이지네이션을 통해 원하는 강의를 빠르게 찾을 수 있습니다.
        </p>

        <div className="search-panel">
          <input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="제목 또는 설명으로 검색"
            aria-label="강의 검색"
          />
          <span>{isFetching ? "불러오는 중..." : `${total.toLocaleString()}개 강의`}</span>
        </div>

        <CategoryFilter
          categories={categories}
          selected={selectedCategoryId}
          onSelect={onSelectCategory}
        />
      </div>
    </section>
  );
}
