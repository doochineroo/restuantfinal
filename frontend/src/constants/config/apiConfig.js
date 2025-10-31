/**
 * API 설정
 * 환경변수 REACT_APP_API_BASE_URL이 설정되어 있으면 사용하고,
 * 없으면 기본값을 사용합니다.
 */

// 기본 API 베이스 URL (로컬 개발 환경)
const DEFAULT_API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api'
  : 'http://localhost:8080/api';

// 환경변수 또는 기본값 사용
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL;

// API 경로 상수
export const API_ENDPOINTS = {
  // Demo API
  DEMO: `${API_BASE_URL}/demo`,
  CHAT: `${API_BASE_URL}/demo/chat`,
  
  // Main API
  RESTAURANTS: `${API_BASE_URL}/restaurants`,
  STATISTICS: `${API_BASE_URL}/statistics`,
  FAVORITES: `${API_BASE_URL}/favorites`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  UPLOAD: `${API_BASE_URL}/upload`,
};

// 이미지 URL 변환 헬퍼 함수
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
  return imagePath;
};

// API 베이스 URL 가져오기 (직접 사용할 때)
export const getApiBaseUrl = () => API_BASE_URL;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getImageUrl,
  getApiBaseUrl,
};
