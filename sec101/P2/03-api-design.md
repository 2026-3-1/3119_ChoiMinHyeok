# sec101 - API 설계

## 기술 스택: NestJS + TypeScript

| 기술 | 역할 |
|---|---|
| NestJS | REST API 서버 |
| TypeScript | 타입 안전성 |
| Prisma | ORM (PostgreSQL 연동) |
| JWT | 사용자 인증 |
| bcrypt | 비밀번호 해싱 |
| cors | 프론트엔드 CORS 허용 |
| dotenv | 환경변수 관리 |
| @aws-sdk/client-s3 | 강사 자료 Presigned URL 업로드 |

---

## 공통 응답 형식

**성공 응답:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {}
}
```

**페이지네이션 응답:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "status": 404,
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "해당 강의를 찾을 수 없습니다."
  }
}
```

---

## 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 요청 데이터 유효성 실패 |
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `CREDENTIAL_INVALID` | 401 | 아이디/비밀번호 불일치 |
| `TOKEN_EXPIRED` | 401 | JWT 만료 |
| `FORBIDDEN` | 403 | 권한 부족 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `DUPLICATE` | 409 | 중복 데이터 |
| `ALREADY_ENROLLED` | 409 | 이미 수강 중인 강의 |
| `ALREADY_REPORTED` | 409 | 이미 신고한 강의 |
| `NOT_ENROLLED` | 403 | 수강하지 않은 강의 접근 |
| `COURSE_CANCELED` | 410 | 폐강된 강의 |
| `SERVER_ERROR` | 500 | 서버 내부 오류 |

---

## 미들웨어

```
Request Flow:
  ┌────────┐   ┌──────┐   ┌─────────────────┐   ┌────────────┐   ┌────────────┐
  │ Client │──►│ CORS │──►│   Auth Guard     │──►│ Validation │──►│ Controller │
  └────────┘   └──────┘   │ JwtAuthGuard     │   │ (class-    │   └────────────┘
                           │ RolesGuard       │   │ validator) │
                           └─────────────────┘   └────────────┘
```

| 미들웨어 | 역할 |
|---|---|
| CORS | 프론트엔드 origin 허용 |
| JwtAuthGuard | JWT 토큰 검증 |
| RolesGuard | STUDENT / INSTRUCTOR / ADMIN 역할 검증 |
| ValidationPipe | 요청 바디 유효성 검사 (class-validator) |
| HttpExceptionFilter | 에러 응답 표준화 |

---

## API 엔드포인트

### Public API (인증 불필요)

#### 카테고리

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/v1/categories` | 전체 카테고리 목록 |
| GET | `/api/v1/categories/:id/courses` | 카테고리별 강의 목록 |

**GET `/api/v1/categories/:id/courses` 쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `search` | string | 검색어 | `?search=web` |
| `difficulty` | string | 난이도 | `?difficulty=EASY` |
| `sort` | string | 정렬 기준 | `?sort=rating` or `?sort=newest` |
| `page` | number | 페이지 번호 (기본 1) | `?page=2` |
| `limit` | number | 페이지 크기 (기본 20) | `?limit=10` |

**응답 예시:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": [
    {
      "id": 1,
      "title": "웹 해킹 입문",
      "thumbnail": "https://r2.example.com/thumbnails/1.jpg",
      "difficulty": "EASY",
      "price": 0,
      "rating": 4.5,
      "instructor": {
        "id": 3,
        "name": "홍길동"
      },
      "category": {
        "id": 1,
        "name": "웹 보안"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

#### 강의

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/v1/courses` | 전체 강의 목록 (필터/검색/페이징) |
| GET | `/api/v1/courses/:id` | 강의 상세 (챕터 목록 포함) |
| GET | `/api/v1/courses/:id/comments` | 강의 댓글 목록 |

**GET `/api/v1/courses` 쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `search` | string | 검색어 | `?search=SQL` |
| `categoryId` | number | 카테고리 ID | `?categoryId=1` |
| `difficulty` | string | 난이도 | `?difficulty=MEDIUM` |
| `sort` | string | 정렬 | `?sort=rating` |
| `page` | number | 페이지 번호 | `?page=1` |
| `limit` | number | 페이지 크기 | `?limit=20` |

---

#### 강사

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/v1/instructors/:id` | 강사 프로필 + 평점 |
| GET | `/api/v1/instructors/:id/courses` | 강사의 강의 목록 |

---

### Auth API (인증)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ✗ | 회원가입 |
| POST | `/api/v1/auth/login` | ✗ | 로그인 → JWT 반환 |
| GET | `/api/v1/auth/me` | ✓ | 내 정보 조회 |
| PATCH | `/api/v1/auth/me` | ✓ | 내 정보 수정 |

**POST `/api/v1/auth/register` 요청:**
```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password123"
}
```

**POST `/api/v1/auth/login` 응답:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "홍길동",
      "email": "user@example.com",
      "roles": ["STUDENT"]
    }
  }
}
```

