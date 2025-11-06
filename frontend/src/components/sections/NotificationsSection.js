import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';
import './NotificationsSection.css';

const NotificationsSection = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user) {
      // 알림 섹션이 마운트될 때만 로드
      loadNotifications();
      setLoading(false);
    }
  }, [user]); // loadNotifications 제거하여 무한 루프 방지

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'RESERVATION_APPROVED': return '✓';
      case 'RESERVATION_REJECTED': return '✗';
      case 'RESERVATION_REMINDER': return '⏰';
      case 'REVIEW_REMINDER': return '★';
      case 'PROMOTION': return '🎉';
      case 'SYSTEM': return '⚙';
      default: return '●';
    }
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'RESERVATION_APPROVED': return '예약 승인';
      case 'RESERVATION_REJECTED': return '예약 거절';
      case 'RESERVATION_REMINDER': return '예약 알림';
      case 'REVIEW_REMINDER': return '리뷰 요청';
      case 'PROMOTION': return '프로모션';
      case 'SYSTEM': return '시스템';
      default: return '알림';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !notification.isRead;
    if (filter === 'READ') return notification.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="notifications-section">
        <div className="loading-container">
          <div className="loading-spinner">알림을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-section">
      <div className="notifications-header">
        <h3>알림</h3>
        <div className="header-actions">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              전체
            </button>
            <button 
              className={`filter-btn ${filter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setFilter('UNREAD')}
            >
              읽지 않음
            </button>
            <button 
              className={`filter-btn ${filter === 'READ' ? 'active' : ''}`}
              onClick={() => setFilter('READ')}
            >
              읽음
            </button>
          </div>
          <button 
            className="btn-mark-all"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
          >
            모두 읽음
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h4>알림이 없습니다</h4>
          <p>새로운 알림이 오면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-type">
                    {getNotificationTypeText(notification.type)}
                  </span>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="notification-message">
                  {notification.message}
                </div>
                
                {notification.data && (
                  <div className="notification-data">
                    {notification.data.restaurantName && (
                      <span className="restaurant-name">
                        {notification.data.restaurantName}
                      </span>
                    )}
                    {notification.data.reservationDate && (
                      <span className="reservation-date">
                        {notification.data.reservationDate}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    className="btn-mark-read"
                    onClick={() => markAsRead(notification.id)}
                    title="읽음 처리"
                  >
                    ✓
                  </button>
                )}
                <button 
                  className="btn-delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
