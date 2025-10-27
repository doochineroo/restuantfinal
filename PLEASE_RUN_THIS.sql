-- ============================================================
-- 백엔드 서버를 중지한 후 이 SQL을 MySQL Workbench에서 실행하세요!
-- ============================================================

USE chopplan;

-- 1단계: 기존 컬럼들을 TEXT로 변경 (에러가 나도 무시하고 다음 실행)
ALTER TABLE restaurants MODIFY COLUMN holiday_info TEXT;
ALTER TABLE restaurants MODIFY COLUMN opening_hours TEXT;
ALTER TABLE restaurants MODIFY COLUMN main_menu TEXT;
ALTER TABLE restaurants MODIFY COLUMN hashtags TEXT;
ALTER TABLE restaurants MODIFY COLUMN area_info TEXT;

-- 2단계: description이 이미 있으면 TEXT로 수정 (에러 무시)
ALTER TABLE restaurants MODIFY COLUMN description TEXT;

-- 3단계: 세부사항 컬럼들 처리 (에러 무시)
ALTER TABLE restaurants MODIFY COLUMN parking_info TEXT;
ALTER TABLE restaurants MODIFY COLUMN transportation TEXT;
ALTER TABLE restaurants MODIFY COLUMN special_notes TEXT;

-- 4단계: 결제 수단 컬럼들 (에러 무시)
ALTER TABLE restaurants MODIFY COLUMN card_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN cash_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN mobile_payment VARCHAR(10);
ALTER TABLE restaurants MODIFY COLUMN account_transfer VARCHAR(10);

-- 완료! 이제 백엔드 서버를 재시작하고 테스트하세요.

