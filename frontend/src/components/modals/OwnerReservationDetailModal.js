import React, { useState } from 'react';
import './OwnerReservationDetailModal.css';

const OwnerReservationDetailModal = ({ 
  isOpen, 
  onClose, 
  reservation, 
  onStatusChange, 
  onVisitStatusChange,
  onBlacklist,
  onNoShow
}) => {
  const [activeTab, setActiveTab] = useState('reservation-info');

  if (!isOpen || !reservation) return null;

  const handleStatusChange = (newStatus) => {
    onStatusChange(reservation.id, newStatus);
    onClose();
  };

  const handleVisitStatusChange = () => {
    onVisitStatusChange(reservation);
    onClose();
  };

  const handleBlacklist = () => {
    onBlacklist(reservation);
    onClose();
  };

  const handleNoShow = () => {
    onNoShow(reservation);
    onClose();
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'APPROVED': return '승인됨';
      case 'REJECTED': return '거절됨';
      case 'CANCELLED': return '취소됨';
      case 'COMPLETED': return '완료됨';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  const getVisitStatusText = (visitStatus) => {
    switch (visitStatus) {
      case 'VISITED': return '방문완료';
      case 'NO_SHOW': return '노쇼';
      case 'CANCELLED': return '취소됨';
      default: return '대기중';
    }
  };

  const getVisitStatusClass = (visitStatus) => {
    switch (visitStatus) {
      case 'VISITED': return 'visited';
      case 'NO_SHOW': return 'no-show';
      case 'CANCELLED': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <div className="owner-reservation-detail-modal-overlay">
      <div className="owner-reservation-detail-modal">
        <div className="modal-header">
          <h2>예약 상세 정보</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-item ${activeTab === 'reservation-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservation-info')}
          >
            예약정보
          </button>
          <button 
            className={`tab-item ${activeTab === 'user-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-info')}
          >
            예약자정보
          </button>
          <button 
            className={`tab-item ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            관리작업
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'reservation-info' && (
            <div className="info-grid">
              <div className="info-item">
                <label>예약 ID</label>
                <span className="value">{reservation.id}</span>
              </div>
              <div className="info-item">
                <label>예약 날짜</label>
                <span className="value">{reservation.reservationDate}</span>
              </div>
              <div className="info-item">
                <label>예약 시간</label>
                <span className="value">{reservation.reservationTime}</span>
              </div>
              <div className="info-item">
                <label>인원수</label>
                <span className="value">{reservation.guests}명</span>
              </div>
              <div className="info-item">
                <label>예약 상태</label>
                <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
              <div className="info-item">
                <label>방문 상태</label>
                <span className={`visit-status-badge ${getVisitStatusClass(reservation.visitStatus)}`}>
                  {getVisitStatusText(reservation.visitStatus)}
                </span>
              </div>
              <div className="info-item full-width">
                <label>특별 요청사항</label>
                <div className="special-requests">
                  <p>{reservation.specialRequests || '없음'}</p>
          </div>
              </div>
              {reservation.rejectionReason && (
                <div className="info-item full-width">
                  <label>거절 사유</label>
              <div className="rejection-reason">
                    <p>{reservation.rejectionReason}</p>
              </div>
            </div>
          )}
              {reservation.blacklistReason && (
                <div className="info-item full-width">
                  <label>블랙리스트 사유</label>
              <div className="blacklist-reason">
                    <p>{reservation.blacklistReason}</p>
              </div>
            </div>
          )}
              {reservation.noShowReason && (
                <div className="info-item full-width">
                  <label>노쇼 사유</label>
              <div className="no-show-reason">
                    <p>{reservation.noShowReason}</p>
                  </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'user-info' && (
            <div className="info-grid">
              <div className="info-item">
                <label>고객명</label>
                <span className="value">{reservation.userName}</span>
              </div>
              <div className="info-item">
                <label>전화번호</label>
                <span className="value">{reservation.userPhone}</span>
              </div>
              <div className="info-item">
                <label>이메일</label>
                <span className="value">{reservation.userEmail || '없음'}</span>
              </div>
              <div className="info-item">
                <label>예약 생성일</label>
                <span className="value">{reservation.createdAt}</span>
              </div>
              <div className="info-item">
                <label>마지막 수정일</label>
                <span className="value">{reservation.updatedAt}</span>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="action-groups">
              <div className="action-group">
                <h3>예약 상태 관리</h3>
                <div className="action-buttons">
                  {reservation.status === 'PENDING' && (
            <>
              <button 
                className="btn btn-success"
                        onClick={() => handleStatusChange('APPROVED')}
                      >
                        승인
              </button>
              <button 
                className="btn btn-danger"
                        onClick={() => handleStatusChange('REJECTED')}
                      >
                        거절
              </button>
            </>
          )}
                  {reservation.status === 'APPROVED' && (
            <button 
              className="btn btn-primary"
                      onClick={() => handleStatusChange('COMPLETED')}
                    >
                      완료 처리
            </button>
          )}
        </div>
      </div>

              <div className="action-group">
                <h3>방문 상태 관리</h3>
                <div className="action-buttons">
                  {reservation.visitStatus !== 'VISITED' && (
                    <button 
                      className="btn btn-success"
                      onClick={handleVisitStatusChange}
                    >
                      방문 완료 처리
                    </button>
                  )}
                  <button 
                    className="btn btn-warning"
                    onClick={handleNoShow}
                  >
                    노쇼 처리
              </button>
                </div>
              </div>

              <div className="action-group">
                <h3>고객 관리</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-danger"
                    onClick={handleBlacklist}
                  >
                    블랙리스트 추가
                  </button>
                </div>
                      </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
                </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerReservationDetailModal;