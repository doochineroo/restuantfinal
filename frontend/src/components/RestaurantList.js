import React from 'react';
import { getKoreanValue, getStatusValue } from '../utils/restaurantUtils';

const RestaurantList = ({ 
  hasSearched, 
  filteredRestaurants, 
  activeFilterTab, 
  expandedCard, 
  onCardClick, 
  onReservation 
}) => {
  return (
    <div className="restaurant-list-section">
      <h3>
        {hasSearched ? `검색 결과 (${filteredRestaurants.length}개)` : '식당 검색'}
        {activeFilterTab !== '전체' && hasSearched && (
          <span className="active-filter"> - {activeFilterTab} 필터 적용</span>
        )}
      </h3>
      <div className="restaurant-list">
        {!hasSearched ? (
          <div className="no-results">
            <p>식당을 검색해주세요.</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="no-results">
            <p>해당 조건에 맞는 식당이 없습니다.</p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id || `restaurant-${index}`}
              restaurant={restaurant}
              isExpanded={expandedCard === restaurant.id}
              onCardClick={onCardClick}
              onReservation={onReservation}
            />
          ))
        )}
      </div>
    </div>
  );
};

const RestaurantCard = ({ restaurant, isExpanded, onCardClick, onReservation }) => {
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      className={`restaurant-card ${isExpanded ? 'selected' : ''}`}
    >
      <div 
        className="restaurant-card-header"
        onClick={() => onCardClick(restaurant.id)}
      >
        <div className="restaurant-name">{restaurant.restaurantName}</div>
        {restaurant.branchName && (
          <div className="restaurant-branch">{restaurant.branchName}</div>
        )}
        <div className="restaurant-info">
          <span className={`info-badge ${
            getStatusValue(restaurant) === '운영중' ? 'status-operating' : 
            getStatusValue(restaurant) === '운영중지예상' ? 'status-closed' : 
            'unavailable'
          }`}>
            {getStatusValue(restaurant)}
          </span>
          <span className={`info-badge ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
            주차 {getKoreanValue(restaurant.parking)}
          </span>
          <span className={`info-badge ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
            WiFi {getKoreanValue(restaurant.wifi)}
          </span>
          <span className={`info-badge ${getKoreanValue(restaurant.kidsZone) === '가능' ? 'available' : 'unavailable'}`}>
            키즈존 {getKoreanValue(restaurant.kidsZone)}
          </span>
          <span className={`info-badge ${getKoreanValue(restaurant.delivery) === '가능' ? 'available' : 'unavailable'}`}>
            배달 {getKoreanValue(restaurant.delivery)}
          </span>
        </div>
        <div className="restaurant-main-menu">
          {restaurant.mainMenu || '메뉴 정보 없음'}
        </div>
        {restaurant.roadAddress ? (
          <div className="restaurant-location">{restaurant.roadAddress}</div>
        ) : (
          <div className="restaurant-location no-location">...</div>
        )}
        <div className="expand-indicator">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      <div 
        className={`restaurant-card-details ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="detail-section">
          <h4>위치 정보</h4>
          <p><strong>지역:</strong> {restaurant.regionName || '정보 없음'}</p>
          {restaurant.roadAddress && (
            <p><strong>주소:</strong> {restaurant.roadAddress}</p>
          )}
          {restaurant.areaInfo && (
            <p><strong>상세지역:</strong> {restaurant.areaInfo}</p>
          )}
        </div>

        <div className="detail-section">
          <h4>메뉴 정보</h4>
          <p><strong>주요 메뉴:</strong> {restaurant.mainMenu || '정보 없음'}</p>
          <p><strong>다국어 메뉴:</strong> {getKoreanValue(restaurant.multilingualMenu)}</p>
        </div>

        <div className="detail-section">
          <h4>운영 정보</h4>
          <p><strong>영업시간:</strong> {restaurant.openingHours || '정보 없음'}</p>
          <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보 없음'}</p>
          <p><strong>상태:</strong> {getStatusValue(restaurant)}</p>
        </div>

        <div className="detail-section">
          <h4>편의시설</h4>
          <div className="facility-grid">
            <span className={`facility-item ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
              주차 {getKoreanValue(restaurant.parking)}
            </span>
            <span className={`facility-item ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
              WiFi {getKoreanValue(restaurant.wifi)}
            </span>
            <span className={`facility-item ${getKoreanValue(restaurant.kidsZone) === '가능' ? 'available' : 'unavailable'}`}>
              키즈존 {getKoreanValue(restaurant.kidsZone)}
            </span>
            <span className={`facility-item ${getKoreanValue(restaurant.delivery) === '가능' ? 'available' : 'unavailable'}`}>
              배달 {getKoreanValue(restaurant.delivery)}
            </span>
            <span className={`facility-item ${getKoreanValue(restaurant.smartOrder) === '가능' ? 'available' : 'unavailable'}`}>
              스마트오더 {getKoreanValue(restaurant.smartOrder)}
            </span>
          </div>
        </div>

        <div className="reservation-section">
          <button 
            className="reservation-btn"
            onClick={(e) => onReservation(restaurant, e)}
          >
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantList;

