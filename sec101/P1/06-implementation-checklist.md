# SEC101 P1 — 구현 체크리스트

> P1 스프린트 전체 구현 완료 항목

---

## 백엔드

### 인증 (Auth)
- [x] 회원가입 (이름·이메일·비밀번호, bcrypt 해싱)
- [x] 로그인 → Access Token(메모리) + Refresh Token(HttpOnly Cookie)
- [x] 로그아웃 (Refresh Token 삭제)
- [x] Access Token 자동 재발급 (`/auth/refresh`)
- [x] 내 정보 조회 / 수정
- [x] `JwtAuthGuard` — JWT 검증 가드
- [x] `RolesGuard` — STUDENT / INSTRUCTOR / ADMIN 역할 검증
- [x] `@Roles()` 데코레이터

### 강의 공개 API
- [x] 강의 목록 (키워드·카테고리·난이도 필터, 페이지네이션)
- [x] OPEN 상태 강의만 노출 (DRAFT 필터링)
- [x] 강의 상세
- [x] 카테고리 목록
- [x] 챕터 목록 / 강의 목록
- [x] 강의 리뷰 목록

### 수강 및 진도
- [x] 수강 상태 조회 (진도율·마지막 강의)
- [x] 강의 상세 (이전/다음 강의 포함)
- [x] 진도 조회 / 저장 (position, watchedSeconds, eventType)

### 북마크
- [x] 북마크 목록 조회
- [x] 북마크 추가 / 삭제

### 강의 댓글
- [x] 댓글 목록 (공개)
- [x] 댓글 작성 / 삭제 (본인만)

### 강의 자료
- [x] 자료 목록 조회
- [x] 파일 업로드 (Multer, 서버 로컬)
- [x] 파일 다운로드

### 장바구니 · 결제
- [x] 장바구니 조회 / 담기 / 삭제
- [x] 주문 생성
- [x] 데모 결제 확인 → 수강 등록 자동화

### 강의 신고
- [x] 신고 접수 (type, content)

### 강사 API
- [x] 강의 목록 / 생성 / 수정 / 삭제
- [x] 강의 공개 상태 변경 (DRAFT ↔ OPEN)
- [x] 챕터 추가 / 수정 / 삭제
- [x] 강의(Lecture) 추가 / 수정 / 삭제
- [x] 강의 자료 업로드 / 삭제
- [x] 수강생 목록 조회
- [x] 소유권 검증 (본인 강의만 수정 가능)

### 관리자 API
- [x] 대시보드 통계 (총 매출·월 매출·신규 회원·강의수·수강수·미처리 신고)
- [x] 사용자 목록 (검색·역할 필터·페이지네이션)
- [x] 사용자 정지 / 역할 변경 / 삭제
- [x] 강의 목록 / 삭제
- [x] 카테고리 생성 / 수정 / 삭제
- [x] 신고 목록 / 처리 완료

---

## 프론트엔드

### 공통
- [x] 디자인 토큰 (CSS 변수 기반 다크 테마)
- [x] `SiteHeader` — 역할별 메뉴 분기, 장바구니 뱃지, 스크롤 스타일
- [x] `SiteFooter` — 항상 하단 고정 (flex sticky)
- [x] `AuthContext` — 로그인 상태, 역할, 자동 복원
- [x] Axios 인터셉터 — 토큰 자동 첨부·재발급

### 수강생 페이지
- [x] `MainPage` — 히어로, 카테고리별 최신 강의
- [x] `CoursePage` — 강의 목록, 검색·필터·페이지네이션, 스켈레톤
- [x] `CourseDetailPage` — 강의 상세, 커리큘럼 아코디언, CTA 버튼 분기
- [x] `CartPage` — 장바구니, 체크박스 선택, 데모 결제
- [x] `MyLearningPage` — 수강 목록, 진도율, 이어보기
- [x] `MyPage` — 마이페이지
- [x] `LoginPage` / `RegisterPage`

### 강의 플레이어 (`LecturePage`)
- [x] YouTube IFrame 재생
- [x] 네이티브 video 재생 (비YouTube)
- [x] 이어보기 (마지막 위치 복원)
- [x] 진도 추적 (1초 단위 position, 10초 인터벌 저장, 이탈 시 keepalive)
- [x] 완강 80% 자동 처리 + 다음 강의 잠금 해제
- [x] 챕터 사이드바 (현재 강의 하이라이트)
- [x] 북마크 패널
- [x] 강의 댓글 섹션
- [x] 강의 자료 다운로드

### 강사 페이지
- [x] `InstructorCoursesPage` — 강의 목록, 상태 뱃지, 공개/비공개 토글, 삭제
- [x] `InstructorCreateCoursePage` — 강의 생성 폼
- [x] `InstructorCourseEditPage` — 기본 정보·챕터·강의·자료·수강생 탭 편집

### 관리자 패널 (`/admin`)
- [x] `AdminLoginPage` — 관리자 전용 로그인
- [x] `AdminLayout` — 사이드바 (대시보드·사용자·강의·카테고리·신고)
- [x] `AdminDashboardPage` — 통계 카드 (accent 디자인, formatRevenue)
- [x] `AdminUsersPage` — 사용자 테이블, 역할 드롭다운, 정지·삭제
- [x] `AdminCoursesPage` — 강의 테이블, 삭제
- [x] `AdminCategoriesPage` — 카테고리 CRUD (인라인 수정)
- [x] `AdminReportsPage` — 신고 목록, 처리 완료

---

## DB 스키마

- [x] 16개 테이블 정의
- [x] 7개 Enum 정의 (Roles, Difficulty, CourseLifecycleStatus 등)
- [x] `courses.status` 기본값 `DRAFT`
- [x] `lecture_comment.title` nullable
- [x] `prisma db push` + `prisma generate` 완료

---

## 완료 기준

| 항목 | 상태 |
|------|------|
| 수강생 회원가입 → 강의 구매 → 플레이어 이어보기 E2E | ✅ |
| 강사 강의 생성 → OPEN 공개 → 수강생 목록 확인 | ✅ |
| 관리자 로그인 → 대시보드 통계 → 사용자 역할 변경 | ✅ |
| 강의 댓글 작성/삭제 | ✅ |
| 강사 계정 장바구니 비활성화 | ✅ |
| Footer 항상 하단 고정 | ✅ |
