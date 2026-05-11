# sec101 — 서브세션 구성 및 구현 체크리스트

## 구현 단계 개요

총 **14단계**로 나누어 진행합니다. 각 단계는 하나의 서브세션 단위에 해당합니다.

```
Phase 1:  프로젝트 초기화 (server + client)
    ↓
Phase 2:  DB 스키마 & 시드 데이터
    ↓
Phase 3:  백엔드 — Public API
    ↓
Phase 4:  백엔드 — Auth API
    ↓
Phase 5:  백엔드 — 수강생 API (수강 / 진도 / 북마크)
    ↓
Phase 6:  백엔드 — 수강생 API (결제 / 주문 / 장바구니)
    ↓
Phase 7:  백엔드 — 강사 API
    ↓
Phase 8:  백엔드 — 관리자 API
    ↓
Phase 9:  프론트엔드 — 디자인 시스템 & 공통 레이아웃
    ↓
Phase 10: 프론트엔드 — 수강생 페이지
    ↓
Phase 11: 프론트엔드 — 강사 페이지
    ↓
Phase 12: 프론트엔드 — 관리자 페이지
    ↓
Phase 13: 파일 스토리지 연동 (Cloudflare R2)
    ↓
Phase 14: 통합 검증 & 마무리
```

---

## Phase 1: 프로젝트 초기화

**목표**: server(NestJS) + client(React) 두 프로젝트 셋업

