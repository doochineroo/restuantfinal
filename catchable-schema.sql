-- 🎨 캐치테이블 스타일 재디자인 DB 스키마

-- 1. 식당 클릭 통계 테이블
CREATE TABLE IF NOT EXISTS restaurant_clicks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id BIGINT NOT NULL,
    user_id BIGINT NULL COMMENT '로그인 사용자만 기록',
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant_id (restaurant_id),
    INDEX idx_clicked_at (clicked_at DESC)
) COMMENT '식당 클릭 통계';

-- 2. 검색어 통계 테이블
CREATE TABLE IF NOT EXISTS search_keywords (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    keyword VARCHAR(100) NOT NULL,
    search_count INT DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_keyword (keyword),
    INDEX idx_search_count (search_count DESC),
    INDEX idx_last_searched (last_searched_at DESC)
) COMMENT '검색어 통계';

-- 3. 사용자 찜 테이블
CREATE TABLE IF NOT EXISTS user_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES demo_users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, restaurant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_restaurant_id (restaurant_id)
) COMMENT '사용자 찜';

-- 4. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'RESERVATION_APPROVED, REVIEW_REMINDER, etc',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT NULL COMMENT '관련 예약ID, 리뷰ID 등',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES demo_users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at DESC)
) COMMENT '알림';

-- 5. restaurants 테이블에 카테고리 컬럼 추가 (없다면)
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS food_category VARCHAR(50) COMMENT '한식,중식,일식,양식 등',
ADD COLUMN IF NOT EXISTS price_range VARCHAR(20) COMMENT '저렴,보통,고급',
ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0 COMMENT '조회수',
ADD INDEX idx_food_category (food_category),
ADD INDEX idx_view_count (view_count DESC);

-- 6. 인기 식당 조회 뷰 (성능 최적화)
CREATE OR REPLACE VIEW popular_restaurants AS
SELECT 
    r.id,
    r.restaurant_name,
    r.region_name,
    r.lat,
    r.lng,
    r.food_category,
    r.main_menu,
    r.hashtags,
    COUNT(rc.id) as click_count,
    r.view_count
FROM restaurants r
LEFT JOIN restaurant_clicks rc ON r.id = rc.restaurant_id 
    AND rc.clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
WHERE r.status = 'NORMAL'
GROUP BY r.id
ORDER BY click_count DESC, r.view_count DESC
LIMIT 100;

-- 7. 인기 검색어 조회 뷰
CREATE OR REPLACE VIEW popular_keywords AS
SELECT 
    keyword,
    search_count,
    last_searched_at
FROM search_keywords
WHERE last_searched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY search_count DESC
LIMIT 20;

-- 테스트 데이터
-- 일부 식당에 카테고리 설정
UPDATE restaurants SET food_category = '일식' WHERE restaurant_name LIKE '%스시%' OR restaurant_name LIKE '%초밥%';
UPDATE restaurants SET food_category = '한식' WHERE restaurant_name LIKE '%한식%' OR restaurant_name LIKE '%국밥%' OR restaurant_name LIKE '%불고기%';
UPDATE restaurants SET food_category = '중식' WHERE restaurant_name LIKE '%중식%' OR restaurant_name LIKE '%짬뽕%' OR restaurant_name LIKE '%짜장%';
UPDATE restaurants SET food_category = '양식' WHERE restaurant_name LIKE '%스테이크%' OR restaurant_name LIKE '%파스타%' OR restaurant_name LIKE '%피자%';
UPDATE restaurants SET food_category = '카페' WHERE restaurant_name LIKE '%카페%' OR restaurant_name LIKE '%커피%';

-- 나머지는 기타로
UPDATE restaurants SET food_category = '기타' WHERE food_category IS NULL;

-- 가격대 설정 (임의)
UPDATE restaurants SET price_range = '보통' WHERE price_range IS NULL;

-- 확인 쿼리
SELECT '=== 테이블 생성 완료 ===' as '';
SELECT 
    TABLE_NAME, 
    TABLE_COMMENT 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME IN ('restaurant_clicks', 'search_keywords', 'user_favorites', 'notifications');

SELECT '=== 인기 식당 샘플 ===' as '';
SELECT 
    restaurant_name,
    region_name,
    food_category,
    click_count
FROM popular_restaurants
LIMIT 10;

SELECT '=== 식당 카테고리 분포 ===' as '';
SELECT 
    food_category,
    COUNT(*) as count
FROM restaurants
GROUP BY food_category;


