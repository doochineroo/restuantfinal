/**
 * React Query를 사용한 사용자 찜 목록 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../demo/context/AuthContext';
import { favoritesAPI } from '../demo/services/apiService';

// 사용자의 찜한 식당 ID 목록 조회
export const useUserFavoriteIds = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorites', 'ids', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const response = await favoritesAPI.getUserFavorites(user.userId);
      // Restaurant 객체 배열에서 ID만 추출
      const restaurants = response.data || [];
      return restaurants.map(r => r.id);
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 (더 길게 설정)
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지
    refetchOnWindowFocus: false, // 찜 목록은 자주 변경되지 않으므로 포커스 시 갱신 안 함
    refetchOnMount: false, // 마운트 시에도 캐시 사용
    refetchOnReconnect: false, // 재연결 시에도 갱신 안 함
  });
};

// 찜 토글 뮤테이션
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (restaurantId) => {
      const response = await favoritesAPI.toggleFavorite(user.userId, restaurantId);
      return response.data.isFavorited;
    },
    onSuccess: () => {
      // 찜 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['favorites', 'ids', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'list', user?.userId] });
    },
  });
};

// 찜한 식당 목록 조회 (Restaurant 객체 배열)
export const useUserFavorites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorites', 'list', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const response = await favoritesAPI.getUserFavorites(user.userId);
      return response.data || [];
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60, // 1분 동안 캐시
    refetchOnWindowFocus: false,
  });
};

