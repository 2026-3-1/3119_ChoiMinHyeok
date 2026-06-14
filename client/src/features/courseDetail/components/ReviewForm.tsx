import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCourseReview } from "../../shared/api/api";
import type { CourseReview } from "../../shared/types";

interface Props {
  courseId: number;
  userId: number;
  existingReview: CourseReview | null;
  onSuccess: () => void;
}

export function ReviewForm({ courseId, userId, existingReview, onSuccess }: Props) {
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [star, setStar] = useState(existingReview?.star ?? 5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingReview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(existingReview.title);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(existingReview.content);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStar(existingReview.star);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingReview?.id]);

  const isEditing = existingReview != null;

  const mutation = useMutation({
    mutationFn: () => createCourseReview(courseId, { userId, title, content, star }),
    onSuccess: () => {
      if (!isEditing) {
        setTitle("");
        setContent("");
        setStar(5);
      }
      setError(null);
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "리뷰 저장에 실패했습니다.");
    },
  });

  return (
    <form
      className="review-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
    >
      <p className="eyebrow">Review</p>
      <h3>{isEditing ? "내 리뷰 수정" : "리뷰 작성"}</h3>

      <div className="review-form__star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="review-form__star"
            onClick={() => setStar(n)}
            style={{ color: n <= star ? "#fbbf24" : "#374151" }}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
        <span style={{ color: "#90a7bf", marginLeft: 6 }}>{star}점</span>
      </div>

      <input
        className="auth-form__input"
        placeholder="제목 (최대 80자)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
        required
      />
      <textarea
        className="auth-form__input auth-form__textarea"
        placeholder="상세 리뷰를 작성해주세요 (최소 10자, 최대 1000자)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minLength={10}
        maxLength={1000}
        rows={4}
        required
      />

      {error && <p className="auth-form__error">{error}</p>}

      <button type="submit" className="button button--primary" disabled={mutation.isPending}>
        {mutation.isPending ? "저장 중..." : isEditing ? "수정하기" : "리뷰 등록"}
      </button>
    </form>
  );
}
