# SEC101 — 완전 재현 가능한 PRD
> **목적**: 이 문서 하나로 Claude Code가 어떤 컴퓨터에서도 SEC101 프로젝트를 동일한 동작과 디자인으로 완전히 재현할 수 있어야 한다.

---

## 1. 프로젝트 개요

**SEC101**은 보안 초보자를 위한 온라인 강의 플랫폼이다.  
누구나 수강생이자 강사가 될 수 있는 강의 마켓플레이스다.

| 역할 | 설명 |
|------|------|
| STUDENT | 강의 탐색·구매·수강 |
| INSTRUCTOR | 강의 제작·판매·수강생 관리 |
| ADMIN | 플랫폼 전체 관리 |

---

## 2. 기술 스택 (정확한 버전 포함)

### 프론트엔드 (`client/`)
```
React 19.2.4
TypeScript ~5.9.3
Vite 8.0.1
React Router DOM 7.13.2
TanStack Query (React Query) 5.95.2
Axios 1.13.6
react-youtube 10.1.0
```

### 백엔드 (`server/`)
```
NestJS 11.1.17
TypeScript 5.7.3
Prisma ORM 7.5.0 (PostgreSQL)
@nestjs/jwt 11.0.2
bcrypt 6.0.0
ioredis 5.10.1
cookie-parser 1.4.7
class-validator 0.14.4
class-transformer 0.5.1
@nestjs/swagger 11.2.6
dotenv 17.3.1
pg 8.20.0
```

### 인프라
```
PostgreSQL (Docker: postgres:latest, 포트 5432)
Redis (Docker: redis:latest, 포트 6379)
```

---

## 3. 디렉토리 구조

```
프로젝트루트/
├── client/                          # React + TypeScript 프론트엔드
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── package.json
│   └── src/
│       ├── main.tsx                 # React 루트, QueryClientProvider 래핑
│       ├── App.tsx                  # 라우터 정의 (lazy loading)
│       ├── index.css                # 전역 스타일 (디자인 시스템 전체)
│       ├── assets/
│       ├── page/                    # 라우팅 페이지 컴포넌트
│       │   ├── MainPage.tsx
│       │   ├── CoursePage.tsx
│       │   ├── CourseDetailPage.tsx
│       │   ├── LecturePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── MyLearningPage.tsx
│       │   ├── MyPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── instructor/
│       │   │   ├── InstructorCoursesPage.tsx
│       │   │   ├── InstructorCreateCoursePage.tsx
│       │   │   └── InstructorCourseEditPage.tsx
│       │   └── admin/
│       │       ├── AdminLoginPage.tsx
│       │       ├── AdminLayout.tsx
│       │       ├── AdminDashboardPage.tsx
│       │       ├── AdminUsersPage.tsx
│       │       ├── AdminCoursesPage.tsx
│       │       ├── AdminCategoriesPage.tsx
│       │       └── AdminReportsPage.tsx
│       └── features/
│           ├── shared/
│           │   ├── api/
│           │   │   └── api.ts       # Axios 클라이언트 + 모든 API 함수
│           │   ├── context/
│           │   │   └── AuthContext.tsx
│           │   ├── layout/
│           │   │   ├── SiteHeader.tsx
│           │   │   └── SiteFooter.tsx
│           │   ├── types/           # TypeScript 인터페이스
│           │   └── utils/
│           ├── home/                # 홈페이지 섹션 컴포넌트
│           ├── courses/             # 강의 목록 컴포넌트
│           ├── courseDetail/        # 강의 상세 컴포넌트
│           ├── lecture/             # 플레이어 컴포넌트
│           ├── cart/                # 장바구니 컴포넌트
│           ├── myLearning/          # 내 학습 컴포넌트
│           ├── myPage/              # 마이페이지 컴포넌트
│           ├── instructor/          # 강사 관리 컴포넌트
│           └── hooks/               # 커스텀 훅
│
└── server/                          # NestJS 백엔드
    ├── nest-cli.json
    ├── tsconfig.json
    ├── tsconfig.build.json
    ├── package.json
    ├── .env
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   ├── youtube-test-seed.ts
    │   ├── youtube-test-clear.ts
    │   └── youtube-test-smoke.ts
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── app.controller.ts
        ├── app.service.ts
        ├── global/
        │   ├── global.exception.ts
        │   ├── global.response-interceptor.ts
        │   └── guards/
        │       ├── jwt-auth.guard.ts
        │       └── roles.guard.ts
        │   └── global_decorator/
        │       ├── public.decorator.ts
        │       ├── roles.decorator.ts
        │       └── user.decorator.ts
        ├── user/
        │   ├── auth/
        │   ├── user.module.ts
        │   ├── user.controller.ts
        │   ├── user.service.ts
        │   ├── user.repository.ts
        │   └── dto/
        ├── lectures_feature/
        │   ├── course/
        │   ├── chapter/
        │   ├── lecture/
        │   ├── category/
        │   └── lecture-comment/
        ├── commerce/
        ├── learning/
        ├── enrollment/
        ├── instructor/
        ├── admin/
        ├── attachment/
        ├── report/
        └── storage/
```

---

## 4. 환경 설정

### 4-1. 백엔드 `.env`
```env
DATABASE_URL="postgresql://postgres:shadower@localhost:5432/sec101"
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=your-32-character-access-secret-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here
REDIS_URL=redis://localhost:6379
```

### 4-2. 프론트엔드 환경변수
- `vite.config.ts`에서 `/api` → `http://localhost:3000` 프록시 설정
- `VITE_API_URL` 없으면 상대경로 사용 (프록시 통해 백엔드 접근)

### 4-3. 로컬 개발 실행 순서
```bash
# 1. PostgreSQL 시작
docker run -d --name sec101-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=shadower \
  -e POSTGRES_DB=sec101 \
  -p 5432:5432 postgres

# 2. Redis 시작
docker run -d --name sec101-redis -p 6379:6379 redis

# 3. 백엔드
cd server
npm install
npx prisma migrate dev
npm run start:dev      # http://localhost:3000

# 4. 프론트엔드 (별도 터미널)
cd client
npm install
npm run dev            # http://localhost:5173
```

---

## 5. 데이터베이스 스키마 (Prisma)

> **파일**: `server/prisma/schema.prisma`

