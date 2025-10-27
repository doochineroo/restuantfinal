import React, { useState } from 'react';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';
import './SearchRestaurantList.css';

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
    <div className="search-restaurant-list-section">
      <h3>
        {hasSearched ? `검색 결과 (${filteredRestaurants.length}개)` : '식당 검색'}
        {activeFilterTab !== '전체' && hasSearched && (
          <span className="active-filter"> - {activeFilterTab} 필터 적용</span>
        )}
      </h3>
      <div className="search-restaurant-list">
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };
  
  // 매장 사진들 수집
  const restaurantPhotos = [
    convertToAbsoluteUrl(restaurant.mainImage),
    convertToAbsoluteUrl(restaurant.restaurantPhoto1),
    convertToAbsoluteUrl(restaurant.restaurantPhoto2),
    convertToAbsoluteUrl(restaurant.restaurantPhoto3),
    convertToAbsoluteUrl(restaurant.restaurantPhoto4),
    convertToAbsoluteUrl(restaurant.restaurantPhoto5)
  ].filter(Boolean);
  
  const imageUrl = restaurantPhotos.length > 0 ? restaurantPhotos[currentImageIndex] : '/image-placeholder.svg';
  
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      className={`search-restaurant-card ${isExpanded ? 'selected' : ''}`}
    >
      <div 
        className="search-restaurant-card-content"
        onClick={() => onCardClick(restaurant.id)}
      >
        {/* 가게 이미지 */}
        <div className="restaurant-image-container">
          {restaurantPhotos.length > 1 ? (
            <div className="mini-slider">
              <img 
                className="restaurant-image"
                src={imageUrl}
                alt={restaurant.restaurantName}
                onError={(e) => {
                  e.target.src = '/image-placeholder.svg';
                }}
              />
              <button 
                className="mini-slider-btn mini-slider-btn-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : restaurantPhotos.length - 1);
                }}
              >
                ‹
              </button>
              <button 
                className="mini-slider-btn mini-slider-btn-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev < restaurantPhotos.length - 1 ? prev + 1 : 0);
                }}
              >
                ›
              </button>
              <div className="mini-slider-indicators">
                {restaurantPhotos.map((_, index) => (
                  <span 
                    key={index}
                    className={`mini-indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <img 
              className="restaurant-image"
              src={imageUrl}
              alt={restaurant.restaurantName}
              onError={(e) => {
                e.target.src = '/image-placeholder.svg';
              }}
            />
          )}
        </div>
        
        <div className="restaurant-info">
          <div className="restaurant-name-container">
            <div className="restaurant-name">
              {restaurant.restaurantName}
              {restaurant.regionName && (
                <span className="restaurant-region"> ({restaurant.regionName})</span>
              )}
            </div>
            {restaurant.branchName && (
              <div className="restaurant-branch">{restaurant.branchName}</div>
            )}
          </div>
          
          {restaurant.roadAddress ? (
            <div className="restaurant-location">{restaurant.roadAddress}</div>
          ) : (
            <div className="restaurant-location no-location">위치 정보 없음</div>
          )}
        </div>
        
        <div className="expand-indicator">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      <div 
        className={`search-restaurant-card-details ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="detail-section">
          <p><strong>전화번호:</strong> {restaurant.phoneNumber || '정보없음'}</p>
          <p><strong>영업시간:</strong> {restaurant.openingHours || '정보없음'}</p>
          <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보없음'}</p>
        </div>

        <div className="detail-section">
          <h4>편의시설</h4>
          <div className="facility-badges">
          
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
        </div>

        <div className="card-buttons">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDetailView(restaurant);
            }}
          >
            상세보기
          </button>
          <button 
            className="btn btn-success btn-sm"
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

