import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import LoginRequiredModal from '../modals/LoginRequiredModal';
import './MainNav.css';

const MainNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // OWNER는 Owner Dashboard로 리다이렉트
  const menuItems = [
    { path: '/', label: '홈', icon: '🏠', requiresAuth: false },
    { path: '/search', label: '검색', icon: '🔍', requiresAuth: false },
    { path: '/nearme', label: '내주변', icon: '📍', requiresAuth: false },
    { path: '/reservation-history', label: '예약내역', icon: '📅', requiresAuth: true },
    { path: '/profile', label: '마이', icon: '👤', requiresAuth: true }
  ];

  const handleMenuClick = (path, requiresAuth) => {
    // 로그인이 필요한 페이지이고 로그인되지 않은 경우
    if (requiresAuth && !user) {
      setShowLoginModal(true);
      return;
    }

    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard');
      return;
    }
    navigate(path);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate('/demo/login');
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="main-nav">
        <div className="main-nav-container">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`main-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path, item.requiresAuth)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </>
  );
};

export default MainNav;




