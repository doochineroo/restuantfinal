# 💰 Google Cloud 비용 분석 및 문제 해결

## ⚠️ 24,000원이 나간 이유 분석

### 가능한 원인들

#### 1. Cloud SQL 인스턴스 여러 개 생성
- 각 인스턴스마다 월 약 13,000-20,000원
- 2개 인스턴스 = 약 26,000-40,000원/월
- **하루에 24,000원은 이상함** ❌

#### 2. 더 큰 인스턴스 사용
- db-f1-micro (가장 저렴): $10-15/월
- db-g1-small: $25-30/월
- 더 큰 인스턴스는 더 비쌈

#### 3. Compute Engine VM 비용
- e2-micro: 무료 (Always Free 티어)
- 더 큰 VM: 과금 발생
- **VM이 실행 중이면 계속 과금**

#### 4. 네트워크 트래픽 비용
- 외부 트래픽: $0.12/GB
- 대량 데이터 전송 시 비용 발생 가능

#### 5. 스토리지 비용
- Cloud SQL 스토리지: $0.17/GB/월
- 10GB = 약 $1.7/월 (거의 무시 가능)

#### 6. 다른 서비스 비용
- Cloud Storage
- 다른 API 사용
- 로드 밸런서 등

## 🔍 비용 확인 방법

### 방법 1: Google Cloud Console

1. **비용 관리자** 접속
   ```
   https://console.cloud.google.com/billing
   ```

2. **비용 분석** 확인
   - 프로젝트별 비용
   - 서비스별 비용
   - 일별/월별 비용

3. **비용 상세** 확인
   - 어떤 서비스에서 비용 발생?
   - 언제 비용 발생?
   - 얼마나 사용했는지?

### 방법 2: gcloud CLI

```bash
# 비용 확인 스크립트 실행
check-gcp-costs.bat
```

### 방법 3: Cloud SQL 인스턴스 확인

```bash
# Cloud SQL 인스턴스 목록
gcloud sql instances list

# 인스턴스 상세 정보
gcloud sql instances describe chopplan-db
```

## 💡 비용 절감 방법

### 즉시 실행 가능한 방법

#### 1. 사용하지 않는 인스턴스 중지

**Cloud SQL 중지:**
```bash
gcloud sql instances patch chopplan-db --activation-policy=NEVER
```

**VM 중지:**
```bash
gcloud compute instances stop chopplan-server --zone=us-west1-a
```

#### 2. 불필요한 인스턴스 삭제

**주의: 삭제하면 데이터가 영구적으로 삭제됩니다!**

```bash
# Cloud SQL 삭제 (백업 필수!)
gcloud sql instances delete chopplan-db

# VM 삭제
gcloud compute instances delete chopplan-server --zone=us-west1-a
```

#### 3. 더 작은 인스턴스로 변경

```bash
# Cloud SQL 인스턴스 크기 변경 (downgrade)
# 주의: 다운타임 발생 가능
```

## 📊 비용 구조 이해

### Cloud SQL 비용

**월 단위 과금:**
- 인스턴스 생성: 무료
- 인스턴스 실행 중: 계속 과금
- 인스턴스 중지: 과금 중지
- 인스턴스 삭제: 비용 없음

**일 단위 계산:**
- 월 $12.5 = 일 약 400원
- 2일 = 약 800원
- **24,000원은 60일치!** ❌

### 가능한 시나리오

#### 시나리오 1: 여러 인스턴스 실행
```
Cloud SQL 인스턴스 2개 × $12.5/월 = $25/월
VM 인스턴스 1개 (더 큰 크기) = 추가 비용
→ 총 월 $30-40 (약 40,000-50,000원)
→ 2일치 = 약 2,700-3,300원
```

#### 시나리오 2: 무료 크레딧 사용
```
무료 크레딧 $300에서 차감
→ 실제로는 현금 결제가 아님
→ 크레딧이 모두 사용되면 과금 시작
```

#### 시나리오 3: 대량 트래픽
```
네트워크 트래픽: $0.12/GB
100GB 전송 = $12 (약 16,000원)
→ 가능한 원인
```

## 🔧 문제 해결 체크리스트

### 1단계: 현재 상태 확인

```bash
# 모든 리소스 확인
check-gcp-costs.bat

# Cloud SQL 인스턴스 확인
gcloud sql instances list

# VM 인스턴스 확인
gcloud compute instances list
```

### 2단계: 비용 확인

1. Cloud Console 접속
2. 비용 관리자 확인
3. 어떤 서비스에서 비용 발생했는지 확인

### 3단계: 즉시 조치

1. 사용하지 않는 인스턴스 중지
2. 불필요한 리소스 삭제
3. 더 작은 인스턴스로 변경

## ⚠️ 주의사항

### 무료 크레딧 확인

- 신규 사용자: $300 무료 크레딧
- 크레딧이 있으면 크레딧에서 차감
- 크레딧 종료 후 실제 과금 시작

### 비용 알림 설정

1. Cloud Console > 비용 관리자
2. 예산 및 알림 설정
3. 비용 임계값 설정

## 📞 추가 도움

### 비용 상담

1. **Cloud Console**에서 비용 상세 확인
2. **고객 지원** 문의 (무료 크레딧 사용자도 가능)
3. **비용 분석** 도구 사용

### 예방 방법

1. **예산 설정**: 월 예산 한도 설정
2. **알림 설정**: 비용 임계값 도달 시 알림
3. **정기 확인**: 주기적으로 비용 확인

## 💡 결론

**24,000원이 하루에 나간 것은 이상합니다.**

가능한 원인:
1. ✅ 여러 인스턴스 실행
2. ✅ 더 큰 인스턴스 사용
3. ✅ 네트워크 트래픽 비용
4. ✅ 다른 서비스 비용
5. ✅ 무료 크레딧 차감 (실제 현금 결제 아님)

**즉시 확인:**
1. Cloud Console에서 비용 상세 확인
2. 실행 중인 모든 리소스 확인
3. 사용하지 않는 리소스 중지/삭제

## 🚀 빠른 해결

```bash
# 1. 현재 상태 확인
check-gcp-costs.bat

# 2. Cloud SQL 인스턴스 확인
gcloud sql instances list

# 3. 불필요한 인스턴스 중지
gcloud sql instances patch [INSTANCE_NAME] --activation-policy=NEVER
```

**Cloud Console에서 비용 상세 확인:**
https://console.cloud.google.com/billing

