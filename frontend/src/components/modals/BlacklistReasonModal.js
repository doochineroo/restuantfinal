import React, { useState } from 'react';
import './CancelReasonModal.css';

const BlacklistReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reservation 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const blacklistReasons = [
    { value: 'no_show_multiple', label: '반복적인 노쇼' },
    { value: 'rude_behavior', label: '무례한 행동' },
    { value: 'damage_property', label: '시설물 파손' },
    { value: 'disturb_others', label: '다른 고객 방해' },
    { value: 'refuse_payment', label: '결제 거부' },
    { value: 'false_reservation', label: '허위 예약' },
    { value: 'inappropriate_behavior', label: '부적절한 행동' },
    { value: 'other', label: '기타' }
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('블랙리스트 사유를 선택해주세요.');
      return;
    }

    const reason = selectedReason === 'other' ? customReason : blacklistReasons.find(r => r.value === selectedReason)?.label;
    
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
          <h2>블랙리스트 추가</h2>
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
            <div className="warning-message">
              <p>⚠️ 이 사용자를 블랙리스트에 추가하면 해당 식당에 대한 예약이 제한됩니다.</p>
            </div>
          </div>

          <div className="reason-selection">
            <h4>블랙리스트 사유 선택</h4>
            <div className="reason-options">
              {blacklistReasons.map((reason) => (
                <label key={reason.value} className="reason-option">
                  <input
                    type="radio"
                    name="blacklistReason"
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
                  placeholder="블랙리스트 사유를 자세히 입력해주세요..."
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
            블랙리스트 추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlacklistReasonModal;
