import React, { useState } from 'react';
import './AppealModal.css';

const AppealModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  blacklistReason,
  reservationId 
}) => {
  const [appealType, setAppealType] = useState('');
  const [appealContent, setAppealContent] = useState('');

  const appealTypes = [
    { value: 'mistake', label: '실수로 인한 블랙리스트' },
    { value: 'unfair', label: '부당한 블랙리스트' },
    { value: 'misunderstanding', label: '오해로 인한 블랙리스트' },
    { value: 'technical_issue', label: '기술적 문제' },
    { value: 'other', label: '기타' }
  ];

  const handleSubmit = () => {
    if (!appealType || !appealContent.trim()) {
      alert('이의 제기 유형과 내용을 모두 입력해주세요.');
      return;
    }

    onSubmit({
      reservationId,
      appealType,
      appealContent: appealContent.trim(),
      blacklistReason
    });
    
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
      <div className="appeal-modal">
        <div className="modal-header">
          <h2>이의 제기</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="blacklist-info">
            <h3>블랙리스트 사유</h3>
            <div className="reason-display">
              <p>{blacklistReason || '사유가 명시되지 않았습니다.'}</p>
            </div>
          </div>

          <div className="appeal-form">
            <h4>이의 제기 유형</h4>
            <div className="appeal-types">
              {appealTypes.map((type) => (
                <label key={type.value} className="appeal-type-option">
                  <input
                    type="radio"
                    name="appealType"
                    value={type.value}
                    checked={appealType === type.value}
                    onChange={(e) => setAppealType(e.target.value)}
                  />
                  <span className="appeal-type-label">{type.label}</span>
                </label>
              ))}
            </div>

            <div className="appeal-content">
              <label htmlFor="appealContent">이의 제기 내용</label>
              <textarea
                id="appealContent"
                value={appealContent}
                onChange={(e) => setAppealContent(e.target.value)}
                placeholder="블랙리스트 처리에 대한 이의 제기 내용을 자세히 작성해주세요..."
                rows={5}
              />
              <div className="character-count">
                {appealContent.length}/500자
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!appealType || !appealContent.trim()}
          >
            이의 제기하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppealModal;

