-- 현재 restaurants 테이블의 컬럼 타입 확인
USE chopplan;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'chopplan'
  AND TABLE_NAME = 'restaurants'
  AND COLUMN_NAME IN (
    'description', 
    'parking_info', 
    'transportation', 
    'special_notes',
    'card_payment',
    'cash_payment',
    'mobile_payment',
    'account_transfer'
  )
ORDER BY COLUMN_NAME;

