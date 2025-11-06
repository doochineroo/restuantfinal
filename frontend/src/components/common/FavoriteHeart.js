import React from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { useUserFavoriteIds, useToggleFavorite } from '../../hooks/useUserFavorites';

/**
 * 재사용 가능한 찜하기 하트 버튼 컴포넌트
 * React Query를 사용하여 찜 목록을 캐시하고 중복 호출 방지
 */
const FavoriteHeart = ({ restaurantId, className = '', style = {} }) => {
  const { user } = useAuth();
  const { data: favoriteIds = [] } = useUserFavoriteIds();
  const toggleFavoriteMutation = useToggleFavorite();

  // 캐시된 찜 목록에서 확인 (개별 API 호출 없음)
  const isFavorited = favoriteIds.includes(restaurantId);
  const isLoadingFavorite = toggleFavoriteMutation.isPending;

  // 찜 토글 핸들러
  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!user?.userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await toggleFavoriteMutation.mutateAsync(restaurantId);
    } catch (error) {
      console.error('찜 토글 오류:', error);
      alert('찜하기 기능을 사용할 수 없습니다.');
    }
  };

  // 로그인하지 않은 경우 하트 버튼 표시 안 함
  if (!user?.userId) {
    return null;
  }

  return (
    <button
      className={`favorite-heart-btn ${isFavorited ? 'favorited' : ''} ${className}`}
      onClick={handleFavoriteToggle}
      disabled={isLoadingFavorite}
      title={isFavorited ? '찜 해제' : '찜하기'}
      style={style}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
};

export default FavoriteHeart;

