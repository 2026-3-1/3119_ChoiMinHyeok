# 보안 감사 체크리스트

**감사 기준일:** 설계 단계 (2026-04-17)
**감사 범위:** server/src/*, client/src/* 전체 코드베이스 (구현 전 설계 기반 사전 점검)

---

## 요약

| 심각도 | 항목 | 구현 시 필수 조치 |
|--------|------|-----------------|
| CRITICAL | 3 | JWT_SECRET 강도, .env 보호, HTTPS |
| HIGH | 5 | Helmet, CORS 제한, Rate Limiting, bcrypt 라운드, 파일 업로드 검증 |
| MEDIUM | 5 | JWT audience 구분, 쿼리 길이 제한, 비밀번호 복잡도, ID 양수 검증, localStorage 파싱 |
| LOW | 4 | Body size 제한, 에러 스택 노출, .gitignore, slug 인젝션 |
| **합계** | **17** | |

---

## CRITICAL

### 1. JWT_SECRET 기본값 폴백 금지
- **파일:** `server/src/config/configuration.ts`
- **문제:** JWT_SECRET 환경변수 미설정 시 `'default-secret'`으로 폴백 → 토큰 위조 가능
- **조치:** 환경변수 미설정 시 서버 시작 차단 (throw Error)
  ```typescript
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }
  ```
- **상태: ⬜ 구현 필요**

### 2. .env 파일의 하드코딩된 시크릿
- **파일:** `server/.env`
- **문제:** `JWT_SECRET`, `TOSS_SECRET_KEY`, `R2_SECRET_ACCESS_KEY` 값이 추측 가능한 문자열이면 노출 위험
- **권장:** `crypto.randomBytes(32).toString('hex')`로 생성한 강력한 시크릿으로 교체
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **상태: ⬜ 배포 전 사용자 직접 조치 필요**

### 3. HTTPS 미적용 시 토큰 탈취 위험
- **파일:** 인프라 설정
- **문제:** HTTP 환경에서 JWT Bearer 토큰이 네트워크 스니핑에 노출
- **조치:** Nginx에서 HTTPS 강제, Helmet의 HSTS 활성화
- **상태: ⬜ 배포 시 조치 필요**

---

## HIGH

### 4. 보안 헤더 미설정 (Helmet.js 없음)
- **파일:** `server/src/main.ts`
- **문제:** X-Frame-Options, X-Content-Type-Options, HSTS 등 보안 헤더 누락
- **조치:** `helmet` 패키지 설치 및 적용
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```
- **상태: ⬜ 구현 필요**

### 5. CORS 무제한 허용
- **파일:** `server/src/main.ts`
- **문제:** `app.enableCors()` 기본값 → 모든 origin 허용
- **조치:** `CLIENT_URL` 환경변수로 origin 제한
  ```typescript
  app.enableCors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' });
  ```
- **상태: ⬜ 구현 필요**

### 6. 인증 엔드포인트 Rate Limiting 없음
- **파일:** `server/src/auth/auth.controller.ts`, `server/src/admin/admin.controller.ts`
- **문제:** 로그인/회원가입 무제한 요청 가능 → 브루트포스 공격 취약
- **조치:** `@nestjs/throttler` 설치, 15분당 20회 제한 적용 (login, register)
  ```typescript
  @Throttle(20, 900)
  @Post('login')
  ```
- **상태: ⬜ 구현 필요**

### 7. bcrypt salt rounds 부족
- **파일:** `server/src/auth/auth.service.ts`
- **문제:** saltRounds=10 → 현대 하드웨어에서 크래킹 위험
- **조치:** saltRounds=12로 증가
  ```typescript
  const hash = await bcrypt.hash(password, 12);
  ```
- **상태: ⬜ 구현 필요**

### 8. 파일 업로드 검증 누락
- **파일:** `server/src/instructor/instructor.service.ts` (Presigned URL 발급)
- **문제:** fileName, fileType, fileSize 서버 검증 없이 R2 URL 발급 시 악성 파일 업로드 가능
- **조치:** DTO에서 허용 MIME 타입 화이트리스트 + 최대 크기(50MB) 강제 검증
  ```typescript
  @IsIn(['application/zip', 'application/pdf', 'text/plain', 'image/png', 'image/jpeg'])
  fileType: string;

  @Max(52428800)  // 50MB
  fileSize: number;
  ```
- **상태: ⬜ 구현 필요**

---

## MEDIUM

### 9. Admin/User JWT 토큰 구분 없음
- **파일:** `server/src/common/guards/jwt-auth.guard.ts`
- **문제:** 동일한 JWT_SECRET 사용, audience 클레임 없음 → 일반 사용자 토큰을 관리자 엔드포인트에 사용 가능성
- **조치:** 관리자 토큰에 `audience: 'admin'`, 일반 사용자 토큰에 `audience: 'user'` 추가. 검증 시 audience 확인
- **상태: ⬜ 구현 필요**

### 10. 검색 쿼리 길이 제한 없음
- **파일:** `server/src/courses/courses.service.ts` (검색 기능)
- **문제:** 매우 긴 검색 문자열로 DB 성능 저하 가능
- **조치:** `search.trim().slice(0, 100)`으로 100자 제한
- **상태: ⬜ 구현 필요**

### 11. 비밀번호 복잡도 규칙 부족
- **파일:** `server/src/auth/dto/register.dto.ts`
- **문제:** 최소 8자만 요구, 복잡도 없음 → `"12345678"` 같은 약한 비밀번호 허용
- **조치:** 영문자 + 숫자 필수 조건 추가
  ```typescript
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: '비밀번호는 영문자와 숫자를 포함해야 합니다.'
  })
  password: string;
  ```
- **상태: ⬜ 구현 필요**

### 12. 라우트 파라미터 ID 음수 검증 누락
- **파일:** `server/src/**/*.controller.ts` (여러 곳)
- **문제:** `isNaN()` 체크만 하고 음수 ID 허용 → 불필요한 DB 쿼리 발생
- **조치:** `id > 0` 조건 추가 또는 class-validator `@IsInt() @Min(1)` 적용
- **상태: ⬜ 구현 필요**

### 13. 클라이언트 localStorage JSON.parse 에러 처리 없음
- **파일:** `client/src/context/AuthContext.tsx`
- **문제:** 손상된 localStorage 데이터 시 파싱 크래시
- **조치:** try-catch 추가, 파싱 실패 시 해당 키 제거 후 null 반환
  ```typescript
  try {
    return JSON.parse(localStorage.getItem('user_info') ?? 'null');
  } catch {
    localStorage.removeItem('user_info');
    return null;
  }
  ```
- **상태: ⬜ 구현 필요**

---

## LOW

### 14. Request Body 크기 제한 없음
- **파일:** `server/src/main.ts`
- **문제:** NestJS 기본값 → 대용량 페이로드로 메모리 고갈 가능
- **조치:** `app.use(express.json({ limit: '1mb' }))` 적용
- **상태: ⬜ 구현 필요**

### 15. 프로덕션 환경에서 에러 스택 트레이스 노출
- **파일:** `server/src/common/filters/http-exception.filter.ts`
- **문제:** 모든 환경에서 `err.stack` 응답에 포함 → 내부 구조 노출
- **조치:** `NODE_ENV === 'production'`에서 스택 제거, 500 에러 시 일반 메시지 반환
- **상태: ⬜ 구현 필요**

### 16. 루트 .gitignore에 .env 미등록
- **파일:** (루트 .gitignore 없음)
- **문제:** .env 파일이 git에 커밋될 위험
- **조치:** 루트에 `.gitignore` 생성, `.env`, `.env.local`, `.env.production` 등록
- **상태: ⬜ 구현 필요**

### 17. 강의 slug 생성 시 입력값 인젝션 위험
- **파일:** `server/src/instructor/instructor.service.ts` (slug 생성)
- **문제:** 제목의 특수문자가 slug에 그대로 들어갈 경우 URL 파싱 오류
- **조치:** slug 생성 시 영문/숫자/하이픈만 허용하는 정규식 적용
  ```typescript
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 100);
  ```
- **상태: ⬜ 구현 필요**

---

## 긍정적 설계 사항 (구현 시 유지해야 할 부분)

1. **SQL Injection 방어:** Prisma ORM 사용으로 Raw SQL 없음
2. **입력 검증:** class-validator + ValidationPipe 전체 적용 예정
3. **역할 기반 접근 제어:** RolesGuard로 STUDENT/INSTRUCTOR/ADMIN 분리
4. **소유권 검증:** 강의/자료 수정·삭제 시 instructorId 기반 검증
5. **XSS 방어:** React의 기본 이스케이핑 + dangerouslySetInnerHTML 사용 금지
6. **결제 보안:** 서버 사이드에서 Toss API 결제 확인 (클라이언트 신뢰 안 함)
7. **파일 다운로드 보안:** 수강 여부 확인 후 Presigned URL 발급 (직접 URL 노출 없음)
8. **로그인 에러 메시지:** 아이디/비밀번호 구분 없는 통합 오류 메시지 (사용자 열거 방지)

---

## 수동 조치 필요 사항

> 아래 항목은 코드 수정만으로 해결할 수 없으며, 운영자가 직접 조치해야 합니다.

### 1. JWT_SECRET 교체
```bash
# 강력한 시크릿 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 출력된 값을 server/.env의 JWT_SECRET에 설정
```

### 2. Toss Secret Key 설정
- Toss Payments 대시보드에서 시크릿 키 발급
- `server/.env`의 `TOSS_SECRET_KEY`에 설정

### 3. DB 비밀번호 변경
- PostgreSQL 비밀번호를 강력한 값으로 변경 후 `DATABASE_URL` 업데이트

### 4. 프로덕션 배포 시
- `CLIENT_URL` 환경변수를 실제 프론트엔드 도메인으로 설정
- HTTPS 적용 (Helmet의 HSTS 자동 활성화)
- 관리자 계정 비밀번호 변경 (`admin@sec101.com` / `Admin1234!` → 강력한 비밀번호)

---

## 설치 필요 보안 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `helmet` | latest | HTTP 보안 헤더 자동 설정 |
| `@nestjs/throttler` | latest | API Rate Limiting |

---

## 수정 대상 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `server/src/config/configuration.ts` | JWT_SECRET 필수 검증 (없으면 서버 시작 차단) |
| `server/src/main.ts` | helmet, CORS 제한, throttler, body size limit 추가 |
| `server/src/auth/auth.service.ts` | bcrypt saltRounds=12, JWT audience:'user' |
| `server/src/admin/admin.service.ts` | JWT audience:'admin' |
| `server/src/common/guards/jwt-auth.guard.ts` | JWT audience 검증 |
| `server/src/auth/dto/register.dto.ts` | 비밀번호 복잡도 정규식 추가 |
| `server/src/instructor/instructor.service.ts` | 파일 업로드 검증, slug 생성 정규식 |
| `server/src/**/*.controller.ts` | ID 양수 검증 (`@Min(1)`) |
| `server/src/courses/courses.service.ts` | 검색 쿼리 100자 제한 |
| `server/src/common/filters/http-exception.filter.ts` | 프로덕션 스택 트레이스 숨김 |
| `client/src/context/AuthContext.tsx` | JSON.parse try-catch |
| `.gitignore` | 신규 생성 (.env 보호) |
