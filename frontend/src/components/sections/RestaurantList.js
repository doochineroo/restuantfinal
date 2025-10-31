import React, { useState } from 'react';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';
import { getImageUrl } from '../../constants/config/apiConfig';
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
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 5;
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
  const startIndex = (currentPage - 1) * restaurantsPerPage;
  const endIndex = startIndex + restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 현재 페이지의 식당들만 렌더링
  return (
    <div className="search-restaurant-list-section">
      <h3>
        {activeFilterTab !== '전체' && hasSearched && (
          <span className="active-filter">{activeFilterTab} 필터 적용</span>
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
          <>
            {currentRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id || `restaurant-${index}`}
                restaurant={restaurant}
                isExpanded={expandedCard === restaurant.id}
                onCardClick={onCardClick}
                onReservation={onReservation}
                onDetailView={onDetailView}
              />
            ))}
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const RestaurantCard = ({ restaurant, isExpanded, onCardClick, onReservation, onDetailView }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    return getImageUrl(url);
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

