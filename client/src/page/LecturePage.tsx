import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLectureBookmark,
  getChapters,
  getCourseDetail,
  getLecture,
  getLectureBookmarks,
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
import type { LectureBookmark } from "../features/shared/types";

const PROGRESS_SAVE_INTERVAL_MS = 15_000;

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
  const currentPositionRef = useRef<number>(0);
  const watchedSecondsRef = useRef<number>(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", user?.id, numericLectureId],
    queryFn: () => getLectureBookmarks(user!.id, numericLectureId),
    enabled: isLoggedIn && !!user && Number.isFinite(numericLectureId),
    staleTime: 1000 * 60,
  });

  const progressMutation = useMutation({
    mutationFn: ({
      lastPosition,
      watchedSeconds,
      eventType,
    }: {
      lastPosition: number;
      watchedSeconds: number;
      eventType: "START" | "PROGRESS" | "PAUSE" | "COMPLETE";
    }) =>
      updateLectureProgress(numericLectureId, {
        userId: user!.id,
        lastPosition,
        watchedSeconds,
        eventType,
      }),
  });

  const addBookmarkMutation = useMutation({
    mutationFn: ({ position, note }: { position: number; note?: string }) =>
      createLectureBookmark(numericLectureId, {
        userId: user!.id,
        position,
        note,
      }),
    onSuccess: (updatedBookmarks) => {
      queryClient.setQueryData(
        ["bookmarks", user?.id, numericLectureId],
        updatedBookmarks
      );
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (bookmarkId: number) => removeLectureBookmark(user!.id, bookmarkId),
    onSuccess: (updatedBookmarks) => {
      queryClient.setQueryData(
        ["bookmarks", user?.id, numericLectureId],
        updatedBookmarks
      );
    },
  });

  const saveProgress = useCallback(
    (eventType: "START" | "PROGRESS" | "PAUSE" | "COMPLETE" = "PROGRESS") => {
      if (!isLoggedIn || !user) return;
      progressMutation.mutate({
        lastPosition: currentPositionRef.current,
        watchedSeconds: watchedSecondsRef.current,
        eventType,
      });
    },
    [isLoggedIn, user, progressMutation]
  );

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    saveProgress("START");

    progressTimerRef.current = setInterval(() => {
      watchedSecondsRef.current += PROGRESS_SAVE_INTERVAL_MS / 1000;
      saveProgress("PROGRESS");
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      saveProgress("PAUSE");
    };
  }, [numericLectureId, isLoggedIn, user]);

  const curriculum = buildCurriculum(
    chaptersQuery.data ?? [],
    lectureQueries.map((query) => query.data ?? [])
  );
  const lectureDetail = lectureDetailQuery.data;
  const currentLecture = lectureDetail?.lecture;
  const categoryName = courseQuery.data
    ? getCategoryName(courseQuery.data.category_id, categories)
    : "미분류";

  useEffect(() => {
    const activeChapterId = curriculum.find((chapter) =>
      chapter.lectures.some((lecture) => lecture.id === numericLectureId)
    )?.id;

    if (activeChapterId && !openChapterIds.includes(activeChapterId)) {
      setOpenChapterIds((current) => [...current, activeChapterId]);
    }
  }, [curriculum, numericLectureId, openChapterIds]);

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
        canMoveNext={Boolean(lectureDetail.nextLecture)}
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
          <LecturePlayerSection lecture={currentLecture} />

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
        </div>

        <LectureSidebarSection
          curriculum={curriculum}
          openChapterIds={openChapterIds}
          activeLectureId={currentLecture.id}
          onToggleChapter={toggleChapter}
          onMoveLecture={(nextLectureId) => moveToLecture(nextLectureId)}
        />
      </div>
    </div>
  );
}
