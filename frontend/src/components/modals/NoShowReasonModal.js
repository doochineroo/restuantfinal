import React, { useState } from 'react';
import './CancelReasonModal.css';

const NoShowReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reservation 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const noShowReasons = [
    { value: 'no_contact', label: '연락 없음' },
    { value: 'late_arrival', label: '늦은 도착' },
    { value: 'group_change', label: '인원 변경' },
    { value: 'emergency', label: '긴급 상황' },
    { value: 'weather', label: '날씨 문제' },
    { value: 'transportation', label: '교통 문제' },
    { value: 'forgot', label: '예약 잊음' },
    { value: 'other', label: '기타' }
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('노쇼 사유를 선택해주세요.');
      return;
    }

    const reason = selectedReason === 'other' ? customReason : noShowReasons.find(r => r.value === selectedReason)?.label;
    
    if (selectedReason === 'other' && !customReason.trim()) {
      alert('기타 사유를 입력해주세요.');
      return;
    }

    onConfirm(reservation, reason);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="cancel-reason-modal">
        <div className="modal-header">
          <h2>노쇼 처리</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="restaurant-info">
            <h3>{reservation?.userName}님의 예약</h3>
            <div className="reservation-time">
              {reservation?.reservationDate} {reservation?.reservationTime}
            </div>
            <p>노쇼 사유를 선택해주세요.</p>
          </div>

          <div className="reason-selection">
            <h4>노쇼 사유 선택</h4>
            <div className="reason-options">
              {noShowReasons.map((reason) => (
                <label key={reason.value} className="reason-option">
                  <input
                    type="radio"
                    name="noShowReason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span className="reason-label">{reason.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'other' && (
              <div className="custom-reason">
                <label htmlFor="customReason">기타 사유</label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="노쇼 사유를 자세히 입력해주세요..."
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
          >
            노쇼 처리하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoShowReasonModal;
