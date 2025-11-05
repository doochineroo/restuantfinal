/**
 * API 설정
 * 환경변수 REACT_APP_API_BASE_URL이 설정되어 있으면 사용하고,
 * 없으면 기본값을 사용합니다.
 */

// 현재 페이지의 프로토콜 감지 (HTTPS/HTTP)
const getProtocol = () => {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:' ? 'https:' : 'http:';
  }
  return 'http:';
};

// API 호스트 설정
const getApiHost = () => {
  // 환경변수가 설정되어 있으면 우선 사용
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
    // 프로덕션 환경
    if (process.env.NODE_ENV === 'production') {
      // Google Cloud Compute Engine VM 외부 IP 사용
      // 환경변수 REACT_APP_API_BASE_URL에서 설정 (frontend/.env.production)
      // 기본값: 외부 IP 136.117.53.209 (Google Cloud VM)
      return process.env.REACT_APP_API_BASE_URL || 'http://136.117.53.209:8080/api';
    }
  
  // 개발 환경
  return 'http://localhost:8080/api';
};

// 환경변수 또는 기본값 사용
export const API_BASE_URL = getApiHost();

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
  
  // 이미 전체 URL인 경우 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 상대 경로인 경우 (/uploads/... 또는 다른 경로)
  // /uploads/로 시작하거나 상대 경로인 경우
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/')) {
    try {
      // API_BASE_URL에서 /api를 제거하여 기본 URL 생성
      let baseUrl = API_BASE_URL.replace('/api', '');
      
      // baseUrl이 올바른 형식인지 확인 (http:// 또는 https://로 시작해야 함)
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        // 형식이 잘못된 경우, 프로토콜을 추가
        const protocol = getProtocol();
        baseUrl = protocol + '//' + baseUrl;
      }
      
      // baseUrl이 올바른 형식인지 재확인
      if (!baseUrl.match(/^https?:\/\/[^\/]+/)) {
        console.error('Invalid baseUrl format:', baseUrl);
        // 폴백: Google Cloud VM 외부 IP 사용
        baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://136.117.53.209:8080';
      }
      
      // URL 구성 (끝에 슬래시가 있으면 제거)
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const cleanImagePath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
      
      return cleanBaseUrl + cleanImagePath;
    } catch (error) {
      console.error('Error constructing image URL:', error);
      return imagePath; // 실패 시 원본 경로 반환
    }
  }
  
  // 상대 경로가 아닌 경우 (파일명만 있는 경우 등)
  // API_BASE_URL 기준으로 상대 경로로 간주하고 처리
  try {
    let baseUrl = API_BASE_URL.replace('/api', '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      const protocol = getProtocol();
      baseUrl = protocol + '//' + baseUrl;
    }
    if (!baseUrl.match(/^https?:\/\/[^\/]+/)) {
      // 폴백: Google Cloud VM 외부 IP 사용
      baseUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://136.117.53.209:8080';
    }
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return cleanBaseUrl + '/uploads/' + imagePath;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    return imagePath;
  }
};

// API 베이스 URL 가져오기 (직접 사용할 때)
export const getApiBaseUrl = () => API_BASE_URL;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getImageUrl,
  getApiBaseUrl,
};
