-- 이미 존재하는 컬럼들을 수정 (TEXT 타입으로)
ALTER TABLE restaurants MODIFY COLUMN description TEXT NULL;
ALTER TABLE restaurants MODIFY COLUMN parking_info TEXT NULL;
ALTER TABLE restaurants MODIFY COLUMN transportation TEXT NULL;
ALTER TABLE restaurants MODIFY COLUMN special_notes TEXT NULL;
ALTER TABLE restaurants MODIFY COLUMN card_payment VARCHAR(10) NULL;
ALTER TABLE restaurants MODIFY COLUMN cash_payment VARCHAR(10) NULL;
ALTER TABLE restaurants MODIFY COLUMN mobile_payment VARCHAR(10) NULL;
ALTER TABLE restaurants MODIFY COLUMN account_transfer VARCHAR(10) NULL;

