# sec101 — Admin API 상세 설계

> Phase 8 구현 기준 문서. 기존 `03-api-design.md`의 Admin 섹션을 구현 수준으로 상세화.

---

## 인증 방식

- **JWT (HS256)**, Bearer 토큰 방식
- 모든 `/api/v1/admin/*` 엔드포인트(로그인 제외)에 `Authorization: Bearer <token>` 헤더 필수
- 토큰 유효기간: **24시간**
- Payload: `{ userId: number, email: string, roles: string[], iat: number, exp: number }`
- `RolesGuard`에서 `roles` 배열에 `ADMIN` 포함 여부 확인

### 초기 관리자 계정

| 항목 | 값 |
|------|-----|
| email | `admin@sec101.com` |
| password | `Admin1234!` |
| 비밀번호 해시 | bcrypt (saltRounds=12), seed.ts에서 생성 |

> ⚠️ 프로덕션 배포 전 반드시 비밀번호 변경 필요.

---

## 엔드포인트 목록

### 인증

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/v1/admin/login` | ✗ | 관리자 로그인 → JWT 발급 |
| GET  | `/api/v1/admin/me` | ✓ ADMIN | 현재 관리자 정보 |

### 대시보드

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/v1/admin/dashboard` | ✓ ADMIN | 전체 통계 |

### 사용자 관리

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET    | `/api/v1/admin/users` | ✓ ADMIN | 전체 사용자 목록 (검색/역할 필터/페이징) |
| GET    | `/api/v1/admin/users/:id` | ✓ ADMIN | 사용자 상세 + 수강 목록 + 역할 |
| DELETE | `/api/v1/admin/users/:id` | ✓ ADMIN | 사용자 삭제 (CASCADE) |
| POST   | `/api/v1/admin/users/:id/ban` | ✓ ADMIN | 사용자 제재 (역할 제거) |

### 강의 관리

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET    | `/api/v1/admin/courses` | ✓ ADMIN | 전체 강의 목록 (검색/카테고리/페이징) |
| DELETE | `/api/v1/admin/courses/:id` | ✓ ADMIN | 강의 삭제 |
| POST   | `/api/v1/admin/courses/:id/cancel` | ✓ ADMIN | 강의 폐강 처리 |

### 신고 관리

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET    | `/api/v1/admin/reports` | ✓ ADMIN | 신고 목록 (미처리 우선, 타입/처리여부 필터) |
| PATCH  | `/api/v1/admin/reports/:id` | ✓ ADMIN | 신고 처리 완료 |

---

## 요청/응답 스키마

### POST `/api/v1/admin/login`

**Request**
```json
{ "email": "admin@sec101.com", "password": "Admin1234!" }
```

**Response 200**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "admin",
      "email": "admin@sec101.com",
      "roles": ["ADMIN"]
    }
  }
}
```

**Response 401** — 잘못된 자격증명
```json
{
  "success": false,
  "status": 401,
  "error": { "code": "CREDENTIAL_INVALID", "message": "이메일 또는 비밀번호가 올바르지 않습니다." }
}
```

---

### GET `/api/v1/admin/dashboard`

**Response 200**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {
    "totalUsers": 320,
    "totalCourses": 45,
    "totalEnrollments": 1280,
    "pendingReports": 7,
    "totalRevenue": 4500000,
    "byDifficulty": {
      "EASY": 18,
      "MEDIUM": 20,
      "HARD": 7
    },
    "recentReports": [
      {
        "id": 12,
        "type": "COPYRIGHT",
        "course": { "id": 3, "title": "웹 해킹 입문" },
        "reporter": { "id": 7, "name": "홍길동" },
        "createdAt": "2026-04-15T10:23:00.000Z"
      }
    ]
  }
}
```

---

### GET `/api/v1/admin/users`

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `search` | string | 이름 또는 이메일 검색 | `?search=hong` |
| `role` | string | 역할 필터 | `?role=INSTRUCTOR` |
| `page` | number | 페이지 번호 (기본 1) | `?page=2` |
| `limit` | number | 페이지 크기 (기본 20) | `?limit=10` |

