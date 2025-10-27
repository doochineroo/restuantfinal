import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../demo/context/AuthContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // 알림 로드
  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`http://localhost:8080/api/notifications/${user.userId}`);
      const notificationData = response.data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  // 새 알림 추가
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(), // 임시 ID
      ...notification,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
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

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:8080/api/notifications/${user.userId}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('알림 삭제 오류:', error);
    }
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // 사용자 변경 시 알림 로드
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    showDropdown,
    setShowDropdown,
    loadNotifications,
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
