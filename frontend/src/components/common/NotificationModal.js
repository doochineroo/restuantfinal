import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  type = "info", // success, error, warning, info
  title = "알림", 
  message = "", 
  buttonText = "확인",
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="notification-modal">
        <div className={`notification-header notification-header-${type}`}>
          <div className="notification-icon">
            {getIcon()}
          </div>
          <h3 className={`notification-title notification-title-${type}`}>{title}</h3>
        </div>
        
        <div className="notification-body">
          <p className="notification-message">{message}</p>
        </div>
        
        <div className="notification-actions">
          <button 
            className={`btn btn-notification btn-notification-${type}`}
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

