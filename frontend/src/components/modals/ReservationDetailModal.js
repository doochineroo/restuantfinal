import React, { useState, useEffect } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import CancelReasonModal from './CancelReasonModal';
import AppealModal from './AppealModal';
import useConfirmModal from '../../hooks/useConfirmModal';
import { reservationAPI } from '../../demo/services/api';
import { API_ENDPOINTS } from '../../constants/config/apiConfig';
import axios from 'axios';
import './ReservationDetailModal.css';

const ReservationDetailModal = ({ 
  reservation, 
  isOpen, 
  onClose, 
  onCancelReservation, 
  onApproveCancellation, 
  onRejectCancellation,
  autoOpenReview = false
}) => {
  const { modalState, showConfirm, hideConfirm, handleConfirm } = useConfirmModal();
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [detailedReservation, setDetailedReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 리뷰 작성 상태
  const [reviewData, setReviewData] = useState({
    rating: 5,
    content: '',
    images: []
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // 예약 상세 정보 가져오기
  useEffect(() => {
    if (isOpen && reservation?.id) {
      loadDetailedReservation();
    }
  }, [isOpen, reservation?.id]);

  // 리뷰 모달 자동 열기
  useEffect(() => {
    if (autoOpenReview && detailedReservation && !loading) {
      setShowReviewModal(true);
    }
  }, [autoOpenReview, detailedReservation, loading]);

  const loadDetailedReservation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.DEMO}/reservations/${reservation.id}`);
      setDetailedReservation(response.data);
    } catch (error) {
      console.error('예약 상세 정보 로드 오류:', error);
      // 오류 발생 시 기존 reservation 데이터 사용
      setDetailedReservation(reservation);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !reservation) return null;

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

  // 취소 사유 선택 핸들러
  const handleCancelWithReason = (reason) => {
    onCancelReservation && onCancelReservation(detailedReservation.id, reason);
  };

  // 이의 제기 핸들러
  const handleAppealSubmit = async (appealData) => {
    try {
      await reservationAPI.submitAppeal(detailedReservation.id, appealData);
      alert('이의 제기가 접수되었습니다.');
    } catch (error) {
      console.error('이의 제기 오류:', error);
      alert('이의 제기에 실패했습니다.');
    }
  };

  // 리뷰 작성 핸들러
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const reviewPayload = {
        restaurantId: detailedReservation.restaurantId,
        userId: detailedReservation.userId,
        reservationId: detailedReservation.id,
        rating: reviewData.rating,
        content: reviewData.content,
        userName: detailedReservation.userName,
        images: reviewData.images
      };

      await axios.post(`${API_ENDPOINTS.DEMO}/reviews`, reviewPayload);
      
      alert('리뷰가 성공적으로 작성되었습니다!');
      setShowReviewModal(false);
      setReviewData({ rating: 5, content: '', images: [] });
      
    } catch (error) {
      console.error('리뷰 작성 오류:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 리뷰 데이터 변경 핸들러
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 별점 변경 핸들러
  const handleRatingChange = (rating) => {
    setReviewData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  // 별점 렌더링 함수
  const renderStars = (rating, onChange) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'active' : ''}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const maxImages = 5;
    const currentImageCount = reviewData.images.length;
    const remainingSlots = maxImages - currentImageCount;
    
    if (remainingSlots <= 0) {
      alert('최대 5장까지만 업로드할 수 있습니다.');
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`${remainingSlots}장만 업로드됩니다. (최대 5장 제한)`);
    }
    
    try {
      setUploadingImages(true);
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_ENDPOINTS.DEMO}/reviews/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setReviewData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImages(false);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = (index) => {
    setReviewData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 로딩 중이거나 상세 정보가 없으면 로딩 표시
  if (loading || !detailedReservation) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="reservation-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>예약 상세 정보</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="reservation-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <h2>예약 상세 정보</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 예약 정보 카드 */}
        <div className="reservation-info-card">
          <div className="info-section">
            <h3>예약 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">예약 날짜</span>
                <span className="value">{detailedReservation.reservationDate}</span>
              </div>
              <div className="info-item">
                <span className="label">예약 시간</span>
                <span className="value">{detailedReservation.reservationTime}</span>
              </div>
              <div className="info-item">
                <span className="label">인원 수</span>
                <span className="value">{detailedReservation.guests}명</span>
              </div>
              <div className="info-item">
                <span className="label">예약 상태</span>
                <span className={`status-badge ${getStatusClass(detailedReservation.status)}`}>
                  {getStatusText(detailedReservation.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>예약자 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">이름</span>
                <span className="value">{detailedReservation.userName}</span>
              </div>
              <div className="info-item">
                <span className="label">이메일</span>
                <span className="value">{detailedReservation.userEmail || '정보없음'}</span>
              </div>
              <div className="info-item">
                <span className="label">전화번호</span>
                <span className="value">{detailedReservation.userPhone}</span>
              </div>
              <div className="info-item">
                <span className="label">방문 상태</span>
                <span className={`visit-status-badge ${getVisitStatusClass(detailedReservation.visitStatus)}`}>
                  {getVisitStatusText(detailedReservation.visitStatus)}
                </span>
              </div>
            </div>
          </div>

          {detailedReservation.specialRequests && (
            <div className="info-section">
              <h3>특별 요청사항</h3>
              <div className="special-requests">
                <p>{detailedReservation.specialRequests}</p>
              </div>
            </div>
          )}

          {detailedReservation.rejectionReason && (
            <div className="info-section">
              <h3>거절 사유</h3>
              <div className="rejection-reason">
                <p>{detailedReservation.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* 블랙리스트 사유 표시 */}
          {detailedReservation.visitStatus === 'BLACKLISTED' && detailedReservation.blacklistReason && (
            <div className="info-section">
              <h3>블랙리스트 사유</h3>
              <div className="blacklist-reason">
                <p>{detailedReservation.blacklistReason}</p>
              </div>
            </div>
          )}

          {/* 노쇼 사유 표시 */}
          {detailedReservation.visitStatus === 'NO_SHOW' && detailedReservation.noShowReason && (
            <div className="info-section">
              <h3>노쇼 사유</h3>
              <div className="no-show-reason">
                <p>{detailedReservation.noShowReason}</p>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3>예약 통계</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">예약 생성일</span>
                <span className="value">{detailedReservation.createdAt ? new Date(detailedReservation.createdAt).toLocaleString() : '정보없음'}</span>
              </div>
              <div className="info-item">
                <span className="label">마지막 수정일</span>
                <span className="value">{detailedReservation.updatedAt ? new Date(detailedReservation.updatedAt).toLocaleString() : '정보없음'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
          
          {/* 예약 취소 버튼 - PENDING 또는 APPROVED 상태일 때만 표시 */}
          {(detailedReservation.status === 'PENDING' || detailedReservation.status === 'APPROVED') && (
            <button 
              className="btn btn-danger"
              onClick={() => setShowCancelReasonModal(true)}
            >
              예약 취소
            </button>
          )}
          
          {/* 취소 요청 승인/거절 버튼 - CANCELLED_PENDING 상태일 때만 표시 */}
          {detailedReservation.status === 'CANCELLED_PENDING' && (
            <>
              <button 
                className="btn btn-success"
                onClick={() => {
                  showConfirm({
                    title: "취소 승인",
                    message: "취소 요청을 승인하시겠습니까?",
                    confirmText: "승인하기",
                    cancelText: "돌아가기",
                    type: "success",
                    onConfirm: () => onApproveCancellation && onApproveCancellation(detailedReservation.id)
                  });
                }}
              >
                취소 승인
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => {
                  showConfirm({
                    title: "취소 거절",
                    message: "취소 요청을 거절하시겠습니까?",
                    confirmText: "거절하기",
                    cancelText: "돌아가기",
                    type: "warning",
                    onConfirm: () => {
                      const reason = prompt('취소 거절 사유를 입력해주세요:');
                      if (reason && reason.trim()) {
                        onRejectCancellation && onRejectCancellation(detailedReservation.id, reason);
                      }
                    }
                  });
                }}
              >
                취소 거절
              </button>
            </>
          )}
          
          {/* 방문 확인 버튼 - APPROVED 상태이고 방문 대기일 때만 표시 */}
          {detailedReservation.status === 'APPROVED' && detailedReservation.visitStatus === 'PENDING' && (
            <button className="btn btn-primary">
              방문 확인
            </button>
          )}

          {/* 리뷰 쓰기 버튼 - 완료된 예약일 때만 표시 */}
          {detailedReservation.status === 'COMPLETED' && detailedReservation.visitStatus === 'VISITED' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowReviewModal(true)}
            >
              리뷰 쓰기
            </button>
          )}

          {/* 이의 제기 버튼 - 블랙리스트 상태일 때만 표시 */}
          {detailedReservation.visitStatus === 'BLACKLISTED' && (
            <button 
              className="btn btn-warning"
              onClick={() => setShowAppealModal(true)}
            >
              이의 제기
            </button>
          )}
        </div>
      </div>

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

      {/* 취소 사유 선택 모달 */}
      <CancelReasonModal
        isOpen={showCancelReasonModal}
        onClose={() => setShowCancelReasonModal(false)}
        onConfirm={handleCancelWithReason}
        restaurantName={detailedReservation.restaurantName}
      />

      {/* 이의 제기 모달 */}
      <AppealModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        onSubmit={handleAppealSubmit}
        blacklistReason={detailedReservation.blacklistReason}
        reservationId={detailedReservation.id}
      />

      {/* 리뷰 쓰기 모달 */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>리뷰 작성</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-section">
                <h3>전체 평점</h3>
                {renderStars(reviewData.rating, handleRatingChange)}
              </div>

              <div className="form-section">
                <h3>리뷰 내용</h3>
                <textarea
                  name="content"
                  value={reviewData.content}
                  onChange={handleReviewInputChange}
                  placeholder="식당에 대한 솔직한 후기를 작성해주세요..."
                  rows="6"
                  className="review-textarea"
                  required
                />
                <div className="character-count">
                  {reviewData.content.length}/500자
                </div>
              </div>

              <div className="form-section">
                <h3>사진 첨부</h3>
                <div className="image-upload-section">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="image-upload-btn">
                    {uploadingImages ? '업로드 중...' : '사진 선택'}
                  </label>
                  <span className="image-upload-hint">최대 5장까지 업로드 가능</span>
                </div>
                
                {reviewData.images.length > 0 && (
                  <div className="uploaded-images">
                    {reviewData.images.map((imageUrl, index) => (
                      <div key={index} className="uploaded-image-item">
                        <img src={`http://localhost:8080${imageUrl}`} alt={`리뷰 이미지 ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleImageRemove(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? '작성 중...' : '리뷰 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetailModal;
