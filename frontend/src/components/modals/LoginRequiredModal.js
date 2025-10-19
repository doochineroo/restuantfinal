import React from 'react';
import './LoginRequiredModal.css';

const LoginRequiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="login-required-modal-overlay">
      <div className="login-required-modal">
        <div className="login-required-modal-header">
          <h3>로그인이 필요합니다</h3>
        </div>
        <div className="login-required-modal-body">
          <p>해당 기능을 사용하려면 로그인이 필요합니다.</p>
          <p>로그인하시겠습니까?</p>
        </div>
        <div className="login-required-modal-footer">
          <button 
            className="login-required-modal-cancel" 
            onClick={onClose}
          >
            취소
          </button>
          <button 
            className="login-required-modal-confirm" 
            onClick={onLogin}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
