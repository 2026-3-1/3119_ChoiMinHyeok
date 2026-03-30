import type { Category } from "../../types/types";

type CategoryFilterProps = {
  categories: Category[];
  selected: number | null;
  onSelect: (categoryId: number | null) => void;
};

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="chip-row">
      <button
        type="button"
        className={selected === null ? "chip is-active" : "chip"}
        onClick={() => onSelect(null)}
      >
        전체
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={selected === category.id ? "chip is-active" : "chip"}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
