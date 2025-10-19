/**
 * 새로운 API 서비스
 * - Statistics (인기 식당, 인기 검색어)
 * - Favorites (찜)
 * - Notifications (알림)
 * - Restaurants (카테고리 검색)
 */
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// ============ Statistics API ============
export const statisticsAPI = {
  // 식당 클릭 기록
  recordClick: (restaurantId, userId = null) => {
    return axios.post(`${API_BASE}/statistics/click`, {
      restaurantId,
      userId
    });
  },

  // 인기 식당 조회 (상위 N개)
  getPopularRestaurants: (limit = 10) => {
    return axios.get(`${API_BASE}/statistics/popular-restaurants`, {
      params: { limit }
    });
  },

  // 인기 식당 조회 (클릭 수와 함께)
  getPopularRestaurantsWithCount: (limit = 10) => {
    return axios.get(`${API_BASE}/statistics/popular-restaurants-with-count`, {
      params: { limit }
    });
  },

  // 최근 7일 인기 식당
  getRecentPopularRestaurants: (limit = 10) => {
    return axios.get(`${API_BASE}/statistics/recent-popular-restaurants`, {
      params: { limit }
    });
  },

  // 오늘 인기 식당
  getTodayPopularRestaurants: (limit = 10) => {
    return axios.get(`${API_BASE}/statistics/today-popular-restaurants`, {
      params: { limit }
    });
  },

  // 검색어 기록
  recordSearch: (keyword, userId = null) => {
    return axios.post(`${API_BASE}/statistics/search`, {
      keyword
    });
  },

  // 인기 검색어 조회
  getPopularKeywords: (limit = 10) => {
    return axios.get(`${API_BASE}/statistics/popular-keywords`, {
      params: { limit }
    });
  },
};

// ============ Favorites API ============
export const favoritesAPI = {
  // 찜 목록 조회
  getUserFavorites: (userId) => {
    return axios.get(`${API_BASE}/favorites/${userId}`);
  },

  // 찜 추가
  addFavorite: (userId, restaurantId) => {
    return axios.post(`${API_BASE}/favorites`, {
      userId,
      restaurantId
    });
  },

  // 찜 삭제
  removeFavorite: (userId, restaurantId) => {
    return axios.delete(`${API_BASE}/favorites`, {
      params: { userId, restaurantId }
    });
  },

  // 찜 여부 확인
  isFavorite: (userId, restaurantId) => {
    return axios.get(`${API_BASE}/favorites/check`, {
      params: { userId, restaurantId }
    });
  },

  // 찜 토글
  toggleFavorite: (userId, restaurantId) => {
    return axios.post(`${API_BASE}/favorites/toggle`, {
      userId,
      restaurantId
    });
  },
};

// ============ Notifications API ============
export const notificationsAPI = {
  // 사용자 알림 조회 (모두)
  getUserNotifications: (userId) => {
    return axios.get(`${API_BASE}/notifications/${userId}`);
  },

  // 읽지 않은 알림 조회
  getUnreadNotifications: (userId) => {
    return axios.get(`${API_BASE}/notifications/${userId}/unread`);
  },

  // 읽지 않은 알림 개수
  getUnreadCount: (userId) => {
    return axios.get(`${API_BASE}/notifications/${userId}/unread-count`);
  },

  // 알림 읽음 처리
  markAsRead: (notificationId) => {
    return axios.put(`${API_BASE}/notifications/${notificationId}/read`);
  },

  // 모든 알림 읽음 처리
  markAllAsRead: (userId) => {
    return axios.put(`${API_BASE}/notifications/${userId}/read-all`);
  },

  // 알림 삭제
  deleteNotification: (notificationId) => {
    return axios.delete(`${API_BASE}/notifications/${notificationId}`);
  },
};

// ============ Restaurants API ============
export const restaurantsAPI = {
  // 모든 식당 조회
  getAll: () => {
    return axios.get(`${API_BASE}/restaurants/all`);
  },

  // 식당 상세 조회
  getById: (id) => {
    return axios.get(`${API_BASE}/restaurants/${id}`);
  },

  // 키워드 검색
  search: (keyword) => {
    return axios.get(`${API_BASE}/restaurants`, {
      params: { keyword }
    });
  },

  // 식당명으로 검색
  searchByName: (name) => {
    return axios.get(`${API_BASE}/restaurants/name`, {
      params: { name }
    });
  },

  // 지역 기반 검색
  searchByRegion: (latitude, longitude, radius = 5000) => {
    return axios.get(`${API_BASE}/restaurants/region`, {
      params: { latitude, longitude, radius }
    });
  },
};

export default {
  statisticsAPI,
  favoritesAPI,
  notificationsAPI,
  restaurantsAPI,
};