### 체크리스트
- [ ] `server/` 디렉토리: NestJS + TypeScript 초기화
  - `nest new server`, `tsconfig.json` 설정
  - 의존성: `prisma`, `@prisma/client`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`
  - dev 의존성: `@types/bcrypt`, `@types/passport-jwt`
- [ ] `client/` 디렉토리: Vite + React + TypeScript 초기화
  - `npx create-vite@latest ./ --template react-ts`
  - 의존성: `react-router-dom`, `axios`, `react-player`, `react-icons`
  - `vite.config.ts`에 `/api` 프록시 설정
- [ ] `.env` 파일 생성 (`DATABASE_URL`, `JWT_SECRET`, `PORT`)
- [ ] 디렉토리 구조 생성 (`docs/05-architecture.md` 참조)
- [ ] `docker-compose.yml` 생성 (PostgreSQL 로컬 개발용)
- [ ] 양쪽 dev 서버 실행 확인

### 참고: `docs/05-architecture.md`
### 완료 조건: `server/` dev 서버 3000포트, `client/` dev 서버 5173포트 정상 실행

---

## Phase 2: DB 스키마 & 시드 데이터

**목표**: Prisma 스키마 정의, DB 마이그레이션, 초기 데이터 시드

### 체크리스트
- [ ] `prisma/schema.prisma` 모델 정의 (19개 테이블)
  - users, user_roles, categories, courses, chapter, lectures
  - cart_items, orders, order_items, payment_transactions
  - enrollments, enrollment_history
  - course_comment, lecture_comment
  - lectures_progress, lecture_playback_history, lecture_bookmark
  - instructor_rating, course_report, lecture_materials
- [ ] `npx prisma migrate dev --name init` 실행
- [ ] `prisma/seed.ts` 작성
  - 5개 카테고리 시드
  - 관리자 1명 + 강사 3명 + 테스트 수강생 2명 시드 (`docs/06-sample-data.md` 참조)
  - 샘플 강의 5개 + 챕터 + 강의 영상 시드
  - 샘플 댓글 & 평점 시드
- [ ] `npx prisma db seed` 실행 확인

### 참고: `docs/02-data-model.md`, `docs/06-sample-data.md`
### 완료 조건: `npx prisma studio`에서 모든 데이터 확인 가능

---

## Phase 3: 백엔드 — Public API

**목표**: 인증 불필요한 공개 읽기 전용 API 구현

### 체크리스트
- [ ] NestJS 앱 기본 설정 (`main.ts`, `app.module.ts`, CORS, ValidationPipe, HttpExceptionFilter)
- [ ] 공통 응답 인터셉터 (`response.interceptor.ts`) — success/status/data 포맷
- [ ] 공통 에러 필터 (`http-exception.filter.ts`) — 표준 에러 응답
- [ ] `GET /api/v1/categories` — 전체 카테고리 목록
- [ ] `GET /api/v1/categories/:id/courses` — 카테고리별 강의 목록 (필터/페이징)
- [ ] `GET /api/v1/courses` — 전체 강의 목록 (검색/필터/정렬/페이징)
- [ ] `GET /api/v1/courses/:slug` — 강의 상세 (챕터 + 강의 목록 포함)
- [ ] `GET /api/v1/courses/:id/comments` — 강의 댓글 목록
- [ ] `GET /api/v1/instructors/:id` — 강사 프로필 + 평점
- [ ] `GET /api/v1/instructors/:id/courses` — 강사의 강의 목록
- [ ] Service 레이어 분리 (Controller → Service → Prisma)

### 참고: `docs/03-api-design.md` Public API 섹션
### 완료 조건: curl/Postman으로 모든 Public 엔드포인트 정상 응답
### 검증 결과: curl로 전체 엔드포인트 정상 응답 확인 ⬜

---

## Phase 4: 백엔드 — Auth API

**목표**: 회원가입 / 로그인 / JWT 인증 구현

### 체크리스트
- [ ] `JwtAuthGuard` — JWT 토큰 검증 가드
- [ ] `RolesGuard` — STUDENT / INSTRUCTOR / ADMIN 역할 검증 가드
- [ ] `@Roles()` 데코레이터
- [ ] `jwt.strategy.ts` — Passport JWT 전략
- [ ] `POST /api/v1/auth/register` — 회원가입 (name, email, password, role 선택)
  - bcrypt 해싱 (saltRounds=12)
  - 이메일 중복 체크 → 409 DUPLICATE
  - user_roles 테이블에 역할 저장
- [ ] `POST /api/v1/auth/login` — 로그인 → JWT accessToken 반환 (7일)
  - 이메일/비밀번호 검증 실패 → 401 CREDENTIAL_INVALID
- [ ] `GET /api/v1/auth/me` — 내 정보 조회 (인증 필요)
- [ ] `PATCH /api/v1/auth/me` — 내 정보 수정 (이름, 소개)

### 초기 관리자 계정
- **email**: `admin@sec101.com`
- **password**: `Admin1234!`
- 자세한 내용: `docs/06-sample-data.md` 참조

### 참고: `docs/03-api-design.md` Auth API 섹션
### 완료 조건: JWT 토큰으로 `/api/v1/auth/me` 정상 응답
### 검증 결과: curl로 전체 Auth 엔드포인트 정상 응답 확인 ⬜

---

## Phase 5: 백엔드 — 수강생 API (수강 / 진도 / 북마크 / 댓글)

**목표**: 수강 등록, 강의 열람, 진도 관리, 댓글 기능 구현

### 체크리스트
- [ ] `GET /api/v1/enrollments` — 내 수강 목록
- [ ] `POST /api/v1/enrollments` — 수강 등록 (무료 강의)
  - 이미 수강 중이면 409 ALREADY_ENROLLED
  - 폐강된 강의면 410 COURSE_CANCELED
- [ ] `DELETE /api/v1/enrollments/:id` — 수강 취소
- [ ] `GET /api/v1/courses/:courseId/chapters` — 챕터 + 강의 목록 (수강자만)
- [ ] `GET /api/v1/lectures/:lectureId` — 강의 영상 상세 (수강자만)
- [ ] `GET /api/v1/lectures/:lectureId/progress` — 진도 조회
- [ ] `PATCH /api/v1/lectures/:lectureId/progress` — 진도 업데이트 (lastPosition, watchedSeconds, progress, isCompleted)
- [ ] `POST /api/v1/lectures/:lectureId/playback` — 재생 이벤트 기록 (STARTED/PROGRESS/RESUMED/COMPLETED)
- [ ] `GET /api/v1/lectures/:lectureId/bookmarks` — 북마크 목록
- [ ] `POST /api/v1/lectures/:lectureId/bookmarks` — 북마크 추가
- [ ] `PATCH /api/v1/lectures/:lectureId/bookmarks/:bookmarkId` — 북마크 수정
- [ ] `DELETE /api/v1/lectures/:lectureId/bookmarks/:bookmarkId` — 북마크 삭제
- [ ] `POST /api/v1/courses/:courseId/comments` — 강의 댓글 + 평점 작성 (수강자만)
- [ ] `PATCH /api/v1/courses/:courseId/comments/:commentId` — 댓글 수정
- [ ] `DELETE /api/v1/courses/:courseId/comments/:commentId` — 댓글 삭제
- [ ] `POST /api/v1/courses/:courseId/comments/:commentId/replies` — 대댓글 작성
- [ ] `POST /api/v1/lectures/:lectureId/comments` — 영상 댓글 작성
- [ ] `POST /api/v1/instructors/:instructorId/ratings` — 강사 평점 등록
- [ ] `PATCH /api/v1/instructors/:instructorId/ratings` — 강사 평점 수정
- [ ] `POST /api/v1/courses/:courseId/reports` — 강의 신고 (COPYRIGHT/WRONG_INFO/OTHER)

### 참고: `docs/03-api-design.md` Student API 섹션
### 완료 조건: 수강 등록 → 강의 열람 → 진도 업데이트 → 댓글 전체 플로우 정상 동작

---

## Phase 6: 백엔드 — 수강생 API (결제 / 주문 / 장바구니)

**목표**: 장바구니 CRUD, 주문 생성, Toss 결제 연동

### 체크리스트
- [ ] `GET /api/v1/cart` — 장바구니 목록 (ACTIVE 상태만)
- [ ] `POST /api/v1/cart` — 장바구니 추가
- [ ] `DELETE /api/v1/cart/:id` — 장바구니 항목 제거
- [ ] `POST /api/v1/orders` — 주문 생성 (cartItemIds + provider)
  - cart_items → CHECKED_OUT 상태 변경
  - orders 생성 (PENDING)
  - order_items 생성
- [ ] `GET /api/v1/orders` — 내 주문 목록
- [ ] `GET /api/v1/orders/:id` — 주문 상세
- [ ] `POST /api/v1/orders/:id/confirm` — 결제 확인 (Toss 콜백)
  - `$transaction`: orders PAID + order_items ENROLLED + enrollments ACTIVE 동시 처리
  - payment_transactions 기록
  - enrollment_history 기록
- [ ] `POST /api/v1/orders/:id/cancel` — 주문 취소 / 환불 요청
  - orders CANCELED + enrollments CANCELED + payment_transactions REFUND 기록

### 참고: `docs/03-api-design.md` 결제/장바구니 섹션, `docs/05-architecture.md` 데이터 흐름
### 완료 조건: 장바구니 담기 → 주문 생성 → Toss 결제 확인 → 수강 등록 전체 플로우

---

## Phase 7: 백엔드 — 강사 API

**목표**: 강의 CRUD, 챕터/영상 관리, 자료 관리, 수강생 관리

### 체크리스트
- [ ] `GET /api/v1/instructor/courses` — 내 강의 목록
- [ ] `POST /api/v1/instructor/courses` — 강의 생성
- [ ] `PATCH /api/v1/instructor/courses/:courseId` — 강의 수정 (제목, 설명, 가격, 상태)
- [ ] `DELETE /api/v1/instructor/courses/:courseId` — 강의 삭제
- [ ] `POST /api/v1/instructor/courses/:courseId/chapters` — 챕터 추가
- [ ] `PATCH /api/v1/instructor/courses/:courseId/chapters/:chapterId` — 챕터 수정
- [ ] `DELETE /api/v1/instructor/courses/:courseId/chapters/:chapterId` — 챕터 삭제
- [ ] `POST /api/v1/instructor/chapters/:chapterId/lectures` — 강의 영상 추가
- [ ] `PATCH /api/v1/instructor/lectures/:lectureId` — 강의 영상 수정
- [ ] `DELETE /api/v1/instructor/lectures/:lectureId` — 강의 영상 삭제
- [ ] `GET /api/v1/instructor/lectures/:lectureId/materials` — 자료 목록
- [ ] `POST /api/v1/instructor/lectures/:lectureId/materials/upload-url` — Presigned 업로드 URL 발급
- [ ] `POST /api/v1/instructor/lectures/:lectureId/materials` — 업로드 완료 메타데이터 저장
- [ ] `PATCH /api/v1/instructor/materials/:materialId` — 자료 수정
- [ ] `DELETE /api/v1/instructor/materials/:materialId` — 자료 삭제
- [ ] `GET /api/v1/instructor/courses/:courseId/students` — 수강생 목록
- [ ] `DELETE /api/v1/instructor/courses/:courseId/students/:userId` — 수강생 추방
- [ ] `GET /api/v1/instructor/ratings` — 내 강사 평점 조회
- [ ] 자료 업로드 서비스 (`StorageService`) → Phase 13에서 R2 실연동, Phase 7에서는 mock URL

### 참고: `docs/03-api-design.md` Instructor API 섹션, `docs/09-instructor-feature-spec.md`
### 완료 조건: 강의 생성 → 챕터/영상 추가 → 자료 업로드 전체 플로우 정상 동작

---

## Phase 8: 백엔드 — 관리자 API

**목표**: 관리자 인증 + 사용자/강의/신고 관리 + 대시보드

### 체크리스트
- [ ] `POST /api/v1/admin/login` — 관리자 로그인 (JWT 발급, 24h 만료)
- [ ] `GET /api/v1/admin/me` — 관리자 정보
- [ ] `GET /api/v1/admin/users` — 전체 사용자 목록 (검색/역할 필터/페이징)
- [ ] `GET /api/v1/admin/users/:id` — 사용자 상세
- [ ] `DELETE /api/v1/admin/users/:id` — 사용자 삭제
- [ ] `POST /api/v1/admin/users/:id/ban` — 사용자 제재 (역할 제거 or 계정 비활성화)
- [ ] `GET /api/v1/admin/courses` — 전체 강의 목록 (검색/카테고리/페이징)
- [ ] `DELETE /api/v1/admin/courses/:id` — 강의 삭제
- [ ] `POST /api/v1/admin/courses/:id/cancel` — 강의 폐강 처리 (status → CANCELED)
- [ ] `GET /api/v1/admin/reports` — 신고 목록 (isResolved/type 필터, 미처리 우선 정렬)
- [ ] `PATCH /api/v1/admin/reports/:id` — 신고 처리 완료 (is_resolved → true)
- [ ] `GET /api/v1/admin/dashboard` — 전체 통계 (사용자/강의/수강/신고/매출 수)

### 초기 관리자 계정
- **email**: `admin@sec101.com`
- **password**: `Admin1234!`
- 자세한 내용: `docs/08-admin-api-spec.md` 참조

### 참고: `docs/03-api-design.md` Admin API 섹션, `docs/08-admin-api-spec.md`
### 완료 조건: JWT 토큰으로 모든 Admin 엔드포인트 정상 응답
### 검증 결과: curl로 전체 Admin 엔드포인트 정상 응답 확인 ⬜ (`npm run build` TypeScript 빌드 성공)

---

## Phase 9: 프론트엔드 — 디자인 시스템 & 공통 레이아웃

**목표**: 글로벌 스타일, API 클라이언트, 공통 레이아웃 컴포넌트

### 체크리스트
- [ ] `index.css` — 디자인 토큰 (CSS 변수, `--bg-*`, `--neon-*`, `--diff-*`, `--glow-*`)
- [ ] `api/client.ts` — Axios 인스턴스 (baseURL, JWT interceptor)
- [ ] `api/auth.ts`, `api/courses.ts`, `api/enrollments.ts`, `api/orders.ts`, `api/cart.ts`, `api/admin.ts`
- [ ] `types/index.ts` — 프론트엔드 TypeScript 타입 (User, Course, Chapter, Lecture, Enrollment 등)
- [ ] `context/AuthContext.tsx` — 사용자 인증 상태 관리 (localStorage `access_token` + `user_info`)
- [ ] `Navbar.tsx` — 공통 네비게이션
  - 비로그인: [로그인] [시작하기]
  - 수강생: [장바구니🛒] + 사용자명 드롭다운
  - 강사: [내 강의 관리] + 사용자명 드롭다운
- [ ] `Footer.tsx` — 공통 푸터
- [ ] `Layout.tsx` — Navbar + main + Footer 래퍼
- [ ] `App.tsx` — React Router 설정 (전체 라우트)
- [ ] `CourseCard/` 컴포넌트 — 썸네일, 강사, 평점, 가격, 난이도 배지
- [ ] `DifficultyBadge/` 컴포넌트 — EASY/MEDIUM/HARD 색상 pill
- [ ] `ProgressBar/` 컴포넌트 — 수강 진도 바 (그린 채움 애니메이션)

### 참고: `docs/04-ui-design.md`, `docs/05-architecture.md`
### 완료 조건: Navbar/Footer 표시, 디자인 토큰 적용 확인

---

## Phase 10: 프론트엔드 — 수강생 페이지

**목표**: 모든 수강생 페이지 구현

### 체크리스트
- [ ] `HomePage` — 히어로 (glow-hero ambient) + 인기 카테고리 카드 + 최신 강의
- [ ] `CourseListPage` — 검색바 + 카테고리/난이도 드롭다운 필터 + 강의 카드 그리드 + 페이지네이션
- [ ] `CourseDetailPage` — 썸네일 + 챕터 목록 아코디언 + 수강 신청/장바구니 버튼 + 리뷰 섹션
- [ ] `LearnPage` — 영상 플레이어 (ReactPlayer) + 우측 목차 (✓/▶/○) + 강의 자료 다운로드 + 댓글
- [ ] `CategoryPage` — 카테고리별 강의 목록
- [ ] `InstructorProfilePage` — 강사 프로필 + 강의 목록
- [ ] `CartPage` — 장바구니 항목 + 제거 + 주문하기
- [ ] `CheckoutPage` — 주문 요약 + Toss 결제 버튼
- [ ] `MyCoursesPage` — 수강 중인 강의 + 진도율 표시
- [ ] `LoginPage` / `RegisterPage` — 인증 폼 (이름, 이메일, 비밀번호, 역할 선택)

### 참고: `docs/04-ui-design.md`
### 완료 조건: 모든 페이지 백엔드 API 연동 및 클라이언트 사이드 필터링 동작
### 빌드 상태: `npm run build` → 성공 ⬜

---

## Phase 11: 프론트엔드 — 강사 & 관리자 페이지

**목표**: 강사 강의 관리 UI + 관리자 대시보드 UI

### 강사 라우트 설계
- `/instructor/courses` — 내 강의 목록 (INSTRUCTOR 전용)
- `/instructor/courses/new` — 강의 생성
- `/instructor/courses/:id/edit` — 강의 편집 (기본 정보 / 챕터·영상 / 자료 / 수강생 탭)
- `/instructor/courses/:id/students` — 수강생 관리

### 관리자 라우트 설계
- `/admin/login` — 독립 로그인 (공개 Navbar 없음)
- `/admin/dashboard` — 통계 대시보드 (인증 필요)
- `/admin/users` — 사용자 관리 (인증 필요)
- `/admin/courses` — 강의 관리 (인증 필요)
- `/admin/reports` — 신고 관리 (인증 필요)

### 체크리스트
- [ ] `InstructorLayout.tsx` — 강사 전용 사이드바 레이아웃
- [ ] `CourseManagePage/` (강사) — 내 강의 카드 그리드 + 신규 생성 버튼
- [ ] `CourseEditPage/` — 4탭 편집 UI (기본 정보 / 챕터·영상 DnD / 자료 업로드 / 수강생 목록)
- [ ] `StudentManagePage/` — 수강생 테이블 + 추방 버튼
- [ ] `AdminLayout.tsx` — 관리자 사이드바 (대시보드/사용자/강의/신고)
- [ ] `admin/LoginPage/` — 관리자 로그인 폼
- [ ] `admin/DashboardPage/` — 통계 카드 + 최근 미처리 신고
- [ ] `admin/UserManagePage/` — 사용자 테이블 + 검색 + 제재/삭제 버튼
- [ ] `admin/CourseManagePage/` — 강의 테이블 + 폐강/삭제 버튼
- [ ] `admin/ReportManagePage/` — 신고 목록 + 처리 완료 버튼
- [ ] `RequireRole` 가드 컴포넌트 — 미인증/권한 부족 시 리다이렉트

### 참고: `docs/04-ui-design.md`, `docs/08-admin-api-spec.md`
### 완료 조건: 관리자 로그인 → 신고 처리, 강사 로그인 → 강의 생성 전체 플로우 동작
### 빌드 상태: `npm run build` → 성공 ⬜

---

## Phase 12: 파일 스토리지 연동 (Cloudflare R2)

**목표**: 강의 자료 업로드/다운로드 Presigned URL 실연동

### 체크리스트
- [ ] Cloudflare R2 버킷 생성 + API 토큰 발급
- [ ] `.env`에 `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` 추가
- [ ] `storage/storage.service.ts` — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` 연동
  - `getUploadUrl()` — Presigned PUT URL 생성 (5분 유효)
  - `getDownloadUrl()` — Presigned GET URL 생성 (10분 유효)
  - `deleteFile()` — 자료 삭제 시 R2 파일도 제거
