import { useState } from 'react';

const useNotification = () => {
  const [notificationState, setNotificationState] = useState({
    isOpen: false,
    type: "info",
    title: "알림",
    message: "",
    buttonText: "확인",
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showNotification = ({
    type = "info",
    title = "알림",
    message = "",
    buttonText = "확인",
    autoClose = false,
    autoCloseDelay = 3000
  }) => {
    setNotificationState({
      isOpen: true,
      type,
      title,
      message,
      buttonText,
      autoClose,
      autoCloseDelay
    });
  };

  const hideNotification = () => {
    setNotificationState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // 편의 함수들
  const showSuccess = (message, title = "성공", options = {}) => {
    showNotification({
      type: "success",
      title,
      message,
      autoClose: true,
      ...options
    });
  };

  const showError = (message, title = "오류", options = {}) => {
    showNotification({
      type: "error",
      title,
      message,
      ...options
    });
  };

  const showWarning = (message, title = "주의", options = {}) => {
    showNotification({
      type: "warning",
      title,
      message,
      ...options
    });
  };

  const showInfo = (message, title = "알림", options = {}) => {
    showNotification({
      type: "info",
      title,
      message,
      autoClose: true,
      ...options
    });
  };

  return {
    notificationState,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;

