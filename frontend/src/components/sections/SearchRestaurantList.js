import React, { useState } from 'react';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';

const SearchRestaurantList = ({ 
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
            <SearchRestaurantCard
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

const SearchRestaurantCard = ({ restaurant, isExpanded, onCardClick, onReservation, onDetailView }) => {
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
        {/* 가게 사진 */}
        <div className="restaurant-image-container">
          {restaurantPhotos.length > 1 ? (
            <div className="mini-slider">
              <img 
                src={imageUrl} 
                alt={restaurant.restaurantName}
                className="restaurant-image"
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
              src={imageUrl} 
              alt={restaurant.restaurantName}
              className="restaurant-image"
              onError={(e) => {
                e.target.src = '/image-placeholder.svg';
              }}
            />
          )}
        </div>

        {/* 가게 정보 */}
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

          {/* 편의시설 배지 */}
          <div className="facility-badges">
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
        </div>

        {/* 액션 버튼들 */}
        <div className="restaurant-actions">
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

        {/* 확장/축소 표시 */}
        <div className="expand-indicator">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      {/* 확장된 상세 정보 */}
      <div 
        className={`search-restaurant-card-details ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="detail-section">
          <h4>운영 정보</h4>
          <p><strong>영업시간:</strong> {restaurant.openingHours || '정보없음'}</p>
          <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보없음'}</p>
          {restaurant.mainMenu && (
            <p><strong>대표메뉴:</strong> {restaurant.mainMenu}</p>
          )}
        </div>

        <div className="detail-section">
          <h4>추가 정보</h4>
          {restaurant.phoneNumber && (
            <p><strong>전화번호:</strong> {restaurant.phoneNumber}</p>
          )}
          {restaurant.homepageUrl && (
            <p><strong>홈페이지:</strong> <a href={restaurant.homepageUrl} target="_blank" rel="noopener noreferrer">{restaurant.homepageUrl}</a></p>
          )}
          {restaurant.hashtags && (
            <p><strong>해시태그:</strong> {restaurant.hashtags}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRestaurantList;
