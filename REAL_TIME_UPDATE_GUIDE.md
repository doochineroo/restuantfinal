# 실시간 갱신 가이드

## 현재 방식 (Polling)
현재 프로젝트는 **간단한 폴링(Polling)**을 사용하고 있습니다.
- ✅ 구현이 간단
- ❌ 서버 부하 증가
- ❌ 실시간성이 떨어짐

## 추천 방법 (우선순위)

### 1. React Query (TanStack Query) - 가장 추천 ⭐
**장점:**
- 자동 캐싱 및 재시도
- 백그라운드 갱신 (stale-while-revalidate)
- 페이지 포커스 시 자동 갱신
- 폴링 간격 지능적 조정
- 코드가 간결해짐

**설치:**
```bash
npm install @tanstack/react-query
```

**사용 예시:**
```javascript
import { useQuery, useQueryClient } from '@tanstack/react-query';

// 알림 조회 - 1분마다 자동 갱신
const { data: notifications } = useQuery({
  queryKey: ['notifications', userId],
  queryFn: () => notificationsAPI.getAll(userId),
  refetchInterval: 60000, // 1분
  staleTime: 30000, // 30초 동안은 캐시된 데이터 사용
});

// 채팅 읽지 않은 개수 - 30초마다 자동 갱신
const { data: unreadCount } = useQuery({
  queryKey: ['chatUnreadCount', userId],
  queryFn: () => chatAPI.getUnreadCount(userId),
  refetchInterval: 30000,
  staleTime: 5000, // 5초 동안은 캐시 사용
});
```

### 2. Server-Sent Events (SSE) - 실시간 알림용
**장점:**
- 서버가 알림을 즉시 푸시
- 폴링보다 효율적
- WebSocket보다 간단

**백엔드 (Spring Boot):**
```java
@GetMapping(value = "/notifications/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<Notification>> streamNotifications(@PathVariable Long userId) {
    return notificationService.streamNotifications(userId)
        .map(notification -> ServerSentEvent.<Notification>builder()
            .data(notification)
            .build());
}
```

**프론트엔드:**
```javascript
const eventSource = new EventSource(`/api/notifications/stream/${userId}`);

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // 알림 업데이트
  setNotifications(prev => [notification, ...prev]);
};
```

### 3. WebSocket - 실시간 채팅용
**장점:**
- 양방향 실시간 통신
- 채팅에 최적화

**백엔드 (Spring Boot):**
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatWebSocketHandler(), "/ws/chat")
            .setAllowedOrigins("*");
    }
}
```

**프론트엔드:**
```javascript
const ws = new WebSocket(`ws://localhost:8080/ws/chat/${chatRoomId}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  setMessages(prev => [...prev, message]);
};
```

## 현재 프로젝트 적용 전략

### 단계적 적용

#### 1단계: React Query 도입 (즉시 가능)
- 알림, 채팅, 리뷰 등 모든 데이터 조회를 React Query로 전환
- 폴링 간격 최적화
- 캐싱으로 불필요한 API 호출 감소

#### 2단계: SSE 도입 (알림용)
- 알림은 SSE로 실시간 푸시
- React Query와 함께 사용 가능

#### 3단계: WebSocket 도입 (채팅용)
- 채팅은 WebSocket으로 실시간 통신
- 메시지 전송/수신 즉시 반영

## 성능 비교

| 방식 | 실시간성 | 서버 부하 | 구현 난이도 | 추천 사용 |
|------|---------|----------|------------|----------|
| Polling | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 개발 단계 |
| React Query | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | 모든 데이터 |
| SSE | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 알림 |
| WebSocket | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | 채팅 |

## 현재 프로젝트 즉시 적용 가능

### React Query로 전환하면:
- API 호출 **80% 감소** 예상
- 사용자 경험 개선 (자동 갱신, 로딩 상태 관리)
- 코드 간결화 (useState, useEffect 제거)

원하시면 React Query 적용 예시 코드를 제공해드릴 수 있습니다!

