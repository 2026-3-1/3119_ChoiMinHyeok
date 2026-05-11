import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../../shared/api/api";
import { useAuth } from "../../shared/context/AuthContext";
import { formatDate } from "../../shared/utils";
import type { User } from "../../shared/types";

const roleLabel: Record<string, string> = {
  STUDENT: "수강생",
  INSTRUCTOR: "강사",
  ADMIN: "관리자",
};

interface Props {
  user: User;
  isInstructor: boolean;
  onLogout: () => void;
}

export function ProfileSection({ user, isInstructor, onLogout }: Props) {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [descInput, setDescInput] = useState(user.description ?? "");
  const [editError, setEditError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateUserProfile(user.id, {
        name: nameInput.trim() || undefined,
        description: descInput.trim(),
      }),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.setQueryData(["user-profile", user.id], updated);
      setEditMode(false);
      setEditError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setEditError(Array.isArray(msg) ? msg[0] : (msg ?? "프로필 수정에 실패했습니다."));
    },
  });

  const startEdit = () => {
    setNameInput(user.name);
    setDescInput(user.description ?? "");
    setEditError(null);
    setEditMode(true);
  };

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">My Page</p>
          <h2>마이페이지</h2>
        </div>
      </div>

      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#000",
              flexShrink: 0,
            }}
          >
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ fontSize: "1.1rem" }}>{user.name}</strong>
              <span
                className={`badge badge--${isInstructor ? "accent" : "neutral"}`}
                style={{ fontSize: "0.75rem" }}
              >
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 2 }}>
              {user.email}
            </p>
          </div>
          {!editMode && (
            <button
              className="button button--ghost"
              style={{ fontSize: 13, padding: "4px 12px" }}
              onClick={startEdit}
            >
              편집
            </button>
          )}
        </div>

        {editMode ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label className="auth-form__label">이름</label>
              <input
                className="auth-form__input"
                value={nameInput}
                maxLength={60}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="auth-form__label">소개</label>
              <textarea
                className="auth-form__input"
                style={{ minHeight: 80, resize: "vertical" }}
                value={descInput}
                maxLength={300}
                placeholder="자기소개를 입력하세요"
                onChange={(e) => setDescInput(e.target.value)}
              />
            </div>
            {editError && <p className="auth-form__error">{editError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="button button--primary"
                style={{ flex: 1 }}
                disabled={!nameInput.trim() || updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
              >
                {updateMutation.isPending ? "저장 중..." : "저장"}
              </button>
              <button
                className="button button--ghost"
                onClick={() => { setEditMode(false); setEditError(null); }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <div>
              <span style={{ color: "var(--text-muted)", marginRight: 8 }}>소개</span>
              {user.description || <em style={{ color: "var(--text-muted)" }}>소개가 없습니다</em>}
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", marginRight: 8 }}>가입일</span>
              {formatDate(user.created_at)}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button
            className="button button--ghost"
            style={{ fontSize: 13, color: "var(--error)" }}
            onClick={onLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </section>
  );
}
