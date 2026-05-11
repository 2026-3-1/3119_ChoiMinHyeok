# sec101 - 기술 스택 및 아키텍처

## 기술 스택

### 프론트엔드

| 기술 | 역할 |
|---|---|
| Vite | 빌드 도구 |
| React + TypeScript | UI 프레임워크 |
| React Router | SPA 라우팅 |
| Vanilla CSS | 스타일링 (디자인 토큰 기반) |
| Axios | HTTP 클라이언트 |
| React Icons | 아이콘 |
| React Player | 강의 영상 플레이어 |

### 백엔드

| 기술 | 역할 |
|---|---|
| NestJS + TypeScript | REST API 서버 |
| Prisma | ORM (PostgreSQL 연동) |
| JWT + bcrypt | 인증 / 비밀번호 해싱 |
| class-validator | 요청 유효성 검증 |
| @aws-sdk/client-s3 | 강의 자료 Presigned URL 업로드 |
| @aws-sdk/s3-request-presigner | Presigned URL 생성 |
| dotenv | 환경변수 |
| cors | CORS 처리 |

### 인프라

| 기술 | 역할 |
|---|---|
| PostgreSQL | 관계형 데이터베이스 |
| Cloudflare R2 | 강의 자료 파일 스토리지 (S3 호환) |
| Docker | 개발 환경 일관성 |
| Nginx | 리버스 프록시 |
| GitHub Actions | CI/CD |

---

## 프로젝트 디렉토리 구조

```
sec101/
├── docs/                               # PRD 설계 문서
│
├── server/                             # 백엔드 (NestJS)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                            # DB URL, JWT_SECRET, R2 키 등
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma 스키마
│   │   ├── migrations/                 # DB 마이그레이션
│   │   └── seed.ts                     # 초기 데이터 시드
│   └── src/
│       ├── main.ts                     # 서버 진입점
│       ├── app.module.ts               # 루트 모듈
│       ├── config/
│       │   └── configuration.ts        # 환경변수 로드
│       ├── common/
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts   # JWT 인증 가드
│       │   │   └── roles.guard.ts      # 역할 기반 접근 제어
│       │   ├── decorators/
│       │   │   └── roles.decorator.ts  # @Roles() 데코레이터
│       │   ├── filters/
│       │   │   └── http-exception.filter.ts  # 에러 응답 표준화
│       │   └── interceptors/
│       │       └── response.interceptor.ts   # 공통 응답 포맷
│       ├── prisma/
│       │   └── prisma.service.ts       # Prisma 클라이언트 서비스
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts      # POST /auth/register, /auth/login
│       │   ├── auth.service.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   └── users.service.ts
│       ├── courses/
│       │   ├── courses.module.ts
│       │   ├── courses.controller.ts   # GET /courses, /courses/:slug
│       │   └── courses.service.ts
│       ├── chapters/
│       │   ├── chapters.module.ts
│       │   ├── chapters.controller.ts
│       │   └── chapters.service.ts
│       ├── lectures/
│       │   ├── lectures.module.ts
│       │   ├── lectures.controller.ts  # GET /lectures/:id, progress, bookmarks
│       │   └── lectures.service.ts
│       ├── enrollments/
│       │   ├── enrollments.module.ts
│       │   ├── enrollments.controller.ts
│       │   └── enrollments.service.ts
│       ├── orders/
│       │   ├── orders.module.ts
│       │   ├── orders.controller.ts    # POST /orders, /orders/:id/cancel
│       │   └── orders.service.ts
│       ├── payments/
│       │   ├── payments.module.ts
│       │   ├── payments.controller.ts  # Toss 결제 연동
│       │   └── payments.service.ts
│       ├── cart/
│       │   ├── cart.module.ts
│       │   ├── cart.controller.ts
│       │   └── cart.service.ts
│       ├── materials/
│       │   ├── materials.module.ts
│       │   ├── materials.controller.ts # Presigned URL 발급 / 메타데이터 저장
│       │   └── materials.service.ts
│       ├── storage/
│       │   └── storage.service.ts      # R2/S3 Presigned URL 생성
│       ├── comments/
│       │   ├── comments.module.ts
│       │   ├── comments.controller.ts
│       │   └── comments.service.ts
│       ├── reports/
│       │   ├── reports.module.ts
│       │   ├── reports.controller.ts
│       │   └── reports.service.ts
│       ├── instructor/
│       │   ├── instructor.module.ts
│       │   ├── instructor.controller.ts
│       │   └── instructor.service.ts
│       └── admin/
│           ├── admin.module.ts
│           ├── admin.controller.ts     # 대시보드, 사용자/강의/신고 관리
│           └── admin.service.ts
│
└── client/                             # 프론트엔드 (React)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                     # 라우터 설정
        ├── index.css                   # 글로벌 스타일 + 디자인 토큰
        ├── api/                        # API 클라이언트
        │   ├── client.ts               # Axios 인스턴스
        │   ├── auth.ts
        │   ├── courses.ts
        │   ├── lectures.ts
        │   ├── enrollments.ts
        │   ├── orders.ts
        │   ├── cart.ts
        │   ├── materials.ts
        │   ├── comments.ts
        │   └── admin.ts
        ├── components/                 # 공통 컴포넌트
        │   ├── Layout/
        │   │   ├── Navbar.tsx + .css
        │   │   └── Footer.tsx + .css
        │   ├── CourseCard/
        │   │   └── CourseCard.tsx + .css
        │   ├── DifficultyBadge/
        │   │   └── DifficultyBadge.tsx + .css
        │   ├── VideoPlayer/
        │   │   └── VideoPlayer.tsx + .css
        │   ├── ProgressBar/
        │   │   └── ProgressBar.tsx + .css
        │   └── CommentList/
        │       └── CommentList.tsx + .css
        ├── pages/                      # 수강생 페이지
        │   ├── HomePage/
        │   ├── CourseListPage/
        │   ├── CourseDetailPage/
        │   ├── LearnPage/              # 강의 수강 화면
        │   ├── CategoryPage/
        │   ├── InstructorProfilePage/
        │   ├── CartPage/
        │   ├── CheckoutPage/
        │   └── MyCoursesPage/
        ├── instructor/                 # 강사 페이지
        │   ├── InstructorLayout.tsx
        │   ├── CourseManagePage/
        │   ├── CourseEditPage/
        │   └── StudentManagePage/
        ├── admin/                      # 관리자 페이지
        │   ├── AdminLayout.tsx
        │   ├── LoginPage/
        │   ├── DashboardPage/
        │   ├── UserManagePage/
        │   ├── CourseManagePage/
        │   └── ReportManagePage/
        ├── auth/                       # 인증 페이지
        │   ├── LoginPage/
        │   └── RegisterPage/
        ├── hooks/
        │   ├── useAuth.ts              # 인증 상태
        │   ├── useCourses.ts
        │   ├── useEnrollment.ts
        │   └── useProgress.ts
        ├── context/
        │   └── AuthContext.tsx
        ├── utils/
        │   └── helpers.ts
        └── types/
            └── index.ts
```

