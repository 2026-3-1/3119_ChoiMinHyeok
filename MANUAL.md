# SEC101 운영 매뉴얼

> 작성일: 2026-06-17  
> 대상: 운영자 / 유지보수 담당자

---

## 목차

1. [접속 정보](#1-접속-정보)
2. [관리자 계정](#2-관리자-계정)
3. [GitHub 저장소](#3-github-저장소)
4. [사이트 기능 확인 방법](#4-사이트-기능-확인-방법)
5. [알림 기능](#5-알림-기능)
6. [배치 작업 (자동화)](#6-배치-작업-자동화)
7. [로그 확인](#7-로그-확인)
8. [보안 기능](#8-보안-기능)
9. [헬스 체크](#9-헬스-체크)
10. [DB 접근 및 관리](#10-db-접근-및-관리)
11. [Docker 운영 명령어](#11-docker-운영-명령어)
12. [Sentry 오류 모니터링](#12-sentry-오류-모니터링)
13. [트러블슈팅](#13-트러블슈팅)

---

## 1. 접속 정보

| 항목 | 주소 |
|------|------|
| **서비스 사이트** | http://3.36.67.35 |
| **관리자 패널** | http://3.36.67.35/admin/login |
| **API 문서 (Swagger)** | http://3.36.67.35/api-docs-v1 |
| **헬스 체크** | http://3.36.67.35/health |

---

## 2. 관리자 계정

| 항목 | 값 |
|------|-----|
| **이메일** | admin@sec101.com |
| **비밀번호** | Admin1234! |
| **역할** | ADMIN |

> ⚠️ 운영 환경에서는 반드시 비밀번호를 변경하세요.  
> 관리자 로그인 후 우측 상단 프로필 → 비밀번호 변경

### 관리자 계정 재생성 (분실 시)

서버에 SSH 접속 후:

```bash
# 관리자 컨테이너 접속
docker compose exec server npm run db:seed:admin
```

기본값으로 `admin@sec101.com / Admin1234!` 계정이 생성(또는 갱신)됩니다.

---

## 3. GitHub 저장소

🔗 **https://github.com/2026-3-1/3119_ChoiMinHyeok**

### 브랜치 구조

| 브랜치 | 설명 |
|--------|------|
| `main` | 안정 버전 (배포 기준) |
| `P3` | P3 단계 개발 브랜치 |

### 코드 업데이트 후 재배포

```bash
git pull origin main
docker compose up -d --build
```

---

## 4. 사이트 기능 확인 방법

### 4-1. 회원 관련

| 기능 | 확인 방법 |
|------|-----------|
| 회원가입 | `/register` 페이지에서 이름·이메일·비밀번호 입력 후 가입 |
| 로그인 | `/login` 페이지 |
| 계정 정지 | 관리자 패널 → 사용자 관리 → 해당 유저 "정지" 버튼 클릭 → 정지된 유저가 로그인 시도 시 403 오류 + 정지 해제 요청 버튼 표시 |
| 계정 정지 해제 | 관리자 패널 → 사용자 관리 → "정지 해제" 버튼 클릭 |
| 정지 해제 요청 | 정지된 계정으로 로그인 시도 → 에러 화면에서 "정지 해제 요청 보내기" 클릭 → 이메일 자동 발송 (관리자 수신) |

### 4-2. 강의 관련

| 기능 | 확인 방법 |
|------|-----------|
| 강의 목록 | `/courses` 페이지 |
| 강의 상세 | 강의 카드 클릭 |
| 수강 신청 (무료) | 강의 상세 페이지 → "수강 신청" 버튼 |
| 수강 신청 (유료) | 강의 상세 → "장바구니" → `/cart` → 결제 |
| 환불 | 내 학습 목록 → 강의 상세 → "환불 요청" 버튼 |

### 4-3. 관리자 기능

관리자 패널 `/admin/login` 에서 로그인 후 확인

| 메뉴 | 기능 |
|------|------|
| 대시보드 | 전체 통계 (회원 수, 강의 수, 오늘 매출 등) |
| 사용자 관리 | 회원 목록 조회·검색, 역할 변경, 정지/해제, 삭제 |
| 강의 관리 | 강의 목록, 상태 변경(OPEN/DRAFT/CANCELED), 삭제 |
| 카테고리 관리 | 카테고리 추가/삭제 |
| 신고 관리 | 강의 신고 목록, 처리 여부 변경 |

### 4-4. 강사 기능

강사 계정으로 로그인 후 확인 (회원가입 시 역할: 강사 선택)

| 메뉴 | 기능 |
|------|------|
| 강사 관리 | `/instructor/courses` — 내 강의 목록 |
| 강의 생성 | "새 강의" 버튼 → 제목·설명·가격·카테고리 입력 |
| 강의 수정 | 강의 카드 "편집" → 챕터·강의 추가, 상태 공개 전환 |

### 4-5. Q&A 게시판

| 기능 | 확인 방법 |
|------|-----------|
| 게시판 접근 | 상단 네비 "게시판" 클릭 → `/board` |
| 질문 작성 | 학생 계정으로 로그인 → "글 작성" 버튼 |
| 공지 작성 | 관리자 계정 → "글 작성" → "공지사항으로 등록" 체크 |
| 댓글 작성 | 게시글 상세 → 하단 댓글 입력창 (모든 로그인 유저 가능) |

---

## 5. 알림 기능

### 5-1. Discord 알림

#### 설정 방법

1. Discord 서버에서 웹훅 URL 생성  
   채널 설정 → 연동 → 웹훅 → 새 웹훅 → URL 복사

2. 서버의 `docker-compose.yml` 에 환경변수 추가:
   ```yaml
   DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/..."
   ```

3. 재시작:
   ```bash
   docker compose up -d server
   ```

#### 알림 발송 시점

| 알림 | 발송 시점 | 포함 정보 |
|------|-----------|-----------|
| **결제 완료** | 사용자가 결제 성공 시 즉시 | 구매자명, 이메일, 주문번호, 강의 목록, 결제금액 |
| **일일 통계** | 매일 오전 9시 자동 발송 | 운영 강의 수, 전체 회원 수, 오늘 수강신청 수, 오늘 매출, 미결제 주문 수 |
| **미달 강의 취소** | 매일 자정 자동 (해당 강의 있을 때만) | 취소된 강의 수, 강의 목록 |

> Discord 알림이 오지 않는다면: `DISCORD_WEBHOOK_URL` 환경변수가 설정되어 있는지 확인하세요.  
> 서버 로그에 `"DISCORD_WEBHOOK_URL이 설정되지 않아"` 메시지가 있으면 미설정 상태입니다.

---

### 5-2. 이메일 알림

#### 설정 방법

`docker-compose.yml` 에 아래 환경변수 설정 (Gmail 기준):

```yaml
SMTP_HOST: "smtp.gmail.com"
SMTP_PORT: "587"
SMTP_USER: "your-email@gmail.com"
SMTP_PASS: "앱 비밀번호"   # Google 계정 → 2단계 인증 → 앱 비밀번호
SMTP_FROM: "your-email@gmail.com"
ADMIN_EMAIL: "admin@yourdomain.com"  # 정지 해제 요청 수신 주소
```

#### 알림 발송 시점

| 알림 | 발송 시점 | 수신자 |
|------|-----------|--------|
| **구매 완료** | 결제 성공 시 즉시 | 구매자 이메일 |
| **계정 정지** | 관리자가 정지 처리 시 즉시 | 정지된 유저 이메일 |
| **정지 해제 요청** | 유저가 요청 제출 시 즉시 | 관리자 이메일 (`ADMIN_EMAIL`) |

> 이메일이 발송되지 않는다면: SMTP_HOST, SMTP_USER, SMTP_PASS 중 하나라도 빠지면 이메일 기능이 비활성화됩니다.  
> 서버 로그에 `"SMTP 환경변수가 설정되지 않아 이메일 알림이 비활성화됩니다"` 메시지로 확인 가능합니다.

---

## 6. 배치 작업 (자동화)

서버 시작 시 자동으로 스케줄러가 동작합니다. 별도 설정 불필요.

| 작업명 | 실행 주기 | 동작 내용 |
|--------|-----------|-----------|
| **미결제 주문 자동 취소** | 30분마다 | PENDING 상태로 30분 이상 경과한 주문을 자동 CANCELED 처리 |
| **미달 강의 자동 취소** | 매일 자정 (00:00) | 개설 7일 이상 경과 + 최소 수강 인원 미달 강의를 자동 CANCELED 처리 + Discord 알림 |
| **일일 운영 통계 리포트** | 매일 오전 9시 | 운영 통계를 Discord로 자동 발송 |

### 배치 작업 실행 여부 확인

```bash
# 서버 로그에서 배치 작업 로그 검색
docker compose logs server | grep -E "미결제|미달|통계|Cron"
```

로그 예시:
```
[SchedulerService] 미결제 주문 자동 취소 작업 시작
[SchedulerService] 미결제 주문 3건 자동 취소 완료
[SchedulerService] 일일 통계 리포트 전송 시작
```

### 배치 작업 코드 위치

```
server/src/scheduler/
├── scheduler.module.ts       # 모듈 설정
├── scheduler.service.ts      # Cron 스케줄 정의
└── scheduler.repository.ts   # DB 쿼리
```

### 배치 작업이 몇 번 실행되었는지 확인

```bash
# 전체 실행 횟수 확인 (배포 이후)
docker compose logs server --no-log-prefix | grep "작업 시작" | wc -l

# 날짜별 확인
docker compose logs server --no-log-prefix | grep "2026-06-17" | grep "작업 시작"
```

---

## 7. 로그 확인

### 실시간 로그

```bash
# 전체 서버 로그 (실시간)
docker compose logs -f server

# 최근 100줄만
docker compose logs --tail=100 server

# 에러만 필터
docker compose logs server | grep '"level":"error"'
```

### 로그 파일 (프로덕션 환경)

로그 파일은 서버 컨테이너 내부 `/app/logs/` 에 저장됩니다.

```bash
# 에러 로그 확인
docker compose exec server cat logs/error.log

# 전체 로그 확인
docker compose exec server cat logs/combined.log

# 실시간 에러 로그 감시
docker compose exec server tail -f logs/error.log
```

### HTTP 요청 로그 항목

각 HTTP 요청마다 아래 항목이 기록됩니다:

```json
{
  "level": "log",
  "message": "GET /api/v1/courses 200 45ms",
  "requestId": "uuid-xxxx",
  "ip": "123.456.789.0",
  "timestamp": "2026-06-17T09:00:00.000Z"
}
```

- `5xx` 에러 → `error` 레벨
- `4xx` 에러 → `warn` 레벨
- `2xx` 성공 → `log` 레벨

---

## 8. 보안 기능

### 8-1. 인증/인가

| 기능 | 설명 |
|------|------|
| JWT 액세스 토큰 | 유효기간 15분, Authorization 헤더로 전달 |
| JWT 리프레시 토큰 | 유효기간 7일, HttpOnly 쿠키로 전달 (JS 접근 불가) |
| 계정 정지 | 정지된 계정은 로그인 및 토큰 갱신 차단 |
| 역할 기반 접근 | STUDENT / INSTRUCTOR / ADMIN 역할별 API 접근 제한 |

### 8-2. Rate Limiting

악성 요청 방지를 위해 API별 속도 제한이 적용됩니다:

| 엔드포인트 | 제한 |
|-----------|------|
| 일반 API 전체 | 분당 100건 |
| 회원가입/로그인 | 15분당 20건 |
| 정지 해제 요청 | 시간당 5건 |

### 8-3. 관리자 패널 보안

- 관리자 패널(`/admin`)은 ADMIN 역할 계정만 접근 가능
- 관리자 본인 계정은 직접 정지/삭제 불가 (UI 버튼 비활성화 + API 레벨 차단)

---

## 9. 헬스 체크

서버 상태 확인 API:

```bash
# 기본 헬스 체크 (DB 연결 상태 포함)
curl http://3.36.67.35/health

# 시스템 상세 정보
curl http://3.36.67.35/health/system
```

응답 예시:
```json
// GET /health
{ "status": "ok", "database": { "status": "up" } }

// GET /health/system
{
  "uptime": 86400,
  "nodeVersion": "v22.x.x",
  "platform": "linux",
  "memory": { "rss": 120, "heapUsed": 85, "heapTotal": 110 },
  "environment": "production",
  "timestamp": "2026-06-17T09:00:00.000Z"
}
```

---

## 10. DB 접근 및 관리

### DB 접속

```bash
docker compose exec c-postgres-1 psql -U postgres -d sec101
```

### 주요 조회 쿼리

```sql
-- 전체 사용자 수
SELECT COUNT(*) FROM users;

-- 최근 가입자 10명
SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10;

-- 결제 완료 주문 내역
SELECT o.id, u.name, o.paid_amount, o.created_at
FROM orders o JOIN users u ON o.user_id = u.id
WHERE o.status = 'PAID'
ORDER BY o.created_at DESC LIMIT 10;

-- 강의 현황
SELECT status, COUNT(*) FROM courses GROUP BY status;

-- 신고 목록 (미처리)
SELECT id, type, content, created_at FROM course_report WHERE is_resolved = false;

-- 게시판 글 삭제 (특정 ID)
DELETE FROM board_posts WHERE id = ?;

-- 신고 내용 삭제
DELETE FROM course_report WHERE id = ?;
```

### 마이그레이션 상태 확인

```bash
docker compose exec server npx prisma migrate status
```

---

## 11. Docker 운영 명령어

```bash
# 전체 서비스 상태 확인
docker compose ps

# 서비스 재시작
docker compose restart server
docker compose restart client

# 코드 업데이트 후 재빌드
git pull origin main
docker compose up -d --build

# 특정 서비스만 재빌드
docker compose up -d --build server

# 전체 중지
docker compose down

# 볼륨 포함 전체 초기화 (데이터 삭제 주의!)
docker compose down -v

# 컨테이너 내부 접속
docker compose exec server sh
docker compose exec c-postgres-1 sh
```

---

## 12. Sentry 오류 모니터링

Sentry를 통해 백엔드 에러를 실시간으로 모니터링할 수 있습니다.

### 설정

`docker-compose.yml` 에 DSN 추가:

```yaml
SENTRY_DSN: "https://xxxx@sentry.io/yyyy"
```

- `SENTRY_DSN` 이 없으면 Sentry 기능 자동 비활성화 (서비스 정상 동작)
- 프로덕션 환경: 요청의 20%만 성능 추적 (부하 감소)
- 개발 환경: 100% 추적

---

## 13. 트러블슈팅

### 로그인이 안 되는 경우

```bash
# 서버 로그 확인
docker compose logs server | grep -E "error|Error"

# DB 연결 확인
curl http://3.36.67.35/health
```

### 이메일/Discord 알림이 오지 않는 경우

```bash
# 환경변수 확인
docker compose exec server env | grep -E "SMTP|DISCORD"

# 서버 로그에서 알림 관련 경고 확인
docker compose logs server | grep -E "SMTP|Discord|비활성화"
```

### 배치 작업이 실행되지 않는 경우

```bash
# 서버가 정상 실행 중인지 확인
docker compose ps server

# 스케줄러 로그 확인
docker compose logs server | grep "SchedulerService"
```

### 디스크 사용량 확인

```bash
# Docker 볼륨 사용량
docker system df

# 로그 파일 크기
docker compose exec server du -sh logs/
```

---

## 부록: 디렉토리 구조

```
├── client/                  # React 프론트엔드
│   ├── src/
│   │   ├── page/            # 페이지 컴포넌트
│   │   └── features/        # 기능별 모듈 (API, 타입, 컨텍스트)
│   └── nginx.conf           # Nginx 설정
│
├── server/                  # NestJS 백엔드
│   ├── src/
│   │   ├── admin/           # 관리자 API
│   │   ├── board/           # Q&A 게시판
│   │   ├── commerce/        # 결제/주문
│   │   ├── enrollment/      # 수강 신청
│   │   ├── instructor/      # 강사 API
│   │   ├── notification/    # 이메일/Discord 알림
│   │   ├── scheduler/       # 배치 작업
│   │   └── user/            # 회원/인증
│   └── prisma/
│       ├── schema.prisma    # DB 스키마
│       ├── migrations/      # 마이그레이션 파일
│       └── seed.ts          # 관리자 시드 스크립트
│
└── docker-compose.yml       # 전체 서비스 구성
```