```prisma
generator client {
  provider     = "prisma-client"
  output       = "./generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

// ── Enums ──────────────────────────────────────────────────────

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum Roles {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum CourseLifecycleStatus {
  DRAFT
  OPEN
  CANCELED
}

enum CartItemStatus {
  ACTIVE
  CHECKED_OUT
  REMOVED
}

enum EnrollmentStatus {
  ACTIVE
  CANCELED
  REFUNDED
}

enum OrderStatus {
  PENDING
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
  CANCELED
}

enum OrderItemStatus {
  PENDING
  ENROLLED
  CANCELED
  REFUNDED
}

enum PaymentProvider {
  TOSS
  DEMO
}

enum PaymentTransactionType {
  PAYMENT
  REFUND
  CANCEL
}

enum PaymentTransactionStatus {
  COMPLETED
  FAILED
  CANCELED
}

enum CancellationReason {
  USER_REQUEST
  COURSE_CANCELED
  CAPACITY_EXCEEDED
  UNDER_ENROLLED
  OTHER
}

enum EnrollmentHistoryType {
  ENROLLED
  CANCELED
  REFUNDED
}

enum LecturePlaybackEventType {
  STARTED
  PROGRESS
  RESUMED
  COMPLETED
}

enum ReportType {
  COPYRIGHT
  WRONG_INFO
  OTHER
}

// ── Models ─────────────────────────────────────────────────────

model users {
  id                       Int                      @id @default(autoincrement())
  name                     String
  email                    String                   @unique
  password                 String
  role                     Roles                    @default(STUDENT)
  description              String?                  @default("")
  updated_at               DateTime                 @updatedAt
  created_at               DateTime                 @default(now())
  cart_items               cart_items[]
  orders                   orders[]
  order_items              order_items[]
  enrollments              enrollments[]
  enrollment_histories     enrollment_history[]
  course_comments          course_comment[]
  lecture_comments         lecture_comment[]
  lecture_progress         lectures_progress[]
  lecture_playback_history lecture_playback_history[]
  lecture_bookmarks        lecture_bookmark[]
  payment_transactions     payment_transactions[]
}

model categories {
  id         Int       @id @default(autoincrement())
  name       String
  created_at DateTime  @default(now())
  courses    courses[]
}

model courses {
  id                   Int                   @id @default(autoincrement())
  title                String
  description          String
  instructor_id        Int
  thumbnail            String
  difficulty           Difficulty
  category_id          Int
  slug                 String                @unique
  price                Int
  rating               Float                 @default(0)
  max_capacity         Int                   @default(30)
  min_enrollment       Int                   @default(1)
  status               CourseLifecycleStatus @default(DRAFT)
  canceled_at          DateTime?
  cancel_reason        CancellationReason?
  created_at           DateTime              @default(now())
  updated_at           DateTime              @updatedAt
  category             categories            @relation(fields: [category_id], references: [id])
  chapters             chapter[]
  cart_items           cart_items[]
  order_items          order_items[]
  enrollments          enrollments[]
  enrollment_histories enrollment_history[]
  comments             course_comment[]
}

model chapter {
  id        Int        @id @default(autoincrement())
  course_id Int
  title     String
  position  Int
  courses   courses    @relation(fields: [course_id], references: [id], onDelete: Cascade)
  lectures  lectures[]

  @@unique([course_id, position])
}

model lectures {
  id               Int                        @id @default(autoincrement())
  chapter_id       Int
  title            String
  video_url        String
  thumbnail_url    String
  duration         Int
  position         Int
  is_published     Boolean                    @default(false)
  created_at       DateTime                   @default(now())
  chapters         chapter                    @relation(fields: [chapter_id], references: [id], onDelete: Cascade)
  progresses       lectures_progress[]
  playback_history lecture_playback_history[]
  bookmarks        lecture_bookmark[]
  lecture_comments lecture_comment[]
  attachments      lecture_attachment[]

  @@unique([chapter_id, position])
}

model lecture_attachment {
  id          Int      @id @default(autoincrement())
  lecture_id  Int
  filename    String
  stored_name String   @unique
  mime_type   String
  size        Int
  created_at  DateTime @default(now())
  lectures    lectures @relation(fields: [lecture_id], references: [id], onDelete: Cascade)

  @@index([lecture_id])
}

model cart_items {
  id             Int            @id @default(autoincrement())
  user_id        Int
  course_id      Int
  status         CartItemStatus @default(ACTIVE)
  added_at       DateTime       @default(now())
  updated_at     DateTime       @updatedAt
  checked_out_at DateTime?
  users          users          @relation(fields: [user_id], references: [id])
  courses        courses        @relation(fields: [course_id], references: [id], onDelete: Cascade)

  @@index([user_id, status])
  @@index([course_id, status])
}

model orders {
  id                   Int                    @id @default(autoincrement())
  user_id              Int
  order_number         String                 @unique
  provider             PaymentProvider        @default(TOSS)
  provider_order_id    String?
  status               OrderStatus            @default(PENDING)
  total_amount         Int
  paid_amount          Int                    @default(0)
  refunded_amount      Int                    @default(0)
  created_at           DateTime               @default(now())
  paid_at              DateTime?
  canceled_at          DateTime?
  updated_at           DateTime               @updatedAt
  users                users                  @relation(fields: [user_id], references: [id])
  items                order_items[]
  payment_transactions payment_transactions[]

  @@index([user_id, created_at])
}

model order_items {
  id                  Int                @id @default(autoincrement())
  order_id            Int
  user_id             Int
  course_id           Int
  price               Int
  status              OrderItemStatus    @default(PENDING)
  enrolled_at         DateTime?
  canceled_at         DateTime?
  refund_amount       Int                @default(0)
  cancellation_reason CancellationReason?
  created_at          DateTime           @default(now())
  updated_at          DateTime           @updatedAt
  orders              orders             @relation(fields: [order_id], references: [id])
  users               users              @relation(fields: [user_id], references: [id])
  courses             courses            @relation(fields: [course_id], references: [id])
  enrollment          enrollments?

  @@index([order_id, status])
  @@index([user_id, course_id])
}

model payment_transactions {
  id               Int                      @id @default(autoincrement())
  order_id         Int
  user_id          Int
  provider         PaymentProvider          @default(TOSS)
  transaction_type PaymentTransactionType
  status           PaymentTransactionStatus @default(COMPLETED)
  amount           Int
  payment_key      String?
  transaction_key  String?
  reason           String?
  metadata         Json?
  created_at       DateTime                 @default(now())
  approved_at      DateTime?
  canceled_at      DateTime?
  orders           orders                   @relation(fields: [order_id], references: [id])
  users            users                    @relation(fields: [user_id], references: [id])

  @@index([order_id, created_at])
  @@index([user_id, transaction_type])
}

model enrollments {
  id                  Int                @id @default(autoincrement())
  user_id             Int
  course_id           Int
  order_item_id       Int?               @unique
  status              EnrollmentStatus   @default(ACTIVE)
  is_canceled         Boolean            @default(false)
  enrolled_at         DateTime           @default(now())
  canceled_at         DateTime?
  cancellation_reason CancellationReason?
  users               users              @relation(fields: [user_id], references: [id])
  courses             courses            @relation(fields: [course_id], references: [id], onDelete: Cascade)
  order_item          order_items?       @relation(fields: [order_item_id], references: [id])
  histories           enrollment_history[]

  @@index([user_id, course_id, status])
}

model enrollment_history {
  id            Int                   @id @default(autoincrement())
  enrollment_id Int
  user_id       Int
  course_id     Int
  event_type    EnrollmentHistoryType
  reason        String?
  created_at    DateTime              @default(now())
  enrollment    enrollments           @relation(fields: [enrollment_id], references: [id], onDelete: Cascade)
  users         users                 @relation(fields: [user_id], references: [id])
  courses       courses               @relation(fields: [course_id], references: [id], onDelete: Cascade)

  @@index([enrollment_id, created_at])
  @@index([user_id, course_id, created_at])
}

model course_comment {
  id         Int      @id @default(autoincrement())
  title      String
  content    String
  star       Int      @default(0)
  user_id    Int
  course_id  Int
  create_at  DateTime @default(now())
  updated_at DateTime @updatedAt
  users      users    @relation(fields: [user_id], references: [id])
  courses    courses  @relation(fields: [course_id], references: [id], onDelete: Cascade)

  @@unique([user_id, course_id])
  @@index([course_id, create_at])
}

model lecture_comment {
  id         Int      @id @default(autoincrement())
  title      String?
  content    String
  star       Int      @default(0)
  user_id    Int
  lecture_id Int
  create_at  DateTime @default(now())
  users      users    @relation(fields: [user_id], references: [id])
  lectures   lectures @relation(fields: [lecture_id], references: [id], onDelete: Cascade)
}

model lectures_progress {
  id              Int      @id @default(autoincrement())
  user_id         Int
  lecture_id      Int
  last_position   Int      @default(0)
  watched_seconds Int      @default(0)
  progress        Int      @default(0)
  is_completed    Boolean  @default(false)
  updated_at      DateTime @updatedAt
  users           users    @relation(fields: [user_id], references: [id])
  lectures        lectures @relation(fields: [lecture_id], references: [id], onDelete: Cascade)

  @@unique([user_id, lecture_id])
  @@index([lecture_id, progress])
}

model lecture_playback_history {
  id         Int                      @id @default(autoincrement())
  user_id    Int
  lecture_id Int
  event_type LecturePlaybackEventType
  from_second Int                     @default(0)
  to_second   Int                     @default(0)
  progress    Int                     @default(0)
  created_at  DateTime                @default(now())
  users       users                   @relation(fields: [user_id], references: [id])
  lectures    lectures                @relation(fields: [lecture_id], references: [id], onDelete: Cascade)

  @@index([user_id, lecture_id, created_at])
}

model lecture_bookmark {
  id         Int      @id @default(autoincrement())
  user_id    Int
  lecture_id Int
  note       String?
  position   Int
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  users      users    @relation(fields: [user_id], references: [id])
  lectures   lectures @relation(fields: [lecture_id], references: [id], onDelete: Cascade)

  @@index([user_id, lecture_id, created_at])
}

model course_report {
  id          Int        @id @default(autoincrement())
  course_id   Int
  user_id     Int
  type        ReportType
  content     String
  is_resolved Boolean    @default(false)
  created_at  DateTime   @default(now())
}
```

