-- 방문 상태가 VISITED이지만 예약 상태가 APPROVED인 경우를 COMPLETED로 업데이트
UPDATE reservations 
SET status = 'COMPLETED' 
WHERE visit_status = 'VISITED' 
  AND status = 'APPROVED';
