import React, { useState } from 'react';
import { getKoreanValue, getStatusValue } from '../utils/restaurantUtils';

const RestaurantDetailModal = ({ restaurant, isOpen, onClose, onReservation }) => {
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

        <div className="modal-body">
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
