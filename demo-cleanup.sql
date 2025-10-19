-- 🗑️ 데모 데이터 정리 스크립트
-- 이 스크립트는 테스트 데이터와 테이블을 모두 삭제합니다.

-- 경고 메시지
SELECT '⚠️  WARNING: 데모 테이블과 데이터를 모두 삭제합니다!' as '';
SELECT '⚠️  이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?' as '';
SELECT '⚠️  계속하려면 이 스크립트를 실행하세요.' as '';

-- 외래 키 제약 조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 테이블 삭제 (순서 중요)
DROP TABLE IF EXISTS demo_reviews;
DROP TABLE IF EXISTS demo_reservations;
DROP TABLE IF EXISTS demo_users;

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 완료 메시지
SELECT '✅ 데모 테이블이 모두 삭제되었습니다.' as '';
SELECT '✅ 백엔드/프론트엔드 demo 폴더도 삭제하세요.' as '';

