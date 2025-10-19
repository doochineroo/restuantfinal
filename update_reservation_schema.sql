-- 예약 테이블에 방문 상태 관련 컬럼 추가
ALTER TABLE demo_reservations 
ADD COLUMN visit_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN visit_confirmed_at DATETIME NULL,
ADD COLUMN no_show_reason TEXT NULL,
ADD COLUMN blacklist_reason TEXT NULL,
ADD COLUMN is_blacklisted BOOLEAN DEFAULT FALSE;

-- 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS demo_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reservation_id (reservation_id)
);

-- 블랙리스트 테이블 생성
CREATE TABLE IF NOT EXISTS demo_blacklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    reservation_id BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    INDEX idx_user_restaurant (user_id, restaurant_id),
    INDEX idx_restaurant_id (restaurant_id)
);