---

## 6. 백엔드 아키텍처

### 6-1. 레이어 구조
```
Controller (HTTP 진입점)
  → Service (비즈니스 로직)
  → Repository (데이터 접근, Prisma)
  → Prisma Client (DB)
```

### 6-2. 전역 설정 (`server/src/main.ts`)
```typescript
// Bootstrap 설정
- CORS: CLIENT_ORIGIN 환경변수로 허용 origin 설정, credentials: true
- cookieParser() 미들웨어
- ValidationPipe: transform, whitelist, forbidNonWhitelisted, stopAtFirstError
- Swagger: /api-docs-v1 경로
- 포트: process.env.PORT ?? 3000
```

### 6-3. 전역 필터 & 인터셉터

**GlobalExceptionFilter** (`global/global.exception.ts`)
- HttpException 처리
- 500 이상: Logger.error()
- 그 외: Logger.warn()
- 응답 형식: `{ ...res, timestamp, path, method }`

**ResponseInterCeptor** (`global/global.response-interceptor.ts`)
- 모든 성공 응답을 래핑:
```json
{
  "success": true,
  "status": 200,
  "message": "",
  "data": {}
}
```

### 6-4. 모듈 목록 (`app.module.ts`)
```
CourseModule, ChapterModule, CategoryModule, LectureModule
UserModule, CommerceModule, LearningModule, EnrollmentModule
InstructorModule, AdminModule, ReportModule, AttachmentModule
LectureCommentModule
```

### 6-5. 인증 구조

**JWT 전략**
- Access Token: 메모리 (프론트엔드 변수)
- Refresh Token: HttpOnly Cookie (보안)

**가드**
- `JwtAuthGuard`: 모든 보호 라우트에 전역 적용
- `RolesGuard`: `@Roles()` 데코레이터와 함께 역할 제한
- `@Public()` 데코레이터: JWT 검증 우회 (공개 라우트)
- `@Roles(Roles.ADMIN, Roles.INSTRUCTOR)`: 역할별 접근 제한
- `@User()` 데코레이터: JWT 페이로드에서 현재 사용자 주입

---

## 7. API 엔드포인트 전체 목록

**Base URL**: `/api/v1`

### 인증 (`/auth`)
```
POST /auth/register      → 회원가입 (name, email, password, role: STUDENT|INSTRUCTOR, description?)
POST /auth/login         → 로그인 → { user, accessToken } + Refresh Token Cookie
POST /auth/logout        → 로그아웃 (쿠키 삭제)
POST /auth/refresh       → 액세스 토큰 갱신 (쿠키의 리프레시 토큰 사용)
GET  /auth/me            → 현재 사용자 정보
```

### 사용자 (`/users`)
```
GET   /users/:userId     → 사용자 프로필 조회
PATCH /users/:userId     → 프로필 수정 (name, description)
```

### 카테고리 (`/categories`)
```
GET    /categories                    → 전체 카테고리 목록 [@Public]
POST   /categories                    → 카테고리 생성 [@Roles(ADMIN)]
PATCH  /categories/:categoryId        → 카테고리 수정 [@Roles(ADMIN)]
DELETE /categories/:categoryId        → 카테고리 삭제 [@Roles(ADMIN)]
GET    /categories/:categoryId/courses → 카테고리별 강의 [@Public]
```

### 강의 목록 (`/courses`)
```
GET  /courses            → 강의 목록 [@Public] (params: search, categoryId, page, limit)
GET  /courses/:courseId  → 강의 상세 [@Public]
POST /courses            → 강의 생성
```

