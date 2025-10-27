package com.example.choprest.service;

import com.example.choprest.entity.Notification;
import com.example.choprest.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 알림 서비스
 */
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    /**
     * 알림 생성
     */
    @Transactional
    public Notification createNotification(Long userId, String type, String title, String message, Long relatedId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .isRead(false)
                .build();
        
        return notificationRepository.save(notification);
    }
    
    /**
     * 예약 승인 알림
     */
    @Transactional
    public void notifyReservationApproved(Long userId, String restaurantName, Long reservationId) {
        createNotification(
            userId,
            "RESERVATION_APPROVED",
            "예약이 승인되었습니다",
            restaurantName + " 예약이 승인되었습니다!",
            reservationId
        );
    }
    
    /**
     * 리뷰 작성 리마인더
     */
    @Transactional
    public void notifyReviewReminder(Long userId, String restaurantName, Long reservationId) {
        createNotification(
            userId,
            "REVIEW_REMINDER",
            "리뷰를 작성해주세요",
            restaurantName + " 방문은 어떠셨나요? 리뷰를 남겨주세요!",
            reservationId
        );
    }
    
    /**
     * 사용자의 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 읽지 않은 알림 조회
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }
    
    /**
     * 읽지 않은 알림 개수
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }
    
    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}


