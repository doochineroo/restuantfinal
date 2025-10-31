# 채팅 테이블 생성 방법

## 방법 1: MySQL Workbench 사용 (권장)

1. MySQL Workbench 실행
2. 데이터베이스 연결:
   - Host: `chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com`
   - Port: `3306`
   - Username: `admin`
   - Password: `chopplan123`
   - Database: `restaurant-demo`

3. `create_chat_tables.sql` 파일 내용을 복사하여 실행

## 방법 2: Spring Boot 자동 생성 (JPA)

`application.properties`에서 `spring.jpa.hibernate.ddl-auto=update`로 설정되어 있으므로,
백엔드 서버를 재시작하면 JPA가 자동으로 테이블을 생성할 수 있습니다.

## 방법 3: 수동 SQL 실행

MySQL 클라이언트에 연결한 후 다음 SQL 실행:

```sql
USE restaurant-demo;

-- 채팅방 테이블
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

-- 채팅 메시지 테이블
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

## 방법 4: 터미널에서 직접 실행 (MySQL 클라이언트가 설치된 경우)

```bash
mysql -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com -P 3306 -u admin -pchopplan123 restaurant-demo < create_chat_tables.sql
```

**주의**: 비밀번호를 명령어에 포함하는 것은 보안상 권장되지 않습니다. 
`-p`만 입력하면 비밀번호를 입력하라는 프롬프트가 나옵니다.

```bash
mysql -h chopplandemo-db.cza44qa8inj4.ap-northeast-2.rds.amazonaws.com -P 3306 -u admin -p restaurant-demo < create_chat_tables.sql
# 비밀번호 입력: chopplan123
```



