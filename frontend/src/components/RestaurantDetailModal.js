import React, { useState } from 'react';
import { getKoreanValue, getStatusValue } from '../utils/restaurantUtils';

const RestaurantDetailModal = ({ restaurant, isOpen, onClose, onReservation }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' 또는 'review'
  
  if (!isOpen || !restaurant) return null;

  const handleReservation = () => {
    onReservation(restaurant);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{restaurant.restaurantName}</h2>
          {restaurant.branchName && <h3>{restaurant.branchName}</h3>}
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            상세정보
          </button>
          <button 
            className={`modal-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            리뷰 <span className="review-count">(0)</span>
          </button>
        </div>

        <div className="modal-body">
          {/* 상세정보 탭 */}
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="detail-section">
                <h4>기본 정보</h4>
                <p><strong>주소:</strong> {restaurant.roadAddress || '정보없음'}</p>
                <p><strong>전화번호:</strong> {restaurant.phoneNumber || '정보없음'}</p>
              </div>

              <div className="detail-section">
                <h4>운영 정보</h4>
                <p><strong>영업시간:</strong> {restaurant.openingHours || '정보없음'}</p>
                <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보없음'}</p>
                <p><strong>상태:</strong> {getStatusValue(restaurant)}</p>
              </div>

              <div className="detail-section">
                <h4>메뉴 정보</h4>
                <p><strong>대표메뉴:</strong> {restaurant.mainMenu || '정보없음'}</p>
                <p><strong>다국어메뉴:</strong> {getKoreanValue(restaurant.multilingualMenu) === '가능' ? '제공' : '미제공'}</p>
              </div>

              <div className="detail-section">
                <h4>편의시설</h4>
                <div className="facility-grid">
                  <div className={`facility-item ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
                    주차 {getKoreanValue(restaurant.parking) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
                    WiFi {getKoreanValue(restaurant.wifi) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.petFriendly) === '가능' ? 'available' : 'unavailable'}`}>
                    반려동물 {getKoreanValue(restaurant.petFriendly) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.wheelchairAccessible) === '가능' ? 'available' : 'unavailable'}`}>
                    휠체어 {getKoreanValue(restaurant.wheelchairAccessible) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.smokingArea) === '가능' ? 'available' : 'unavailable'}`}>
                    흡연구역 {getKoreanValue(restaurant.smokingArea) === '가능' ? '있음' : '없음'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.privateRoom) === '가능' ? 'available' : 'unavailable'}`}>
                    개별실 {getKoreanValue(restaurant.privateRoom) === '가능' ? '있음' : '없음'}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>온라인 서비스</h4>
                <p><strong>홈페이지:</strong> {restaurant.homepageUrl || '정보없음'}</p>
                <p><strong>온라인예약:</strong> {restaurant.onlineReservation || '정보없음'}</p>
                <p><strong>해시태그:</strong> {restaurant.hashtags || '정보없음'}</p>
              </div>
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === 'review' && (
            <div className="tab-content review-tab-content">
              <div className="review-placeholder">
                <div className="review-placeholder-icon">📝</div>
                <h3>리뷰 기능 준비 중입니다</h3>
                <p>곧 고객님의 소중한 리뷰를 작성하실 수 있습니다.</p>
                <div className="review-preview">
                  <div className="review-stats">
                    <div className="review-stat-item">
                      <span className="stat-label">평균 평점</span>
                      <span className="stat-value">-</span>
                    </div>
                    <div className="review-stat-item">
                      <span className="stat-label">리뷰 수</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            닫기
          </button>
          <button className="modal-reservation-btn" onClick={handleReservation}>
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
