-- 관리자 계정 삭제 SQL
-- 주의: 이 명령은 관리자 계정을 완전히 삭제합니다.

-- 방법 1: username으로 삭제
DELETE FROM demo_users WHERE username = 'admin';

-- 방법 2: role이 ADMIN인 모든 계정 삭제 (주의!)
-- DELETE FROM demo_users WHERE role = 'ADMIN';

-- 방법 3: 특정 ID로 삭제
-- DELETE FROM demo_users WHERE id = 1;

-- 삭제 확인
SELECT * FROM demo_users WHERE username = 'admin';

