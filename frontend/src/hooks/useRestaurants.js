/**
 * React Query를 사용한 식당 데이터 훅
 */
import { useQuery } from '@tanstack/react-query';
import { restaurantAPI, statisticsAPI } from '../demo/services/api';

// 모든 식당 조회
export const useAllRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: async () => {
      const response = await restaurantAPI.getAll();
      return response.data || [];
    },
    staleTime: 1000 * 30, // 30초 동안 캐시 (더 짧게 설정하여 빠른 갱신)
    refetchOnWindowFocus: false, // 포커스 시 갱신 안 함
    refetchOnMount: true, // 첫 마운트 시에는 항상 데이터 가져오기 (즉시 표시)
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지
  });
};

// 인기 식당 조회
export const usePopularRestaurants = (limit = 10) => {
  return useQuery({
    queryKey: ['restaurants', 'popular', limit],
    queryFn: async () => {
      const response = await statisticsAPI.getPopularRestaurantsWithCount(limit);
      return response.data || [];
    },
    staleTime: 1000 * 30, // 30초 동안 캐시
    refetchOnWindowFocus: false, // 포커스 시 갱신 안 함
    refetchOnMount: true, // 첫 마운트 시에는 항상 데이터 가져오기
  });
};

// 최근 인기 식당 조회
export const useRecentPopularRestaurants = (limit = 6) => {
  return useQuery({
    queryKey: ['restaurants', 'recent-popular', limit],
    queryFn: async () => {
      const response = await statisticsAPI.getRecentPopularRestaurants(limit);
      return response.data || [];
    },
    staleTime: 1000 * 30, // 30초 동안 캐시
    refetchOnWindowFocus: false, // 포커스 시 갱신 안 함
    refetchOnMount: true, // 첫 마운트 시에는 항상 데이터 가져오기
  });
};

