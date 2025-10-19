import React, { useState } from 'react';
import { useAuth } from '../demo/context/AuthContext';
import LoginRequiredModal from './modals/LoginRequiredModal';

const ProtectedRoute = ({ children, fallbackPath = '/demo/login' }) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 로그인된 사용자는 자식 컴포넌트 렌더링
  if (user) {
    return children;
  }

  // 로그인되지 않은 사용자는 모달 표시
  const handleProtectedAccess = () => {
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    window.location.href = fallbackPath;
  };

  const handleClose = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      {children}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleClose}
        onLogin={handleLogin}
      />
    </>
  );
};

export default ProtectedRoute;
