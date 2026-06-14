import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  getCategories,
  updateInstructorCourse,
} from "../../shared/api/api";
import type { InstructorCourse } from "../../shared/types";

type CourseInfoSectionProps = {
  courseId: number;
  course: InstructorCourse | undefined;
};

export function CourseInfoSection({ courseId, course }: CourseInfoSectionProps) {
  const queryClient = useQueryClient();

  const [infoForm, setInfoForm] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    price: 0,
    maxCapacity: 30,
    thumbnail: "",
    categoryId: 0,
  });
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (course) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInfoForm({
        title: course.title,
        description: "",
        difficulty: course.difficulty,
        price: course.price,
        maxCapacity: course.maxCapacity,
        thumbnail: "",
        categoryId: 0,
      });
    }
  }, [course]);

  const updateCourseMutation = useMutation({
    mutationFn: () =>
      updateInstructorCourse(courseId, {
        title: infoForm.title || undefined,
        description: infoForm.description || undefined,
        difficulty: infoForm.difficulty as "EASY" | "MEDIUM" | "HARD",
        price: infoForm.price,
        maxCapacity: infoForm.maxCapacity,
        thumbnail: infoForm.thumbnail || undefined,
        categoryId: infoForm.categoryId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setInfoError(msg ?? "수정에 실패했습니다.");
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: () => createCategory({ name: newCatName.trim() }),
    onSuccess: (cat) => {
      queryClient.setQueryData<typeof categories>(["categories"], (prev) => [
        ...(prev ?? []),
        cat,
      ]);
      setInfoForm((f) => ({ ...f, categoryId: cat.id }));
      setNewCatName("");
      setShowNewCat(false);
    },
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="auth-form__field">
        <label className="auth-form__label">강의 제목</label>
        <input
          className="auth-form__input"
          value={infoForm.title}
          onChange={(e) => setInfoForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div className="auth-form__field">
        <label className="auth-form__label">설명</label>
        <textarea
          className="auth-form__input"
          style={{ minHeight: 100, resize: "vertical" }}
          value={infoForm.description}
          placeholder="강의 상세 설명 (선택)"
          onChange={(e) => setInfoForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="auth-form__field">
          <label className="auth-form__label">난이도</label>
          <select
            className="auth-form__input"
            value={infoForm.difficulty}
            onChange={(e) => setInfoForm((f) => ({ ...f, difficulty: e.target.value }))}
          >
            <option value="EASY">입문</option>
            <option value="MEDIUM">중급</option>
            <option value="HARD">고급</option>
          </select>
        </div>
        <div className="auth-form__field">
          <label className="auth-form__label">카테고리</label>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              className="auth-form__input"
              style={{ flex: 1 }}
              value={infoForm.categoryId}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, categoryId: Number(e.target.value) }))
              }
            >
              <option value={0}>선택 안함</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="button button--ghost"
              style={{ whiteSpace: "nowrap", fontSize: 13 }}
              onClick={() => setShowNewCat((v) => !v)}
            >
              + 새 카테고리
            </button>
          </div>
          {showNewCat && (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                className="auth-form__input"
                style={{ flex: 1 }}
                placeholder="카테고리 이름"
                value={newCatName}
                maxLength={50}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && newCatName.trim() && addCategoryMutation.mutate()
                }
              />
              <button
                type="button"
                className="button button--primary"
                style={{ fontSize: 13 }}
                disabled={!newCatName.trim() || addCategoryMutation.isPending}
                onClick={() => addCategoryMutation.mutate()}
              >
                {addCategoryMutation.isPending ? "추가 중..." : "추가"}
              </button>
              <button
                type="button"
                className="button button--ghost"
                style={{ fontSize: 13 }}
                onClick={() => {
                  setShowNewCat(false);
                  setNewCatName("");
                }}
              >
                취소
              </button>
            </div>
          )}
        </div>
        <div className="auth-form__field">
          <label className="auth-form__label">가격 (원)</label>
          <input
            type="number"
            min={0}
            className="auth-form__input"
            value={infoForm.price}
            onChange={(e) => setInfoForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
        </div>
        <div className="auth-form__field">
          <label className="auth-form__label">최대 수용 인원</label>
          <input
            type="number"
            min={1}
            className="auth-form__input"
            value={infoForm.maxCapacity}
            onChange={(e) =>
              setInfoForm((f) => ({ ...f, maxCapacity: Number(e.target.value) }))
            }
          />
        </div>
      </div>
      <div className="auth-form__field">
        <label className="auth-form__label">썸네일 URL</label>
        <input
          className="auth-form__input"
          placeholder="https://..."
          value={infoForm.thumbnail}
          onChange={(e) => setInfoForm((f) => ({ ...f, thumbnail: e.target.value }))}
        />
        {infoForm.thumbnail && (
          <img
            src={infoForm.thumbnail}
            alt="썸네일 미리보기"
            style={{
              marginTop: 8,
              width: "100%",
              maxHeight: 180,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid var(--border-subtle)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {infoError && <p className="auth-form__error">{infoError}</p>}
      {infoSuccess && (
        <p style={{ color: "var(--success)", marginBottom: 12 }}>강의가 수정되었습니다.</p>
      )}

      <button
        className="button button--primary"
        disabled={updateCourseMutation.isPending}
        onClick={() => {
          setInfoError(null);
          updateCourseMutation.mutate();
        }}
      >
        {updateCourseMutation.isPending ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
