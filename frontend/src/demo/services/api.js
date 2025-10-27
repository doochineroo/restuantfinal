/**
 * 테스트용 API 클라이언트 - 데모 종료 시 제거 예정
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/demo';

// Auth API
export const authAPI = {
  signup: (data) => axios.post(`${API_BASE_URL}/auth/signup`, data),
  login: (data) => axios.post(`${API_BASE_URL}/auth/login`, data),
};

// Reservation API (실제 API 호출)
export const reservationAPI = {
  create: (data) => axios.post(`${API_BASE_URL}/reservations`, data),
  getUserReservations: (userId) => axios.get(`${API_BASE_URL}/reservations/user/${userId}`),
  getRestaurantReservations: (restaurantId) => axios.get(`${API_BASE_URL}/reservations/restaurant/${restaurantId}`),
  getAllReservations: () => axios.get(`${API_BASE_URL}/reservations`),
  approve: (id) => axios.put(`${API_BASE_URL}/reservations/${id}/approve`),
  reject: (id, reason) => axios.put(`${API_BASE_URL}/reservations/${id}/reject`, { reason }),
  cancel: (id) => axios.put(`${API_BASE_URL}/reservations/${id}/cancel`),
  approveCancellation: (id) => axios.put(`${API_BASE_URL}/reservations/${id}/cancel/approve`),
  rejectCancellation: (id, reason) => axios.put(`${API_BASE_URL}/reservations/${id}/cancel/reject`, { reason }),
  submitAppeal: (id, data) => axios.post(`${API_BASE_URL}/reservations/${id}/appeal`, data),
};

// Review API
export const reviewAPI = {
  create: (data) => axios.post(`${API_BASE_URL}/reviews`, data),
  getRestaurantReviews: (restaurantId) => axios.get(`${API_BASE_URL}/reviews/restaurant/${restaurantId}`),
  getRestaurantStats: (restaurantId) => axios.get(`${API_BASE_URL}/reviews/restaurant/${restaurantId}/stats`),
  getUserReviews: (userId) => axios.get(`${API_BASE_URL}/reviews/user/${userId}`),
  like: (id) => axios.put(`${API_BASE_URL}/reviews/${id}/like`),
  dislike: (id) => axios.put(`${API_BASE_URL}/reviews/${id}/dislike`),
  report: (id) => axios.put(`${API_BASE_URL}/reviews/${id}/report`),
  getReported: () => axios.get(`${API_BASE_URL}/reviews/reported`),
};

// Restaurant API
export const restaurantAPI = {
  getAll: () => axios.get(`http://localhost:8080/api/restaurants/all`), // DB 기반 전체 조회
  getById: (id) => axios.get(`http://localhost:8080/api/restaurants/${id}`),
  getNameById: (id) => axios.get(`http://localhost:8080/api/restaurants/${id}/name`), // 가게 ID로 가게 이름 조회
  search: (keyword) => axios.get(`http://localhost:8080/api/restaurants?keyword=${keyword}`), // DB 기반 검색 API 사용
  searchByName: (name) => axios.get(`http://localhost:8080/api/restaurants/name?name=${name}`), // 식당명으로 검색
  searchByRegion: (latitude, longitude, radius = 5000) => axios.get(`http://localhost:8080/api/restaurants/region?latitude=${latitude}&longitude=${longitude}&radius=${radius}`), // 지역 기반 검색
};

// Statistics API
export const statisticsAPI = {
  recordClick: (restaurantId, userId = null) => axios.post('http://localhost:8080/api/statistics/click', { restaurantId, userId }),
  recordSearch: (keyword) => axios.post('http://localhost:8080/api/statistics/search', { keyword }),
  getPopularRestaurants: (limit = 10) => axios.get(`http://localhost:8080/api/statistics/popular-restaurants?limit=${limit}`),
  getPopularRestaurantsWithCount: (limit = 10) => axios.get(`http://localhost:8080/api/statistics/popular-restaurants-with-count?limit=${limit}`),
  getRecentPopularRestaurants: (limit = 10) => axios.get(`http://localhost:8080/api/statistics/recent-popular-restaurants?limit=${limit}`),
  getTodayPopularRestaurants: (limit = 10) => axios.get(`http://localhost:8080/api/statistics/today-popular-restaurants?limit=${limit}`),
  getPopularKeywords: (limit = 10) => axios.get(`http://localhost:8080/api/statistics/popular-keywords?limit=${limit}`),
  getKeywordSuggestions: (keyword) => axios.get(`http://localhost:8080/api/statistics/keyword-suggestions?keyword=${keyword}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => axios.get(`${API_BASE_URL}/admin/users`),
  getUsersByRole: (role) => axios.get(`${API_BASE_URL}/admin/users/role/${role}`),
  updateUserStatus: (userId, status) => axios.put(`${API_BASE_URL}/admin/users/${userId}/status`, { status }),
  deleteUser: (userId) => axios.delete(`${API_BASE_URL}/admin/users/${userId}`),
};

// Image Upload API
export const imageUploadAPI = {
  uploadRestaurantImage: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return axios.post('http://localhost:8080/api/upload/restaurant-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMenuImage: (file, menuId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('menuId', menuId);
    return axios.post('http://localhost:8080/api/upload/menu-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (fileUrl) => axios.delete('http://localhost:8080/api/upload/image', {
    params: { fileUrl }
  }),
};