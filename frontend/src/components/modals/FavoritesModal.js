import React from 'react';
import FavoritesSection from '../sections/FavoritesSection';
import './FavoritesModal.css';

const FavoritesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="favorites-modal-overlay" onClick={handleBackdropClick}>
      <div className="favorites-modal">
        <div className="favorites-modal-header">
          <h2>찜한 맛집</h2>
          <button 
            className="favorites-modal-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        
        <div className="favorites-modal-body">
          <FavoritesSection />
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;