### 챕터 (`/chapters`)
```
GET    /courses/:courseId/chapters               → 강의 챕터 목록
POST   /chapters                                 → 챕터 생성
GET    /chapters/:chapterId                      → 챕터 단건 조회
GET    /chapters/:chapterId/lectures             → 챕터 강의 목록
```

### 강의(Lecture) (`/lectures`)
```
GET  /lectures/:lectureId                      → 강의 단건 조회 (수강 권한 확인)
POST /lectures                                  → 강의 생성
GET  /lectures/:lectureId/progress             → 진도 조회 (params: userId)
PUT  /lectures/:lectureId/progress             → 진도 저장 (lastPosition, watchedSeconds, eventType)
GET  /lectures/:lectureId/bookmarks            → 북마크 목록 (params: userId)
POST /lectures/:lectureId/bookmarks            → 북마크 추가 (userId, position, note?)
GET  /lectures/:lectureId/comments             → 댓글 목록
POST /lectures/:lectureId/comments             → 댓글 작성 (content)
DELETE /lectures/:lectureId/comments/:commentId → 댓글 삭제
GET  /lectures/:lectureId/attachments          → 강의자료 목록
```

### 북마크
```
DELETE /bookmarks/:bookmarkId  → 북마크 삭제 (params: userId)
```

### 강의 리뷰
```
GET  /courses/:courseId/reviews  → 강의 리뷰 목록
POST /courses/:courseId/reviews  → 리뷰 작성 (userId, title, content, star)
```

### 장바구니 & 결제 (`/cart`, `/orders`)
```
GET    /cart                           → 장바구니 조회 (params: userId)
POST   /cart/items                     → 장바구니 담기 (userId, courseId)
DELETE /cart/items/:cartItemId         → 장바구니 삭제 (params: userId)
POST   /orders/checkout                → 결제·주문 생성 (userId, cartItemIds, provider: DEMO|TOSS)
GET    /orders                         → 주문 목록 (params: userId)
POST   /orders/:orderId/cancel         → 주문 취소 (userId, reason, orderItemIds?)
```

### 학습 (`/users/:userId`)
```
GET /users/:userId/learning                              → 내 수강 강의 목록
GET /users/:userId/courses/:courseId/learning-status     → 강의 수강 상태 + 진도
```

### 첨부파일
```
GET /attachments/:attachmentId/download  → 파일 다운로드 (수강 여부 확인)
```

### 신고
```
POST /courses/:courseId/reports  → 강의 신고 (userId, type: COPYRIGHT|WRONG_INFO|OTHER, content)
```

### 강사 (`/instructor`) — @Roles(INSTRUCTOR, ADMIN)
```
GET    /instructor/courses                              → 내 강의 목록
POST   /instructor/courses                              → 강의 생성
PATCH  /instructor/courses/:courseId                    → 강의 수정
DELETE /instructor/courses/:courseId                    → 강의 삭제
PATCH  /instructor/courses/:courseId/status             → 강의 상태 변경 (DRAFT|OPEN)
POST   /instructor/courses/:courseId/chapters           → 챕터 추가
PATCH  /instructor/courses/:courseId/chapters/:chapterId → 챕터 수정
DELETE /instructor/courses/:courseId/chapters/:chapterId → 챕터 삭제
POST   /instructor/chapters/:chapterId/lectures          → 강의 추가
PATCH  /instructor/lectures/:lectureId                  → 강의 수정
DELETE /instructor/lectures/:lectureId                  → 강의 삭제
GET    /instructor/courses/:courseId/students           → 수강생 목록
DELETE /instructor/courses/:courseId/students/:userId   → 수강생 추방
POST   /instructor/lectures/:lectureId/attachments      → 자료 업로드 (multipart/form-data)
DELETE /instructor/attachments/:attachmentId            → 자료 삭제
```

### 관리자 (`/admin`) — @Roles(ADMIN)
```
GET    /admin/dashboard                  → 대시보드 통계
GET    /admin/users                      → 사용자 목록 (search, role, page, limit)
PATCH  /admin/users/:userId/role         → 역할 변경 (role: STUDENT|INSTRUCTOR|ADMIN)
POST   /admin/users/:userId/ban          → 사용자 정지
DELETE /admin/users/:userId              → 사용자 삭제
GET    /admin/courses                    → 강의 목록 (search, categoryId, status, page, limit)
DELETE /admin/courses/:courseId          → 강의 삭제
GET    /admin/categories                 → 카테고리 목록
GET    /admin/reports                    → 신고 목록 (isResolved, type, page, limit)
PATCH  /admin/reports/:reportId          → 신고 처리 (isResolved: boolean)
```

---

## 8. 프론트엔드 라우팅

```typescript
// App.tsx — createBrowserRouter 구조
"/"                                → MainPage (홈)
"/courses"                         → CoursePage (강의 목록)
"/courses/:courseId"               → CourseDetailPage (강의 상세)
"/courses/:courseId/learn/:lectureId" → LecturePage (플레이어)
"/login"                           → LoginPage
"/register"                        → RegisterPage
"/my-learning"                     → MyLearningPage
"/my-page"                         → MyPage
"/cart"                            → CartPage
"/instructor/courses"              → InstructorCoursesPage
"/instructor/courses/new"          → InstructorCreateCoursePage
"/instructor/courses/:courseId/edit" → InstructorCourseEditPage
"/admin/login"                     → AdminLoginPage (독립 로그인)
"/admin"                           → AdminLayout (사이드바 레이아웃)
  "/admin/dashboard"               → AdminDashboardPage
  "/admin/users"                   → AdminUsersPage
  "/admin/courses"                 → AdminCoursesPage
  "/admin/categories"              → AdminCategoriesPage
  "/admin/reports"                 → AdminReportsPage
"*"                                → Navigate to "/"
```

**로딩 상태**: `RouterFallback` 컴포넌트
```tsx
<div className="app-loading">
  <div className="app-loading__mark">SEC101</div>
  <p>화면을 준비하는 중입니다...</p>
</div>
```

---

## 9. 인증 플로우 (프론트엔드)

### `AuthContext.tsx` 동작
- `localStorage` 키: `"sec101_user"` (User 객체 JSON)
- 페이지 로드 시: localStorage에 사용자가 있으면 `/auth/refresh` 호출해 토큰 복원
- `authReady: false` 동안 세션 확인 중 스피너 표시
- `authReady: true` 이후 자식 렌더링

### `api.ts` Axios 인터셉터
- 요청 인터셉터: `_accessToken`이 있으면 `Authorization: Bearer ${_accessToken}` 헤더 추가
- 응답 인터셉터: 401 응답 시 토큰 갱신 후 원래 요청 재시도
  - 동시 여러 요청의 401: `_isRefreshing` 플래그로 중복 갱신 방지
  - 갱신 실패 시: 로그아웃

