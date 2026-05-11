# sec101 — 샘플 시드 데이터

> 초기 시드 데이터로 사용할 카테고리, 사용자, 강의 목록입니다.
> `prisma/seed.ts` 작성 시 이 문서를 참고합니다.

---

## 🗂️ 카테고리 (5개)

| ID | 이름 | 영문명 | 설명 | 아이콘 |
|---|---|---|---|---|
| 1 | 웹 보안 | web-security | SQL Injection, XSS, CSRF 등 웹 취약점 분석과 방어 | 🌐 |
| 2 | 시스템 보안 | system-security | 버퍼 오버플로우, 권한 상승, 바이너리 익스플로잇 | 💻 |
| 3 | 네트워크 보안 | network-security | 패킷 분석, 스니핑, 방화벽 우회, Wireshark 활용 | 📡 |
| 4 | 리버싱 | reversing | IDA Pro, Ghidra를 이용한 바이너리 분석 및 크랙미 풀이 | 🔍 |
| 5 | 포렌식 | forensics | 디지털 증거 수집, 파일 복구, 메모리 덤프 분석 | 🔬 |

---

## 👥 사용자 계정

### 관리자 (1명)

| 항목 | 값 |
|---|---|
| name | admin |
| email | admin@sec101.com |
| password | Admin1234! |
| role | ADMIN |
| 비밀번호 해시 | bcrypt (saltRounds=12), seed.ts에서 생성 |

> ⚠️ 프로덕션 배포 전 반드시 비밀번호 변경 필요.

### 강사 계정 (3명)

| name | email | password | 소개 | role |
|---|---|---|---|---|
| 홍길동 | hong@sec101.com | Test1234! | 웹 해킹 전문가, 버그바운티 헌터 5년 경력 | INSTRUCTOR |
| 김보안 | kim@sec101.com | Test1234! | 시스템 보안 & 리버싱 전문가, CTF 수상 다수 | INSTRUCTOR |
| 이해킹 | lee@sec101.com | Test1234! | 포렌식 & 네트워크 보안 전문가, 보안 컨설턴트 | INSTRUCTOR |

### 테스트 수강생 (2명)

| name | email | password | role |
|---|---|---|---|
| 테스트유저1 | student1@test.com | Test1234! | STUDENT |
| 테스트유저2 | student2@test.com | Test1234! | STUDENT |

---

## 🎓 샘플 강의 (5개)

### 1. 웹 해킹 입문

| 항목 | 값 |
|---|---|
| instructor | 홍길동 |
| category | 웹 보안 |
| difficulty | EASY |
| price | 0 (무료) |
| slug | web-hacking-intro |
| maxCapacity | 100 |
| description | SQL Injection부터 XSS까지, 웹 해킹의 핵심 취약점을 실습 중심으로 배웁니다. |

**챕터 구성:**

| 챕터 | 제목 | 영상 수 |
|---|---|---|
| 1 | 웹의 동작 원리 | 3강 |
| 2 | SQL Injection | 4강 |
| 3 | XSS 공격과 방어 | 3강 |
| 4 | 마무리 및 실습 | 2강 |

**강의 영상 목록 (챕터 1~2):**

| position | 제목 | duration(초) | is_published |
|---|---|---|---|
| 1-1 | HTTP 구조 이해 | 1200 | true |
| 1-2 | 개발자 도구 활용 | 900 | true |
| 1-3 | 쿠키와 세션 | 1100 | true |
| 2-1 | SQL Injection 원리 | 1500 | true |
| 2-2 | Union Based SQLi | 1800 | true |
| 2-3 | Blind SQLi | 1600 | true |
| 2-4 | SQLi 방어 기법 | 1200 | true |

**강의 자료:**

| lecture | title | file_type |
|---|---|---|
| 2-1 | SQLi 실습 파일.zip | application/zip |
| 3-1 | XSS 치트시트.pdf | application/pdf |

---

### 2. 리버싱 입문

| 항목 | 값 |
|---|---|
| instructor | 김보안 |
| category | 리버싱 |
| difficulty | MEDIUM |
| price | 9900 |
| slug | reversing-intro |
| description | 어셈블리 기초부터 Ghidra 실습까지, 바이너리 분석의 첫걸음. |

**챕터 구성:**

| 챕터 | 제목 | 영상 수 |
|---|---|---|
| 1 | 어셈블리 기초 | 4강 |
| 2 | Ghidra 사용법 | 3강 |
| 3 | CTF 풀이 실습 | 3강 |

---

### 3. 버프스위트 기초

| 항목 | 값 |
|---|---|
| instructor | 홍길동 |
| category | 웹 보안 |
| difficulty | EASY |
| price | 0 (무료) |
| slug | burpsuite-basics |
| description | Burp Suite의 Proxy, Repeater, Intruder 기능을 실전 예제로 익힙니다. |

**챕터 구성:**

| 챕터 | 제목 | 영상 수 |
|---|---|---|
| 1 | Burp Suite 설치 & 환경 설정 | 2강 |
| 2 | Proxy & Intercept | 3강 |
| 3 | Repeater & Intruder | 3강 |

---

### 4. 네트워크 패킷 분석

| 항목 | 값 |
|---|---|
| instructor | 이해킹 |
| category | 네트워크 보안 |
| difficulty | MEDIUM |
| price | 14900 |
| slug | network-packet-analysis |
| description | Wireshark로 실제 패킷을 캡처하고 분석하는 방법을 학습합니다. |

**챕터 구성:**

| 챕터 | 제목 | 영상 수 |
|---|---|---|
| 1 | 네트워크 기초 | 3강 |
| 2 | Wireshark 실습 | 4강 |
| 3 | 공격 트래픽 분석 | 3강 |

---

### 5. 디지털 포렌식 기초

| 항목 | 값 |
|---|---|
| instructor | 이해킹 |
| category | 포렌식 |
| difficulty | HARD |
| price | 19900 |
| slug | digital-forensics-basics |
| description | 파일 복구, 메모리 덤프, 타임라인 분석까지 디지털 포렌식 핵심 기법. |

**챕터 구성:**

| 챕터 | 제목 | 영상 수 |
|---|---|---|
| 1 | 포렌식 개론 & 도구 | 3강 |
| 2 | 파일시스템 분석 | 4강 |
| 3 | 메모리 포렌식 | 4강 |
| 4 | 실전 CTF 포렌식 | 3강 |

---

## 💬 샘플 댓글 & 평점

| 강의 | 작성자 | 평점 | 내용 |
|---|---|---|---|
| 웹 해킹 입문 | 테스트유저1 | 5 | 입문자에게 딱 맞는 강의입니다! 설명이 너무 쉬워요. |
| 웹 해킹 입문 | 테스트유저2 | 4 | 실습 파일이 풍부하고 따라하기 좋습니다. |
| 리버싱 입문 | 테스트유저1 | 5 | 어셈블리부터 차근차근 설명해줘서 이해가 잘 됩니다. |
| 버프스위트 기초 | 테스트유저2 | 5 | 무료인데 퀄리티가 너무 좋아요. |

---

## 📊 합계

| 항목 | 수 |
|---|---|
| 카테고리 | 5 |
| 관리자 계정 | 1 |
| 강사 계정 | 3 |
| 테스트 수강생 | 2 |
| 샘플 강의 | 5 |
| 챕터 합계 | 17 |
| 강의 영상 합계 | ~40 |
| 강의 자료 | 2 |
| 샘플 댓글 | 4 |
