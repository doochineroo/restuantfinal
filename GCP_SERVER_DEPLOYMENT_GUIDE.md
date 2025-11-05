# ☁️ Google Cloud 서버 배포 가이드

## ✅ 가능합니다! Google Cloud에서도 서버 배포 가능

**AWS EC2와 유사한 서비스:**
- **Compute Engine**: VM 인스턴스 (EC2와 동일)
- **Cloud Run**: 서버리스 (더 저렴, 추천!)
- **App Engine**: 완전 관리형

---

## 💰 비용 비교

### Option 1: Compute Engine (EC2와 유사)

**e2-micro (Always Free 티어)**: ✅ 무료!
- vCPU: 공유 1개
- RAM: 1GB
- **월 1개 무료** (제한 있음)
- **현재 애플리케이션에 충분합니다!**

**e2-small (유료):**
- vCPU: 2개
- RAM: 2GB
- 비용: 약 $10-15/월

### Option 2: Cloud Run (서버리스) ⭐ 추천!

**장점:**
- 사용한 만큼만 과금
- 트래픽이 적으면 거의 무료
- 자동 확장/축소

**예상 비용:**
- 트래픽 적을 때: $0-5/월
- 트래픽 많을 때: $10-20/월

### 총 예상 비용 ($300 크레딧 포함)

**Compute Engine (Always Free 티어)**: 거의 무료!
- Always Free: 월 1개 e2-micro 무료
- 스토리지: 약 $1.7/월 (10GB)
- **총: 약 $1.7/월 (무료 크레딧으로 거의 무료)**

**Cloud Run**: 사용량 기반
- 매우 저렴하거나 거의 무료

---

## 🎯 추천: Always Free 티어 사용

### e2-micro Always Free 티어:

**제한사항:**
- ✅ 월 1개 인스턴스 무료
- ✅ 지역: `us-west1`, `us-central1`, `us-east1`
- ✅ 30GB 스토리지 무료
- ⚠️ 한국 리전(`asia-northeast2`)은 무료 티어 없음

**해결책:**
- `us-west1` (미국 서부) 사용하면 무료!
- 또는 한국 리전 사용 시 $300 크레딧 사용

---

## 🚀 배포 방법

### 방법 1: Compute Engine (EC2와 동일) ⭐

**단계:**
1. VM 인스턴스 생성 (e2-micro)
2. SSH로 접속
3. Java, MySQL 클라이언트 설치
4. JAR 파일 업로드
5. 실행

### 방법 2: Cloud Run (더 쉬움) ⭐⭐⭐ 추천

**단계:**
1. Dockerfile 작성 (또는 JAR 직접 배포)
2. Cloud Run에 배포
3. 자동 HTTPS, 자동 확장

---

## 📝 결론

### 충분히 가능하고 무료로 사용 가능합니다!

**Option A: Always Free 티어 (추천)**
- e2-micro 1개 무료
- 미국 리전 사용
- **거의 무료** ($1-2/월 정도만)

**Option B: 한국 리전 사용**
- e2-micro: 약 $10-15/월
- **$300 크레딧으로 20-30개월 무료!**

**현재 애플리케이션 크기:**
- ✅ 매우 작은 애플리케이션
- ✅ e2-micro로 충분
- ✅ Always Free 티어 가능!

---

## 🎉 지금 바로 배포 가능합니다!

자세한 배포 가이드를 만들어드릴까요?



