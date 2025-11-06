import React, { createContext, useContext, useState } from 'react';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '../hooks/useNotifications';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // React Query 훅 사용
  const { data: notifications = [], refetch: loadNotifications } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // 기존 API와 호환성을 위한 래퍼 함수들
  const loadUnreadCount = () => {
    // React Query가 자동으로 관리하므로 빈 함수
  };
  
  const markAsRead = async (notificationId) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };
  
  const markAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };
  
  const deleteNotification = async (notificationId) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  };

  // 새 알림 추가 (로컬 상태에만 추가 - 실제 서버 알림은 React Query가 관리)
  const addNotification = (notification) => {
    // 로컬 상태에만 추가하는 경우는 거의 없으므로 빈 함수로 유지
    // 실제 알림은 서버에서 오고 React Query가 자동으로 갱신함
  };

  // 예약 관련 알림 추가
  const addReservationNotification = (type, restaurantName, reservationId) => {
    let message = '';
    let icon = '';
    
    switch (type) {
      case 'RESERVATION_CREATED':
        message = `${restaurantName}에 예약이 완료되었습니다.`;
        icon = '✓';
        break;
      case 'RESERVATION_APPROVED':
        message = `${restaurantName} 예약이 승인되었습니다.`;
        icon = '✓';
        break;
      case 'RESERVATION_REJECTED':
        message = `${restaurantName} 예약이 거절되었습니다.`;
        icon = '✗';
        break;
      case 'RESERVATION_CANCELLED':
        message = `${restaurantName} 예약이 취소되었습니다.`;
        icon = '✗';
        break;
      default:
        message = `${restaurantName} 예약 상태가 변경되었습니다.`;
        icon = '●';
    }

    addNotification({
      type: 'RESERVATION',
      title: '예약 알림',
      message,
      icon,
      reservationId,
      restaurantName
    });
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const value = {
    notifications,
    unreadCount,
    showDropdown,
    setShowDropdown,
    loadNotifications,
    loadUnreadCount,
    addNotification,
    addReservationNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleDropdown
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
