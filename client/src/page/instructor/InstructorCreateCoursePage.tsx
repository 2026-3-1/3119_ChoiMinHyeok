import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategory, createInstructorCourse, getCategories } from "../../features/shared/api/api";
import { useAuth } from "../../features/shared/context/AuthContext";
import { SiteHeader } from "../../features/shared/layout/SiteHeader";
import { SiteFooter } from "../../features/shared/layout/SiteFooter";
import type { Difficulty } from "../../features/shared/types";

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "입문" },
  { value: "MEDIUM", label: "중급" },
  { value: "HARD", label: "고급" },
];

export default function InstructorCreateCoursePage() {
  const navigate = useNavigate();
  const { isLoggedIn, isInstructor } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "EASY" as Difficulty,
    price: 0,
    categoryId: 0,
    maxCapacity: 30,
    thumbnail: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const addCategoryMutation = useMutation({
    mutationFn: () => createCategory({ name: newCatName.trim() }),
    onSuccess: (cat) => {
      queryClient.setQueryData<typeof categories>(["categories"], (prev) => [...(prev ?? []), cat]);
      set("categoryId", cat.id);
      setNewCatName("");
      setShowNewCat(false);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createInstructorCourse({
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        price: form.price,
        categoryId: form.categoryId,
        maxCapacity: form.maxCapacity,
        thumbnail: form.thumbnail || undefined,
      }),
    onSuccess: (created) => {
      navigate(`/instructor/courses/${created.id}/edit`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : (msg ?? "강의 개설에 실패했습니다.");
      setError(text);
    },
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    form.title.length >= 2 &&
    form.description.length >= 10 &&
    form.categoryId > 0 &&
    form.maxCapacity >= 1 &&
    !createMutation.isPending;

  if (!isLoggedIn || !isInstructor) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: 60 }}>
              <strong>접근 권한이 없습니다</strong>
              <p>강사 계정으로 로그인해주세요.</p>
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
                <h2>새 강의 개설</h2>
              </div>
              <button
                className="button button--ghost"
                onClick={() => navigate("/instructor/courses")}
              >
                목록으로
              </button>
            </div>

            <div className="auth-card" style={{ maxWidth: 640, marginTop: 24 }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label className="auth-form__label">강의명 *</label>
                  <input
                    className="auth-form__input"
                    placeholder="예: 웹 해킹 기초"
                    value={form.title}
                    maxLength={255}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="auth-form__label">강의 설명 *</label>
                  <textarea
                    className="auth-form__input"
                    style={{ minHeight: 120, resize: "vertical" }}
                    placeholder="이 강의에서 배울 내용을 자세히 설명해주세요. (최소 10자)"
                    value={form.description}
                    maxLength={2000}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="auth-form__label">난이도 *</label>
                    <select
                      className="auth-form__input"
                      value={form.difficulty}
                      onChange={(e) => set("difficulty", e.target.value as Difficulty)}
                    >
                      {difficultyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="auth-form__label">카테고리 *</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <select
                        className="auth-form__input"
                        style={{ flex: 1 }}
                        value={form.categoryId}
                        onChange={(e) => set("categoryId", Number(e.target.value))}
                      >
                        <option value={0}>카테고리 선택</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                          onKeyDown={(e) => e.key === "Enter" && newCatName.trim() && addCategoryMutation.mutate()}
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
                          onClick={() => { setShowNewCat(false); setNewCatName(""); }}
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="auth-form__label">가격 (원) *</label>
                    <input
                      type="number"
                      className="auth-form__input"
                      min={0}
                      placeholder="0 (무료)"
                      value={form.price === 0 ? "" : form.price}
                      onChange={(e) => set("price", e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="auth-form__label">최대 수강 인원 *</label>
                    <input
                      type="number"
                      className="auth-form__input"
                      min={1}
                      max={10000}
                      value={form.maxCapacity}
                      onChange={(e) => set("maxCapacity", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="auth-form__label">썸네일 URL (선택)</label>
                  <input
                    className="auth-form__input"
                    placeholder="https://..."
                    value={form.thumbnail}
                    onChange={(e) => set("thumbnail", e.target.value)}
                  />
                  {form.thumbnail && (
                    <img
                      src={form.thumbnail}
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

                {error && <p className="auth-form__error">{error}</p>}

                <button
                  className="button button--primary"
                  style={{ width: "100%", minHeight: 44 }}
                  disabled={!canSubmit}
                  onClick={() => {
                    setError(null);
                    createMutation.mutate();
                  }}
                >
                  {createMutation.isPending ? "개설 중..." : "강의 개설하기"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
