# sec101 - 보안 강의 플랫폼

보안 초보자를 위한 강의 웹 서비스. 누구나 수강생이자 강사가 될 수 있다.

## 설계 문서

| 문서 | 내용 |
|---|---|
| [01-project-overview](P2/01-project-overview.md) | 프로젝트 비전, 핵심 기능, 비기능 요구사항 |
| [02-data-model](P2/02-data-model.md) | DB 스키마 (PostgreSQL, 테이블 20개) |
| [03-api-design](P2/03-api-design.md) | REST API 엔드포인트 설계 |
| [04-ui-design](P2/04-ui-design.md) | UI/UX 설계 |
| [05-architecture](P2/05-architecture.md) | 기술 스택, 디렉토리 구조, 시스템 아키텍처 |
| [06-sample-data](P2/06-sample-data.md) | 시드 데이터 |
| [07-implementation-checklist](P2/07-implementation-checklist.md) | 구현 체크리스트 |
| [08-admin-api-spec](P2/08-admin-api-spec.md) | 관리자 API 상세 스펙 |
| [09-instructor-feature-spec](P2/09-instructor-feature-spec.md) | 강사 기능 상세 스펙 |
| [10-security-audit](P2/10-security-audit.md) | 보안 감사 항목 |

---

## 기술 스택

### 백엔드 (`server/`)
- **NestJS + TypeScript** — REST API
- **Prisma** — ORM (PostgreSQL)
- **JWT + bcrypt** — 인증
- **@aws-sdk/client-s3** — Cloudflare R2 파일 업로드 (Presigned URL)
- **class-validator** — 요청 유효성 검증

### 프론트엔드 (`client/`)
- **React + TypeScript** (Vite)
- **React Router** — SPA 라우팅
- **Axios** — HTTP 클라이언트
- **Vanilla CSS** — 스타일링 (디자인 토큰 기반)
- **React Player** — 강의 영상 플레이어

### 인프라
- **PostgreSQL** (포트 5432, Docker)
- **Cloudflare R2** — 강의 자료 파일 스토리지
- **Nginx** — 리버스 프록시

---

## 개발 서버

```bash
docker-compose up -d          # PostgreSQL
cd server && npm run dev      # 백엔드 http://localhost:3000
cd client && npm run dev      # 프론트엔드 http://localhost:5173
```

프론트엔드 `/api/*` → 백엔드 프록시 (`vite.config.ts`)

---

## 역할 시스템

사용자 역할은 `user_roles` 테이블로 분리 — 한 사람이 STUDENT + INSTRUCTOR 동시 보유 가능.

| 역할 | 설명 |
|---|---|
| STUDENT | 강의 수강, 결제, 평점, 신고 |
| INSTRUCTOR | 강의 업로드, 자료 업로드, 수강생 관리 |
| ADMIN | 사용자/강의/신고 관리, 대시보드 |

---

## 인증 흐름

- JWT Bearer 토큰 — 모든 보호 라우트에 `JwtAuthGuard` 적용
- 역할 제어 — `RolesGuard` + `@Roles()` 데코레이터
- 관리자 페이지는 ADMIN 역할만 접근 가능

---

## 파일 업로드 흐름 (Cloudflare R2)

1. `POST /instructor/lectures/:id/materials/upload-url` → Presigned PUT URL 발급 (5분)
2. 클라이언트가 R2에 직접 PUT 업로드
3. `POST /instructor/lectures/:id/materials` → 메타데이터를 `lecture_materials` 테이블에 저장
4. 다운로드: Presigned GET URL 발급 (10분), 수강 여부 확인 후 제공

---

## 결제 흐름 (Toss)

1. `POST /orders` → 주문 생성 (PENDING)
2. Toss 결제 진행
3. `POST /orders/:id/confirm` → orders PAID + enrollments ACTIVE 트랜잭션 처리

---

## API 규칙

- Base URL: `/api/v1`
- 응답 포맷: `ResponseInterceptor`로 공통 래핑
- 에러 응답: `HttpExceptionFilter`로 표준화
- 목표 응답 시간: 300ms 이내

### 공통 응답 형식

```json
// 성공
{ "success": true, "status": 200, "message": "", "data": {} }

// 페이지네이션
{ "success": true, "status": 200, "message": "", "data": [], "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }

// 에러
{ "success": false, "status": 404, "message": "Not Found" }
```

---

## 구현 단계 (14 Phase)

```
Phase 1:  프로젝트 초기화 (server + client)
Phase 2:  DB 스키마 & 시드 데이터
Phase 3:  백엔드 — Public API
Phase 4:  백엔드 — Auth API
Phase 5:  백엔드 — 수강생 API (수강 / 진도 / 북마크)
Phase 6:  백엔드 — 수강생 API (결제 / 주문 / 장바구니)
Phase 7:  백엔드 — 강사 API
Phase 8:  백엔드 — 관리자 API
Phase 9:  프론트엔드 — 디자인 시스템 & 공통 레이아웃
Phase 10: 프론트엔드 — 수강생 페이지
Phase 11: 프론트엔드 — 강사 페이지
Phase 12: 프론트엔드 — 관리자 페이지
Phase 13: 파일 스토리지 연동 (Cloudflare R2)
Phase 14: 통합 검증 & 마무리
```

자세한 체크리스트 → [07-implementation-checklist](P2/07-implementation-checklist.md)

---

## 보안 필수 항목 (구현 시 반드시 적용)

| 심각도 | 항목 |
|---|---|
| CRITICAL | `JWT_SECRET` 미설정 시 서버 시작 차단 (폴백 금지) |
| CRITICAL | `.env` 시크릿은 `crypto.randomBytes(32)` 로 생성 |
| CRITICAL | Nginx에서 HTTPS 강제 + HSTS 활성화 |
| HIGH | `helmet()`, CORS 화이트리스트, Rate Limiting 적용 |
| HIGH | bcrypt 라운드 12 이상, 파일 업로드 타입/크기 검증 |

전체 보안 감사 → [10-security-audit](P2/10-security-audit.md)
