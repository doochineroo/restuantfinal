/**
 * React Query를 사용한 채팅 읽지 않은 개수 훅
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../demo/context/AuthContext';
import { chatAPI } from '../demo/services/chatAPI';

export const useChatUnreadCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chatUnreadCount', user?.userId],
    queryFn: async () => {
      if (!user?.userId) return 0;
      const response = await chatAPI.getUnreadChatRoomCount(user.userId);
      return response.data.count || 0;
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 20, // 20초 동안 캐시
    refetchInterval: 1000 * 30, // 30초마다 자동 갱신
    refetchOnWindowFocus: true, // 페이지 포커스 시 갱신
  });
};

