-- ============================================
-- 이메일 인증 기능을 위한 컬럼 추가
-- 기존 demo_users 테이블에 email_verified 컬럼을 추가합니다.
-- ============================================

-- 1. 컬럼이 이미 존재하는지 확인 후 추가 (중복 실행 방지)
-- MySQL에서는 컬럼이 존재하면 오류가 발생하므로, IF NOT EXISTS는 지원하지 않습니다.
-- 따라서 스크립트를 여러 번 실행해도 안전하도록 처리합니다.

-- 방법 1: 컬럼 존재 여부 확인 후 추가 (권장)
SET @dbname = DATABASE();
SET @tablename = 'demo_users';
SET @columnname = 'email_verified';
SET @preparedStatement = (
    SELECT IF(
        (
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = @dbname
            AND TABLE_NAME = @tablename
            AND COLUMN_NAME = @columnname
        ) > 0,
        'SELECT 1', -- 컬럼이 이미 존재하면 아무것도 하지 않음
        CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN NOT NULL DEFAULT FALSE AFTER email')
    )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 방법 2: 간단한 방법 (컬럼이 이미 존재하면 오류 발생 - 한 번만 실행할 때 사용)
-- ALTER TABLE demo_users 
-- ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE 
-- AFTER email;

-- 2. 기존 사용자들의 이메일 인증 상태를 false로 설정
-- (이미 DEFAULT FALSE로 설정되어 있지만, 명시적으로 업데이트)
UPDATE demo_users 
SET email_verified = FALSE 
WHERE email_verified IS NULL;

-- 3. 확인 쿼리 (실행 후 결과 확인)
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND TABLE_NAME = 'demo_users'
-- AND COLUMN_NAME = 'email_verified';

