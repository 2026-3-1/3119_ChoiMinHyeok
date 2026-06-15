import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBoardPosts } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "학생",
  INSTRUCTOR: "강사",
  ADMIN: "관리자",
};

export default function BoardPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["board-posts", search, page],
    queryFn: () => getBoardPosts({ search: search || undefined, page, limit }),
  });

  const canWrite = isLoggedIn && (user?.role === "STUDENT" || user?.role === "ADMIN");
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main">
        <div className="site-container" style={{ maxWidth: 860 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>Q&A 게시판</h1>
            {canWrite && (
              <button
                className="button button--primary"
                style={{ fontSize: 14 }}
                onClick={() => navigate("/board/new")}
              >
                글 작성
              </button>
            )}
          </div>

          <input
            className="auth-form__input"
            placeholder="제목 또는 내용 검색"
            value={search}
            style={{ marginBottom: 20, maxWidth: 320 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          {isLoading ? (
            <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
          ) : !data || data.data.length === 0 ? (
            <div className="empty-state">
              <strong>게시글이 없습니다</strong>
              {canWrite && <p>첫 질문을 올려보세요!</p>}
            </div>
          ) : (
            <>
              <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 8, overflow: "hidden" }}>
                {data.data.map((post, i) => (
                  <Link
                    key={post.id}
                    to={`/board/${post.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 20px",
                      borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                      textDecoration: "none",
                      color: "inherit",
                      background: post.isAnnouncement ? "var(--surface-secondary)" : "transparent",
                    }}
                  >
                    {post.isAnnouncement && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 7px",
                        borderRadius: 4, background: "rgba(99,102,241,0.15)",
                        color: "var(--accent-primary)", flexShrink: 0,
                      }}>
                        공지
                      </span>
                    )}
                    <span style={{ flex: 1, fontWeight: post.isAnnouncement ? 600 : 400, fontSize: 15 }}>
                      {post.title}
                      {post.commentCount > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 13, color: "var(--accent-primary)" }}>
                          [{post.commentCount}]
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>
                      {post.author.name}
                      {post.author.role !== "STUDENT" && (
                        <span style={{ marginLeft: 4, fontSize: 11, color: "var(--accent-primary)" }}>
                          {ROLE_LABEL[post.author.role]}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                      {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </Link>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                <button
                  className="button button--ghost"
                  style={{ fontSize: 13, padding: "6px 16px" }}
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  이전
                </button>
                <span style={{ lineHeight: "36px", fontSize: 13, color: "var(--text-muted)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="button button--ghost"
                  style={{ fontSize: 13, padding: "6px 16px" }}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
