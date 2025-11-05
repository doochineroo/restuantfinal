# 🚀 Google Cloud Run 배포 가이드 (더 쉬움!) ⭐⭐⭐

## 🎯 Cloud Run이 더 좋은 이유

**Compute Engine보다:**
- ✅ 더 쉬운 배포
- ✅ 자동 확장/축소
- ✅ HTTPS 자동 제공
- ✅ 더 저렴 (사용량 기반)
- ✅ 서버 관리 불필요

---

## 💰 비용

**트래픽 적을 때**: 거의 무료 ($0-5/월)
**트래픽 많을 때**: $10-20/월

**$300 크레딧으로 15-30개월 무료 가능!**

---

## 📋 Step 1: Dockerfile 생성

**프로젝트 루트에 `Dockerfile` 생성:**

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# JAR 파일 복사
COPY build/libs/choprest-0.0.1-SNAPSHOT.jar app.jar

# 포트 노출
EXPOSE 8080

# 실행
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=gcp"]
```

---

## 📋 Step 2: 빌드 및 배포

### 2-1. Cloud Build 사용 (자동)

```bash
# Cloud Build 활성화
gcloud services enable cloudbuild.googleapis.com

# 빌드 및 배포
gcloud run deploy chopplan-api \
    --source . \
    --region asia-northeast2 \
    --platform managed \
    --allow-unauthenticated
```

### 2-2. 수동 배포

```bash
# 1. 로컬 빌드
gradlew.bat clean build

# 2. Docker 이미지 빌드
docker build -t gcr.io/[PROJECT_ID]/chopplan-api .

# 3. Cloud Run에 배포
gcloud run deploy chopplan-api \
    --image gcr.io/[PROJECT_ID]/chopplan-api \
    --region asia-northeast2 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080
```

---

## ✅ 장점

1. **자동 HTTPS**: URL 자동 제공
2. **자동 확장**: 트래픽에 따라 자동
3. **서버 관리 불필요**: 완전 관리형
4. **비용 절감**: 사용한 만큼만 과금

---

## 🎯 추천 순서

1. **Cloud Run** (가장 쉬움, 저렴)
2. **Compute Engine** (AWS EC2와 동일, 더 많은 제어)

둘 다 무료 크레딧으로 충분히 사용 가능합니다!



