# SEC101 P1 — API 설계

> Base URL: `/api/v1`  
> 공통 응답 포맷: `{ success, status, message, data }`

---

## 인증 (Auth)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/auth/register` | - | 회원가입 (name, email, password) |
| POST | `/auth/login` | - | 로그인 → Access Token 반환 |
| POST | `/auth/logout` | Cookie | Refresh Token 삭제 |
| POST | `/auth/refresh` | Cookie | Access Token 재발급 |
| GET | `/auth/me` | JWT | 내 정보 조회 |
| PATCH | `/auth/me` | JWT | 내 정보 수정 (name, description) |

---

## 공개 강의 (Public)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/courses` | - | 강의 목록 (검색·카테고리·난이도·페이지네이션, OPEN만) |
| GET | `/courses/:id` | - | 강의 상세 |
| GET | `/categories` | - | 카테고리 목록 |
| GET | `/courses/:courseId/chapters` | - | 챕터 목록 |
| GET | `/chapters/:chapterId/lectures` | - | 강의 목록 |
| GET | `/courses/:courseId/comments` | - | 강의 리뷰 목록 |

---

## 수강 (Learning)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/learning/:courseId` | JWT | 수강 상태 조회 (진도율·마지막 강의) |
| GET | `/lectures/:lectureId` | JWT | 강의 상세 (이전/다음 강의 포함) |

---

## 진도 (Progress)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/users/:userId/lectures/:lectureId/progress` | JWT | 진도 조회 |
| PUT | `/lectures/:lectureId/progress` | JWT | 진도 저장 (position, watchedSeconds, eventType) |

---

## 북마크 (Bookmark)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/users/:userId/lectures/:lectureId/bookmarks` | JWT | 북마크 목록 |
| POST | `/lectures/:lectureId/bookmarks` | JWT | 북마크 추가 (position, note?) |
| DELETE | `/bookmarks/:bookmarkId` | JWT | 북마크 삭제 |

---

## 강의 댓글 (Lecture Comment)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/lectures/:lectureId/comments` | - | 댓글 목록 |
| POST | `/lectures/:lectureId/comments` | JWT | 댓글 작성 (content, 최대 1000자) |
| DELETE | `/lectures/:lectureId/comments/:commentId` | JWT | 댓글 삭제 (본인만) |

---

## 강의 자료 (Attachment)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/lectures/:lectureId/attachments` | - | 자료 목록 |
| GET | `/attachments/:attachmentId/download` | JWT | 파일 다운로드 |

---

## 장바구니 (Cart)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/cart` | JWT | 장바구니 조회 |
| POST | `/cart` | JWT | 강의 담기 (courseId) |
| DELETE | `/cart/:cartItemId` | JWT | 아이템 제거 |

---

## 결제 · 주문 (Commerce)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/orders` | JWT | 주문 생성 (cartItemIds) |
| POST | `/orders/:orderId/confirm` | JWT | 결제 확인 → 수강 등록 |
| GET | `/orders` | JWT | 주문 목록 |

---

## 강의 신고 (Report)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/courses/:courseId/reports` | JWT | 신고 (type: COPYRIGHT·WRONG_INFO·OTHER, content) |

---

## 강사 (Instructor)

### 강의 관리
| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/instructor/courses` | INSTRUCTOR | 내 강의 목록 |
| POST | `/instructor/courses` | INSTRUCTOR | 강의 생성 |
| PATCH | `/instructor/courses/:courseId` | INSTRUCTOR | 강의 수정 |
| DELETE | `/instructor/courses/:courseId` | INSTRUCTOR | 강의 삭제 |
| PATCH | `/instructor/courses/:courseId/status` | INSTRUCTOR | 공개 상태 변경 (DRAFT·OPEN) |

### 챕터 관리
| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/instructor/courses/:courseId/chapters` | INSTRUCTOR | 챕터 추가 |
| PATCH | `/instructor/courses/:courseId/chapters/:chapterId` | INSTRUCTOR | 챕터 수정 |
| DELETE | `/instructor/courses/:courseId/chapters/:chapterId` | INSTRUCTOR | 챕터 삭제 |

### 강의(Lecture) 관리
| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/instructor/chapters/:chapterId/lectures` | INSTRUCTOR | 강의 추가 |
| PATCH | `/instructor/lectures/:lectureId` | INSTRUCTOR | 강의 수정 |
| DELETE | `/instructor/lectures/:lectureId` | INSTRUCTOR | 강의 삭제 |

### 강의 자료
| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | `/instructor/lectures/:lectureId/attachments` | INSTRUCTOR | 파일 업로드 (multipart) |
| DELETE | `/instructor/attachments/:attachmentId` | INSTRUCTOR | 파일 삭제 |

### 수강생
| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/instructor/courses/:courseId/students` | INSTRUCTOR | 수강생 목록 |

---

## 관리자 (Admin)

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/admin/dashboard` | ADMIN | 통계 (총 매출·월 매출·회원수·오늘 신규·강의수·수강수·미처리 신고) |
| GET | `/admin/users` | ADMIN | 사용자 목록 (검색·역할 필터·페이지네이션) |
| POST | `/admin/users/:userId/ban` | ADMIN | 사용자 정지 |
| PATCH | `/admin/users/:userId/role` | ADMIN | 역할 변경 |
| DELETE | `/admin/users/:userId` | ADMIN | 사용자 삭제 |
| GET | `/admin/courses` | ADMIN | 강의 목록 |
| DELETE | `/admin/courses/:courseId` | ADMIN | 강의 삭제 |
| GET | `/admin/categories` | - | 카테고리 목록 |
| POST | `/admin/categories` | ADMIN | 카테고리 생성 |
| PATCH | `/admin/categories/:id` | ADMIN | 카테고리 수정 |
| DELETE | `/admin/categories/:id` | ADMIN | 카테고리 삭제 |
| GET | `/admin/reports` | ADMIN | 신고 목록 |
| PATCH | `/admin/reports/:reportId` | ADMIN | 신고 처리 완료 |

---

## 공통 응답 형식

```json
// 성공
{ "success": true, "status": 200, "message": "", "data": {} }

// 페이지네이션
{
  "success": true,
  "status": 200,
  "data": [],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}

// 에러
{ "success": false, "status": 404, "message": "Not Found" }
```

---

## 에러 코드

| HTTP | 상황 |
|------|------|
| 400 | 요청 형식 오류, 유효성 검증 실패 |
| 401 | 인증 토큰 없음 또는 만료 |
| 403 | 권한 없음 (본인 강의 아님 등) |
| 404 | 리소스 없음 |
| 409 | 중복 (이미 장바구니 담김 등) |
