import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLectureBookmark,
  createLectureComment,
  deleteLectureComment,
  downloadAttachment,
  getChapters,
  getCourseDetail,
  getLecture,
  getLectureAttachments,
  getLectureBookmarks,
  getLectureComments,
  getLectureProgress,
  getLectures,
  removeLectureBookmark,
  updateLectureProgress,
} from "../features/shared/api/api";
import { useCategories } from "../features/shared/hooks/useCourseList";
import { useAuth } from "../features/shared/context/AuthContext";
import { LecturePlayerSection } from "../features/lecture/sections/LecturePlayerSection";
import { LectureSidebarSection } from "../features/lecture/sections/LectureSidebarSection";
import { LectureTopbarSection } from "../features/lecture/sections/LectureTopbarSection";
import { buildCurriculum, getCategoryName, formatDuration } from "../features/shared/utils";
import type { LectureBookmark, LectureComment } from "../features/shared/types";

const PROGRESS_SAVE_INTERVAL_MS = 10_000;
const COMPLETION_THRESHOLD = 0.8;

function CommentSection({
  lectureId,
  currentUserId,
  isLoggedIn,
}: {
  lectureId: number;
  currentUserId?: number;
  isLoggedIn: boolean;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["lecture-comments", lectureId],
    queryFn: () => getLectureComments(lectureId),
    enabled: Number.isFinite(lectureId),
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => createLectureComment(lectureId, content),
    onSuccess: (newComment) => {
      queryClient.setQueryData<LectureComment[]>(
        ["lecture-comments", lectureId],
        (prev) => [newComment, ...(prev ?? [])],
      );
      setText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteLectureComment(lectureId, commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<LectureComment[]>(
        ["lecture-comments", lectureId],
        (prev) => (prev ?? []).filter((c) => c.id !== commentId),
      );
    },
  });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  return (
    <section className="player-comments">
      <h3 className="player-comments__title">댓글 {comments.length > 0 ? `(${comments.length})` : ""}</h3>

      {isLoggedIn && (
        <div className="player-comments__form">
          <textarea
            className="auth-form__input"
            style={{ resize: "vertical", minHeight: 72, fontSize: "0.9rem" }}
            placeholder="강의에 대한 질문이나 의견을 남겨보세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
            }}
            maxLength={1000}
          />
          <button
            className="button button--primary"
            style={{ alignSelf: "flex-end", minHeight: 36, padding: "0 20px", fontSize: "0.9rem" }}
            disabled={!text.trim() || addMutation.isPending}
            onClick={handleSubmit}
          >
            {addMutation.isPending ? "등록 중..." : "등록"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>댓글 불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>아직 댓글이 없습니다.</p>
      ) : (
        <ul className="player-comments__list">
          {comments.map((c) => (
            <li key={c.id} className="player-comment">
              <div className="player-comment__header">
                <span className="player-comment__author">{c.user.name}</span>
                <span className="player-comment__date">
                  {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                </span>
                {currentUserId === c.user.id && (
                  <button
                    className="player-comment__delete"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(c.id)}
                    aria-label="댓글 삭제"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="player-comment__content">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BookmarkPanel({
  bookmarks,
  isLoading,
  onAdd,
  onRemove,
  currentPosition,
  isAdding,
}: {
  bookmarks: LectureBookmark[];
  isLoading: boolean;
  onAdd: (position: number, note?: string) => void;
  onRemove: (bookmarkId: number) => void;
  currentPosition: number;
  isAdding: boolean;
}) {
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    onAdd(currentPosition, note.trim() || undefined);
    setNote("");
    setShowForm(false);
  };

  return (
    <div className="bookmark-panel">
      <div className="bookmark-panel__header">
        <strong>북마크</strong>
        <button
          className="button button--ghost"
          style={{ minHeight: 34, padding: "0 12px", fontSize: "0.88rem" }}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "취소" : "+ 추가"}
        </button>
      </div>

      {showForm && (
        <div className="bookmark-panel__form">
          <input
            className="auth-form__input"
            style={{ minHeight: 36, fontSize: "0.9rem" }}
            placeholder={`${formatDuration(currentPosition)} 구간 메모 (선택)`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
          />
          <button
            className="button button--primary"
            style={{ width: "100%", minHeight: 36 }}
            onClick={handleAdd}
            disabled={isAdding}
          >
            {isAdding ? "저장 중..." : "북마크 저장"}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="bookmark-panel__empty">불러오는 중...</p>
      ) : bookmarks.length === 0 ? (
        <p className="bookmark-panel__empty">북마크가 없습니다</p>
      ) : (
        <ul className="bookmark-list">
          {bookmarks.map((bm) => (
            <li key={bm.id} className="bookmark-item">
              <span className="bookmark-item__time">{formatDuration(bm.position)}</span>
              <span className="bookmark-item__note">{bm.note ?? "메모 없음"}</span>
              <button
                className="bookmark-item__remove"
                onClick={() => onRemove(bm.id)}
                aria-label="북마크 삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LecturePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const numericCourseId = Number(courseId);
  const numericLectureId = Number(lectureId);
  const { user, isLoggedIn } = useAuth();

  const [openChapterIds, setOpenChapterIds] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const currentPositionRef = useRef<number>(0);
  const watchedSecondsRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const currentLectureDurationRef = useRef<number>(0);
  const completionFiredRef = useRef<boolean>(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalStartTimeRef = useRef<number>(0);

  const { data: categories = [] } = useCategories();

  const courseQuery = useQuery({
    queryKey: ["course", numericCourseId],
    queryFn: () => getCourseDetail(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", numericCourseId],
    queryFn: () => getChapters(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const lectureQueries = useQueries({
    queries: (chaptersQuery.data ?? []).map((chapter) => ({
      queryKey: ["lectures", chapter.id],
      queryFn: () => getLectures(chapter.id),
      enabled: true,
    })),
  });

  const lectureDetailQuery = useQuery({
    queryKey: ["lecture", numericLectureId],
    queryFn: () => getLecture(numericLectureId),
    enabled: Number.isFinite(numericLectureId),
  });

  const lectureDetail = lectureDetailQuery.data;
  const currentLecture = lectureDetail?.lecture;

  const lectureProgressQuery = useQuery({
    queryKey: ["lecture-progress", user?.id, numericLectureId],
    queryFn: () => getLectureProgress(user!.id, numericLectureId),
    enabled: isLoggedIn && !!user && Number.isFinite(numericLectureId),
    staleTime: Infinity,
  });

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", user?.id, numericLectureId],
    queryFn: () => getLectureBookmarks(user!.id, numericLectureId),
    enabled: isLoggedIn && !!user && Number.isFinite(numericLectureId),
    staleTime: 1000 * 60,
  });

  const attachmentsQuery = useQuery({
    queryKey: ["attachments", numericLectureId],
    queryFn: () => getLectureAttachments(numericLectureId),
    enabled: Number.isFinite(numericLectureId),
  });

  const progressMutation = useMutation({
    mutationFn: ({
      lastPosition,
      watchedSeconds,
      eventType,
    }: {
      lastPosition: number;
      watchedSeconds: number;
      eventType: "STARTED" | "PROGRESS" | "RESUMED" | "COMPLETED";
    }) =>
      updateLectureProgress(numericLectureId, {
        userId: user!.id,
        lastPosition,
        watchedSeconds,
        eventType,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["lecture-progress", user?.id, numericLectureId], saved);
    },
  });

  const addBookmarkMutation = useMutation({
    mutationFn: ({ position, note }: { position: number; note?: string }) =>
      createLectureBookmark(numericLectureId, {
        userId: user!.id,
        position,
        note,
      }),
    onSuccess: (updatedBookmarks) => {
      queryClient.setQueryData(["bookmarks", user?.id, numericLectureId], updatedBookmarks);
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => removeLectureBookmark(user!.id, bookmarkId),
    onSuccess: (updatedBookmarks) => {
      queryClient.setQueryData(["bookmarks", user?.id, numericLectureId], updatedBookmarks);
    },
  });

  // wall-clock 보정 제거 → currentPositionRef는 onPositionChange(react-youtube)가 직접 업데이트
  const saveProgress = useCallback(
    (eventType: "STARTED" | "PROGRESS" | "RESUMED" | "COMPLETED" = "PROGRESS") => {
      if (!isLoggedIn || !user) return;
      const dur = currentLectureDurationRef.current;
      const lastPosition = Math.floor(
        dur > 0 ? Math.min(currentPositionRef.current, dur) : currentPositionRef.current
      );
      progressMutation.mutate({
        lastPosition,
        watchedSeconds: Math.floor(watchedSecondsRef.current),
        eventType,
      });
    },
    [isLoggedIn, user, progressMutation]
  );

  const saveProgressRef = useRef(saveProgress);
  useEffect(() => { saveProgressRef.current = saveProgress; }, [saveProgress]);

  // 강의 바뀔 때 refs 초기화
  useEffect(() => {
    currentPositionRef.current = 0;
    watchedSecondsRef.current = 0;
    isPlayingRef.current = true;
    completionFiredRef.current = false;
  }, [numericLectureId]);

  // DB에서 불러온 진도로 refs 초기화
  useEffect(() => {
    if (lectureProgressQuery.data) {
      watchedSecondsRef.current = lectureProgressQuery.data.watchedSeconds;
      currentPositionRef.current = lectureProgressQuery.data.lastPosition;
    }
  }, [lectureProgressQuery.data]);

  useEffect(() => {
    currentLectureDurationRef.current = currentLecture?.duration ?? 0;
  }, [currentLecture]);

  useEffect(() => {
    if (!lectureProgressQuery.data || !currentLecture) return;
    const { watchedSeconds } = lectureProgressQuery.data;
    if (currentLecture.duration > 0 && watchedSeconds >= currentLecture.duration * COMPLETION_THRESHOLD) {
      setCompletedIds((prev) => {
        if (prev.has(numericLectureId)) return prev;
        return new Set([...prev, numericLectureId]);
      });
      completionFiredRef.current = true;
    }
  }, [lectureProgressQuery.data, currentLecture, numericLectureId]);

  // 진도 저장 인터벌 (watchedSeconds만 누적, position은 ref에서 읽음)
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    if (lectureProgressQuery.isLoading) return;

    saveProgress("STARTED");

    intervalStartTimeRef.current = Date.now();
    progressTimerRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      const now = Date.now();
      const elapsedSeconds = (now - intervalStartTimeRef.current) / 1000;
      intervalStartTimeRef.current = now;

      console.log("elapsed:", elapsedSeconds, "watchedSeconds:", watchedSecondsRef.current);
      watchedSecondsRef.current += elapsedSeconds;

      saveProgress("PROGRESS");

      const dur = currentLectureDurationRef.current;
      if (dur > 0 && watchedSecondsRef.current >= dur * COMPLETION_THRESHOLD && !completionFiredRef.current) {
        completionFiredRef.current = true;
        setCompletedIds((prev) => {
          if (prev.has(numericLectureId)) return prev;
          return new Set([...prev, numericLectureId]);
        });
      }
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      saveProgress("PROGRESS");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericLectureId, isLoggedIn, user, lectureProgressQuery.isLoading]);

  // 페이지 언로드 시 keepalive fetch
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const handleBeforeUnload = () => {
      const dur = currentLectureDurationRef.current;
      const lastPosition = Math.floor(
        dur > 0 ? Math.min(currentPositionRef.current, dur) : currentPositionRef.current
      );
      fetch(`/api/v1/lectures/${numericLectureId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lastPosition,
          watchedSeconds: Math.floor(watchedSecondsRef.current),
          eventType: "PROGRESS",
        }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn, user, numericLectureId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const curriculum = useMemo(
    () => buildCurriculum(
      chaptersQuery.data ?? [],
      lectureQueries.map((query) => query.data ?? [])
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chaptersQuery.data, lectureQueries.map((q) => q.dataUpdatedAt ?? 0).join(",")]
  );

  const orderedLectures = useMemo(
    () => curriculum.flatMap((ch) => ch.lectures),
    [curriculum]
  );

  useEffect(() => {
    if (orderedLectures.length === 0) return;
    const currentIdx = orderedLectures.findIndex((l) => l.id === numericLectureId);
    if (currentIdx < 0) return;
    setUnlockedIds((prev) => {
      let needsUpdate = false;
      for (let i = 0; i <= currentIdx; i++) {
        if (!prev.has(orderedLectures[i].id)) { needsUpdate = true; break; }
      }
      if (!needsUpdate) return prev;
      const next = new Set(prev);
      for (let i = 0; i <= currentIdx; i++) next.add(orderedLectures[i].id);
      return next;
    });
  }, [orderedLectures, numericLectureId]);

  const unlockNext = useCallback(
    (completedId: number) => {
      const idx = orderedLectures.findIndex((l) => l.id === completedId);
      if (idx >= 0 && idx + 1 < orderedLectures.length) {
        setUnlockedIds((prev) => {
          const nextId = orderedLectures[idx + 1].id;
          if (prev.has(nextId)) return prev;
          return new Set([...prev, nextId]);
        });
      }
    },
    [orderedLectures]
  );

  useEffect(() => {
    completedIds.forEach((id) => unlockNext(id));
  }, [completedIds, unlockNext]);

  const categoryName = courseQuery.data
    ? getCategoryName(courseQuery.data.category_id, categories)
    : "미분류";

  useEffect(() => {
    const activeChapterId = curriculum.find((chapter) =>
      chapter.lectures.some((lecture) => lecture.id === numericLectureId)
    )?.id;
    if (activeChapterId) {
      setOpenChapterIds((current) =>
        current.includes(activeChapterId) ? current : [...current, activeChapterId]
      );
    }
  }, [curriculum, numericLectureId]);

  const toggleChapter = (chapterId: number) => {
    setOpenChapterIds((current) =>
      current.includes(chapterId)
        ? current.filter((value) => value !== chapterId)
        : [...current, chapterId]
    );
  };

  const moveToLecture = (targetLectureId: number | null) => {
    if (!targetLectureId || !courseId) return;
    navigate(`/courses/${courseId}/learn/${targetLectureId}`);
  };

  // react-youtube의 onPositionChange가 1초마다 정확한 값을 주므로 단순 대입
  const handlePositionChange = useCallback((seconds: number) => {
    currentPositionRef.current = seconds;
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    intervalStartTimeRef.current = Date.now();
    if (!playing) {
      console.log("일시정지 시점 watchedSeconds:", watchedSecondsRef.current);
      saveProgressRef.current("PROGRESS");
    } else {
      console.log("재생 시작");
    }
  }, []);

  const handleLectureEnd = useCallback(() => {
    if (!currentLecture) return;
    watchedSecondsRef.current = currentLecture.duration;
    currentPositionRef.current = currentLecture.duration;
    saveProgress("COMPLETED");

    if (!completionFiredRef.current) {
      completionFiredRef.current = true;
      setCompletedIds((prev) => {
        if (prev.has(currentLecture.id)) return prev;
        return new Set([...prev, currentLecture.id]);
      });
    }

    if (lectureDetail?.nextLecture) {
      moveToLecture(lectureDetail.nextLecture);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLecture, lectureDetail?.nextLecture, saveProgress]);

  if (lectureDetailQuery.isLoading) {
    return <div className="app-loading">강의 정보를 불러오는 중...</div>;
  }

  if (!currentLecture) {
    return (
      <div className="page-shell">
        <main className="page-main">
          <div className="site-container empty-state">
            <strong>강의를 찾을 수 없습니다.</strong>
            <p>`{lectureId}`에 해당하는 강의 데이터가 없습니다.</p>
            <Link
              to={courseId ? `/courses/${courseId}` : "/courses"}
              className="button button--primary"
            >
              강의 상세로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="player-page">
      <LectureTopbarSection
        courseId={courseId}
        courseTitle={courseQuery.data?.title}
        categoryName={categoryName}
        lectureTitle={currentLecture.title}
        canMovePrev={Boolean(lectureDetail.prevLecture)}
        canMoveNext={Boolean(lectureDetail.nextLecture) && completedIds.has(numericLectureId)}
        onPrevLecture={() => moveToLecture(lectureDetail.prevLecture)}
        onNextLecture={() => moveToLecture(lectureDetail.nextLecture)}
        extraActions={
          isLoggedIn ? (
            <button
              className={`button button--ghost${showBookmarks ? " is-active-btn" : ""}`}
              style={{ minHeight: 36, padding: "0 14px", fontSize: "0.88rem" }}
              onClick={() => setShowBookmarks((v) => !v)}
            >
              🔖 북마크
              {(bookmarksQuery.data?.length ?? 0) > 0 && (
                <span className="site-header__cart-badge" style={{ position: "static", marginLeft: 4 }}>
                  {bookmarksQuery.data!.length}
                </span>
              )}
            </button>
          ) : null
        }
      />

      <div className="player-layout">
        <div className="player-main">
          {lectureProgressQuery.isLoading ? (
            <div className="player-video player-video--loading">
              <span>이어보기 위치 불러오는 중...</span>
            </div>
          ) : (
            <LecturePlayerSection
              lecture={currentLecture}
              initialPosition={lectureProgressQuery.data?.lastPosition}
              onPositionChange={handlePositionChange}
              onLectureEnd={handleLectureEnd}
              onPlayStateChange={handlePlayStateChange}
              attachments={attachmentsQuery.data ?? []}
              onDownload={(id, filename) => downloadAttachment(id, filename)}
            />
          )}

          {showBookmarks && isLoggedIn && (
            <BookmarkPanel
              bookmarks={bookmarksQuery.data ?? []}
              isLoading={bookmarksQuery.isLoading}
              currentPosition={currentPositionRef.current}
              isAdding={addBookmarkMutation.isPending}
              onAdd={(position, note) => addBookmarkMutation.mutate({ position, note })}
              onRemove={(bookmarkId) => removeBookmarkMutation.mutate(bookmarkId)}
            />
          )}

          {!isLoggedIn && (
            <div className="empty-state" style={{ marginTop: 0 }}>
              <p>
                진도 저장 및 북마크 기능을 사용하려면{" "}
                <Link to="/login" className="auth-card__link">
                  로그인
                </Link>
                이 필요합니다.
              </p>
            </div>
          )}

          <CommentSection
            lectureId={numericLectureId}
            currentUserId={user?.id}
            isLoggedIn={isLoggedIn}
          />
        </div>

        <LectureSidebarSection
          curriculum={curriculum}
          openChapterIds={openChapterIds}
          activeLectureId={currentLecture.id}
          unlockedIds={unlockedIds}
          onToggleChapter={toggleChapter}
          onMoveLecture={(lectureId) => {
            if (unlockedIds.has(lectureId)) moveToLecture(lectureId);
          }}
        />
      </div>
    </div>
  );
}