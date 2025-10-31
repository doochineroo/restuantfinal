# 채팅 기능 설정 가이드

## 404 에러 해결 방법

### 1. 데이터베이스 테이블 생성

먼저 채팅 테이블을 생성해야 합니다:

```sql
-- create_chat_tables.sql 파일 실행
source create_chat_tables.sql;

-- 또는 MySQL에서 직접 실행:
CREATE TABLE IF NOT EXISTS demo_chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    restaurant_name VARCHAR(255),
    user_name VARCHAR(255),
    owner_id BIGINT,
    last_message TEXT,
    last_message_at DATETIME,
    unread_count_user INT DEFAULT 0,
    unread_count_owner INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_restaurant (user_id, restaurant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS demo_chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role ENUM('USER', 'OWNER') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_room_id (chat_room_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (chat_room_id) REFERENCES demo_chat_rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 백엔드 서버 재시작

새로운 컨트롤러가 등록되려면 Spring Boot 서버를 재시작해야 합니다:

```bash
# Gradle을 사용하는 경우
./gradlew bootRun

# 또는 IDE에서 애플리케이션 재시작
```

### 3. 빌드 확인

프로젝트를 다시 빌드:

```bash
./gradlew clean build
```

### 4. API 엔드포인트 확인

서버가 실행된 후 다음 엔드포인트가 작동하는지 확인:

- `GET http://localhost:8080/api/demo/chat/unread-count/{userId}`
- `GET http://localhost:8080/api/demo/chat/rooms/user/{userId}`
- `POST http://localhost:8080/api/demo/chat/room?userId={userId}&restaurantId={restaurantId}`

### 5. 문제 해결 체크리스트

- [ ] 데이터베이스 테이블 생성 완료
- [ ] 백엔드 서버 재시작 완료
- [ ] 빌드 오류 없음
- [ ] 서버 로그에 ChatController 등록 확인
- [ ] 데이터베이스 연결 정상