---

### Student API (수강생 — STUDENT 역할)

#### 수강 (F1)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/enrollments` | ✓ STUDENT | 내 수강 목록 |
| POST | `/api/v1/enrollments` | ✓ STUDENT | 수강 등록 (무료 강의) |
| DELETE | `/api/v1/enrollments/:id` | ✓ STUDENT | 수강 취소 |

**POST `/api/v1/enrollments` 요청:**
```json
{
  "courseId": 1
}
```

---

#### 결제 / 장바구니 (F4)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/cart` | ✓ STUDENT | 장바구니 목록 |
| POST | `/api/v1/cart` | ✓ STUDENT | 장바구니 추가 |
| DELETE | `/api/v1/cart/:id` | ✓ STUDENT | 장바구니 항목 제거 |
| POST | `/api/v1/orders` | ✓ STUDENT | 주문 생성 |
| GET | `/api/v1/orders` | ✓ STUDENT | 내 주문 목록 |
| GET | `/api/v1/orders/:id` | ✓ STUDENT | 주문 상세 |
| POST | `/api/v1/orders/:id/cancel` | ✓ STUDENT | 주문 취소 / 환불 요청 |

**POST `/api/v1/orders` 요청:**
```json
{
  "cartItemIds": [1, 2, 3],
  "provider": "TOSS"
}
```

---

#### 강의 열람 (F6)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/courses/:courseId/chapters` | ✓ ENROLLED | 챕터 + 강의 목록 |
| GET | `/api/v1/lectures/:lectureId` | ✓ ENROLLED | 강의 영상 상세 |
| GET | `/api/v1/lectures/:lectureId/materials` | ✓ ENROLLED | 강의 자료 목록 |
| GET | `/api/v1/lectures/:lectureId/materials/:materialId/download` | ✓ ENROLLED | 자료 Presigned 다운로드 URL |

**GET `/api/v1/lectures/:lectureId/materials/:materialId/download` 응답:**
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {
    "downloadUrl": "https://r2.example.com/...",
    "expiresIn": 600
  }
}
```

---

#### 강의 진도

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/lectures/:lectureId/progress` | ✓ ENROLLED | 진도 조회 |
| PATCH | `/api/v1/lectures/:lectureId/progress` | ✓ ENROLLED | 진도 업데이트 |
| POST | `/api/v1/lectures/:lectureId/playback` | ✓ ENROLLED | 재생 이벤트 기록 |

**PATCH `/api/v1/lectures/:lectureId/progress` 요청:**
```json
{
  "lastPosition": 320,
  "watchedSeconds": 310,
  "progress": 65,
  "isCompleted": false
}
```

---

#### 북마크

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/lectures/:lectureId/bookmarks` | ✓ ENROLLED | 북마크 목록 |
| POST | `/api/v1/lectures/:lectureId/bookmarks` | ✓ ENROLLED | 북마크 추가 |
| PATCH | `/api/v1/lectures/:lectureId/bookmarks/:bookmarkId` | ✓ ENROLLED | 북마크 수정 |
| DELETE | `/api/v1/lectures/:lectureId/bookmarks/:bookmarkId` | ✓ ENROLLED | 북마크 삭제 |

---

#### 평가 / 댓글 (F2)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/courses/:courseId/comments` | ✓ ENROLLED | 강의 댓글 + 평점 작성 |
| PATCH | `/api/v1/courses/:courseId/comments/:commentId` | ✓ STUDENT | 댓글 수정 |
| DELETE | `/api/v1/courses/:courseId/comments/:commentId` | ✓ STUDENT | 댓글 삭제 |
| POST | `/api/v1/courses/:courseId/comments/:commentId/replies` | ✓ STUDENT | 대댓글 작성 |
| POST | `/api/v1/lectures/:lectureId/comments` | ✓ ENROLLED | 영상 댓글 작성 |
| POST | `/api/v1/lectures/:lectureId/comments/:commentId/replies` | ✓ ENROLLED | 영상 대댓글 작성 |

---

#### 강사 평점 (F7)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/instructors/:instructorId/ratings` | ✓ STUDENT | 강사 평점 등록 |
| PATCH | `/api/v1/instructors/:instructorId/ratings` | ✓ STUDENT | 강사 평점 수정 |

---

#### 강의 신고 (F5)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/courses/:courseId/reports` | ✓ STUDENT | 강의 신고 |

**POST `/api/v1/courses/:courseId/reports` 요청:**
```json
{
  "type": "COPYRIGHT",
  "content": "해당 영상은 유튜브 채널 XXX의 무단 복제본입니다."
}
```

---

### Instructor API (강사 — INSTRUCTOR 역할)

