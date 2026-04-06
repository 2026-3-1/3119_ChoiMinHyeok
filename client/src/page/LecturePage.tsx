import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getChapters,
  getCourseDetail,
  getLecture,
  getLectures,
} from "../features/shared/api/api";
import { useCategories } from "../features/shared/hooks/useCourseList";
import { LecturePlayerSection } from "../features/lecture/sections/LecturePlayerSection";
import { LectureSidebarSection } from "../features/lecture/sections/LectureSidebarSection";
import { LectureTopbarSection } from "../features/lecture/sections/LectureTopbarSection";
import { buildCurriculum, getCategoryName } from "../features/shared/utils";

export default function LecturePage() {
  const navigate = useNavigate();
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const numericCourseId = Number(courseId);
  const numericLectureId = Number(lectureId);

  const [openChapterIds, setOpenChapterIds] = useState<number[]>([]);

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
    if (!targetLectureId || !courseId) {
      return;
    }

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
      />

      <div className="player-layout">
        <LecturePlayerSection lecture={currentLecture} />
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
