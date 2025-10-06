import React from 'react';
import { getKoreanValue, getStatusValue } from '../utils/restaurantUtils';

const RestaurantList = ({ 
  hasSearched, 
  filteredRestaurants, 
  activeFilterTab, 
  expandedCard, 
  onCardClick, 
  onReservation,
  onDetailView 
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
              onDetailView={onDetailView}
            />
          ))
        )}
      </div>
    </div>
  );
};

const RestaurantCard = ({ restaurant, isExpanded, onCardClick, onReservation, onDetailView }) => {
  // 카드 렌더링 시 데이터 로그
  console.log('카드 렌더링:', {
    id: restaurant.id,
    name: restaurant.restaurantName,
    branch: restaurant.branchName,
    region: restaurant.regionName,
    parking: restaurant.parking,
    wifi: restaurant.wifi,
    mainMenu: restaurant.mainMenu,
    address: restaurant.roadAddress
  });
  
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      className={`restaurant-card ${isExpanded ? 'selected' : ''}`}
    >
      <div 
        className="restaurant-card-header"
        onClick={() => onCardClick(restaurant.id)}
      >
        <div className="restaurant-name-container">
          <div className="restaurant-name">{restaurant.restaurantName}</div>
        </div>
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
          <h4>상세 주소</h4>
          <p><strong>주소:</strong> {restaurant.roadAddress || '주소 정보 없음'}</p>
        </div>

        <div className="detail-section">
          <h4>운영 정보</h4>
          <p><strong>영업시간:</strong> {restaurant.openingHours || '정보없음'}</p>
          <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보없음'}</p>
        </div>

        <div className="card-buttons">
          <button 
            className="detail-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDetailView(restaurant);
            }}
          >
            상세보기
          </button>
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

