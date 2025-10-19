-- 🧪 데모 테스트 데이터 v2 (JPA 관계 매핑 버전)
-- User와 Restaurant가 외래키로 연결된 버전

-- 1. 테스트 사용자 생성
-- 주의: restaurant_id는 실제 restaurants 테이블에 있는 ID를 사용해야 합니다

-- 관리자 (식당 연결 없음)
INSERT INTO demo_users (username, password, name, email, phone, role, restaurant_id, status, created_at, updated_at) 
VALUES ('admin', 'admin123', '관리자', 'admin@choprest.com', '010-1111-1111', 'ADMIN', NULL, 'ACTIVE', NOW(), NOW());

-- 가게 주인들 (실제 restaurants 테이블의 ID 사용)
INSERT INTO demo_users (username, password, name, email, phone, role, restaurant_id, status, created_at, updated_at) 
VALUES 
('owner', 'owner123', '김사장', 'owner@choprest.com', '010-2222-2222', 'OWNER', 1, 'ACTIVE', NOW(), NOW()),
('owner2', 'owner123', '이사장', 'owner2@choprest.com', '010-2222-3333', 'OWNER', 2, 'ACTIVE', NOW(), NOW()),
('owner3', 'owner123', '박사장', 'owner3@choprest.com', '010-2222-4444', 'OWNER', 3, 'ACTIVE', NOW(), NOW());

-- 일반 회원들 (식당 연결 없음)
INSERT INTO demo_users (username, password, name, email, phone, role, restaurant_id, status, created_at, updated_at) 
VALUES 
('user', 'user123', '홍길동', 'user@choprest.com', '010-3333-3333', 'USER', NULL, 'ACTIVE', NOW(), NOW()),
('user2', 'user123', '김철수', 'user2@choprest.com', '010-4444-4444', 'USER', NULL, 'ACTIVE', NOW(), NOW()),
('user3', 'user123', '박영희', 'user3@choprest.com', '010-5555-5555', 'USER', NULL, 'ACTIVE', NOW(), NOW());

-- 2. 사용자 ID 확인
SET @admin_id = (SELECT id FROM demo_users WHERE username = 'admin');
SET @owner_id = (SELECT id FROM demo_users WHERE username = 'owner');
SET @owner2_id = (SELECT id FROM demo_users WHERE username = 'owner2');
SET @owner3_id = (SELECT id FROM demo_users WHERE username = 'owner3');
SET @user_id = (SELECT id FROM demo_users WHERE username = 'user');
SET @user2_id = (SELECT id FROM demo_users WHERE username = 'user2');
SET @user3_id = (SELECT id FROM demo_users WHERE username = 'user3');