#### 강의 관리 (I1)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/instructor/courses` | ✓ INSTRUCTOR | 내 강의 목록 |
| POST | `/api/v1/instructor/courses` | ✓ INSTRUCTOR | 강의 생성 |
| PATCH | `/api/v1/instructor/courses/:courseId` | ✓ INSTRUCTOR | 강의 수정 |
| DELETE | `/api/v1/instructor/courses/:courseId` | ✓ INSTRUCTOR | 강의 삭제 |

**POST `/api/v1/instructor/courses` 요청:**
```json
{
  "title": "웹 해킹 입문",
  "description": "SQL Injection부터 XSS까지...",
  "categoryId": 1,
  "difficulty": "EASY",
  "price": 0,
  "maxCapacity": 30
}
```

---

#### 챕터 / 강의 영상 관리

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/instructor/courses/:courseId/chapters` | ✓ INSTRUCTOR | 챕터 추가 |
| PATCH | `/api/v1/instructor/courses/:courseId/chapters/:chapterId` | ✓ INSTRUCTOR | 챕터 수정 |
| DELETE | `/api/v1/instructor/courses/:courseId/chapters/:chapterId` | ✓ INSTRUCTOR | 챕터 삭제 |
| POST | `/api/v1/instructor/chapters/:chapterId/lectures` | ✓ INSTRUCTOR | 강의 영상 추가 |
| PATCH | `/api/v1/instructor/lectures/:lectureId` | ✓ INSTRUCTOR | 강의 영상 수정 |
| DELETE | `/api/v1/instructor/lectures/:lectureId` | ✓ INSTRUCTOR | 강의 영상 삭제 |

---

#### 강의 자료 관리 (I3)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/instructor/lectures/:lectureId/materials` | ✓ INSTRUCTOR | 자료 목록 |
| POST | `/api/v1/instructor/lectures/:lectureId/materials/upload-url` | ✓ INSTRUCTOR | Presigned 업로드 URL 발급 |
| POST | `/api/v1/instructor/lectures/:lectureId/materials` | ✓ INSTRUCTOR | 업로드 완료 후 메타데이터 저장 |
| PATCH | `/api/v1/instructor/materials/:materialId` | ✓ INSTRUCTOR | 자료 수정 |
| DELETE | `/api/v1/instructor/materials/:materialId` | ✓ INSTRUCTOR | 자료 삭제 |

**POST `/api/v1/instructor/lectures/:lectureId/materials/upload-url` 요청:**
```json
{
  "fileName": "practice_01.zip",
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
    "uploadUrl": "https://r2.example.com/...?X-Amz-Signature=...",
    "fileKey": "lectures/3/practice_01.zip",
    "expiresIn": 300
  }
}
```

---

#### 수강생 관리 (I2)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/instructor/courses/:courseId/students` | ✓ INSTRUCTOR | 수강생 목록 |
| DELETE | `/api/v1/instructor/courses/:courseId/students/:userId` | ✓ INSTRUCTOR | 수강생 추방 |

---

#### 평점 조회 (I4)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/instructor/ratings` | ✓ INSTRUCTOR | 내 강사 평점 조회 |

---

### Admin API (관리자 — ADMIN 역할)

#### 인증 (A4)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/api/v1/admin/login` | ✗ | 관리자 로그인 |
| GET | `/api/v1/admin/me` | ✓ ADMIN | 관리자 정보 |

---

#### 사용자 관리 (A1)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/admin/users` | ✓ ADMIN | 전체 사용자 목록 |
| GET | `/api/v1/admin/users/:id` | ✓ ADMIN | 사용자 상세 |
| DELETE | `/api/v1/admin/users/:id` | ✓ ADMIN | 사용자 삭제 |
| POST | `/api/v1/admin/users/:id/ban` | ✓ ADMIN | 사용자 제재 |

---

#### 강의 관리 (A2)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/admin/courses` | ✓ ADMIN | 전체 강의 목록 |
| DELETE | `/api/v1/admin/courses/:id` | ✓ ADMIN | 강의 삭제 |
| POST | `/api/v1/admin/courses/:id/cancel` | ✓ ADMIN | 강의 폐강 처리 |

---

#### 신고 관리 (A3)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/admin/reports` | ✓ ADMIN | 신고 목록 (미처리 우선) |
| PATCH | `/api/v1/admin/reports/:id` | ✓ ADMIN | 신고 처리 완료 |

**GET `/api/v1/admin/reports` 쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|---|---|---|---|
| `isResolved` | boolean | 처리 여부 | `?isResolved=false` |
| `type` | string | 신고 유형 | `?type=COPYRIGHT` |
| `page` | number | 페이지 | `?page=1` |

---

#### 대시보드 (A3)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | ✓ ADMIN | 전체 통계 |

**응답 예시:**
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
    "totalRevenue": 4500000
  }
}
```