/**
 * 상단 네비게이션 바
 * 로고, 알림, 로그인/프로필
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// import NotificationBell from './NotificationBell';
import './TopNav.css';

const TopNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="top-nav">
      <div className="top-nav-container">
        {/* 로고 */}
        <div className="logo" onClick={() => navigate('/')}>
          <h1>🍽️ CHOPLAN</h1>
        </div>

        {/* 오른쪽: 알림 + 로그인/프로필 */}
        <div className="top-nav-actions">
          {user ? (
            <>
              {/* 알림 아이콘 - 주석 처리 */}
              {/* <NotificationBell /> */}
              
              {/* 프로필 드롭다운 */}
              <div className="user-profile">
                <button className="profile-btn" onClick={() => navigate('/my')}>
                  <span className="profile-icon">👤</span>
                  <span className="profile-name">{user.name}</span>
                </button>
                <div className="profile-dropdown">
                  <button onClick={() => navigate('/my')}>마이페이지</button>
                  <button onClick={() => navigate('/profile')}>회원정보</button>
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
              </div>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
