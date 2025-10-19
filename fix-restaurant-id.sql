-- restaurants 테이블의 id 컬럼을 AUTO_INCREMENT로 변경
-- 이 스크립트를 MySQL에 접속해서 실행하세요

USE `restaurant-demo`;

-- id 컬럼을 AUTO_INCREMENT로 수정
ALTER TABLE restaurants 
MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- 확인
DESCRIBE restaurants;

-- 성공 메시지
SELECT '✅ restaurants 테이블 id 컬럼이 AUTO_INCREMENT로 변경되었습니다!' AS result;


