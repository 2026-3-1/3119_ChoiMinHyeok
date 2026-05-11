import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../features/shared/api/api";
import type { Category } from "../../features/shared/types";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name: newName.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin</p>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>카테고리 관리</h2>
      </div>

      {/* 새 카테고리 추가 */}
      <div
        style={{
          background: "var(--surface-secondary)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 28,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>새 카테고리 추가</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="auth-form__input"
            style={{ maxWidth: 300 }}
            placeholder="카테고리 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) createMutation.mutate();
            }}
          />
          <button
            className="button button--primary"
            style={{ minHeight: 40, padding: "0 20px" }}
            disabled={!newName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "추가 중..." : "추가"}
          </button>
        </div>
        {createMutation.isError && (
          <p style={{ fontSize: 13, color: "var(--error)", marginTop: 8 }}>추가에 실패했습니다.</p>
        )}
      </div>

      {/* 카테고리 목록 */}
      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state"><strong>카테고리가 없습니다</strong></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>생성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{cat.id}</td>
                  <td>
                    {editingId === cat.id ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="auth-form__input"
                          style={{ minHeight: 32, fontSize: 13, padding: "0 10px", maxWidth: 200 }}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editingName.trim())
                              updateMutation.mutate({ id: cat.id, name: editingName.trim() });
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <button
                          className="button button--primary"
                          style={{ fontSize: 12, padding: "0 12px", minHeight: 32 }}
                          disabled={!editingName.trim() || updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({ id: cat.id, name: editingName.trim() })
                          }
                        >
                          저장
                        </button>
                        <button
                          className="button button--ghost"
                          style={{ fontSize: 12, padding: "0 12px", minHeight: 32 }}
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(cat.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td>
                    {editingId !== cat.id && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="button button--ghost"
                          style={{ fontSize: 12, padding: "3px 10px" }}
                          onClick={() => startEdit(cat)}
                        >
                          수정
                        </button>
                        <button
                          className="button button--ghost"
                          style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`))
                              deleteMutation.mutate(cat.id);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
