-- 데이터베이스 크기 확인 및 정리 스크립트

-- 1. 전체 데이터베이스 크기
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'restaurant-demo'
GROUP BY table_schema;

-- 2. 테이블별 크기
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'restaurant-demo'
ORDER BY (data_length + index_length) DESC;

-- 3. 좌표가 있는/없는 레스토랑 수
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates,
    ROUND(COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) * 100.0 / COUNT(*), 2) as percentage_without_coordinates
FROM restaurants;

-- 4. 데이터베이스 최적화 명령어 (실행 시)
-- OPTIMIZE TABLE restaurants;
-- ANALYZE TABLE restaurants;





