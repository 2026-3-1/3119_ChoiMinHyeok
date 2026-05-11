import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kickInstructorStudent } from "../../shared/api/api";
import type { InstructorStudent } from "../../shared/types";

type CourseStudentsSectionProps = {
  courseId: number;
  students: InstructorStudent[];
};

export function CourseStudentsSection({ courseId, students }: CourseStudentsSectionProps) {
  const queryClient = useQueryClient();

  const kickStudentMutation = useMutation({
    mutationFn: (userId: number) => kickInstructorStudent(courseId, userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructor-students", courseId] }),
  });

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <strong>수강생이 없습니다</strong>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>수강 등록일</th>
            <th>진도율</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.enrollmentId}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{new Date(s.enrolledAt).toLocaleDateString("ko-KR")}</td>
              <td>-</td>
              <td>
                <button
                  className="button button--ghost"
                  style={{ fontSize: 13, padding: "4px 12px", color: "var(--error)" }}
                  disabled={kickStudentMutation.isPending}
                  onClick={() => kickStudentMutation.mutate(s.userId)}
                >
                  추방
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
