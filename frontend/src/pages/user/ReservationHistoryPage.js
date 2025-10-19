import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import axios from 'axios';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import ReservationDetailModal from '../../components/modals/ReservationDetailModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import NotificationModal from '../../components/common/NotificationModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import useNotification from '../../hooks/useNotification';
import { reservationAPI } from '../../demo/services/api';
import './ReservationHistoryPage.css';

const ReservationHistoryPage = () => {
  const { user } = useAuth();
  const { modalState, showConfirm, hideConfirm, handleConfirm } = useConfirmModal();
  const { notificationState, showSuccess, showError, hideNotification } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoOpenReview, setAutoOpenReview] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, COMPLETED
  const [sortBy, setSortBy] = useState('LATEST'); // LATEST, OLDEST
  const [expandedItems, setExpandedItems] = useState(new Set()); // 아코디언 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 5; // 페이지당 아이템 수

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/demo/reservations/user/${user.userId}`);
      setReservations(response.data);
    } catch (error) {
      console.error('예약 내역 로드 오류:', error);
      showError('예약 내역을 불러오는데 실패했습니다.', '로드 오류');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'APPROVED': return '승인됨';
      case 'REJECTED': return '거절됨';
      case 'CANCELLED': return '취소됨';
      case 'CANCELLED_PENDING': return '취소 요청 대기중';
      case 'COMPLETED': return '완료됨';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const getVisitStatusText = (visitStatus) => {
    switch (visitStatus) {
      case 'PENDING': return '대기중';
      case 'VISITED': return '방문함';
      case 'NO_SHOW': return '노쇼';
      case 'BLACKLISTED': return '블랙리스트';
      default: return '대기중';
    }
  };

  const getVisitStatusClass = (visitStatus) => {
    return `visit-${(visitStatus || 'PENDING').toLowerCase()}`;
  };

  const canWriteReview = (reservation) => {
    return reservation.status === 'COMPLETED' && 
           reservation.visitStatus === 'VISITED' && 
           !reservation.hasReview;
  };

  const handleReservationDetail = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setAutoOpenReview(false);
  };

  const handleWriteReview = (reservation) => {
    // 예약 상세 모달을 열어서 리뷰 쓰기 모달을 표시
    setSelectedReservation(reservation);
    setAutoOpenReview(true);
    setIsModalOpen(true);
  };

  const handleCancelReservation = async (reservationId, reason = '') => {
    try {
      await reservationAPI.cancel(reservationId);
      const message = reason ? `예약 취소 요청이 완료되었습니다.\n사유: ${reason}` : '예약 취소 요청이 완료되었습니다.';
      showSuccess(message, '취소 완료');
      loadReservations(); // 예약 목록 새로고침
    } catch (error) {
      console.error('예약 취소 오류:', error);
      showError('예약 취소에 실패했습니다.', '취소 실패');
    }
  };

  const handleApproveCancellation = async (reservationId) => {
    try {
      await reservationAPI.approveCancellation(reservationId);
      showSuccess('취소 요청이 승인되었습니다.', '승인 완료');
      loadReservations(); // 예약 목록 새로고침
    } catch (error) {
      console.error('취소 승인 오류:', error);
      showError('취소 승인에 실패했습니다.', '승인 실패');
    }
  };

  const handleRejectCancellation = async (reservationId, reason) => {
    try {
      await reservationAPI.rejectCancellation(reservationId, reason);
      showSuccess('취소 요청이 거절되었습니다.', '거절 완료');
      loadReservations(); // 예약 목록 새로고침
    } catch (error) {
      console.error('취소 거절 오류:', error);
      showError('취소 거절에 실패했습니다.', '거절 실패');
    }
  };

  // 아코디언 토글 함수
  const toggleExpanded = (reservationId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

  const filteredReservations = reservations
    .filter(reservation => {
      if (filter === 'ALL') return true;
      return reservation.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'LATEST') {
        return new Date(b.reservationDate) - new Date(a.reservationDate);
      } else {
        return new Date(a.reservationDate) - new Date(b.reservationDate);
      }
    });

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  // 페이지 변경 함수
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedItems(new Set()); // 페이지 변경 시 아코디언 닫기
  };

  // 필터나 정렬 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
    setExpandedItems(new Set());
  }, [filter, sortBy]);

  if (loading) {
    return (
      <div className="reservation-history-page">
        <TopNav />
        <MainNav />
        <div className="loading-container">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservation-history-page">
      <TopNav />
      <MainNav />
      
      <div className="reservation-history-container">
        

        {/* 필터 및 정렬 */}
        <div className="filter-section">
          <div className="filter-group">
            <label>상태별 필터:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">전체</option>
              <option value="PENDING">대기중</option>
              <option value="APPROVED">승인됨</option>
              <option value="REJECTED">거절됨</option>
              <option value="CANCELLED">취소됨</option>
              <option value="CANCELLED_PENDING">취소 요청 대기중</option>
              <option value="COMPLETED">완료됨</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>정렬:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="LATEST">최신순</option>
              <option value="OLDEST">오래된순</option>
            </select>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="reservations-list">
          {filteredReservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>예약 내역이 없습니다</h3>
              <p>새로운 예약을 만들어보세요!</p>
            </div>
          ) : (
            currentReservations.map((reservation) => {
              const isExpanded = expandedItems.has(reservation.id);
              return (
                <div key={reservation.id} className="reservation-list-item">
                  {/* 리스트 헤더 - 항상 보이는 부분 */}
                  <div 
                    className="reservation-list-header"
                    onClick={() => toggleExpanded(reservation.id)}
                  >
                    <div className="restaurant-info">
                      <h3>{reservation.restaurantName}</h3>
                      <div className="reservation-meta">
                        <span className="reservation-date">{reservation.reservationDate}</span>
                        <span className="reservation-time">{reservation.reservationTime}</span>
                        <span className="reservation-guests">{reservation.guests}명</span>
                      </div>
                    </div>
                    <div className="reservation-status">
                      <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                      <span className={`visit-status-badge ${getVisitStatusClass(reservation.visitStatus)}`}>
                        {getVisitStatusText(reservation.visitStatus)}
                      </span>
                      <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* 아코디언 내용 - 클릭 시 펼쳐지는 부분 */}
                  <div className={`reservation-list-details ${isExpanded ? 'expanded' : ''}`}>
                    <div className="detail-section">
                      <h4>예약 상세 정보</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">예약 날짜</span>
                          <span className="detail-value">{reservation.reservationDate}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">예약 시간</span>
                          <span className="detail-value">{reservation.reservationTime}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">인원 수</span>
                          <span className="detail-value">{reservation.guests}명</span>
                        </div>
                        {reservation.specialRequests && (
                          <div className="detail-item full-width">
                            <span className="detail-label">특별 요청</span>
                            <span className="detail-value">{reservation.specialRequests}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="reservation-actions">
                      <button 
                        className="btn-detail"
                        onClick={() => handleReservationDetail(reservation)}
                      >
                        상세보기
                      </button>
                      
                      {canWriteReview(reservation) && (
                        <button 
                          className="btn-review"
                          onClick={() => handleWriteReview(reservation)}
                        >
                          리뷰 작성
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 예약 상세보기 모달 */}
      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCancelReservation={handleCancelReservation}
        onApproveCancellation={handleApproveCancellation}
        onRejectCancellation={handleRejectCancellation}
        autoOpenReview={autoOpenReview}
      />

      {/* 공용 확인 팝업 */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />

      {/* 공용 알림 팝업 */}
      <NotificationModal
        isOpen={notificationState.isOpen}
        onClose={hideNotification}
        type={notificationState.type}
        title={notificationState.title}
        message={notificationState.message}
        buttonText={notificationState.buttonText}
        autoClose={notificationState.autoClose}
        autoCloseDelay={notificationState.autoCloseDelay}
      />
    </div>
  );
};

export default ReservationHistoryPage;
