import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { favoritesAPI, statisticsAPI } from '../../demo/services/apiService';
import './FavoritesSection.css';

const FavoritesSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await favoritesAPI.getUserFavorites(user.userId);
      setFavorites(response.data || []);
    } catch (error) {
      console.error('찜 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId) => {
    if (!window.confirm('찜 목록에서 삭제하시겠습니까?')) {
      return;
    }

    try {
      await favoritesAPI.removeFavorite(user.userId, restaurantId);
      loadFavorites();
    } catch (error) {
      console.error('찜 삭제 오류:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleRestaurantClick = async (favorite) => {
    try {
      await statisticsAPI.recordClick(favorite.restaurant.id, user?.userId);
    } catch (error) {
      console.error('클릭 기록 오류:', error);
    }

    navigate(`/restaurant/${favorite.restaurant.id}`, { 
      state: { restaurant: favorite.restaurant } 
    });
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (filter === 'ALL') return true;
    if (filter === 'RECENT') return true;
    if (filter === 'RATING') return favorite.restaurant.rating >= 4.0;
    return true;
  }).sort((a, b) => {
    if (filter === 'RECENT') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (filter === 'RATING') {
      return (b.restaurant.rating || 0) - (a.restaurant.rating || 0);
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
          <div className="empty-icon"></div>
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
        <div className="favorites-grid">
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="favorite-card">
              <div className="restaurant-image">
                <img 
                  src={convertToAbsoluteUrl(favorite.restaurant.mainImage || favorite.restaurant.imageUrl) || '/image-placeholder.svg'} 
                  alt={favorite.restaurant.restaurantName}
                  onError={(e) => {
                    e.target.src = '/image-placeholder.svg';
                  }}
                />
                <button 
                  className="remove-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.restaurant.id);
                  }}
                  title="찜 목록에서 삭제"
                >
                  ❌
                </button>
              </div>
              
              <div className="restaurant-info">
                <h4 onClick={() => handleRestaurantClick(favorite)}>
                  {favorite.restaurant.restaurantName}
                </h4>
                {favorite.restaurant.branchName && (
                  <p className="branch-name">{favorite.restaurant.branchName}</p>
                )}
                <p className="address">{favorite.restaurant.roadAddress}</p>
                
                <div className="restaurant-meta">
                  <div className="rating">
                    <span className="star">★</span>
                    <span>{favorite.restaurant.rating || '0.0'}</span>
                  </div>
                  <div className="category">
                    {favorite.restaurant.category || '음식점'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
