-- Restaurant 테이블에 메인 이미지 컬럼 추가
ALTER TABLE restaurants ADD COLUMN main_image VARCHAR(500) NULL;
ALTER TABLE restaurants ADD COLUMN menu_image1 VARCHAR(500) NULL;
ALTER TABLE restaurants ADD COLUMN menu_image2 VARCHAR(500) NULL;
ALTER TABLE restaurants ADD COLUMN menu_image3 VARCHAR(500) NULL;