- [ ] `POST /api/v1/instructor/lectures/:lectureId/materials/upload-url` → R2 실 Presigned URL 반환
- [ ] `GET /api/v1/lectures/:lectureId/materials/:materialId/download` → R2 다운로드 URL 반환
- [ ] 프론트엔드 파일 업로드 UI: 드래그 앤 드롭 + 업로드 진행률 표시
  - `PUT {presignedUrl}` — 클라이언트가 R2에 직접 업로드
  - 업로드 완료 후 메타데이터 서버에 저장

### 참고: `docs/05-architecture.md` 데이터 흐름 (강의 자료 업로드 섹션)
### 완료 조건: 강사가 자료 업로드 → 수강생이 다운로드 전체 플로우 정상 동작

---

## Phase 13: 결제 연동 (Toss Payments)

**목표**: Toss Payments SDK 연동, 결제 확인, 환불 처리

### 체크리스트
- [ ] Toss Payments 테스트 키 발급 + `.env`에 `TOSS_SECRET_KEY` 추가
- [ ] 프론트엔드 `@tosspayments/payment-sdk` 설치 및 결제 위젯 설정
- [ ] `CheckoutPage` — Toss 결제 버튼 연결, 성공/실패 콜백 처리
- [ ] `POST /api/v1/orders/:id/confirm` — Toss API 결제 확인 (서버 사이드)
  - `https://api.tosspayments.com/v1/payments/confirm` 호출
  - 응답 검증 후 트랜잭션 내 수강 등록 처리
