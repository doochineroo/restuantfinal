import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { statisticsAPI } from '../../demo/services/apiService';
import { getImageUrl } from '../../constants/config/apiConfig';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';
import FavoriteHeart from '../common/FavoriteHeart';
import RestaurantDetailModal from '../modals/RestaurantDetailModal';
import { useUserFavorites } from '../../hooks/useUserFavorites';
import './FavoritesSection.css';

const FavoritesSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: favorites = [], isLoading: loading } = useUserFavorites();
  const [filter, setFilter] = useState('ALL');
  const [expandedCard, setExpandedCard] = useState(null);
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    return getImageUrl(url);
  };

  const handleRemoveFavorite = async (restaurantId) => {
    if (!window.confirm('찜 목록에서 삭제하시겠습니까?')) {
      return;
    }

    // React Query가 자동으로 갱신하므로 별도 처리 불필요
    // FavoriteHeart의 toggleFavorite이 이미 처리함
  };

  const toggleCardExpansion = (restaurantId) => {
    setExpandedCard(expandedCard === restaurantId ? null : restaurantId);
  };

  const handleReservation = (restaurant, event) => {
    event.stopPropagation();
    try {
      navigate('/reservation', { state: { restaurant } });
    } catch (error) {
      console.error('예약 페이지 이동 오류:', error);
      alert('예약 페이지로 이동하는데 실패했습니다.');
    }
  };

  const handleDetailView = (restaurant) => {
    setModalRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalRestaurant(null);
  };

  const handleModalReservation = (restaurant) => {
    handleReservation(restaurant, { stopPropagation: () => {} });
    handleCloseModal();
  };

  const filteredFavorites = favorites.filter(restaurant => {
    if (filter === 'ALL') return true;
    if (filter === 'RECENT') return true;
    if (filter === 'RATING') return true; // 모든 식당 표시, 정렬만 함
    return true;
  }).sort((a, b) => {
    if (filter === 'RECENT') {
      // 최근 추가된 순서는 createdAt이 없으므로 ID 기준으로 정렬
      return (b.id || 0) - (a.id || 0);
    }
    if (filter === 'RATING') {
      // 평점 높은 순으로 정렬 (평점이 없는 경우 0으로 처리)
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="favorites-section">
        <div className="loading-container">
          <div className="loading-spinner">찜 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-section">
      <div className="favorites-header">
        <h3>찜한 맛집</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            전체
          </button>
          <button 
            className={`filter-btn ${filter === 'RECENT' ? 'active' : ''}`}
            onClick={() => setFilter('RECENT')}
          >
            최근 추가
          </button>
          <button 
            className={`filter-btn ${filter === 'RATING' ? 'active' : ''}`}
            onClick={() => setFilter('RATING')}
          >
            평점 높은 순
          </button>
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h4>찜한 맛집이 없습니다</h4>
          <p>마음에 드는 맛집을 찜해보세요!</p>
          <button 
            className="btn-explore"
            onClick={() => navigate('/search')}
          >
            맛집 둘러보기
          </button>
        </div>
      ) : (
        <div className="favorites-list">
          {filteredFavorites.map((restaurant, index) => (
            <FavoriteRestaurantCard
              key={restaurant.id || `restaurant-${index}`}
              restaurant={restaurant}
              isExpanded={expandedCard === restaurant.id}
              onCardClick={toggleCardExpansion}
              onReservation={handleReservation}
              onDetailView={handleDetailView}
              onRemoveFavorite={handleRemoveFavorite}
              user={user}
            />
          ))}
        </div>
      )}

      {/* 상세정보 모달 */}
      {modalRestaurant && (
        <RestaurantDetailModal
          restaurant={modalRestaurant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onReservation={handleModalReservation}
        />
      )}
    </div>
  );
};

// 찜한 맛집 카드 컴포넌트 (SearchRestaurantCard 스타일 재사용)
const FavoriteRestaurantCard = ({ 
  restaurant, 
  isExpanded, 
  onCardClick, 
  onReservation, 
  onDetailView,
  onRemoveFavorite,
  user
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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
          {/* 찜하기 하트 버튼 */}
          <FavoriteHeart restaurantId={restaurant.id} />
              </div>
              
        {/* 가게 정보 */}
              <div className="restaurant-info">
          <div className="restaurant-name-container">
            <div className="restaurant-name">
              {restaurant.restaurantName}{' '}
              <span className="restaurant-rating-inline">
                <span className="star-icon">★</span> {(restaurant.rating || 0).toFixed(1)}
                <span className="review-count"> ({(restaurant.reviewCount || 0)})</span>
              </span>
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

export default FavoritesSection;
