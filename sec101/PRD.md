# PRD — SEC101 온라인 강의 플랫폼

> **Product Requirements Document**  
> 보안 초보자를 위한 강의 공유 플랫폼. 누구나 수강생이자 강사가 될 수 있다.

---

## 프로젝트 비전

SEC101은 보안 분야의 지식을 서로 공유할 수 있는 강의 웹 서비스다.  
수강자는 강의를 구매·수강하고, 강사는 직접 강의를 제작·판매하며,  
관리자는 플랫폼 전체를 관리한다.

---

## 대상 사용자

| 역할 | 설명 |
|------|------|
| STUDENT | 강의를 탐색·구매·수강하는 일반 사용자 |
| INSTRUCTOR | 강의를 제작하고 수강생을 관리하는 강사 |
| ADMIN | 사용자·강의·신고를 관리하는 운영자 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript + Vite |
| 상태 관리 | TanStack Query v5 |
| 라우팅 | React Router v6 |
| Backend | NestJS + TypeScript |
| ORM | Prisma (PostgreSQL) |
| 인증 | JWT (Access Token 메모리 + Refresh Token HttpOnly Cookie) |
| 파일 저장 | 서버 로컬 (P1) → Cloudflare R2 (P2) |
| 결제 | Demo 모드 (P1) → Toss Payments (P2) |

---

## DB 주요 모델

```
users, categories, courses, chapter, lectures
cart_items, orders, order_items, payment_transactions
enrollments, enrollment_history
course_comment, lecture_comment
lectures_progress, lecture_playback_history, lecture_bookmark
lecture_attachment, course_report
```

---

---

# P1 — 구현 완료

> P1은 핵심 플로우(수강생·강사·관리자)를 모두 동작 가능한 수준으로 구현한 스프린트다.

---

## P1 수강생 기능

### 인증
- 회원가입 / 로그인 / 로그아웃
- JWT Access Token (메모리) + Refresh Token (HttpOnly Cookie)
- 새로고침 시 세션 자동 복원

### 강의 탐색
- 강의 목록 카드 그리드 (카테고리·키워드·난이도 필터, 페이지네이션)
- OPEN 상태 강의만 목록 노출 (DRAFT 비노출)
- 메인 페이지 카테고리별 최신 강의 6개
- 강의 상세 (커리큘럼 아코디언, 총 재생시간, CTA 버튼 분기)

### 수강 및 결제
- 장바구니 담기 / 삭제 / 금액 합산
- 데모 결제 → 수강 등록 자동화
- 결제 완료 후 수강 상태 즉시 반영

### 강의 플레이어
- YouTube 임베드 / 네이티브 video 재생
- 마지막 시청 위치 이어보기
- 이전/다음 강의 이동, 챕터 사이드바
- 이전 강의 미완료 시 다음 강의 잠금
- 완강(80% 이상) 시 다음 강의 자동 잠금 해제 및 이동

### 수강 진도 추적
- 1초 단위 position 추적 + 10초 인터벌 서버 저장
- 페이지 이탈 시 keepalive fetch로 최종 진도 저장
- 내 학습 페이지 진도율 표시

### 부가 기능
- 강의 북마크 (구간 메모 저장/삭제)
- 강의 댓글 (작성/삭제, Ctrl+Enter 등록)
- 강의 자료 다운로드
- 강의 신고 (저작권·오류·기타)

---

## P1 강사 기능

### 강의 관리
- 강의 생성 (기본 상태 DRAFT)
- 강의 수정 / 삭제 (2단계 확인)
- DRAFT ↔ OPEN 공개 상태 토글
- 상태 뱃지 표시 (초안/공개/취소)

### 챕터·강의 관리
- 챕터 추가 / 수정 / 삭제 / 순서 변경
- 강의(Lecture) 추가 / 수정 / 삭제 / 순서 변경
- 강의 공개/비공개 설정

### 강의 자료
- 파일 업로드 (형식·크기 검증)
- 파일 삭제

### 수강생
- 강의별 수강생 목록 조회 (이름·수강일·진도율)

---

## P1 관리자 기능

### 전용 로그인
- `/admin/login` 독립 페이지
- ADMIN 역할 계정만 접근 가능

### 대시보드
- 총 매출 / 월 매출 / 전체 회원 / 오늘 신규 가입
- 전체 강의 수 / 활성 수강 수 / 미처리 신고 수

### 사용자 관리
- 전체 사용자 목록 (이름·이메일 검색, 역할 필터, 페이지네이션)
- 역할 변경 (STUDENT / INSTRUCTOR / ADMIN)
- 사용자 정지 / 삭제

### 강의 관리
- 전체 강의 목록 조회
- 강의 삭제

### 카테고리 관리
- 카테고리 추가 / 인라인 수정 / 삭제

### 신고 관리
- 신고 목록 (미처리 우선 정렬)
- 신고 처리 완료 처리

---

## P1 API 엔드포인트 요약

| 구분 | 주요 엔드포인트 |
|------|----------------|
| 인증 | POST /auth/register, /auth/login, /auth/logout, /auth/refresh, GET /auth/me |
| 강의 | GET /courses, /courses/:id, /categories |
| 수강 | GET/POST /enrollments, /learning/:courseId |
| 플레이어 | GET /lectures/:id, PUT /lectures/:id/progress, GET/POST /lectures/:id/bookmarks |
| 댓글 | GET/POST /lectures/:id/comments, DELETE /lectures/:id/comments/:commentId |
| 첨부파일 | GET /lectures/:id/attachments, GET /attachments/:id/download |
| 장바구니 | GET/POST /cart, DELETE /cart/:id |
| 결제 | POST /orders, POST /orders/:id/confirm |
| 강사 | GET/POST/PATCH/DELETE /instructor/courses |
| 강사 챕터 | POST/PATCH/DELETE /instructor/courses/:id/chapters |
| 강사 강의 | POST/PATCH/DELETE /instructor/chapters/:id/lectures |
| 강사 자료 | POST /instructor/lectures/:id/attachments, DELETE /instructor/attachments/:id |
| 관리자 | GET /admin/dashboard, /admin/users, /admin/courses, /admin/categories, /admin/reports |
| 신고 | POST /courses/:id/reports, PATCH /admin/reports/:id |