- [ ] 결제 성공 → 수강 목록 페이지 리다이렉트
- [ ] 결제 실패 / 취소 → 에러 메시지 표시
- [ ] `POST /api/v1/orders/:id/cancel` — Toss 환불 API 연동

### 참고: `docs/05-architecture.md` 데이터 흐름 (결제 및 수강 등록 섹션)
### 완료 조건: 테스트 카드로 결제 → 수강 등록 → 환불 전체 플로우 정상 동작

---

## Phase 14: 통합 검증 & 마무리

**목표**: 전체 기능 점검, 빌드 테스트

### 체크리스트
- [ ] 백엔드 `npm run build` 성공
- [ ] 프론트엔드 `npm run build` 성공
- [ ] 회원가입 → 로그인 → 강의 수강 → 진도 저장 E2E 확인
- [ ] 수강생 댓글/평점 → 강사 평점 집계 확인
- [ ] 강의 신고 → 관리자 처리 플로우 확인
- [ ] 강사 강의 생성 → 수강생이 목록에서 확인 플로우
- [ ] 미인증 접근 시 리다이렉트 동작 확인
- [ ] 반응형 레이아웃 (360px, 768px, 1440px)
- [ ] 링크 깨짐 없는지 확인
- [ ] README.md 작성 (설치/실행 가이드)

