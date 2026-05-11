# sec101 — 강사 기능 상세 설계

> Phase 7 구현 기준 문서.
> 강사 강의 업로드 → 챕터/영상 관리 → 자료 업로드 → 수강생 관리 전체 플로우를 정의합니다.

## 서버 구현 현황 (Phase 7)

| 항목 | 상태 |
|------|------|
| Prisma 스키마 (courses, chapter, lectures, lecture_materials) | ⬜ 미완료 |
| `JwtAuthGuard` + `RolesGuard` (INSTRUCTOR) | ⬜ 미완료 |
| `instructor/instructor.service.ts` | ⬜ 미완료 |
| `instructor/instructor.controller.ts` | ⬜ 미완료 |
| `storage/storage.service.ts` (Presigned URL mock) | ⬜ 미완료 |
| `app.module.ts` 라우터 마운트 | ⬜ 미완료 |
| TypeScript 빌드 (`npm run build`) | ⬜ 미완료 |
| curl 엔드포인트 검증 | ⬜ 미완료 |

---

## 1. 기능 개요

| 기능 | 설명 |
|------|------|
| 강의 관리 (I1) | 강의 생성/수정/삭제, 가격 책정, 상태 관리 |
| 챕터·영상 관리 | 챕터 추가/수정/삭제, 강의 영상 추가/수정/삭제, 순서 관리 |
| 자료 업로드 (I3) | Presigned URL 기반 파일 업로드 (R2), 메타데이터 저장/수정/삭제 |
| 수강생 관리 (I2) | 수강생 목록 조회, 수강생 추방 |
| 평점 조회 (I4) | 내 강사 평점 및 리뷰 목록 조회 |

---

## 2. 인증 전략

- JWT (HS256), Bearer 토큰
- Payload: `{ userId: number, email: string, roles: string[], iat, exp }`
- 토큰 유효기간: **7일** (일반 사용자와 동일)
- 클라이언트 저장: `localStorage('access_token')`, `localStorage('user_info')`
- `RolesGuard`에서 `roles` 배열에 `INSTRUCTOR` 포함 여부 확인

### 소유권 검증
강의/챕터/영상/자료 수정·삭제 시 `course.instructorId !== req.user.userId`이면 `FORBIDDEN 403` 반환.

---

## 3. 데이터 모델 관계

```
users (INSTRUCTOR)
  └─── courses
         ├── chapter
         │     └── lectures
         │           └── lecture_materials
         └── course_comment (평점 집계)
```

---

## 4. API 설계

### 4-1. 강의 관리 (`/api/v1/instructor/courses`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/instructor/courses` | 내 강의 목록 |
| POST | `/api/v1/instructor/courses` | 강의 생성 |
| PATCH | `/api/v1/instructor/courses/:courseId` | 강의 수정 |
| DELETE | `/api/v1/instructor/courses/:courseId` | 강의 삭제 |

**POST `/api/v1/instructor/courses`**
```json
// Request
{
  "title": "웹 해킹 입문",
  "description": "SQL Injection부터 XSS까지...",
  "categoryId": 1,
  "difficulty": "EASY",
  "price": 0,
  "maxCapacity": 100
}

// Response 201
{
  "success": true,
  "status": 201,
  "message": "",
  "data": {
    "id": 6,
    "title": "웹 해킹 입문",
    "slug": "web-hacking-intro",
    "difficulty": "EASY",
    "price": 0,
    "status": "OPEN",
    "createdAt": "2026-04-17T..."
  }
}
```

> `slug`는 서버에서 `title`을 기반으로 자동 생성 (kebab-case, 중복 시 suffix 추가)

**PATCH `/api/v1/instructor/courses/:courseId`**
```json
// Request (모든 필드 선택)
{
  "title": "웹 해킹 입문 (개정판)",
  "price": 9900,
  "maxCapacity": 50
}
```

---

### 4-2. 챕터 관리

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/instructor/courses/:courseId/chapters` | 챕터 추가 |
| PATCH | `/api/v1/instructor/courses/:courseId/chapters/:chapterId` | 챕터 수정 |
| DELETE | `/api/v1/instructor/courses/:courseId/chapters/:chapterId` | 챕터 삭제 (하위 강의 CASCADE) |

**POST `/api/v1/instructor/courses/:courseId/chapters`**
```json
// Request
{ "title": "SQL Injection", "position": 2 }

// Response 201
{ "data": { "id": 5, "title": "SQL Injection", "position": 2 } }
```

> `UNIQUE(course_id, position)` 제약 — position 중복 시 409 DUPLICATE

---

### 4-3. 강의 영상 관리

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/instructor/chapters/:chapterId/lectures` | 강의 영상 추가 |
| PATCH | `/api/v1/instructor/lectures/:lectureId` | 강의 영상 수정 |
| DELETE | `/api/v1/instructor/lectures/:lectureId` | 강의 영상 삭제 |

