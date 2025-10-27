-- 매장 사진 5개 컬럼 추가
ALTER TABLE restaurants ADD COLUMN restaurant_photo1 VARCHAR(500) NULL AFTER main_image;
ALTER TABLE restaurants ADD COLUMN restaurant_photo2 VARCHAR(500) NULL AFTER restaurant_photo1;
ALTER TABLE restaurants ADD COLUMN restaurant_photo3 VARCHAR(500) NULL AFTER restaurant_photo2;
ALTER TABLE restaurants ADD COLUMN restaurant_photo4 VARCHAR(500) NULL AFTER restaurant_photo3;
ALTER TABLE restaurants ADD COLUMN restaurant_photo5 VARCHAR(500) NULL AFTER restaurant_photo4;