### 완료 조건: 모든 체크리스트 통과, 프로덕션 빌드 성공

---

## 서브세션 프롬프트 가이드

| Phase | 핵심 지시 |
|---|---|
| 1 | `docs/05-architecture.md` 참고하여 server + client 프로젝트 초기화 |
| 2 | `docs/02-data-model.md` + `docs/06-sample-data.md` 참고하여 Prisma 스키마 + 시드 |
| 3 | `docs/03-api-design.md` Public 섹션 참고하여 공개 API 구현 |
| 4 | `docs/03-api-design.md` Auth 섹션 참고하여 JWT 인증 구현 |
| 5 | `docs/03-api-design.md` Student API 섹션 참고하여 수강/진도/댓글 구현 |
| 6 | `docs/03-api-design.md` 결제 섹션 참고하여 장바구니/주문 구현 |
| 7 | `docs/03-api-design.md` Instructor API + `docs/09-instructor-feature-spec.md` 참고 |
| 8 | `docs/03-api-design.md` Admin API + `docs/08-admin-api-spec.md` 참고 |
| 9 | `docs/04-ui-design.md` + `docs/05-architecture.md` 참고하여 디자인 시스템 구현 |
| 10 | `docs/04-ui-design.md` 수강생 페이지 섹션 참고하여 모든 수강생 페이지 구현 |
| 11 | `docs/04-ui-design.md` + `docs/08-admin-api-spec.md` 참고하여 강사/관리자 UI 구현 |
| 12 | `docs/05-architecture.md` 데이터 흐름 섹션 참고하여 R2 Presigned URL 연동 |
| 13 | Toss Payments 공식 문서 참고하여 결제 흐름 구현 |
| 14 | 전체 E2E 검증 + 빌드 + README |
