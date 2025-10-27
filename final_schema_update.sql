-- 최종 스키마 업데이트 스크립트
-- restaurants 테이블의 컬럼 타입을 확인하고 필요한 경우 수정

USE chopplan;

-- Step 1: 기존 큰 컬럼들을 TEXT로 변경 (이미 TEXT면 변경 없음)
ALTER TABLE restaurants 
MODIFY COLUMN holiday_info TEXT,
MODIFY COLUMN opening_hours TEXT,
MODIFY COLUMN main_menu TEXT,
MODIFY COLUMN hashtags TEXT,
MODIFY COLUMN area_info TEXT;

-- Step 2: description 컬럼이 VARCHAR면 TEXT로 변경
-- 에러가 발생하면 description이 이미 TEXT이거나 존재하지 않을 수 있음
ALTER TABLE restaurants MODIFY COLUMN description TEXT;

-- Step 3: 나머지 세부사항 컬럼들 처리
-- 에러가 발생하면 해당 컬럼이 이미 TEXT이거나 존재하지 않을 수 있음
ALTER TABLE restaurants MODIFY COLUMN parking_info TEXT;
ALTER TABLE restaurants MODIFY COLUMN transportation TEXT;
ALTER TABLE restaurants MODIFY COLUMN special_notes TEXT;

-- Step 4: 결제 수단 컬럼들 (VARCHAR로 유지)
ALTER TABLE restaurants MODIFY COLUMN card_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN cash_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN mobile_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN account_transfer VARCHAR(10);