---

## 시스템 아키텍처

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │ 수강생    │  │ 강사      │  │ 관리자    │  │  Axios  │ │  │
│  │  │ Pages    │  │ Pages    │  │ Pages    │  │ Client  │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────┬────┘ │  │
│  └───────────────────────────────────────────────────┼──────┘  │
└─────────────────────────────────────────────────────┼──────────┘
                                                       │ HTTP/REST
┌─────────────────────────────────────────────────────┼──────────┐
│  NestJS Server (Nginx 리버스 프록시)                  │          │
│  ┌────────────────────────────────────────────────── ▼──────┐  │
│  │  Guard (JwtAuthGuard → RolesGuard)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Controller → Service                                    │  │
│  │  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────┐  │  │
│  │  │ Auth   │ │ Courses  │ │ Orders  │ │ Materials     │  │  │
│  │  │        │ │ Lectures │ │ Payment │ │ StorageService│  │  │
│  │  └────────┘ └──────────┘ └─────────┘ └───────┬───────┘  │  │
│  ├──────────────────────────────────────────────┼───────────┤  │
│  │  Prisma ORM                                  │           │  │
│  └──────────────────────────────────┬───────────┼───────────┘  │
└───────────────────────────────────  │  ─────────┼──────────────┘
                                      │ TCP        │ HTTPS
            ┌─────────────────────────┘            │
┌───────────▼──────────────┐    ┌──────────────────▼──────────┐
│  PostgreSQL               │    │  Cloudflare R2              │
│  users / user_roles       │    │  강의 자료 파일 저장          │
│  courses / chapters       │    │  (S3 호환 API)              │
│  lectures / enrollments   │    │                             │
│  orders / payments        │    │  업로드: Presigned PUT URL   │
│  comments / reports ...   │    │  다운로드: Presigned GET URL │
└──────────────────────────┘    └─────────────────────────────┘
```

---

## 데이터 흐름

```
[수강생 강의 검색]
1. 검색어 입력 → debounce(300ms)
2. GET /api/v1/courses?search=SQL → NestJS
3. Prisma: courses ILIKE '%SQL%' → PostgreSQL
4. 결과 JSON → React 렌더링

[강의 자료 업로드 (강사)]
1. 강사가 파일 선택
2. POST /api/v1/instructor/lectures/:id/materials/upload-url → NestJS
3. StorageService: R2 Presigned PUT URL 생성 (유효 5분)
4. 클라이언트가 Presigned URL로 R2에 직접 PUT
5. 업로드 완료 후 POST /api/v1/instructor/lectures/:id/materials
6. NestJS → PostgreSQL: lecture_materials 메타데이터 저장

[수강생 자료 다운로드]
1. GET /api/v1/lectures/:lectureId/materials/:materialId/download
2. NestJS: enrollments 테이블에서 수강 여부 확인
3. StorageService: R2 Presigned GET URL 생성 (유효 10분)
4. 클라이언트에 URL 반환 → 직접 다운로드

[결제 및 수강 등록]
1. POST /api/v1/orders → 주문 생성 (PENDING)
2. Toss 결제 진행
3. 결제 성공 → POST /api/v1/orders/:id/confirm
4. 트랜잭션: orders PAID + enrollments ACTIVE 동시 처리
5. 수강 등록 완료
```

---

## 개발 서버 구성

| 서버 | 포트 | 명령어 |
|---|---|---|
| 프론트엔드 (Vite) | 5173 | `cd client && npm run dev` |
| 백엔드 (NestJS) | 3000 | `cd server && npm run dev` |
| PostgreSQL | 5432 | `docker-compose up -d` |

프론트엔드에서 `/api/*` 요청을 백엔드로 프록시하는 설정을 `vite.config.ts`에 추가합니다.

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```