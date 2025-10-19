-- 🧪 데모 테스트 데이터
-- 이 스크립트는 데모 시스템 테스트용 데이터를 생성합니다.

-- 1. 테스트 사용자 생성
INSERT INTO demo_users (username, password, name, email, phone, role, restaurant_id, status, created_at, updated_at) VALUES
('admin', 'admin123', '관리자', 'admin@choprest.com', '010-1111-1111', 'ADMIN', NULL, 'ACTIVE', NOW(), NOW()),
('owner', 'owner123', '김사장', 'owner@choprest.com', '010-2222-2222', 'OWNER', 1, 'ACTIVE', NOW(), NOW()),
('owner2', 'owner123', '이사장', 'owner2@choprest.com', '010-2222-3333', 'OWNER', 2, 'ACTIVE', NOW(), NOW()),
('user', 'user123', '홍길동', 'user@choprest.com', '010-3333-3333', 'USER', NULL, 'ACTIVE', NOW(), NOW()),
('user2', 'user123', '김철수', 'user2@choprest.com', '010-4444-4444', 'USER', NULL, 'ACTIVE', NOW(), NOW()),
('user3', 'user123', '박영희', 'user3@choprest.com', '010-5555-5555', 'USER', NULL, 'ACTIVE', NOW(), NOW());

-- 2. 테스트 예약 데이터 (다양한 상태)
INSERT INTO demo_reservations (user_id, restaurant_id, restaurant_name, user_name, user_phone, user_email, reservation_date, reservation_time, guests, special_requests, status, created_at, updated_at) VALUES
-- 대기중 예약
(4, 1, '더플레이스 다이닝', '홍길동', '010-3333-3333', 'user@choprest.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', 4, '창가 자리 부탁드립니다.', 'PENDING', NOW(), NOW()),
(5, 2, '스시코우지', '김철수', '010-4444-4444', 'user2@choprest.com', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00', 2, '알레르기 있습니다. 새우 제외 부탁드립니다.', 'PENDING', NOW(), NOW()),
(6, 1, '더플레이스 다이닝', '박영희', '010-5555-5555', 'user3@choprest.com', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '20:00:00', 6, '생일 파티입니다. 케이크 준비 가능한가요?', 'PENDING', NOW(), NOW()),

-- 승인된 예약
(4, 3, '비스트로 서울', '홍길동', '010-3333-3333', 'user@choprest.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:00:00', 2, NULL, 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(5, 1, '더플레이스 다이닝', '김철수', '010-4444-4444', 'user2@choprest.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00', 3, '조용한 자리 부탁드립니다.', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- 거절된 예약
(6, 2, '스시코우지', '박영희', '010-5555-5555', 'user3@choprest.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 4, NULL, 'REJECTED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- 완료된 예약 (과거)
(4, 1, '더플레이스 다이닝', '홍길동', '010-3333-3333', 'user@choprest.com', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:00:00', 2, NULL, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(5, 2, '스시코우지', '김철수', '010-4444-4444', 'user2@choprest.com', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '18:30:00', 4, NULL, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- 3. 테스트 리뷰 데이터
INSERT INTO demo_reviews (user_id, restaurant_id, reservation_id, user_name, restaurant_name, rating, content, likes_count, dislikes_count, is_reported, created_at, updated_at) VALUES
-- 식당 1 리뷰
(4, 1, 7, '홍길동', '더플레이스 다이닝', 5, '음식이 정말 맛있었고 분위기도 좋았습니다! 특히 파스타가 일품이었어요. 직원들도 친절하고 다시 방문하고 싶은 곳입니다. 적극 추천합니다!', 15, 1, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 1, NULL, '김철수', '더플레이스 다이닝', 4, '전반적으로 만족스러운 식사였습니다. 음식 맛은 좋았으나 대기 시간이 조금 길었어요. 그래도 재방문 의사 있습니다.', 8, 0, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 1, NULL, '박영희', '더플레이스 다이닝', 5, '가족 모임으로 다녀왔는데 모두 만족했습니다. 특히 스테이크가 굉장히 부드럽고 맛있었어요!', 12, 0, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 식당 2 리뷰
(5, 2, 8, '김철수', '스시코우지', 5, '신선한 생선과 정성스러운 요리가 인상적이었습니다. 셰프님의 실력이 대단하세요! 가격대비 매우 만족스럽습니다.', 20, 1, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 2, NULL, '홍길동', '스시코우지', 4, '초밥이 신선하고 맛있었습니다. 가격은 조금 있지만 그만한 가치가 있어요.', 10, 2, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 식당 3 리뷰
(6, 3, NULL, '박영희', '비스트로 서울', 3, '음식은 괜찮았으나 서비스가 아쉬웠습니다. 개선이 필요해 보입니다.', 3, 5, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 3, NULL, '홍길동', '비스트로 서울', 4, '분위기 좋고 음식도 맛있었어요. 다만 소음이 조금 있어서 별점 하나 뺐습니다.', 7, 1, FALSE, NOW(), NOW()),

-- 신고된 리뷰 (테스트용)
(4, 1, NULL, '홍길동', '더플레이스 다이닝', 1, '이 리뷰는 테스트를 위해 신고된 리뷰입니다. 관리자 페이지에서 확인할 수 있습니다.', 0, 15, TRUE, NOW(), NOW());

-- 4. 거절 사유 업데이트 (거절된 예약)
UPDATE demo_reservations 
SET rejection_reason = '죄송합니다. 해당 시간대는 예약이 마감되었습니다.' 
WHERE id = 6;

-- 데이터 확인 쿼리
SELECT '=== 사용자 목록 ===' as '';
SELECT id, username, name, role, status FROM demo_users;

SELECT '=== 예약 현황 ===' as '';
SELECT id, user_name, restaurant_name, reservation_date, status FROM demo_reservations;

SELECT '=== 리뷰 목록 ===' as '';
SELECT id, user_name, restaurant_name, rating, is_reported FROM demo_reviews;