---

---

# P2 — 구현 예정

> P1에서 동작을 확인한 뒤, P2에서 실 서비스 수준의 기능을 추가한다.

---

## P2-1. Toss Payments 실결제 연동

| 항목 | 내용 |
|------|------|
| 목표 | 실제 결제 카드로 강의 구매 가능 |
| 구현 내용 | Toss Payments SDK 연동, 결제 확인 API (서버 사이드 검증), 환불 처리 |
| 백엔드 | `POST /orders/:id/confirm` → Toss API 호출 → 트랜잭션 내 수강 등록 |
| 프론트엔드 | `@tosspayments/payment-sdk` 결제 위젯, 성공/실패 콜백 처리 |
| 예상 공수 | 3일 |

---

## P2-2. Cloudflare R2 파일 스토리지

| 항목 | 내용 |
|------|------|
| 목표 | 강의 자료를 클라우드 스토리지에 안전하게 저장/제공 |
| 구현 내용 | Presigned PUT URL로 클라이언트 → R2 직접 업로드, Presigned GET URL로 다운로드 |
| 백엔드 | `StorageService` (`@aws-sdk/client-s3`) — 업로드 URL 발급(5분), 다운로드 URL(10분), 삭제 |
| 프론트엔드 | 드래그앤드롭 업로드 UI, 업로드 진행률 표시 |
| 예상 공수 | 2일 |

---

## P2-3. 강의 리뷰 시스템

| 항목 | 내용 |
|------|------|
| 목표 | 수강생이 강의에 평점과 리뷰를 남기고, 강사는 이를 조회 |
| 구현 내용 | 강의 리뷰 작성(평점 1-5+댓글), 수정, 삭제, 대댓글 |
| 백엔드 | POST/PATCH/DELETE `/courses/:id/comments`, 대댓글 API |
| 프론트엔드 | 강의 상세 리뷰 섹션, 별점 입력 UI |
| 예상 공수 | 2일 |

---

## P2-4. 강사 평점 대시보드

| 항목 | 내용 |
|------|------|
| 목표 | 강사가 본인 강의의 평점 통계와 최근 리뷰를 한눈에 확인 |
| 구현 내용 | 강사 평균 평점, 총 리뷰 수, 최근 리뷰 목록 조회 |
| 백엔드 | GET `/instructor/ratings` |
| 프론트엔드 | 강사 패널 내 평점 탭 |
| 예상 공수 | 1일 |

---

## P2-5. 수강생 추방

| 항목 | 내용 |
|------|------|
| 목표 | 강사가 문제 수강생의 수강 자격 취소 가능 |
| 구현 내용 | 수강생 목록에서 추방 버튼 → enrollment CANCELED 처리 |
| 백엔드 | DELETE `/instructor/courses/:id/students/:userId` |
| 프론트엔드 | 수강생 목록 테이블 추방 버튼 + 확인 다이얼로그 |
| 예상 공수 | 0.5일 |

---

## P2-6. 검색 고도화

| 항목 | 내용 |
|------|------|
| 목표 | 강의·강사 검색 정확도 향상 |
| 구현 내용 | PostgreSQL Full-text Search 또는 별도 검색 엔진 적용, 자동완성 |
| 예상 공수 | 3일 |

---

## P2-7. 실시간 알림

| 항목 | 내용 |
|------|------|
| 목표 | 댓글, 신고 처리 등 이벤트를 실시간으로 사용자에게 알림 |
| 구현 내용 | WebSocket (Socket.io) 서버, 클라이언트 알림 벨 UI |
| 예상 공수 | 3일 |

---

## P2-8. 반응형 모바일 지원

| 항목 | 내용 |
|------|------|
| 목표 | 모바일(360px) ~ 데스크톱(1920px) 전 구간 지원 |
| 구현 내용 | 미디어 쿼리 전면 적용, 플레이어 모바일 UX 개선 |
| 예상 공수 | 2일 |

---

## P2 구현 우선순위

| 순위 | 기능 | 이유 |
|------|------|------|
| 1 | Toss 실결제 | 서비스 수익화 핵심 |
| 2 | Cloudflare R2 | 파일 안정성·확장성 |
| 3 | 강의 리뷰 시스템 | 강의 신뢰도·전환율 향상 |
| 4 | 수강생 추방 | 강사 운영 권한 완성 |
| 5 | 강사 평점 대시보드 | 강사 경험 개선 |
| 6 | 반응형 모바일 | 접근성 확대 |
| 7 | 검색 고도화 | 대규모 콘텐츠 대비 |
| 8 | 실시간 알림 | UX 고도화 |

---

## 마일스톤

| 스프린트 | 범위 | 완료 기준 |
|----------|------|-----------|
| **P1** | 수강생·강사·관리자 핵심 플로우 | 모든 핵심 기능 브라우저에서 동작 확인 |
| **P2-α** | 실결제 + R2 스토리지 | 테스트 카드 결제 → 수강 등록 E2E 통과 |
| **P2-β** | 리뷰·평점·추방 | 강사 리뷰 통계 정상 집계 확인 |
| **P2-γ** | 검색·알림·모바일 | 360px 모바일 전 페이지 정상 표시 |
