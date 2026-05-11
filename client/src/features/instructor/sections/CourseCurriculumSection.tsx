import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInstructorChapter,
  addInstructorLecture,
  deleteAttachment,
  deleteInstructorChapter,
  deleteInstructorLecture,
  getLectureAttachments,
  getLectures,
  updateInstructorChapter,
  updateInstructorLecture,
  uploadLectureAttachment,
} from "../../shared/api/api";
import type { Chapter, Lecture, LectureAttachment } from "../../shared/types";
import { YouTubeDurationDetector } from "../components/YouTubeDurationDetector";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type EditLectureForm = {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  position: number;
  isPublished: boolean;
};

type NewLectureForm = {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  position: number;
};

// ─── AttachmentPanel ──────────────────────────────────────────────────────────

function AttachmentPanel({ lectureId }: { lectureId: number }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["attachments", lectureId],
    queryFn: () => getLectureAttachments(lectureId),
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadLectureAttachment(lectureId, file),
    onSuccess: (added) => {
      queryClient.setQueryData<LectureAttachment[]>(
        ["attachments", lectureId],
        (prev) => [...(prev ?? []), added]
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: (_, attachmentId) => {
      queryClient.setQueryData<LectureAttachment[]>(
        ["attachments", lectureId],
        (prev) => (prev ?? []).filter((a) => a.id !== attachmentId)
      );
    },
  });

  return (
    <div
      style={{
        marginTop: 6,
        padding: "8px 12px",
        background: "var(--surface-primary)",
        borderRadius: 6,
        border: "1px solid var(--border-subtle)",
      }}
    >
      <button
        type="button"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
        }}
        onClick={() => setOpen((v) => !v)}
      >
        📎 강의 자료 {attachments.length > 0 ? `(${attachments.length})` : ""}
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          {isLoading ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>불러오는 중...</p>
          ) : attachments.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>업로드된 자료가 없습니다.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 8px", display: "grid", gap: 4 }}>
              {attachments.map((att) => (
                <li
                  key={att.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    padding: "4px 0",
                  }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    📄 {att.filename}
                  </span>
                  <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {formatBytes(att.size)}
                  </span>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--error)",
                      fontSize: 12,
                      padding: "0 4px",
                    }}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(att.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              style={{ fontSize: 12, flex: 1 }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
            {uploadMutation.isPending && (
              <span style={{ fontSize: 11, color: "var(--accent-primary)" }}>업로드 중...</span>
            )}
          </div>
          {uploadMutation.isError && (
            <p style={{ fontSize: 11, color: "var(--error)", marginTop: 4 }}>
              업로드에 실패했습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CourseCurriculumSection ──────────────────────────────────────────────────

type CourseCurriculumSectionProps = {
  courseId: number;
  chapters: Chapter[];
  refetchChapters: () => void;
};

export function CourseCurriculumSection({
  courseId,
  chapters,
  refetchChapters,
}: CourseCurriculumSectionProps) {
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [editChapterId, setEditChapterId] = useState<number | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterPosition, setEditChapterPosition] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [lecturesByChapter, setLecturesByChapter] = useState<Record<number, Lecture[]>>({});
  const [newLectureForms, setNewLectureForms] = useState<Record<number, NewLectureForm>>({});
  const [addLectureError, setAddLectureError] = useState<Record<number, string | null>>({});
  const [editLecture, setEditLecture] = useState<EditLectureForm | null>(null);
  const [newDetectTarget, setNewDetectTarget] = useState<{ chapterId: number; videoId: string } | null>(null);
  const [editDetectVideoId, setEditDetectVideoId] = useState<string | null>(null);

  const addChapterMutation = useMutation({
    mutationFn: () =>
      addInstructorChapter(courseId, {
        title: newChapterTitle,
        position: chapters.length + 1,
      }),
    onSuccess: () => {
      setNewChapterTitle("");
      refetchChapters();
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: ({ chapterId, title, position }: { chapterId: number; title: string; position: number }) =>
      updateInstructorChapter(courseId, chapterId, { title, position }),
    onSuccess: () => {
      setEditChapterId(null);
      refetchChapters();
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: number) => deleteInstructorChapter(courseId, chapterId),
    onSuccess: () => refetchChapters(),
  });

  const refreshChapterLectures = async (chapterId: number) => {
    const lectures = await getLectures(chapterId);
    setLecturesByChapter((prev) => ({ ...prev, [chapterId]: lectures }));
    return lectures;
  };

  const toggleChapter = async (chapterId: number) => {
    const next = new Set(expandedChapters);
    if (next.has(chapterId)) {
      next.delete(chapterId);
    } else {
      next.add(chapterId);
      if (!lecturesByChapter[chapterId]) {
        const lectures = await getLectures(chapterId);
        setLecturesByChapter((prev) => ({ ...prev, [chapterId]: lectures }));
        setNewLectureForms((prev) =>
          prev[chapterId]
            ? prev
            : {
                ...prev,
                [chapterId]: { title: "", videoUrl: "", thumbnailUrl: "", duration: 0, position: lectures.length + 1 },
              }
        );
      }
    }
    setExpandedChapters(next);
  };

  const addLectureMutation = useMutation({
    mutationFn: ({ chapterId, form }: { chapterId: number; form: NewLectureForm }) =>
      addInstructorLecture(chapterId, {
        title: form.title,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl || undefined,
        duration: form.duration,
        position: form.position,
      }),
    onSuccess: async (_, vars) => {
      const lectures = await refreshChapterLectures(vars.chapterId);
      setNewLectureForms((prev) => ({
        ...prev,
        [vars.chapterId]: { title: "", videoUrl: "", thumbnailUrl: "", duration: 0, position: lectures.length + 1 },
      }));
      setAddLectureError((prev) => ({ ...prev, [vars.chapterId]: null }));
      setNewDetectTarget(null);
    },
    onError: (err: unknown, vars) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : (msg ?? "강의 추가에 실패했습니다.");
      setAddLectureError((prev) => ({ ...prev, [vars.chapterId]: text }));
    },
  });

  const updateLectureMutation = useMutation({
    mutationFn: ({ lectureId, data }: { lectureId: number; data: EditLectureForm }) =>
      updateInstructorLecture(lectureId, {
        title: data.title,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl || undefined,
        duration: data.duration,
        position: data.position,
        isPublished: data.isPublished,
      }),
    onSuccess: async () => {
      if (editLecture) {
        const chapter = chapters.find((ch) =>
          lecturesByChapter[ch.id]?.some((l) => l.id === editLecture.id)
        );
        if (chapter) await refreshChapterLectures(chapter.id);
      }
      setEditLecture(null);
      setEditDetectVideoId(null);
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: ({ lectureId }: { lectureId: number; chapterId: number }) =>
      deleteInstructorLecture(lectureId),
    onSuccess: async (_, vars) => {
      await refreshChapterLectures(vars.chapterId);
    },
  });

  const handleNewVideoUrlChange = (chapterId: number, url: string) => {
    setNewLectureForms((f) => ({ ...f, [chapterId]: { ...f[chapterId], videoUrl: url } }));
    const videoId = extractYouTubeId(url);
    if (videoId) setNewDetectTarget({ chapterId, videoId });
    else if (newDetectTarget?.chapterId === chapterId) setNewDetectTarget(null);
  };

  const handleEditVideoUrlChange = (url: string) => {
    setEditLecture((l) => l && { ...l, videoUrl: url });
    setEditDetectVideoId(extractYouTubeId(url) ?? null);
  };

  return (
    <div>
      {/* Hidden YouTube duration detectors */}
      {newDetectTarget && (
        <YouTubeDurationDetector
          key={newDetectTarget.videoId}
          videoId={newDetectTarget.videoId}
          onDuration={(sec) => {
            setNewLectureForms((f) => ({
              ...f,
              [newDetectTarget.chapterId]: { ...f[newDetectTarget.chapterId], duration: sec },
            }));
            setNewDetectTarget(null);
          }}
        />
      )}
      {editDetectVideoId && (
        <YouTubeDurationDetector
          key={editDetectVideoId}
          videoId={editDetectVideoId}
          onDuration={(sec) => {
            setEditLecture((l) => l && { ...l, duration: sec });
            setEditDetectVideoId(null);
          }}
        />
      )}

      {/* New chapter input */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <input
          className="auth-form__input"
          style={{ maxWidth: 300 }}
          placeholder="새 챕터 제목"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newChapterTitle.trim() && addChapterMutation.mutate()}
        />
        <button
          className="button button--primary"
          disabled={!newChapterTitle.trim() || addChapterMutation.isPending}
          onClick={() => addChapterMutation.mutate()}
        >
          챕터 추가
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {chapters.map((ch) => (
          <div
            key={ch.id}
            style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}
          >
            {/* Chapter header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                background: "var(--surface-secondary)",
              }}
            >
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}
                onClick={() => toggleChapter(ch.id)}
              >
                {expandedChapters.has(ch.id) ? "▼" : "▶"}
              </button>

              {editChapterId === ch.id ? (
                <>
                  <input
                    className="auth-form__input"
                    style={{ flex: 1, maxWidth: 280 }}
                    placeholder="챕터 제목"
                    value={editChapterTitle}
                    onChange={(e) => setEditChapterTitle(e.target.value)}
                    autoFocus
                  />
                  <input
                    type="number"
                    className="auth-form__input"
                    style={{ width: 72 }}
                    placeholder="순서"
                    min={1}
                    value={editChapterPosition}
                    onChange={(e) => setEditChapterPosition(Number(e.target.value))}
                  />
                  <button
                    className="button button--primary"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                    disabled={updateChapterMutation.isPending}
                    onClick={() =>
                      updateChapterMutation.mutate({
                        chapterId: ch.id,
                        title: editChapterTitle,
                        position: editChapterPosition,
                      })
                    }
                  >
                    저장
                  </button>
                  <button
                    className="button button--ghost"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                    onClick={() => setEditChapterId(null)}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 600 }}>Ch.{ch.position} {ch.title}</span>
                  <button
                    className="button button--ghost"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => {
                      setEditChapterId(ch.id);
                      setEditChapterTitle(ch.title);
                      setEditChapterPosition(ch.position);
                    }}
                  >
                    편집
                  </button>
                  <button
                    className="button button--ghost"
                    style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                    onClick={() => deleteChapterMutation.mutate(ch.id)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>

            {/* Lectures */}
            {expandedChapters.has(ch.id) && (
              <div style={{ padding: "16px 20px" }}>
                {(lecturesByChapter[ch.id] ?? []).map((lec) => (
                  <div
                    key={lec.id}
                    style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    {editLecture?.id === lec.id ? (
                      // ── Edit mode ──
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <input
                            className="auth-form__input"
                            placeholder="제목"
                            value={editLecture.title}
                            onChange={(e) => setEditLecture((l) => l && { ...l, title: e.target.value })}
                          />
                          <div style={{ position: "relative" }}>
                            <input
                              className="auth-form__input"
                              placeholder="영상 URL"
                              value={editLecture.videoUrl}
                              onChange={(e) => handleEditVideoUrlChange(e.target.value)}
                            />
                            {editDetectVideoId && (
                              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--accent-primary)" }}>
                                감지 중...
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          className="auth-form__input"
                          placeholder="썸네일 URL (선택)"
                          value={editLecture.thumbnailUrl}
                          onChange={(e) => setEditLecture((l) => l && { ...l, thumbnailUrl: e.target.value })}
                        />
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input
                            type="number"
                            className="auth-form__input"
                            style={{ flex: "0 0 140px" }}
                            placeholder="재생시간(초)"
                            value={editLecture.duration || ""}
                            onChange={(e) => setEditLecture((l) => l && { ...l, duration: Number(e.target.value) })}
                          />
                          <input
                            type="number"
                            className="auth-form__input"
                            style={{ width: 90 }}
                            placeholder="순서"
                            min={1}
                            value={editLecture.position || ""}
                            onChange={(e) => setEditLecture((l) => l && { ...l, position: Number(e.target.value) })}
                          />
                          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            <input
                              type="checkbox"
                              checked={editLecture.isPublished}
                              onChange={(e) => setEditLecture((l) => l && { ...l, isPublished: e.target.checked })}
                            />
                            공개
                          </label>
                          <button
                            className="button button--primary"
                            style={{ fontSize: 12, padding: "3px 10px" }}
                            disabled={updateLectureMutation.isPending}
                            onClick={() => updateLectureMutation.mutate({ lectureId: lec.id, data: editLecture })}
                          >
                            저장
                          </button>
                          <button
                            className="button button--ghost"
                            style={{ fontSize: 12, padding: "3px 10px" }}
                            onClick={() => { setEditLecture(null); setEditDetectVideoId(null); }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ── View mode ──
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ flex: 1, fontSize: 14 }}>
                            {lec.position}. {lec.title}
                            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)" }}>
                              ({formatDuration(lec.duration)})
                            </span>
                            {!lec.is_published && (
                              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--error)" }}>비공개</span>
                            )}
                          </span>
                          <button
                            className="button button--ghost"
                            style={{ fontSize: 12, padding: "3px 10px" }}
                            onClick={() => {
                              setEditLecture({
                                id: lec.id,
                                title: lec.title,
                                videoUrl: lec.video_url,
                                thumbnailUrl: lec.thumbnail_url ?? "",
                                duration: lec.duration,
                                position: lec.position,
                                isPublished: lec.is_published,
                              });
                              setEditDetectVideoId(null);
                            }}
                          >
                            편집
                          </button>
                          <button
                            className="button button--ghost"
                            style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                            onClick={() => deleteLectureMutation.mutate({ lectureId: lec.id, chapterId: ch.id })}
                          >
                            삭제
                          </button>
                        </div>
                        {/* Attachment panel per lecture */}
                        <AttachmentPanel lectureId={lec.id} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add lecture form */}
                <div style={{ marginTop: 16, padding: 16, background: "var(--surface-secondary)", borderRadius: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text-muted)" }}>
                    강의 영상 추가
                  </p>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input
                        className="auth-form__input"
                        placeholder="제목"
                        value={newLectureForms[ch.id]?.title ?? ""}
                        onChange={(e) =>
                          setNewLectureForms((f) => ({ ...f, [ch.id]: { ...f[ch.id], title: e.target.value } }))
                        }
                      />
                      <div style={{ position: "relative" }}>
                        <input
                          className="auth-form__input"
                          placeholder="영상 URL (YouTube 또는 직접 링크)"
                          value={newLectureForms[ch.id]?.videoUrl ?? ""}
                          onChange={(e) => handleNewVideoUrlChange(ch.id, e.target.value)}
                        />
                        {newDetectTarget?.chapterId === ch.id && (
                          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "var(--accent-primary)" }}>
                            재생시간 감지 중...
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      className="auth-form__input"
                      placeholder="썸네일 URL (선택)"
                      value={newLectureForms[ch.id]?.thumbnailUrl ?? ""}
                      onChange={(e) =>
                        setNewLectureForms((f) => ({ ...f, [ch.id]: { ...f[ch.id], thumbnailUrl: e.target.value } }))
                      }
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 150 }}
                        placeholder="재생시간(초)"
                        min={1}
                        value={newLectureForms[ch.id]?.duration || ""}
                        onChange={(e) =>
                          setNewLectureForms((f) => ({
                            ...f,
                            [ch.id]: {
                              ...(f[ch.id] ?? { title: "", videoUrl: "", thumbnailUrl: "", duration: 0, position: 1 }),
                              duration: Number(e.target.value),
                            },
                          }))
                        }
                      />
                      <input
                        type="number"
                        className="auth-form__input"
                        style={{ width: 100 }}
                        placeholder="순서"
                        min={1}
                        value={newLectureForms[ch.id]?.position ?? ""}
                        onChange={(e) =>
                          setNewLectureForms((f) => ({
                            ...f,
                            [ch.id]: {
                              ...(f[ch.id] ?? { title: "", videoUrl: "", thumbnailUrl: "", duration: 0, position: 1 }),
                              position: Number(e.target.value),
                            },
                          }))
                        }
                      />
                      <button
                        className="button button--primary"
                        style={{ fontSize: 13 }}
                        disabled={
                          !newLectureForms[ch.id]?.title ||
                          !newLectureForms[ch.id]?.videoUrl ||
                          (newLectureForms[ch.id]?.duration ?? 0) < 1 ||
                          addLectureMutation.isPending
                        }
                        onClick={() => {
                          const form = newLectureForms[ch.id];
                          if (form) {
                            setAddLectureError((prev) => ({ ...prev, [ch.id]: null }));
                            addLectureMutation.mutate({ chapterId: ch.id, form });
                          }
                        }}
                      >
                        {addLectureMutation.isPending ? "추가 중..." : "추가"}
                      </button>
                    </div>
                    {addLectureError[ch.id] && (
                      <p className="auth-form__error" style={{ marginTop: 4 }}>
                        {addLectureError[ch.id]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {chapters.length === 0 && (
          <div className="empty-state">
            <strong>챕터가 없습니다</strong>
            <p>위에서 첫 챕터를 추가해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