**Response 200**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": [
    {
      "id": 3,
      "name": "홍길동",
      "email": "hong@sec101.com",
      "roles": ["INSTRUCTOR"],
      "courseCount": 3,
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 320,
    "totalPages": 16
  }
}
```

---

### DELETE `/api/v1/admin/users/:id`

**Response 200**
```json
{ "success": true, "status": 200, "message": "사용자가 삭제되었습니다.", "data": null }
```

**Response 404**
```json
{
  "success": false,
  "status": 404,
  "error": { "code": "NOT_FOUND", "message": "해당 사용자를 찾을 수 없습니다." }
}
```

---

### POST `/api/v1/admin/users/:id/ban`

**Request Body**
```json
{ "reason": "저작권 침해 강의 반복 업로드" }
```

**Response 200**
```json
{ "success": true, "status": 200, "message": "사용자가 제재되었습니다.", "data": null }
```

---

### GET `/api/v1/admin/courses`

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `search` | string | 강의 제목 검색 | `?search=SQL` |
| `categoryId` | number | 카테고리 필터 | `?categoryId=1` |
| `status` | string | 상태 필터 | `?status=OPEN` |
| `page` | number | 페이지 번호 | `?page=1` |
| `limit` | number | 페이지 크기 | `?limit=20` |

**Response 200**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": [
    {
      "id": 1,
      "title": "웹 해킹 입문",
      "slug": "web-hacking-intro",
      "difficulty": "EASY",
      "price": 0,
      "status": "OPEN",
      "instructor": { "id": 3, "name": "홍길동" },
      "category": { "id": 1, "name": "웹 보안" },
      "enrollmentCount": 142,
      "pendingReports": 2,
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### POST `/api/v1/admin/courses/:id/cancel`

**Request Body**
```json
{ "reason": "저작권 침해 확인으로 폐강 처리" }
```

**Response 200**
```json
{ "success": true, "status": 200, "message": "강의가 폐강 처리되었습니다.", "data": null }
```

**Response 409** — 이미 폐강된 강의
```json
{
  "success": false,
  "status": 409,
  "error": { "code": "DUPLICATE", "message": "이미 폐강된 강의입니다." }
}
```

---

### GET `/api/v1/admin/reports`

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `isResolved` | boolean | 처리 여부 | `?isResolved=false` |
| `type` | string | 신고 유형 | `?type=COPYRIGHT` |
| `page` | number | 페이지 번호 | `?page=1` |

**신고 유형:**

| type | 설명 |
|------|------|
| `COPYRIGHT` | 저작권 침해 |
| `WRONG_INFO` | 잘못된 정보 |
| `OTHER` | 기타 |

**Response 200**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": [
    {
      "id": 12,
      "type": "COPYRIGHT",
      "content": "해당 영상은 유튜브 채널 XXX의 무단 복제본입니다.",
      "isResolved": false,
      "course": { "id": 3, "title": "웹 해킹 입문", "instructor": "홍길동" },
      "reporter": { "id": 7, "name": "테스트유저1" },
      "createdAt": "2026-04-15T10:23:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 7, "totalPages": 1 }
}
```

---

### PATCH `/api/v1/admin/reports/:id`

**Request Body**
```json
{ "isResolved": true }
```

**Response 200**
```json
{ "success": true, "status": 200, "message": "신고가 처리되었습니다.", "data": null }
```

---

## class-validator DTO 규칙 요약

```typescript
// 관리자 로그인
class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

// 사용자 제재
class BanUserDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  reason?: string;
}

// 강의 폐강
class CancelCourseDto {
  @IsString()
  @MaxLength(50)
  @IsIn(['저작권 침해', '오류 강의', '기타'])
  reason: string;
}

// 신고 처리
class ResolveReportDto {
  @IsBoolean()
  isResolved: boolean;
}
```

---

## 미들웨어 파이프라인 (Admin)

```
POST /api/v1/admin/courses/:id/cancel
  ──▶ CORS
  ──▶ JwtAuthGuard       → JWT 검증, req.user 주입
  ──▶ RolesGuard         → roles에 ADMIN 포함 여부 확인
  ──▶ ValidationPipe     → DTO 검증, req.body 정제
  ──▶ Controller         → 비즈니스 로직
  ──▶ HttpExceptionFilter → 표준 에러 응답
```

---

## 파일 구조

```
server/src/
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    → JWT JwtAuthGuard
│   │   └── roles.guard.ts       → RolesGuard
│   ├── decorators/
│   │   └── roles.decorator.ts   → @Roles() 데코레이터
│   └── filters/
│       └── http-exception.filter.ts
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts      → 전체 라우트 핸들러
│   └── admin.service.ts         → 대시보드·사용자·강의·신고 비즈니스 로직
```

---

## 프론트엔드 관리자 라우트 설계 (Phase 11)

### 라우트 구조

| 경로 | 설명 | 레이아웃 |
|------|------|---------|
| `/admin/login` | 관리자 로그인 (공개) | 없음 (독립 페이지) |
| `/admin` | `/admin/dashboard`로 리다이렉트 | AdminLayout |
| `/admin/dashboard` | 통계 대시보드 (인증 필요) | AdminLayout |
| `/admin/users` | 사용자 CRUD (인증 필요) | AdminLayout |
| `/admin/courses` | 강의 관리 (인증 필요) | AdminLayout |
| `/admin/reports` | 신고 관리 (인증 필요) | AdminLayout |

- 공개 사용자 페이지(`/`, `/courses` 등)에서 관리자 링크 **노출 없음**
- `/admin/*` 진입 시 미인증이면 `/admin/login`으로 자동 리다이렉트
- 로그인 성공 시 JWT를 `localStorage('admin_token')`에 저장

### 클라이언트 파일 구조

```
client/src/
├── api/
│   └── admin.ts              → 관리자 API 호출 함수 (axios + JWT interceptor)
├── context/
│   └── AuthContext.tsx       → JWT 인증 상태 관리 (로그인/로그아웃/토큰)
├── admin/
│   ├── AdminLayout.tsx       → 사이드바 + 메인 영역 레이아웃
│   ├── AdminLayout.css
│   ├── LoginPage/            → 독립 로그인 폼
│   ├── DashboardPage/        → 통계 카드 + 최근 미처리 신고
│   ├── UserManagePage/       → 사용자 테이블 + 검색 + 제재/삭제
│   ├── CourseManagePage/     → 강의 테이블 + 폐강/삭제
│   └── ReportManagePage/     → 신고 목록 + 처리 완료 버튼
```
