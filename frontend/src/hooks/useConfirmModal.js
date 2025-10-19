import { useState } from 'react';

const useConfirmModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "확인",
    message: "정말로 진행하시겠습니까?",
    confirmText: "확인",
    cancelText: "취소",
    type: "default",
    onConfirm: null
  });

  const showConfirm = ({
    title = "확인",
    message = "정말로 진행하시겠습니까?",
    confirmText = "확인",
    cancelText = "취소",
    type = "default",
    onConfirm
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  };

  const hideConfirm = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideConfirm();
  };

  return {
    modalState,
    showConfirm,
    hideConfirm,
    handleConfirm
  };
};

export default useConfirmModal;

