import React, { useState, useEffect } from 'react';
import { useAuth } from '../demo/context/AuthContext';
import axios from 'axios';
import TopNav from '../components/TopNav';
import MainNav from '../components/MainNav';
import ReservationDetailModal from '../components/ReservationDetailModal';
import './ReservationHistoryPage.css';

const ReservationHistoryPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoOpenReview, setAutoOpenReview] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, COMPLETED
  const [sortBy, setSortBy] = useState('LATEST'); // LATEST, OLDEST

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
      alert('예약 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'APPROVED': return '승인됨';
      case 'REJECTED': return '거절됨';
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
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div className="restaurant-info">
                    <h3>{reservation.restaurantName}</h3>
                    {reservation.branchName && <p className="branch-name">{reservation.branchName}</p>}
                  </div>
                  <div className="reservation-status">
                    <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                    <span className={`visit-status-badge ${getVisitStatusClass(reservation.visitStatus)}`}>
                      {getVisitStatusText(reservation.visitStatus)}
                    </span>
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="detail-row">
                    <span className="detail-label">예약 날짜</span>
                    <span className="detail-value">{reservation.reservationDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">예약 시간</span>
                    <span className="detail-value">{reservation.reservationTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">인원</span>
                    <span className="detail-value">{reservation.guests}명</span>
                  </div>
                  {reservation.specialRequests && (
                    <div className="detail-row">
                      <span className="detail-label">특별 요청</span>
                      <span className="detail-value">{reservation.specialRequests}</span>
                    </div>
                  )}
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
                  
                  {reservation.status === 'PENDING' && (
                    <button 
                      className="btn-cancel"
                      onClick={() => {
                        if (window.confirm('예약을 취소하시겠습니까?')) {
                          // 예약 취소 로직
                          alert('예약 취소 기능은 준비 중입니다.');
                        }
                      }}
                    >
                      예약 취소
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 예약 상세보기 모달 */}
      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        autoOpenReview={autoOpenReview}
      />
    </div>
  );
};

export default ReservationHistoryPage;
