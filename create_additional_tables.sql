-- EVENTS 테이블 생성
CREATE TABLE IF NOT EXISTS EVENTS (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_description TEXT,
    event_type VARCHAR(50),
    discount_rate INT,
    discount_amount INT,
    min_order_amount INT,
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    terms_and_conditions TEXT,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES STORES(store_id) ON DELETE CASCADE
);

-- ADDITIONAL_INFO 테이블 생성
CREATE TABLE IF NOT EXISTS ADDITIONAL_INFO (
    info_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    info_type VARCHAR(50) NOT NULL,
    info_title VARCHAR(200),
    info_description TEXT,
    info_value VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    icon_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    additional_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES STORES(store_id) ON DELETE CASCADE
);

-- MENU 테이블에 추가 컬럼들 추가 (기존 테이블이 있다면)
ALTER TABLE MENU 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allergen_info VARCHAR(500),
ADD COLUMN IF NOT EXISTS nutrition_info TEXT,
ADD COLUMN IF NOT EXISTS preparation_time INT,
ADD COLUMN IF NOT EXISTS spice_level INT,
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 샘플 데이터 삽입
-- EVENTS 샘플 데이터
INSERT INTO EVENTS (store_id, event_name, event_description, event_type, discount_rate, image_url, start_date, end_date, is_active, is_popular) VALUES
(1, '신메뉴 출시 이벤트', '새로운 메뉴 20% 할인', 'DISCOUNT', 20, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, TRUE),
(1, '주말 특별 할인', '주말에만 15% 추가 할인', 'DISCOUNT', 15, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, FALSE),
(2, '생일 축하 이벤트', '생일 고객 30% 할인', 'SPECIAL', 30, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop', '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, TRUE);

-- ADDITIONAL_INFO 샘플 데이터
INSERT INTO ADDITIONAL_INFO (store_id, info_type, info_title, info_description, info_value, is_available, icon_url) VALUES
(1, 'PARKING', '주차 가능', '지하 주차장 이용 가능', '지하 1-2층', TRUE, 'https://via.placeholder.com/24x24/4CAF50/ffffff?text=P'),
(1, 'WIFI', '무료 WiFi', '고객용 무료 WiFi 제공', 'ChopRest_Free', TRUE, 'https://via.placeholder.com/24x24/2196F3/ffffff?text=W'),
(1, 'KIDS_ZONE', '키즈존', '어린이 놀이 공간 제공', '2층 키즈존', TRUE, 'https://via.placeholder.com/24x24/FF9800/ffffff?text=K'),
(1, 'DELIVERY', '배달 가능', '배달 주문 가능', '배달의민족, 요기요', TRUE, 'https://via.placeholder.com/24x24/9C27B0/ffffff?text=D'),
(2, 'PARKING', '주차 가능', '발렛 파킹 서비스', '발렛 파킹', TRUE, 'https://via.placeholder.com/24x24/4CAF50/ffffff?text=P'),
(2, 'WIFI', '무료 WiFi', '고객용 무료 WiFi 제공', 'Store_WiFi', TRUE, 'https://via.placeholder.com/24x24/2196F3/ffffff?text=W');

-- MENU 샘플 데이터 업데이트 (기존 메뉴에 이미지 추가)
UPDATE MENU SET 
    image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    thumbnail_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=150&fit=crop',
    category = '메인',
    is_available = TRUE,
    is_popular = TRUE,
    is_recommended = FALSE,
    preparation_time = 15,
    spice_level = 2,
    sort_order = 1
WHERE store_id = 1 AND name LIKE '%스테이크%';

UPDATE MENU SET 
    image_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    thumbnail_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop',
    category = '사이드',
    is_available = TRUE,
    is_popular = FALSE,
    is_recommended = TRUE,
    preparation_time = 10,
    spice_level = 1,
    sort_order = 2
WHERE store_id = 1 AND name LIKE '%샐러드%';





