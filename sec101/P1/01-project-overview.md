# SEC101 P1 — 프로젝트 개요

## 스프린트 목표

P1은 핵심 플로우(수강생 · 강사 · 관리자)가 모두 브라우저에서 동작하는 수준의 MVP를 완성한다.  
실결제·클라우드 스토리지 등 외부 서비스 연동은 P2에서 처리한다.

---

## 구현 범위

| 역할 | 핵심 기능 |
|------|-----------|
| 수강생 | 회원가입·로그인, 강의 탐색·구매, 강의 플레이어, 진도 추적, 북마크, 댓글, 자료 다운로드 |
| 강사 | 강의 생성·수정·삭제, 챕터·강의 관리, DRAFT/OPEN 상태 제어, 자료 업로드, 수강생 조회 |
| 관리자 | 별도 로그인, 대시보드 통계, 사용자·강의·카테고리·신고 관리 |

---

## 기술 스택

### 백엔드 (`server/`)
- **NestJS + TypeScript** — REST API
- **Prisma ORM** — PostgreSQL 연동 (Custom Generator, CJS 모듈)
- **JWT** — Access Token(메모리) + Refresh Token(HttpOnly Cookie)
- **bcrypt** — 비밀번호 해싱
- **Multer** — 강의 자료 파일 업로드 (서버 로컬)
- **class-validator** — DTO 유효성 검증

### 프론트엔드 (`client/`)
- **React 18 + TypeScript** (Vite)
- **TanStack Query v5** — 서버 상태 관리
- **React Router v6** — SPA 라우팅
- **Axios** — HTTP 클라이언트 (토큰 인터셉터 포함)
- **react-youtube** — YouTube IFrame Player API 연동
- **Vanilla CSS** — 디자인 토큰 기반 스타일링

---

## 역할 시스템

| 역할 | 권한 |
|------|------|
| STUDENT | 강의 수강, 장바구니·결제, 댓글·북마크·신고 |
| INSTRUCTOR | 강의·챕터·자료 CRUD, 수강생 조회, 장바구니 비활성화 |
| ADMIN | 사용자·강의·카테고리·신고 전체 관리 |

---

## 인증 흐름

```
로그인 → Access Token (메모리 보관, 15분)
           + Refresh Token (HttpOnly Cookie, 7일)

Access Token 만료 → Axios 인터셉터 자동 재발급
로그아웃 → 서버에서 Refresh Token 삭제
새로고침 → /auth/refresh 호출로 세션 복원
```

---

## 개발 서버 실행

```bash
# PostgreSQL 실행 확인 후

cd server
npx prisma db push       # 스키마 동기화
npx prisma generate      # 클라이언트 생성
npm run start:dev        # http://localhost:3000

cd client
npm run dev              # http://localhost:5173
```

---

## 관리자 계정 생성

```bash
cd server
node scripts/create-admin.js
# 이메일: admin@sec101.dev / 비밀번호: admin1234!
```

---

## 관련 문서

| 문서 | 내용 |
|------|------|
| [02-data-model](02-data-model.md) | DB 스키마 (16개 테이블, Enum 정의) |
| [03-api-design](03-api-design.md) | P1 구현 REST API 전체 목록 |
| [04-requirements-user](04-requirements-user.md) | 수강생 기능 요구사항 명세 |
| [05-requirements-instructor](05-requirements-instructor.md) | 강사 기능 요구사항 명세 |
| [06-implementation-checklist](06-implementation-checklist.md) | P1 구현 체크리스트 |
