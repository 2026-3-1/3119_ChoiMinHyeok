# SEC101 — EC2 Docker 배포 가이드

---

## 아키텍처

```
인터넷
  ↓ :80
[client 컨테이너 — nginx]
  ├─ /            → React SPA (정적 파일)
  ├─ /api/*       → proxy → server:3000
  └─ /api-docs-v1 → proxy → server:3000
      ↓
[server 컨테이너 — NestJS :3000]
      ↓
[postgres 컨테이너]  [redis 컨테이너]

볼륨:
  postgres_data  — DB 데이터 영구 저장
  redis_data     — Redis 데이터
  uploads_data   — 강의 첨부파일 (server/uploads/)
```

---

## 생성된 파일 구조

```
프로젝트루트/
├── docker-compose.yml        ← 전체 스택 오케스트레이션
├── .env.example              ← 환경변수 템플릿
├── server/
│   ├── Dockerfile            ← NestJS 빌드 + 마이그레이션 실행
│   └── .dockerignore
└── client/
    ├── Dockerfile            ← React 빌드 + Nginx 서빙
    ├── nginx.conf            ← Nginx 설정 (SPA + API 프록시)
    └── .dockerignore
```

---

## EC2 서버 초기 설정

### 1. EC2 인스턴스 생성
- **AMI**: Amazon Linux 2023 또는 Ubuntu 22.04 LTS
- **인스턴스 타입**: t3.small 이상 권장 (메모리 2GB+)
- **보안 그룹 인바운드**: 80(HTTP), 22(SSH) 오픈
- **스토리지**: 20GB 이상

### 2. Docker 설치 (Amazon Linux 2023)
```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 로그아웃 후 재로그인 (그룹 적용)
exit
```

### 2-b. Docker 설치 (Ubuntu 22.04)
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu
exit
```

---

## 배포 절차

### 3. 코드 클론
```bash
git clone https://github.com/your-repo/sec101.git
cd sec101
```

### 4. 환경변수 설정
```bash
cp .env.example .env
nano .env
```

`.env` 파일 내용 (실제 값으로 교체):
```env
DB_PASSWORD=강력한-비밀번호-여기에
JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CLIENT_ORIGIN=http://EC2퍼블릭IP
```

> **JWT 시크릿 빠른 생성**: EC2에 Node가 없다면
> ```bash
> openssl rand -hex 32  # 이걸 두 번 실행해서 각각 사용
> ```

### 5. 빌드 & 실행
```bash
# 이미지 빌드 후 백그라운드 실행
docker compose up -d --build

# 로그 확인
docker compose logs -f
```

### 6. 마이그레이션 확인
서버 컨테이너가 시작될 때 자동으로 `prisma migrate deploy`가 실행됩니다.
```bash
docker compose logs server
# "Prisma Migrate applied" 메시지 확인
```

### 7. 정상 동작 확인
```bash
# 컨테이너 상태
docker compose ps

# API 헬스체크
curl http://localhost/api/v1/categories

# 브라우저: http://EC2퍼블릭IP
```

---

## 자주 쓰는 명령어

```bash
# 전체 재시작
docker compose restart

# 코드 업데이트 후 재배포
git pull
docker compose up -d --build

# 특정 서비스만 재빌드
docker compose up -d --build server
docker compose up -d --build client

# 로그 실시간 확인
docker compose logs -f server
docker compose logs -f client

# DB 직접 접속
docker compose exec postgres psql -U postgres -d sec101

# Redis 확인
docker compose exec redis redis-cli ping

# 컨테이너 내부 접속
docker compose exec server sh

# 전체 정지 (데이터 보존)
docker compose stop

# 전체 삭제 (데이터 포함 — 주의!)
docker compose down -v
```

---

## 업로드 파일 백업

```bash
# EC2에서 uploads 볼륨 백업
docker run --rm \
  -v sec101_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# 복원
docker run --rm \
  -v sec101_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

---

## HTTPS 설정 (도메인이 있을 때)

도메인이 있으면 Let's Encrypt로 무료 SSL 적용:

```bash
# certbot 설치
sudo dnf install -y certbot  # Amazon Linux
# 또는
sudo apt install -y certbot  # Ubuntu

# 인증서 발급 (포트 80이 열려 있어야 함)
sudo certbot certonly --standalone -d yourdomain.com

# docker-compose.yml의 client 포트에 443 추가
# nginx.conf에 SSL 설정 추가 필요
```

### SSL을 위한 nginx.conf 수정
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... 나머지 location 블록 동일
}
```

### docker-compose.yml 수정 (SSL)
```yaml
client:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## 트러블슈팅

### 포트 80이 이미 사용 중
```bash
sudo lsof -i :80
sudo systemctl stop nginx  # 시스템 nginx가 있을 경우
```

### DB 연결 실패
```bash
# postgres가 healthy 상태인지 확인
docker compose ps postgres
# 환경변수 확인
docker compose exec server env | grep DATABASE
```

### 마이그레이션 실패
```bash
docker compose exec server sh
npx prisma migrate status
```

### Prisma 클라이언트 생성 오류
```bash
# 서버 이미지 재빌드
docker compose build --no-cache server
```