**POST `/api/v1/instructor/chapters/:chapterId/lectures`**
```json
// Request
{
  "title": "SQL Injection 원리",
  "videoUrl": "https://youtube.com/watch?v=...",
  "thumbnailUrl": "https://r2.example.com/thumbnails/...",
  "duration": 1500,
  "position": 1,
  "isPublished": true
}

// Response 201
{ "data": { "id": 12, "title": "SQL Injection 원리", "position": 1, "duration": 1500 } }
```

---

### 4-4. 강의 자료 관리 (`/api/v1/instructor/lectures/:lectureId/materials`)

강의 자료는 **Presigned URL 2단계 업로드** 방식으로 처리합니다.

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/instructor/lectures/:lectureId/materials` | 자료 목록 |
| POST | `/api/v1/instructor/lectures/:lectureId/materials/upload-url` | Presigned 업로드 URL 발급 |
| POST | `/api/v1/instructor/lectures/:lectureId/materials` | 업로드 완료 메타데이터 저장 |
| PATCH | `/api/v1/instructor/materials/:materialId` | 자료 제목/순서 수정 |
| DELETE | `/api/v1/instructor/materials/:materialId` | 자료 삭제 (R2 파일 + DB) |

**업로드 플로우:**

```
1. POST /upload-url     → NestJS → StorageService → R2 Presigned PUT URL (5분)
2. PUT {presignedUrl}   → 클라이언트가 R2에 직접 업로드 (NestJS 경유 없음)
3. POST /materials      → 업로드 완료 후 메타데이터 NestJS에 저장
```

**POST `.../materials/upload-url` 요청:**
```json
{
  "fileName": "sqlinjection-practice.zip",
  "fileType": "application/zip",
  "fileSize": 204800
}
```

**응답:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {
    "uploadUrl": "https://r2.example.com/lectures/12/sqlinjection-practice.zip?X-Amz-Signature=...",
    "fileKey": "lectures/12/sqlinjection-practice.zip",
    "expiresIn": 300
  }
}
```

**POST `.../materials` (메타데이터 저장):**
```json
// Request
{
  "title": "SQLi 실습 파일",
  "fileKey": "lectures/12/sqlinjection-practice.zip",
  "fileName": "sqlinjection-practice.zip",
  "fileSize": 204800,
  "fileType": "application/zip",
  "position": 1
}

// Response 201
{ "data": { "id": 3, "title": "SQLi 실습 파일", "fileSize": 204800 } }
```

**허용 파일 형식:**

| 형식 | MIME Type | 최대 크기 |
|------|-----------|----------|
| ZIP | application/zip | 50MB |
| PDF | application/pdf | 20MB |
| TXT | text/plain | 1MB |
| PNG/JPG | image/png, image/jpeg | 10MB |

---

### 4-5. 수강생 관리

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/instructor/courses/:courseId/students` | 수강생 목록 (이름/이메일, 수강일, 진도율) |
| DELETE | `/api/v1/instructor/courses/:courseId/students/:userId` | 수강생 추방 (enrollment CANCELED) |

**GET `.../students` 응답:**
```json
{
  "data": [
    {
      "userId": 5,
      "name": "테스트유저1",
      "email": "student1@test.com",
      "enrolledAt": "2026-04-01T...",
      "progressAvg": 72
    }
  ]
}
```

---

### 4-6. 강사 평점 조회

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/v1/instructor/ratings` | 내 강사 평점 + 최근 리뷰 |

**응답:**
```json
{
  "data": {
    "averageStar": 4.7,
    "totalRatings": 34,
    "ratings": [
      {
        "id": 1,
        "star": 5,
        "content": "설명이 매우 친절합니다.",
        "user": { "id": 5, "name": "테스트유저1" },
        "createdAt": "2026-04-10T..."
      }
    ]
  }
}
```

---

## 5. class-validator DTO 규칙

```typescript
// 강의 생성
class CreateCourseDto {
  @IsString() @MinLength(2) @MaxLength(255)
  title: string;

  @IsString() @MinLength(10)
  description: string;

  @IsInt() @Min(1)
  categoryId: number;

  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty: string;

  @IsInt() @Min(0)
  price: number;

  @IsInt() @Min(1) @IsOptional()
  maxCapacity?: number;
}

// 챕터 추가
class CreateChapterDto {
  @IsString() @MinLength(1) @MaxLength(255)
  title: string;

  @IsInt() @Min(1)
  position: number;
}

// 강의 영상 추가
class CreateLectureDto {
  @IsString() @MinLength(1) @MaxLength(255)
  title: string;

  @IsUrl()
  videoUrl: string;

  @IsUrl() @IsOptional()
  thumbnailUrl?: string;

  @IsInt() @Min(1)
  duration: number;         // 초 단위

  @IsInt() @Min(1)
  position: number;

  @IsBoolean() @IsOptional()
  isPublished?: boolean;
}

// 자료 업로드 URL 요청
class GetUploadUrlDto {
  @IsString() @MinLength(1) @MaxLength(255)
  fileName: string;

  @IsIn(['application/zip', 'application/pdf', 'text/plain', 'image/png', 'image/jpeg'])
  fileType: string;

  @IsInt() @Min(1) @Max(52428800)  // 50MB
  fileSize: number;
}
```

