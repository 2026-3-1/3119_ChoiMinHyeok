# SEC101 — 보안 강의 플랫폼

보안 분야 온라인 강의 플랫폼입니다.  
NestJS(백엔드) + React(프론트엔드) + PostgreSQL + Redis 구성으로 Docker Compose로 배포됩니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS, Prisma ORM, PostgreSQL, Redis |
| 프론트엔드 | React, TypeScript, Vite, TanStack Query |
| 인프라 | Docker Compose, Nginx |
| 알림 | Discord Webhook, Nodemailer(SMTP) |
| 모니터링 | Winston 로거, Sentry |
| 결제 | Toss Payments |

---

## 주요 기능

- 강의 목록/상세 조회, 수강 신청, 결제(Toss Payments)
- 수강 진도 관리, 북마크, 재생 이력
- 강사 전용 강의 관리 (생성/수정/공개)
- 관리자 대시보드 (사용자·강의·카테고리·신고 관리)
- 계정 정지 및 정지 해제 요청(이메일)
- Q&A 게시판 (학생 질문 / 관리자 공지)
- Discord 알림 (결제 완료, 일일 통계, 미달 강의 취소)
- 이메일 알림 (구매 완료, 계정 정지)
- 배치 작업 (미결제 주문 자동 취소, 미달 강의 자동 취소, 일일 리포트)

---

## 로컬 실행

```bash
# 저장소 클론
git clone https://github.com/2026-3-1/3119_ChoiMinHyeok.git
cd 3119_ChoiMinHyeok

# 환경 변수 설정 (docker-compose.yml 참고)
cp docker-compose.yml.example docker-compose.yml  # 또는 직접 수정

# 빌드 및 실행
docker compose up -d --build

# 관리자 계정 생성
docker compose exec server npm run db:seed:admin
```

---

## 환경 변수 (docker-compose.yml)

| 변수 | 필수 | 설명 |
|------|------|------|
| `JWT_ACCESS_SECRET` | ✅ | JWT 액세스 토큰 서명 키 (32자 이상) |
| `JWT_REFRESH_SECRET` | ✅ | JWT 리프레시 토큰 서명 키 (32자 이상) |
| `DATABASE_URL` | ✅ | PostgreSQL 접속 URL |
| `REDIS_URL` | ✅ | Redis 접속 URL |
| `CLIENT_ORIGIN` | ✅ | 프론트엔드 도메인 (CORS) |
| `DISCORD_WEBHOOK_URL` | - | Discord 알림 웹훅 URL |
| `SMTP_HOST` | - | SMTP 서버 주소 |
| `SMTP_USER` | - | SMTP 계정 |
| `SMTP_PASS` | - | SMTP 비밀번호 |
| `SENTRY_DSN` | - | Sentry 오류 추적 DSN |
| `TOSS_SECRET_KEY` | - | Toss Payments 시크릿 키 |

---

## GitHub

🔗 https://github.com/2026-3-1/3119_ChoiMinHyeok

---

> 상세 운영 매뉴얼: [MANUAL.md](./MANUAL.md)
