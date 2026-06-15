import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoardComment,
  deleteBoardComment,
  deleteBoardPost,
  getBoardPost,
  updateBoardComment,
  updateBoardPost,
} from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import type { BoardComment } from "../features/shared/types";

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  INSTRUCTOR: { label: "강사", color: "var(--accent-primary)" },
  ADMIN: { label: "관리자", color: "#f59e0b" },
};

export default function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const id = Number(postId);

  const { data: post, isLoading } = useQuery({
    queryKey: ["board-post", id],
    queryFn: () => getBoardPost(id),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["board-post", id] });

  const commentMutation = useMutation({
    mutationFn: () => createBoardComment(id, commentText),
    onSuccess: () => { setCommentText(""); invalidate(); },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deleteBoardPost(id),
    onSuccess: () => navigate("/board"),
  });

  const updatePostMutation = useMutation({
    mutationFn: () => updateBoardPost(id, { title: editTitle, content: editContent }),
    onSuccess: () => { setEditingPost(false); invalidate(); },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteBoardComment(id, commentId),
    onSuccess: invalidate,
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateBoardComment(id, commentId, content),
    onSuccess: () => { setEditingCommentId(null); invalidate(); },
  });

  const canModifyPost = (authorId: number) =>
    user?.id === authorId || user?.role === "ADMIN";

  const canModifyComment = (authorId: number) =>
    user?.id === authorId || user?.role === "ADMIN";

  if (isLoading) return (
    <div className="page-shell">
      <SiteHeader />
      <main className="page-main"><div className="site-container" style={{ color: "var(--text-muted)" }}>로딩 중...</div></main>
      <SiteFooter />
    </div>
  );

  if (!post) return null;

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

          {/* 게시글 */}
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "28px 32px", marginBottom: 24 }}>
            {editingPost ? (
              <div>
                <input
                  className="auth-form__input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ marginBottom: 12, fontWeight: 600, fontSize: 18 }}
                />
                <textarea
                  className="auth-form__input"
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "inherit", marginBottom: 12 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="button button--primary"
                    style={{ fontSize: 13 }}
                    disabled={updatePostMutation.isPending}
                    onClick={() => updatePostMutation.mutate()}
                  >
                    저장
                  </button>
                  <button
                    className="button button--ghost"
                    style={{ fontSize: 13 }}
                    onClick={() => setEditingPost(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    {post.isAnnouncement && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: "rgba(99,102,241,0.15)", color: "var(--accent-primary)",
                        marginRight: 8,
                      }}>
                        공지
                      </span>
                    )}
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{post.title}</span>
                  </div>
                  {canModifyPost(post.author.id) && (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 12, padding: "3px 10px" }}
                        onClick={() => {
                          setEditTitle(post.title);
                          setEditContent(post.content);
                          setEditingPost(true);
                        }}
                      >
                        수정
                      </button>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                        disabled={deletePostMutation.isPending}
                        onClick={() => {
                          if (window.confirm("게시글을 삭제하시겠습니까?"))
                            deletePostMutation.mutate();
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 20px" }}>
                  {post.author.name}
                  {ROLE_BADGE[post.author.role] && (
                    <span style={{ marginLeft: 4, color: ROLE_BADGE[post.author.role].color, fontSize: 11 }}>
                      {ROLE_BADGE[post.author.role].label}
                    </span>
                  )}
                  <span style={{ margin: "0 6px" }}>·</span>
                  {new Date(post.createdAt).toLocaleString("ko-KR")}
                </div>

                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15 }}>{post.content}</p>
              </>
            )}
          </div>

          {/* 댓글 */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              댓글 {post.comments.length}개
            </h3>

            {post.comments.map((c: BoardComment) => (
              <div
                key={c.id}
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  padding: "16px 0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                    {c.author.name}
                    {ROLE_BADGE[c.author.role] && (
                      <span style={{ marginLeft: 4, color: ROLE_BADGE[c.author.role].color, fontSize: 11 }}>
                        {ROLE_BADGE[c.author.role].label}
                      </span>
                    )}
                    <span style={{ margin: "0 6px" }}>·</span>
                    {new Date(c.createdAt).toLocaleString("ko-KR")}
                  </div>
                  {canModifyComment(c.author.id) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 11, padding: "2px 8px" }}
                        onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.content); }}
                      >
                        수정
                      </button>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 11, padding: "2px 8px", color: "var(--error)" }}
                        onClick={() => {
                          if (window.confirm("댓글을 삭제하시겠습니까?"))
                            deleteCommentMutation.mutate(c.id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === c.id ? (
                  <div>
                    <textarea
                      className="auth-form__input"
                      rows={3}
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      style={{ resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="button button--primary"
                        style={{ fontSize: 12 }}
                        disabled={updateCommentMutation.isPending}
                        onClick={() => updateCommentMutation.mutate({ commentId: c.id, content: editCommentText })}
                      >
                        저장
                      </button>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 12 }}
                        onClick={() => setEditingCommentId(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14 }}>{c.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* 댓글 작성 */}
          {isLoggedIn ? (
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
              <textarea
                className="auth-form__input"
                rows={4}
                placeholder="댓글을 입력하세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit", marginBottom: 10 }}
              />
              <button
                className="button button--primary"
                style={{ fontSize: 14 }}
                disabled={commentMutation.isPending || !commentText.trim()}
                onClick={() => commentMutation.mutate()}
              >
                댓글 등록
              </button>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
