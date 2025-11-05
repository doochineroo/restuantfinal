-- 좌표가 없는 레스토랑 레코드 삭제 스크립트
-- lat 또는 lng가 NULL인 레코드들을 삭제합니다.

-- 삭제 전 확인: 좌표가 없는 레코드 수 조회
SELECT 
    COUNT(*) as total_restaurants,
    COUNT(CASE WHEN lat IS NULL OR lng IS NULL THEN 1 END) as restaurants_without_coordinates,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates
FROM restaurants;

-- 삭제할 레코드 미리보기 (선택사항)
SELECT 
    id,
    restaurant_name,
    branch_name,
    lat,
    lng,
    road_address
FROM restaurants
WHERE lat IS NULL OR lng IS NULL
LIMIT 10;

-- 실제 삭제 실행 (주의: 실행 전 위의 조회로 확인하세요)
DELETE FROM restaurants
WHERE lat IS NULL OR lng IS NULL;

-- 삭제 후 확인
SELECT 
    COUNT(*) as remaining_restaurants,
    COUNT(CASE WHEN lat IS NOT NULL AND lng IS NOT NULL THEN 1 END) as restaurants_with_coordinates
FROM restaurants;

-- 인덱스 최적화 (데이터베이스 크기 최적화)
OPTIMIZE TABLE restaurants;





