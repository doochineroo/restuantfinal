import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { chatAPI } from '../../demo/services/chatAPI';
import './TopNav.css';

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    showDropdown, 
    setShowDropdown,
    toggleDropdown, 
    markAsRead, 
    deleteNotification 
  } = useNotification();
  
  const dropdownRef = useRef(null);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // 채팅 읽지 않은 메시지 개수 조회 (5초마다) - 일반회원만
  useEffect(() => {
    if (user?.userId && user?.role === 'USER') {
      loadChatUnreadCount();
      const interval = setInterval(loadChatUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadChatUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const response = await chatAPI.getUnreadChatRoomCount(user.userId);
      setChatUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('채팅 알림 개수 조회 오류:', error);
    }
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // 예약 관련 알림이면 예약 내역 페이지로 이동
    if (notification.type === 'RESERVATION') {
      navigate('/reservation-history');
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showDropdown) {
          toggleDropdown();
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, toggleDropdown]);

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        {/* 로고 */}
        <div className="logo-section" onClick={handleLogoClick}>
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">Chopplan</span>
        </div>

        {/* 우측 메뉴 */}
        <div className="top-nav-right">
          {/* 채팅 (일반회원만) */}
          {user && user.role === 'USER' && (
            <div className="chat-section">
              <button className="chat-btn" onClick={handleChatClick} title="채팅 보기">
                <span className="chat-icon">💬</span>
                {chatUnreadCount > 0 && (
                  <span className="chat-badge-nav">{chatUnreadCount}</span>
                )}
              </button>
            </div>
          )}
          
          {/* 알림 */}
          <div className="notification-section" ref={dropdownRef}>
            <button className="notification-btn" onClick={toggleDropdown}>
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {/* 알림 드롭다운 */}
            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <h3>알림</h3>
                  <span className="notification-count">{unreadCount}개</span>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <span className="empty-icon">🔔</span>
                      <p>새로운 알림이 없습니다</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-content">
                          <div className="notification-icon-small">
                            {notification.icon || '●'}
                          </div>
                          <div className="notification-text">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <button
                          className="notification-delete"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="notification-footer">
                    <button 
                      className="view-all-btn"
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                    >
                      모든 알림 보기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 로그인/사용자 메뉴 */}
          <div className="user-section">
            {user ? (
              <div className="user-menu">
                <span 
                  className="user-name" 
                  style={{
                    color: '#2c3e50',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-block',
                    backgroundColor: '#f8f9fa',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    textShadow: 'none',
                    WebkitTextFillColor: '#2c3e50',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.username || user.email || '사용자'}님
                </span>
                <button 
                  className="logout-btn" 
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5a6268';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6c757d';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={handleLogin}>
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;


