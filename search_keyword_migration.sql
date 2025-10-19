-- SearchKeyword 테이블 개선을 위한 마이그레이션 스크립트

-- 1. 기존 테이블 백업
CREATE TABLE search_keywords_backup AS SELECT * FROM search_keywords;

-- 2. 기존 테이블 삭제
DROP TABLE search_keywords;

-- 3. 새로운 테이블 생성
CREATE TABLE search_keywords (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(100) NOT NULL,
    search_count INT DEFAULT 1,
    result_count INT DEFAULT 0,
    category VARCHAR(50),
    region VARCHAR(100),
    user_id BIGINT,
    search_type VARCHAR(20) DEFAULT 'KEYWORD',
    last_searched_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);

-- 4. 인덱스 생성
CREATE INDEX idx_keyword ON search_keywords(keyword);
CREATE INDEX idx_search_count ON search_keywords(search_count DESC);
CREATE INDEX idx_last_searched ON search_keywords(last_searched_at DESC);
CREATE INDEX idx_category ON search_keywords(category);
CREATE INDEX idx_region ON search_keywords(region);
CREATE INDEX idx_user_id ON search_keywords(user_id);
CREATE INDEX idx_search_type ON search_keywords(search_type);

-- 5. 기존 데이터 마이그레이션 (가능한 경우)
INSERT INTO search_keywords (id, keyword, search_count, result_count, search_type, last_searched_at, created_at, updated_at)
SELECT 
    id,
    keyword,
    COALESCE(search_count, 1),
    0,
    'KEYWORD',
    COALESCE(last_searched_at, NOW()),
    COALESCE(created_at, NOW()),
    NOW()
FROM search_keywords_backup;

-- 6. 백업 테이블 삭제 (데이터 확인 후)
-- DROP TABLE search_keywords_backup;

-- 7. 샘플 데이터 삽입 (테스트용)
INSERT INTO search_keywords (keyword, search_count, result_count, category, region, user_id, search_type, last_searched_at, created_at, updated_at) VALUES
('강남역 맛집', 1250, 45, '한식', '강남구', 1, 'KEYWORD', NOW(), NOW(), NOW()),
('스시', 980, 32, '일식', '강남구', 2, 'KEYWORD', NOW(), NOW(), NOW()),
('이태원 데이트', 850, 28, '양식', '용산구', 3, 'KEYWORD', NOW(), NOW(), NOW()),
('홍대 술집', 720, 25, '술집', '마포구', 4, 'KEYWORD', NOW(), NOW(), NOW()),
('강남 카페', 650, 20, '카페', '강남구', 5, 'KEYWORD', NOW(), NOW(), NOW()),
('맛집', 580, 15, '한식', '서울시', 6, 'KEYWORD', NOW(), NOW(), NOW()),
('데이트', 520, 18, '양식', '서울시', 7, 'KEYWORD', NOW(), NOW(), NOW()),
('치킨', 480, 22, '치킨', '서울시', 8, 'KEYWORD', NOW(), NOW(), NOW()),
('피자', 420, 16, '양식', '서울시', 9, 'KEYWORD', NOW(), NOW(), NOW()),
('한식', 380, 12, '한식', '서울시', 10, 'KEYWORD', NOW(), NOW(), NOW());