### 메모리 토큰 관리
```typescript
let _accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { _accessToken = token; }
export const getAccessToken = () => _accessToken;
```

---

## 10. 상태 관리

- **전역 인증**: `AuthContext` (React Context)
- **서버 데이터**: TanStack Query v5 (`useQuery`, `useMutation`, `useQueryClient`)
- **사용자 프로필**: localStorage (`"sec101_user"` 키)
- **로컬 UI 상태**: `useState`

### TanStack Query 설정 (`main.tsx`)
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
// <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
```

---

## 11. 디자인 시스템 (완전 재현용)

> **중요**: 아래 CSS는 `client/src/index.css` 전체 내용이다.  
> 외부 UI 라이브러리 없음 — 순수 Vanilla CSS.

### 폰트 임포트
```css
@import url("https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@700;800&family=Noto+Sans+KR:wght@400;500;700;900&display=swap");
```

### 디자인 토큰 (CSS 변수)
```css
:root {
  --text-primary: #f3f7ff;
  --text-secondary: #aec2d7;
  --text-muted: #90a7bf;
  --accent-primary: #00ff88;
  --surface-secondary: rgba(255, 255, 255, 0.04);
  --surface-tertiary: rgba(255, 255, 255, 0.07);
  --border-subtle: rgba(112, 132, 155, 0.2);
  --error: #ff5a72;
  --success: #00ff88;
  --warning: #ffc046;
}
```

### 배경 (전체 사이트 공통)
```css
background:
  radial-gradient(circle at top, rgba(0, 255, 136, 0.11), transparent 28%),
  radial-gradient(circle at 85% 15%, rgba(77, 171, 255, 0.12), transparent 22%),
  #07111b;
