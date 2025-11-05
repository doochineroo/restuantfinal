# ⚡ 빠른 배포 가이드

기존 배포 방법이 너무 오래 걸릴 때 사용하는 빠른 방법입니다.

---

## 🚀 방법 1: 자동화 스크립트 사용 (가장 빠름!)

### 전체 배포 (백엔드 + 프론트엔드)

```bash
# C:\yonsai\chopplan\choprest 에서 실행
quick-deploy.bat
```

**소요 시간: 약 2-3분**

### 백엔드만 배포

```bash
quick-deploy-backend.bat
```

**소요 시간: 약 1분**

### 프론트엔드만 배포

```bash
quick-deploy-frontend.bat
```

**소요 시간: 약 30초**

---

## 🚀 방법 2: 한 줄 명령어 (PowerShell)

### 전체 배포

```powershell
# C:\yonsai\chopplan\choprest 에서 실행
gradlew.bat clean build -q; cd ..\frontend; npm run build; cd ..\choprest; gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a --quiet; gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a --quiet; gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java 2>/dev/null; sleep 1; nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &" --quiet
```

### 백엔드만

```powershell
gradlew.bat clean build -q; gcloud compute scp build/libs/choprest-0.0.1-SNAPSHOT.jar chopplan-server:chopplan/ --zone=us-west1-a --quiet; gcloud compute ssh chopplan-server --zone=us-west1-a --command="cd ~/chopplan && pkill -f java 2>/dev/null; sleep 1; nohup java -jar choprest-0.0.1-SNAPSHOT.jar --spring.profiles.active=gcp > app.log 2>&1 &" --quiet
```

### 프론트엔드만

```powershell
cd ..\frontend; npm run build; cd ..\choprest; gcloud compute scp --recurse ..\frontend\build\* chopplan-server:chopplan/static/ --zone=us-west1-a --quiet
```

---

## 🚀 방법 3: 병렬 처리 (더 빠름!)

### 백엔드와 프론트엔드를 동시에 빌드

```powershell
# PowerShell에서 실행
Start-Job -ScriptBlock { cd C:\yonsai\chopplan\choprest; gradlew.bat clean build -q } | Out-Null
Start-Job -ScriptBlock { cd C:\yonsai\chopplan\frontend; npm run build } | Out-Null
Wait-Job | Receive-Job
```

**소요 시간: 약 1-2분 (빌드 시간 중 긴 것 기준)**

---

## 🚀 방법 4: 증분 배포 (변경된 것만)

### 변경된 파일만 확인 후 업로드

```powershell
# 최근 변경된 JAR 파일만 업로드
$jarFile = Get-ChildItem build\libs\choprest-*.jar | Sort-Object LastWriteTime -Descending | Select-Object -First 1
gcloud compute scp $jarFile.FullName chopplan-server:chopplan/ --zone=us-west1-a --quiet
```

---

## 📊 속도 비교

| 방법 | 소요 시간 | 설명 |
|------|----------|------|
| 수동 배포 | 5-10분 | 각 단계를 하나씩 실행 |
| **자동화 스크립트** | **2-3분** | **가장 추천!** |
| 한 줄 명령어 | 2-3분 | 스크립트 없이 빠르게 |
| 병렬 빌드 | 1-2분 | 빌드 시간 단축 |

---

## 💡 팁: 더 빠르게 하려면

1. **빌드 캐시 활용**: `gradlew.bat build` (clean 생략)
2. **--quiet 플래그**: gcloud 출력 최소화
3. **증분 빌드**: 변경된 파일만 빌드
4. **병렬 처리**: 백엔드/프론트엔드 동시 빌드

---

## ⚡ 가장 빠른 방법 (추천)

```bash
# C:\yonsai\chopplan\choprest 에서
quick-deploy.bat
```

**이게 가장 빠르고 안전합니다!**

---

## 🔧 문제 해결

### 빌드 실패 시
```bash
# 캐시 클리어 후 재빌드
gradlew.bat clean --no-daemon
gradlew.bat build
```

### 업로드 실패 시
```bash
# 수동으로 확인
gcloud compute instances describe chopplan-server --zone=us-west1-a
```

---

**✅ 빠른 배포로 시간을 절약하세요!**


