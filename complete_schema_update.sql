-- restaurants 테이블 스키마 완전 업데이트
-- 이 스크립트는 이미 존재하는 컬럼은 수정하고, 없는 컬럼은 추가합니다.

USE chopplan;

-- 1. 기존 VARCHAR 컬럼들을 TEXT로 변경
ALTER TABLE restaurants MODIFY COLUMN holiday_info TEXT;
ALTER TABLE restaurants MODIFY COLUMN opening_hours TEXT;
ALTER TABLE restaurants MODIFY COLUMN main_menu TEXT;
ALTER TABLE restaurants MODIFY COLUMN hashtags TEXT;
ALTER TABLE restaurants MODIFY COLUMN area_info TEXT;

-- 2. 세부사항 컬럼들을 TEXT로 수정 또는 추가
-- description이 이미 존재하면 수정, 없으면 추가할 수 없으므로 MODIFY만 시도
-- 에러가 발생하면 해당 컬럼은 이미 존재하는 것

-- description 컬럼 처리
-- MODIFY COLUMN description TEXT로 실행하되, 에러가 나면 이미 TEXT이거나 존재하지 않을 수 있음