---

## 6. 미들웨어 파이프라인 (Instructor)

```
POST /api/v1/instructor/courses/:courseId/chapters
  ──▶ CORS
  ──▶ JwtAuthGuard       → JWT 검증, req.user 주입
  ──▶ RolesGuard         → roles에 INSTRUCTOR 포함 여부 확인
  ──▶ ValidationPipe     → DTO 검증
  ──▶ Controller         → 소유권 검증 (course.instructorId === req.user.userId)
  ──▶ Service            → 비즈니스 로직
  ──▶ HttpExceptionFilter
```

---

## 7. 서버 파일 구조 (신규)

```
server/src/
├── instructor/
│   ├── instructor.module.ts
│   ├── instructor.controller.ts    → 강의/챕터/영상/자료/수강생 라우트
│   └── instructor.service.ts       → 소유권 검증 + CRUD 비즈니스 로직
├── storage/
│   └── storage.service.ts          → R2/S3 Presigned URL 생성
│                                     Phase 7: mock URL 반환
│                                     Phase 12: R2 실연동
```

---

## 8. 클라이언트 구조 (신규)

```
client/src/
├── api/
│   └── instructor.ts              → 강사 API 호출 함수
├── instructor/
│   ├── InstructorLayout.tsx       → 강사 전용 사이드바 레이아웃
│   ├── InstructorLayout.css
│   ├── CourseManagePage/          → /instructor/courses
│   │     ├── CourseManagePage.tsx → 내 강의 카드 그리드 + 신규 생성 버튼
│   │     └── CourseManagePage.css
│   ├── CourseEditPage/            → /instructor/courses/:id/edit
│   │     ├── CourseEditPage.tsx   → 4탭 편집 UI
│   │     ├── tabs/
│   │     │   ├── BasicInfoTab.tsx     → 제목, 설명, 가격, 카테고리
│   │     │   ├── ChapterTab.tsx       → 챕터/영상 DnD 트리
│   │     │   ├── MaterialTab.tsx      → 강의별 자료 목록 + 파일 업로드
│   │     │   └── StudentTab.tsx       → 수강생 테이블
│   │     └── CourseEditPage.css
│   └── StudentManagePage/         → /instructor/courses/:id/students
```

---

## 9. 라우트 설계

| 경로 | 설명 | 인증 |
|------|------|------|
| `/instructor/courses` | 내 강의 목록 | INSTRUCTOR 필요 |
| `/instructor/courses/new` | 강의 생성 폼 | INSTRUCTOR 필요 |
| `/instructor/courses/:id/edit` | 강의 편집 (4탭) | INSTRUCTOR 필요 (본인 강의만) |
| `/instructor/courses/:id/students` | 수강생 관리 | INSTRUCTOR 필요 (본인 강의만) |

- 공개 페이지에서 강사 대시보드 링크는 **로그인한 INSTRUCTOR 역할일 때만** Navbar에 표시
- `/instructor/*` 진입 시 미인증 또는 INSTRUCTOR 역할 없으면 `/login`으로 리다이렉트

---

## 10. 강의 편집 UX 플로우

```
[강의 목록] → [강의 생성 버튼]
  ↓
[강의 생성 모달 / 폼] → POST /instructor/courses
  ↓
[강의 편집 페이지] → 4탭
  ├── [기본 정보] → PATCH /instructor/courses/:id
  ├── [챕터/영상]
  │     ├── [+ 챕터 추가] → POST /instructor/courses/:id/chapters
  │     ├── [챕터 드래그 순서 변경] → PATCH chapters/:id (position 업데이트)
  │     └── [+ 영상 추가] → POST /instructor/chapters/:id/lectures
  ├── [자료]
  │     ├── [강의 선택 드롭다운]
  │     ├── [파일 드래그 앤 드롭 업로드]
  │     │     1. POST .../upload-url → presignedUrl 받기
  │     │     2. PUT presignedUrl → R2 직접 업로드 (진행률 표시)
  │     │     3. POST .../materials → 메타데이터 저장
  │     └── [자료 삭제] → DELETE /instructor/materials/:id
  └── [수강생] → GET /instructor/courses/:id/students
```

---

## 11. 에러 코드 추가

| 코드 | HTTP | 설명 |
|------|------|------|
| `COURSE_NOT_FOUND` | 404 | 강의 없음 |
| `CHAPTER_NOT_FOUND` | 404 | 챕터 없음 |
| `LECTURE_NOT_FOUND` | 404 | 강의 영상 없음 |
| `MATERIAL_NOT_FOUND` | 404 | 강의 자료 없음 |
| `POSITION_CONFLICT` | 409 | 챕터/영상 position 중복 |
| `UPLOAD_SIZE_EXCEEDED` | 400 | 파일 크기 초과 |
| `UPLOAD_TYPE_INVALID` | 400 | 허용되지 않는 파일 형식 |
| `FORBIDDEN` | 403 | 본인 강의가 아님 |
