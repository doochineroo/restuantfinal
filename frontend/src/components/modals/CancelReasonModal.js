import React, { useState } from 'react';
import './CancelReasonModal.css';

const CancelReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  restaurantName 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const cancelReasons = [
    { value: 'schedule_change', label: '일정 변경' },
    { value: 'weather', label: '날씨 문제' },
    { value: 'emergency', label: '긴급 상황' },
    { value: 'transportation', label: '교통 문제' },
    { value: 'group_size', label: '인원 변경' },
    { value: 'restaurant_issue', label: '식당 문제' },
    { value: 'other', label: '기타' }
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('취소 사유를 선택해주세요.');
      return;
    }

    const reason = selectedReason === 'other' ? customReason : cancelReasons.find(r => r.value === selectedReason)?.label;
    
    if (selectedReason === 'other' && !customReason.trim()) {
      alert('기타 사유를 입력해주세요.');
      return;
    }

    onConfirm(reason);
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
          <h2>예약 취소 사유</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="restaurant-info">
            <h3>{restaurantName}</h3>
            <p>예약 취소 사유를 선택해주세요.</p>
          </div>

          <div className="reason-selection">
            <h4>취소 사유 선택</h4>
            <div className="reason-options">
              {cancelReasons.map((reason) => (
                <label key={reason.value} className="reason-option">
                  <input
                    type="radio"
                    name="cancelReason"
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
                  placeholder="취소 사유를 자세히 입력해주세요..."
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
            취소 요청하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReasonModal;

