# 🌐 GCP 사이트 주소(도메인) 변경 가이드

현재 사이트 주소: `http://136.117.47.204:8080`

도메인을 연결하여 `http://yourdomain.com` 또는 `https://yourdomain.com`으로 접속할 수 있도록 설정하는 방법입니다.

---

## 📋 방법 1: 도메인 연결 (무료 도메인)

### 1-1. 무료 도메인 서비스

- **Freenom** (https://www.freenom.com) - `.tk`, `.ml`, `.ga`, `.cf` 등 무료
- **GitHub Pages** - `username.github.io` (정적 사이트만)
- **Cloudflare Pages** - 무료 도메인 제공

### 1-2. 도메인 구매 (유료)

- **Namecheap** (https://www.namecheap.com)
- **Google Domains** (https://domains.google)
- **GoDaddy** (https://www.godaddy.com)

---

## 🔧 방법 2: 도메인 DNS 설정

### 2-1. A 레코드 설정

도메인 제공자(DNS 제공자)에서 A 레코드를 추가하세요:

```
Type: A
Name: @ (또는 www)
Value: 136.117.47.204
TTL: 3600 (또는 기본값)
```

**예시:**
- `chopplan.com` → `136.117.47.204`
- `www.chopplan.com` → `136.117.47.204`

### 2-2. DNS 설정 확인

```bash
# DNS 전파 확인 (Windows PowerShell)
nslookup chopplan.com

# 또는 온라인 도구 사용
# https://www.whatsmydns.net
```

---

## 🔧 방법 3: 애플리케이션 설정 변경

### 3-1. 프론트엔드 환경변수 업데이트

`frontend/.env.production` 파일 수정:

```env
# 도메인 사용 시
REACT_APP_API_BASE_URL=http://chopplan.com:8080/api
PUBLIC_URL=/

# 또는 HTTPS 사용 시
REACT_APP_API_BASE_URL=https://chopplan.com/api
PUBLIC_URL=/
```

### 3-2. apiConfig.js 업데이트

`frontend/src/constants/config/apiConfig.js` 파일 수정:

```javascript
// 프로덕션 환경
if (process.env.NODE_ENV === 'production') {
  // 도메인 사용
  return process.env.REACT_APP_API_BASE_URL || 'http://chopplan.com:8080/api';
}
```

### 3-3. 프론트엔드 재빌드 및 배포

```bash
# C:\yonsai\chopplan 에서
cd frontend
npm run build
cd ..
gcloud compute scp --recurse frontend/build/* chopplan-server:chopplan/static/ --zone=us-west1-a
```

---

## 🔒 방법 4: HTTPS 설정 (Let's Encrypt 무료 SSL)

### 4-1. Certbot 설치

```bash
# VM에 Certbot 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt update && sudo apt install certbot -y"
```

### 4-2. SSL 인증서 발급

```bash
# SSL 인증서 발급 (도메인 필요)
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo certbot certonly --standalone -d chopplan.com -d www.chopplan.com"
```

**⚠️ 주의:**
- 포트 80이 열려있어야 함
- 도메인이 이미 VM IP로 연결되어 있어야 함

### 4-3. Spring Boot에 SSL 설정 추가

`src/main/resources/application-gcp.properties`에 추가:

```properties
# HTTPS 설정
server.ssl.key-store=/etc/letsencrypt/live/chopplan.com/keystore.p12
server.ssl.key-store-password=your-password
server.ssl.key-store-type=PKCS12
server.port=443
```

**또는 Nginx를 리버스 프록시로 사용 (권장):**

```bash
# Nginx 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install nginx -y"

# Nginx 설정 (로컬에서 실행)
# 설정 파일은 별도로 작성 필요
```

---

## 🔧 방법 5: 포트 제거 (도메인만 사용)

### 5-1. Nginx 리버스 프록시 사용

도메인만 사용하려면 Nginx를 사용하여 포트를 숨길 수 있습니다:

```bash
# Nginx 설치
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo apt install nginx -y"

# Nginx 설정 파일 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo bash -c 'cat > /etc/nginx/sites-available/chopplan << EOF
server {
    listen 80;
    server_name chopplan.com www.chopplan.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF'"

# 심볼릭 링크 생성
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo ln -s /etc/nginx/sites-available/chopplan /etc/nginx/sites-enabled/"

# Nginx 재시작
gcloud compute ssh chopplan-server --zone=us-west1-a --command="sudo systemctl restart nginx"
```

이제 `http://chopplan.com`으로 접속 가능 (포트 없이)

---

## 📝 전체 변경 작업 체크리스트

### 1. 도메인 구매/등록
- [ ] 도메인 구매 완료
- [ ] DNS 관리자 접근 가능

### 2. DNS 설정
- [ ] A 레코드 추가 (`@` → `136.117.47.204`)
- [ ] A 레코드 추가 (`www` → `136.117.47.204`)
- [ ] DNS 전파 확인 (24-48시간 소요)

### 3. 애플리케이션 설정
- [ ] `frontend/.env.production` 업데이트
- [ ] `apiConfig.js` 업데이트 (선택사항)
- [ ] 프론트엔드 재빌드
- [ ] 배포

### 4. HTTPS 설정 (선택사항)
- [ ] Certbot 설치
- [ ] SSL 인증서 발급
- [ ] Spring Boot 또는 Nginx SSL 설정
- [ ] HTTPS 테스트

### 5. 방화벽 규칙
- [ ] 포트 80 열기 (HTTP)
- [ ] 포트 443 열기 (HTTPS, 선택사항)

---

## 🚀 빠른 설정 스크립트

### setup-domain.bat

```batch
@echo off
REM 도메인 설정 스크립트

chcp 65001 >nul
echo ============================================
echo    도메인 설정
echo ============================================
echo.

set /p DOMAIN="도메인 이름 (예: chopplan.com): "
if "%DOMAIN%"=="" (
    echo ❌ 도메인 이름을 입력해야 합니다.
    pause
    exit /b 1
)

set /p EXTERNAL_IP="VM 외부 IP (예: 136.117.47.204): "
if "%EXTERNAL_IP%"=="" (
    echo ❌ IP 주소를 입력해야 합니다.
    pause
    exit /b 1
)

echo.
echo 📝 프론트엔드 환경변수 업데이트 중...
(
    echo # 도메인 설정
    echo REACT_APP_API_BASE_URL=http://%DOMAIN%:8080/api
    echo PUBLIC_URL=/
) > frontend\.env.production

echo ✅ .env.production 파일 업데이트 완료!
echo.
echo 📋 다음 단계:
echo    1. 도메인 DNS에서 A 레코드 설정:
echo       @ → %EXTERNAL_IP%
echo       www → %EXTERNAL_IP%
echo.
echo    2. DNS 전파 대기 (24-48시간)
echo.
echo    3. 프론트엔드 재빌드 및 배포:
echo       cd frontend
echo       npm run build
echo       cd ..
echo       gcloud compute scp --recurse frontend/build/* chopplan-server:chopplan/static/ --zone=us-west1-a
echo.

pause
```

---

## ⚠️ 주의사항

1. **DNS 전파 시간**: DNS 변경 후 전 세계적으로 전파되는데 24-48시간이 걸릴 수 있습니다.

2. **포트 80/443 열기**: 도메인을 사용하려면 방화벽에서 포트 80(HTTP)과 443(HTTPS)을 열어야 합니다.

3. **정적 IP**: VM 재시작 시 IP가 변경될 수 있으므로, 정적 IP를 설정하는 것을 권장합니다.

4. **HTTPS 설정**: HTTPS를 사용하려면 SSL 인증서가 필요하며, Let's Encrypt는 무료로 제공합니다.

---

## 🔍 DNS 설정 확인

```bash
# Windows PowerShell에서
nslookup chopplan.com

# 또는 온라인 도구
# https://www.whatsmydns.net
# https://dnschecker.org
```

---

**✅ 이제 도메인으로 사이트에 접속할 수 있습니다!**


