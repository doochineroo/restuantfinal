-- Restaurant 테이블에 이미지 컬럼 추가
ALTER TABLE restaurants 
ADD COLUMN image_url VARCHAR(500),
ADD COLUMN thumbnail_url VARCHAR(500);

-- 샘플 데이터 업데이트 (기존 식당들에 이미지 URL 추가)
UPDATE restaurants 
SET 
    image_url = 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Restaurant+Image',
    thumbnail_url = 'https://via.placeholder.com/200x150/ff6b6b/ffffff?text=Thumbnail'
WHERE id IN (1, 2, 3, 4, 5);

-- 더 많은 샘플 이미지 URL들
UPDATE restaurants 
SET 
    image_url = CASE 
        WHEN id = 1 THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
        WHEN id = 2 THEN 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop'
        WHEN id = 3 THEN 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'
        WHEN id = 4 THEN 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
        WHEN id = 5 THEN 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop'
        ELSE 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Restaurant+Image'
    END,
    thumbnail_url = CASE 
        WHEN id = 1 THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=150&fit=crop'
        WHEN id = 2 THEN 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=150&fit=crop'
        WHEN id = 3 THEN 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200&h=150&fit=crop'
        WHEN id = 4 THEN 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=150&fit=crop'
        WHEN id = 5 THEN 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=150&fit=crop'
        ELSE 'https://via.placeholder.com/200x150/ff6b6b/ffffff?text=Thumbnail'
    END
WHERE id BETWEEN 1 AND 5;