-- 3. 테스트 예약 데이터
INSERT INTO demo_reservations (user_id, restaurant_id, restaurant_name, user_name, user_phone, user_email, reservation_date, reservation_time, guests, special_requests, status, created_at, updated_at) VALUES
-- 대기중 예약 (식당 1, 2, 3)
(@user_id, 1, (SELECT restaurant_name FROM restaurants WHERE id = 1), '홍길동', '010-3333-3333', 'user@choprest.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', 4, '창가 자리 부탁드립니다.', 'PENDING', NOW(), NOW()),
(@user2_id, 2, (SELECT restaurant_name FROM restaurants WHERE id = 2), '김철수', '010-4444-4444', 'user2@choprest.com', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00', 2, '알레르기 있습니다. 새우 제외 부탁드립니다.', 'PENDING', NOW(), NOW()),
(@user3_id, 3, (SELECT restaurant_name FROM restaurants WHERE id = 3), '박영희', '010-5555-5555', 'user3@choprest.com', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '20:00:00', 6, '생일 파티입니다. 케이크 준비 가능한가요?', 'PENDING', NOW(), NOW()),

-- 승인된 예약
(@user_id, 1, (SELECT restaurant_name FROM restaurants WHERE id = 1), '홍길동', '010-3333-3333', 'user@choprest.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:00:00', 2, NULL, 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(@user2_id, 2, (SELECT restaurant_name FROM restaurants WHERE id = 2), '김철수', '010-4444-4444', 'user2@choprest.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00', 3, '조용한 자리 부탁드립니다.', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- 거절된 예약
(@user3_id, 3, (SELECT restaurant_name FROM restaurants WHERE id = 3), '박영희', '010-5555-5555', 'user3@choprest.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 4, NULL, 'REJECTED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- 완료된 예약 (과거)
(@user_id, 1, (SELECT restaurant_name FROM restaurants WHERE id = 1), '홍길동', '010-3333-3333', 'user@choprest.com', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:00:00', 2, NULL, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(@user2_id, 2, (SELECT restaurant_name FROM restaurants WHERE id = 2), '김철수', '010-4444-4444', 'user2@choprest.com', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '18:30:00', 4, NULL, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- 4. 거절 사유 업데이트
UPDATE demo_reservations 
SET rejection_reason = '죄송합니다. 해당 시간대는 예약이 마감되었습니다.' 
WHERE status = 'REJECTED';

-- 5. 테스트 리뷰 데이터
SET @completed_reservation1 = (SELECT id FROM demo_reservations WHERE user_id = @user_id AND status = 'COMPLETED' LIMIT 1);
SET @completed_reservation2 = (SELECT id FROM demo_reservations WHERE user_id = @user2_id AND status = 'COMPLETED' LIMIT 1);

INSERT INTO demo_reviews (user_id, restaurant_id, reservation_id, user_name, restaurant_name, rating, content, likes_count, dislikes_count, is_reported, created_at, updated_at) VALUES
-- 식당 1 리뷰
(@user_id, 1, @completed_reservation1, '홍길동', (SELECT restaurant_name FROM restaurants WHERE id = 1), 5, '음식이 정말 맛있었고 분위기도 좋았습니다! 특히 파스타가 일품이었어요. 직원들도 친절하고 다시 방문하고 싶은 곳입니다. 적극 추천합니다!', 15, 1, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@user2_id, 1, NULL, '김철수', (SELECT restaurant_name FROM restaurants WHERE id = 1), 4, '전반적으로 만족스러운 식사였습니다. 음식 맛은 좋았으나 대기 시간이 조금 길었어요. 그래도 재방문 의사 있습니다.', 8, 0, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@user3_id, 1, NULL, '박영희', (SELECT restaurant_name FROM restaurants WHERE id = 1), 5, '가족 모임으로 다녀왔는데 모두 만족했습니다. 특히 스테이크가 굉장히 부드럽고 맛있었어요!', 12, 0, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 식당 2 리뷰
(@user2_id, 2, @completed_reservation2, '김철수', (SELECT restaurant_name FROM restaurants WHERE id = 2), 5, '신선한 생선과 정성스러운 요리가 인상적이었습니다. 셰프님의 실력이 대단하세요! 가격대비 매우 만족스럽습니다.', 20, 1, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@user_id, 2, NULL, '홍길동', (SELECT restaurant_name FROM restaurants WHERE id = 2), 4, '초밥이 신선하고 맛있었습니다. 가격은 조금 있지만 그만한 가치가 있어요.', 10, 2, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 식당 3 리뷰
(@user3_id, 3, NULL, '박영희', (SELECT restaurant_name FROM restaurants WHERE id = 3), 3, '음식은 괜찮았으나 서비스가 아쉬웠습니다. 개선이 필요해 보입니다.', 3, 5, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@user_id, 3, NULL, '홍길동', (SELECT restaurant_name FROM restaurants WHERE id = 3), 4, '분위기 좋고 음식도 맛있었어요. 다만 소음이 조금 있어서 별점 하나 뺐습니다.', 7, 1, FALSE, NOW(), NOW()),

-- 신고된 리뷰 (관리자 테스트용)
(@user_id, 1, NULL, '홍길동', (SELECT restaurant_name FROM restaurants WHERE id = 1), 1, '⚠️ 이 리뷰는 테스트를 위해 신고된 리뷰입니다. 관리자 페이지에서 확인할 수 있습니다.', 0, 15, TRUE, NOW(), NOW());

-- 6. 데이터 확인
SELECT '=== 👥 사용자 목록 (가게 주인-식당 연결 확인) ===' as '';
SELECT 
    u.id,
    u.username,
    u.name,
    u.role,
    u.restaurant_id,
    r.restaurant_name as '연결된 식당',
    u.status
FROM demo_users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
ORDER BY u.role DESC, u.id;

SELECT '=== 📅 예약 현황 ===' as '';
SELECT 
    r.id,
    r.user_name as '고객명',
    r.restaurant_name as '식당명',
    r.reservation_date as '예약일',
    r.reservation_time as '예약시간',
    r.status as '상태'
FROM demo_reservations r
ORDER BY r.reservation_date DESC;

SELECT '=== ✍️ 리뷰 목록 ===' as '';
SELECT 
    r.id,
    r.user_name as '작성자',
    r.restaurant_name as '식당명',
    r.rating as '평점',
    r.is_reported as '신고여부'
FROM demo_reviews r
ORDER BY r.created_at DESC;

SELECT '✅ 테스트 데이터 생성 완료!' as '';


