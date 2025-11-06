/**
 * React Query를 사용한 알림 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../demo/context/AuthContext';
import { API_ENDPOINTS } from '../constants/config/apiConfig';
import axios from 'axios';

// 알림 목록 조회
export const useNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const response = await axios.get(`${API_ENDPOINTS.NOTIFICATIONS}/${user.userId}`);
      return response.data || [];
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60, // 1분 동안 캐시
    refetchInterval: 1000 * 60, // 1분마다 자동 갱신
    refetchOnWindowFocus: true, // 페이지 포커스 시 갱신
  });
};

// 읽지 않은 알림 개수 조회
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unreadNotificationCount', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return 0;
      const response = await axios.get(`${API_ENDPOINTS.NOTIFICATIONS}/${user.userId}/unread-count`);
      return response.data.count || 0;
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 30, // 30초 동안 캐시
    refetchInterval: 1000 * 60, // 1분마다 자동 갱신
    refetchOnWindowFocus: true,
  });
};

// 알림 읽음 처리
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      await axios.put(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
    },
    onSuccess: () => {
      // 알림 목록과 읽지 않은 개수 모두 갱신
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', user?.userId] });
    },
  });
};

// 모든 알림 읽음 처리
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      await axios.put(`${API_ENDPOINTS.NOTIFICATIONS}/${user.userId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', user?.userId] });
    },
  });
};

// 알림 삭제
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      await axios.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount', user?.userId] });
    },
  });
};

