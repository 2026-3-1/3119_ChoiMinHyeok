import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createBoardPost } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

export default function BoardNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createBoardPost({ title, content, announcement: isAnnouncement }),
    onSuccess: () => navigate("/board"),
  });

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main">
        <div className="site-container" style={{ maxWidth: 860 }}>
          <button
            className="button button--ghost"
            style={{ fontSize: 13, marginBottom: 20 }}
            onClick={() => navigate("/board")}
          >
            ← 목록으로
          </button>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
            {isAnnouncement ? "공지사항 작성" : "질문 작성"}
          </h1>

          {isAdmin && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", fontSize: 14 }}>
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
              />
              공지사항으로 등록
            </label>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>제목</label>
            <input
              className="auth-form__input"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>내용</label>
            <textarea
              className="auth-form__input"
              rows={12}
              placeholder="질문 내용을 자세하게 작성해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="button button--primary"
              disabled={mutation.isPending || !title.trim() || !content.trim()}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "등록 중..." : "등록"}
            </button>
            <button
              className="button button--ghost"
              onClick={() => navigate("/board")}
            >
              취소
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