color: #f3f7ff;
```

### 폰트 사용 규칙
- **기본 텍스트**: `Noto Sans KR, sans-serif`
- **제목 (h1, h2)**: `Syne, Noto Sans KR, sans-serif`
- **코드/태그/배지**: `Share Tech Mono, monospace`

### 레이아웃 컨테이너
```css
.site-container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}
.page-shell { min-height: 100vh; display: flex; flex-direction: column; }
.page-main { padding-top: 88px; flex: 1; }
```

### 버튼 클래스
```css
.button          → 기본 버튼 (pill 형태, min-height 44px, hover 시 -1px translateY)
.button--primary → 그린 그라디언트 (#00ff88 → #b8ffcf), 텍스트: #03110b
.button--ghost   → 반투명 다크 배경, 테두리 있음
.button--danger  → 붉은 계열 (rgba(255,90,114,0.15))
.button:disabled → opacity 0.45, cursor not-allowed
```

### 헤더 `.site-header`
- `position: fixed`, `z-index: 50`
- 스크롤 시 `.site-header--scrolled` 클래스 추가: `backdrop-filter: blur(18px)`, 반투명 배경
- 높이: 72px (`.site-header__inner`)
- 브랜드로고 왼쪽, 내비게이션 중간, 액션(장바구니·로그인) 오른쪽

### 강의 카드 `.course-card`
```css
border-radius: 24px;
background: linear-gradient(180deg, rgba(10,23,37,0.92), rgba(7,14,24,0.78));
border: 1px solid rgba(112,132,155,0.18);
hover: translateY(-4px), border-color rgba(0,255,136,0.28), box-shadow 0 26px 70px rgba(0,0,0,0.28)
```
- 그리드: `repeat(3, minmax(0, 1fr))`, gap 18px
- 미디어 영역 min-height: 190px

### 학습 카드 `.learning-card`
- 같은 패턴, 3열 그리드
- 하단 진행률 바: `.progress-bar` / `.progress-bar__fill` (그린-블루 그라디언트)
- 오버레이: `#00ff88` 색상 퍼센트 표시

### 섹션 제목 (`.section-heading h2`)
```css
font-family: "Syne", "Noto Sans KR", sans-serif;
font-size: clamp(1.9rem, 3vw, 2.7rem);
```

### `.eyebrow` (작은 섹션 레이블)
```css
color: #00ff88;
font-family: "Share Tech Mono", monospace;
font-size: 0.76rem;
letter-spacing: 0.24em;
text-transform: uppercase;
```

### 칩 필터 `.chip`
```css
padding: 10px 16px;
border-radius: 999px;
border: 1px solid rgba(112,132,155,0.22);
background: rgba(7,17,27,0.52);
active: border-color rgba(0,255,136,0.38), color #03110b, background #00ff88
```

### 플레이어 페이지 레이아웃
```css
.player-page → min-height 100vh, grid (topbar + content)
.player-layout → grid-template-columns: 1fr 360px, gap 20px, padding 20px
.player-video → min-height 520px (모바일: 280px)
.player-sidebar → 360px 너비, overflow-y: auto
.player-topbar → back 버튼(#00ff88), 강의 제목, 액션 버튼
```

### 어드민 테이블
```css
.admin-table-wrap → overflow-x auto, border-radius 12px
.admin-table th → uppercase, letter-spacing, background rgba(255,255,255,0.04)
.admin-table tbody tr:hover td → background rgba(255,255,255,0.03)
```

### 배지 `.badge`
```css
.badge--success → rgba(0,255,136,0.12) 배경, #00ff88 텍스트
.badge--neutral → rgba(112,132,155,0.15) 배경
.badge--warning → rgba(255,192,70,0.12) 배경, #ffc046 텍스트
```

### 모달 `.modal`
```css
.modal-backdrop → fixed, inset 0, rgba(0,0,0,0.65), z-index 1000
.modal → max-width 480px, border-radius 12px, #1a2332 배경
```

### 인증 페이지 `.auth-card`
```css
max-width: 440px;
padding: 36px;
border-radius: 28px;
background: rgba(7,17,27,0.88);
입력 필드 focus: border-color rgba(0,255,136,0.5)
```

### 반응형 브레이크포인트
```css
/* 1024px 이하 */
.hero-section__grid, .detail-hero, .detail-layout, .player-layout,
.roadmap-panel, .cart-layout → grid-template-columns: 1fr

.course-grid, .stats-grid, .my-learning-grid → repeat(2, 1fr)
.player-sidebar → min-height 320px

/* 760px 이하 */
.site-header__nav → display none
.site-header__username → display none
.hero-grid, .stat-strip, .course-grid, .stats-grid, .my-learning-grid → 1fr
.player-video → min-height 280px
```

### 스크롤바
```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.25); border-radius: 999px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
```

### 스켈레톤 애니메이션
```css
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -20% 0; }
}
.skeleton-block, .skeleton-line {
  background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  background-size: 220% 100%;
  animation: shimmer 1.5s infinite linear;
}
```

---

## 12. 주요 TypeScript 타입

> **파일**: `client/src/features/shared/types/`

```typescript
// 사용자
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole; // "STUDENT" | "INSTRUCTOR" | "ADMIN"
  description?: string;
  created_at: string;
  updated_at: string;
}

// 강의 (목록용)
interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
  thumbnail: string;
  difficulty: Difficulty; // "EASY" | "MEDIUM" | "HARD"
  category_id: number;
  slug: string;
  price: number;  // 원(KRW) 단위
  rating: number;
  max_capacity: number;
  min_enrollment: number;
  status: CourseStatus; // "DRAFT" | "OPEN" | "CANCELED"
  created_at: string;
  updated_at: string;
}

// 강의 상세 (챕터·강의 포함)
interface CourseListData {
  courses: Course[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}

// 챕터
interface Chapter {
  id: number;
  course_id: number;
  title: string;
  position: number;
  lectures: Lecture[];
}

// 강의 단건
interface Lecture {
  id: number;
  chapter_id: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration: number; // 초
  position: number;
  is_published: boolean;
}

// 강의 상세 (플레이어)
interface LectureDetail extends Lecture {
  progress?: LectureProgress;
  isEnrolled: boolean;
}

// 진도
interface LectureProgress {
  id: number;
  user_id: number;
  lecture_id: number;
  last_position: number;
  watched_seconds: number;
  progress: number; // 0-100
  is_completed: boolean;
  updated_at: string;
}

// 북마크
interface LectureBookmark {
  id: number;
  user_id: number;
  lecture_id: number;
  position: number;
  note?: string;
  created_at: string;
}

// 댓글
interface LectureComment {
  id: number;
  user_id: number;
  lecture_id: number;
  content: string;
  create_at: string;
  users: { name: string };
}

// 장바구니
interface CartSummary {
  items: CartItem[];
  total: number;
}

interface CartItem {
  id: number;
  user_id: number;
  course_id: number;
  status: CartItemStatus;
  courses: Course;
}

// 주문
interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  paid_amount: number;
  provider: "TOSS" | "DEMO";
  created_at: string;
  items: OrderItem[];
}

// 수강 목록 카드
interface LearningCourseCard {
  course: Course;
  enrollment: { id: number; status: EnrollmentStatus; enrolled_at: string };
  overallProgress: number; // 0-100
}

// 강의 수강 상태
interface CourseLearningStatus {
  isEnrolled: boolean;
  progress: LectureProgress[];
  lectures: Lecture[];
}

// 강의 첨부파일
interface LectureAttachment {
  id: number;
  lecture_id: number;
  filename: string;
  stored_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

// 강의 리뷰
interface CourseReview {
  id: number;
  user_id: number;
  course_id: number;
  title: string;
  content: string;
  star: number; // 1-5
  create_at: string;
  users: { name: string };
}

// API 공통 응답
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

interface PaginatedData<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}

// 강사 전용 타입
interface InstructorCourse extends Course {
  chapters: InstructorChapter[];
  enrollmentCount: number;
}

interface InstructorChapter {
  id: number;
  course_id: number;
  title: string;
  position: number;
  lectures: InstructorLecture[];
}

interface InstructorLecture extends Lecture {
  attachments?: LectureAttachment[];
}

interface InstructorStudent {
  userId: number;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
}

// 관리자 전용 타입
interface AdminDashboard {
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  newUsersToday: number;
  totalCourses: number;
  activeEnrollments: number;
  unresolvedReports: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface AdminCourse {
  id: number;
  title: string;
  instructor_id: number;
  status: CourseStatus;
  price: number;
  created_at: string;
}

interface AdminReport {
  id: number;
  course_id: number;
  user_id: number;
  type: ReportType; // "COPYRIGHT" | "WRONG_INFO" | "OTHER"
  content: string;
  is_resolved: boolean;
  created_at: string;
}

// Enum 타입
type Difficulty = "EASY" | "MEDIUM" | "HARD";
type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";
type CourseStatus = "DRAFT" | "OPEN" | "CANCELED";
type CartItemStatus = "ACTIVE" | "CHECKED_OUT" | "REMOVED";
type EnrollmentStatus = "ACTIVE" | "CANCELED" | "REFUNDED";
type OrderStatus = "PENDING" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED" | "CANCELED";
type LecturePlaybackEventType = "STARTED" | "PROGRESS" | "RESUMED" | "COMPLETED";
type CancellationReason = "USER_REQUEST" | "COURSE_CANCELED" | "CAPACITY_EXCEEDED" | "UNDER_ENROLLED" | "OTHER";
type ReportType = "COPYRIGHT" | "WRONG_INFO" | "OTHER";
```

---

## 13. 비즈니스 로직 규칙

### 강의 잠금/잠금해제
- 강의 목록에서 `OPEN` 상태만 노출 (`DRAFT` 비노출)
- 플레이어: 이전 강의가 미완료(`progress < 80%`)이면 다음 강의 잠금
- 잠금된 강의는 `.sidebar-lecture.is-locked` 클래스 적용, `cursor: not-allowed`
- 완강(80% 이상)하면 다음 강의 잠금 해제 + 자동 이동

### 진도 저장 규칙
- 1초마다 position 추적
- 10초 인터벌로 서버에 저장 (`PUT /lectures/:id/progress`)
- 페이지 이탈 시 `navigator.sendBeacon` (keepalive fetch)로 최종 진도 저장

### 장바구니 & 결제
- 이미 수강 중인 강의는 장바구니에 담을 수 없음
- 데모 결제: provider `"DEMO"` → 서버에서 즉시 `PAID` 처리 + 수강 등록
- 결제 완료 후 cart_items의 status → `CHECKED_OUT`
- 주문 취소: order_items → `CANCELED`, enrollments → `CANCELED`

### 강의 상태 관리 (INSTRUCTOR)
- 생성 시 기본 상태: `DRAFT`
- `DRAFT` → `OPEN`: 강의가 공개되어 수강생이 볼 수 있음
- `OPEN` → `DRAFT`: 강의가 비공개됨 (기존 수강생은 계속 수강 가능)

### 수강생 추방 (INSTRUCTOR)
- DELETE `/instructor/courses/:id/students/:userId`
- enrollment status → `CANCELED`

---

## 14. 구현 체크리스트 (Phase별)

### Phase 1: 프로젝트 초기화
- [ ] `server/` — NestJS 프로젝트 생성 (`nest new`)
- [ ] `client/` — React + Vite 프로젝트 생성 (`npm create vite@latest`)
- [ ] TypeScript 설정 파일 구성
- [ ] `.env` 파일 생성
- [ ] Docker PostgreSQL + Redis 실행 확인

### Phase 2: DB 스키마
- [ ] `prisma/schema.prisma` — 위 스키마 완전 복사
- [ ] `npx prisma migrate dev` 실행
- [ ] Prisma Client 생성 확인 (`./generated/prisma`)

### Phase 3: 백엔드 전역 설정
- [ ] `main.ts` — CORS, cookie-parser, ValidationPipe, Swagger
- [ ] `global/global.exception.ts` — GlobalExceptionFilter
- [ ] `global/global.response-interceptor.ts` — ResponseInterCeptor
- [ ] JWT 가드, RolesGuard 구현
- [ ] `@Public()`, `@Roles()`, `@User()` 데코레이터

### Phase 4: 백엔드 인증 모듈 (`user/`)
- [ ] 회원가입: bcrypt 해시, 역할 선택(STUDENT/INSTRUCTOR)
- [ ] 로그인: Access Token (JWT) + Refresh Token (HttpOnly Cookie)
- [ ] 로그아웃: 쿠키 삭제
- [ ] 토큰 갱신: Refresh Token → 새 Access Token
- [ ] Redis에 Refresh Token 저장/검증
- [ ] 사용자 프로필 조회/수정

### Phase 5: 백엔드 강의 모듈
- [ ] CategoryModule: CRUD
- [ ] CourseModule: 목록(필터/검색/페이지), 상세
- [ ] ChapterModule: CRUD
- [ ] LectureModule: CRUD + 진도 추적 + 북마크 + 댓글

### Phase 6: 백엔드 상거래 모듈
- [ ] CommerceModule: 장바구니, 주문, 데모 결제
- [ ] EnrollmentModule: 수강 등록/조회
- [ ] LearningModule: 내 학습 목록, 강의 수강 상태

### Phase 7: 백엔드 강사 모듈
- [ ] InstructorModule: 강의/챕터/강의 CRUD, 상태 변경
- [ ] AttachmentModule: 파일 업로드(multer), 다운로드
- [ ] 수강생 목록/추방

### Phase 8: 백엔드 관리자 모듈
- [ ] AdminModule: 대시보드, 사용자/강의/카테고리/신고 관리
- [ ] ReportModule: 신고 생성

### Phase 9: 프론트엔드 기초
- [ ] `index.css` — 위 디자인 시스템 완전 복사
- [ ] `main.tsx` — QueryClientProvider 래핑
- [ ] `App.tsx` — 라우터 정의
- [ ] `api.ts` — Axios 클라이언트 + 인터셉터
- [ ] `AuthContext.tsx` — 인증 상태 관리

### Phase 10: 프론트엔드 — SiteHeader & SiteFooter
- [ ] 고정 헤더, 스크롤 시 블러 효과
- [ ] 장바구니 뱃지 (담긴 수량)
- [ ] 로그인 상태에 따른 CTA 버튼 분기
- [ ] 강사 역할이면 "내 강의" 링크 표시

### Phase 11: 프론트엔드 — 홈페이지 (`/`)
- [ ] Hero 섹션: 제목, 설명, CTA 버튼 + 오른쪽 히어로 카드 그리드
- [ ] Stats 섹션: 플랫폼 통계 카드 4개
- [ ] 카테고리별 최신 강의 6개 그리드
- [ ] 로드맵 패널 (2열 레이아웃)

### Phase 12: 프론트엔드 — 강의 목록 (`/courses`)
- [ ] 검색 입력 + 카테고리 칩 필터
- [ ] 3열 강의 카드 그리드 (스켈레톤 로딩)
- [ ] 페이지네이션
- [ ] 빈 상태 표시 (`.empty-state`)

### Phase 13: 프론트엔드 — 강의 상세 (`/courses/:courseId`)
- [ ] 상단: 강의 제목/설명/메타 + 사이드바(썸네일, 가격, CTA)
- [ ] CTA 분기: 미로그인→로그인, 수강중→이어보기, 장바구니에 있음, 수강 안 함→담기
- [ ] 커리큘럼 아코디언 (챕터 > 강의)
- [ ] 하단: 강의 리뷰 목록 + 리뷰 작성 폼 (수강생만)
- [ ] 강의 신고 버튼 (수강생, 신고 유형 선택 모달)

### Phase 14: 프론트엔드 — 플레이어 (`/courses/:courseId/learn/:lectureId`)
- [ ] 별도 레이아웃 (헤더 없음, topbar)
- [ ] YouTube 임베드 (`react-youtube`) 또는 `<video>` 태그
- [ ] 마지막 시청 위치 이어보기
- [ ] 1초 position 추적, 10초 인터벌 저장
- [ ] 페이지 이탈 시 keepalive 저장
- [ ] 이전/다음 강의 버튼
- [ ] 우측 사이드바: 챕터 > 강의 목록, 잠금/해제/현재 강의 표시
- [ ] 하단: 강의 제목/설명, 북마크 패널, 댓글 패널, 첨부파일 목록

### Phase 15: 프론트엔드 — 장바구니 (`/cart`)
- [ ] 체크박스로 강의 선택
- [ ] 오른쪽 가격 요약 패널 (sticky)
- [ ] 결제 버튼 → 데모 결제 처리

### Phase 16: 프론트엔드 — 내 학습 (`/my-learning`)
- [ ] 수강 중인 강의 카드 3열 그리드
- [ ] 진행률 바 표시
- [ ] 클릭 시 마지막 시청 강의로 이동

### Phase 17: 프론트엔드 — 마이페이지 (`/my-page`)
- [ ] 이름/자기소개 수정 폼
- [ ] 주문 내역

### Phase 18: 프론트엔드 — 강사 패널
- [ ] `/instructor/courses` — 내 강의 목록 (상태 뱃지, 편집/삭제/공개토글)
- [ ] `/instructor/courses/new` — 강의 생성 폼
- [ ] `/instructor/courses/:courseId/edit` — 강의 편집 (메타 + 챕터/강의 CRUD + 첨부파일 + 수강생 목록)

### Phase 19: 프론트엔드 — 관리자 패널
- [ ] `/admin/login` — ADMIN 전용 로그인 (일반 로그인과 분리)
- [ ] `AdminLayout` — 사이드바 네비게이션
- [ ] `/admin/dashboard` — 통계 카드 7개
- [ ] `/admin/users` — 테이블, 검색, 역할필터, 역할변경/정지/삭제
- [ ] `/admin/courses` — 테이블, 검색, 상태필터, 삭제
- [ ] `/admin/categories` — 인라인 편집, 추가, 삭제
- [ ] `/admin/reports` — 테이블, 처리완료 토글

---

## 15. 페이지별 UI 세부 명세

### 메인 페이지 (`/`)
```
[Hero Section]
  좌측: eyebrow "SECURITY LEARNING" | 제목(Syne 폰트) | 부제 | CTA 버튼 2개
  우측: 2×2 그리드 카드 (보안 도구 아이콘 + 이름 + 설명)

[Stat Strip]
  3열: 총 강의 수 | 수강생 수 | 강사 수 (아이콘 + 숫자 + 라벨)

[Category Section]
  eyebrow | 제목 | 카테고리별 강의 6개 3열 그리드

[Roadmap Panel]
  좌측: 단계별 학습 로드맵 리스트
  우측: 요약 카드
```

### 강의 목록 (`/courses`)
```
[Page Banner]
  배너 영역 (반투명 패널): "강의 탐색" 제목 + 설명

[Search Panel]
  검색 입력 | 정렬 드롭다운

[Category Chip Filter]
  "전체" + 카테고리 칩들 (수평 스크롤)

[Course Grid]
  3열 카드 그리드 → 로딩 시 스켈레톤 카드
  카드: 썸네일(190px) + 난이도 뱃지 + 제목 + 설명 + 카테고리/가격 메타

[Pagination]
  이전/다음 버튼 + 현재 페이지 표시
```

### 강의 상세 (`/courses/:courseId`)
```
[Detail Hero] (2열)
  좌: 카테고리/난이도 메타 | 제목(Syne) | 설명 | 통계(강의수, 총시간, 수강생)
  우: 썸네일 이미지 | 가격 | CTA 버튼

[Detail Layout] (메인 + 300px 사이드)
  메인:
    [Chapter Accordion]
      챕터 헤더(토글) → 강의 행 목록
      강의 행: 제목 | 재생시간 | 잠금 아이콘(비공개) | 진도율(수강생)
    [Reviews Section]
      리뷰 카드 목록 | 리뷰 작성 폼(별점 + 제목 + 내용)
  사이드:
    Summary Card (강의 포함 내용 요약)
    Report Button
```

### 플레이어 (`/courses/:courseId/learn/:lectureId`)
```
[Player Topbar]
  ← 뒤로 (그린) | 강의 제목 + 강의 이름 | 이전/다음 버튼

[Player Layout] (메인 + 360px 사이드바)
  메인:
    [Player Video] → YouTube 임베드 또는 <video>
    [Player Info] → 제목, 메타(챕터명, 재생시간, 진도율)
    [Player Attachments] → 자료 목록 (파일명 + 크기 + 다운로드)
    [Bookmark Panel] → 북마크 추가 폼 + 북마크 목록
    [Player Comments] → 댓글 입력(Ctrl+Enter) + 댓글 목록

  사이드바:
    헤더: "강의 목차"
    챕터 토글 → 강의 행 (활성=파란 하이라이트, 잠금=흐림)
```

### 강사 강의 편집 (`/instructor/courses/:courseId/edit`)
```
[Course Meta Section]
  제목/설명/가격/난이도/카테고리/최대수강인원 편집 폼
  공개/비공개 토글 버튼

[Curriculum Section]
  챕터 목록 (드래그 또는 순서 버튼으로 정렬)
  챕터 내 강의 목록
  강의 추가/수정/삭제
  강의 자료 업로드/삭제

[Students Section]
  수강생 목록 테이블 (이름, 이메일, 등록일, 진도율, 추방 버튼)
```

### 관리자 대시보드 (`/admin/dashboard`)
```
[Stats Grid] (4열 + 3열 2행)
  총 매출 | 월 매출 | 전체 회원 | 오늘 신규 가입
  전체 강의 | 활성 수강 | 미처리 신고
```

---

## 16. 보안 구현 필수 항목

| 항목 | 구현 방법 |
|------|-----------|
| 비밀번호 해시 | bcrypt, 10+ rounds |
| JWT 비밀키 | 32바이트 이상 랜덤 (`crypto.randomBytes(32).toString('hex')`) |
| CORS | `CLIENT_ORIGIN` 화이트리스트, `credentials: true` |
| SQL 인젝션 | Prisma ORM 파라미터 바인딩 |
| XSS | React JSX 기본 이스케이프 |
| 입력 검증 | class-validator DTO |
| 민감 라우트 | `JwtAuthGuard` + `RolesGuard` |
| 리프레시 토큰 | HttpOnly Cookie (`secure`, `httpOnly`, `sameSite`) |

---

## 17. 설정 파일 명세

### `client/vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/api-docs-v1": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
```

### `server/nest-cli.json`
```json
{ "$schema": "https://json.schemastore.org/nest-cli", "collection": "@nestjs/schematics", "sourceRoot": "src", "compilerOptions": { "deleteOutDir": true } }
```

### `server/prisma/schema.prisma` generator 설정
```prisma
generator client {
  provider     = "prisma-client"
  output       = "./generated/prisma"
  moduleFormat = "cjs"
}
```

---

## 18. npm 스크립트

### 백엔드 (`server/package.json`)
```json
"scripts": {
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "db:seed:youtube-test": "npm run build && node dist/prisma/youtube-test-seed.js",
  "db:clear:youtube-test": "npm run build && node dist/prisma/youtube-test-clear.js",
  "test:smoke:youtube": "npm run build && node dist/prisma/youtube-test-smoke.js"
}
```

### 프론트엔드 (`client/package.json`)
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

---

## 19. P2 예정 기능 (구현 시 참고)

| 기능 | 내용 | 우선순위 |
|------|------|---------|
| Toss Payments | 실결제 카드 처리, 환불 | 1 |
| Cloudflare R2 | Presigned URL 업로드/다운로드 | 2 |
| 강의 리뷰 | 평점 1-5 + 리뷰 작성/수정/삭제 | 3 |
| 수강생 추방 | 강사가 수강 취소 처리 | 4 |
| 강사 평점 대시보드 | 평균 평점, 리뷰 통계 | 5 |
| 반응형 모바일 | 360px ~ 1920px 전구간 | 6 |
| 검색 고도화 | Full-text Search, 자동완성 | 7 |
| 실시간 알림 | WebSocket (Socket.io) | 8 |

---

## 20. Claude Code 사용 지침

이 PRD로 프로젝트를 재현할 때:

1. **순서 준수**: Phase 1 → 2 → ... → 19 순서로 진행한다.
2. **디자인 토큰 우선**: `index.css`를 먼저 완성하고 컴포넌트를 작성한다.
3. **CSS 클래스명 준수**: 위 명세의 CSS 클래스명을 그대로 사용한다 (컴포넌트 스타일과 분리).
4. **API Base URL**: 모든 API 호출은 `/api/v1` 접두사 사용.
5. **응답 형식**: 모든 API 응답은 `{ success, status, message, data }` 형식.
6. **환경변수 미설정 방지**: `JWT_ACCESS_SECRET` 없으면 서버 시작 차단.
7. **Prisma 생성 경로**: `output = "./generated/prisma"` 준수.
8. **모듈별 독립성**: 각 NestJS 모듈은 독립적으로 테스트 가능하게 구현.
