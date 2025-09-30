import { useState, useEffect } from 'react';
import axios from 'axios';
import { filterOperatingRestaurants, filterByRegion, filterByService } from '../utils/restaurantUtils';

export const useRestaurantSearch = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [regions, setRegions] = useState([]);

  const getApiUrl = () => {
    const hostname = window.location.hostname;
    
    // 로컬 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    
    // 프로덕션 환경 - 직접 HTTP 호출 (Mixed Content 허용 필요)
    return 'http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api';
  };

  
  // 통합검색 처리 (백엔드 API 호출)
  const handleSearch = async (searchKeyword) => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('검색 시작:', searchKeyword);
      
      // 백엔드 API 호출
      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/restaurants?keyword=${encodeURIComponent(searchKeyword)}`;
      console.log('API 요청 URL:', fullUrl);
      
      const response = await axios.get(fullUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30초 타임아웃
      });
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      console.log('API 응답 데이터:', response.data);
      console.log('API 응답 타입:', typeof response.data);
      
      // 응답이 HTML인지 확인
      if (typeof response.data === 'string' && response.data.includes('<html')) {
        console.error('HTML 응답을 받았습니다. API 엔드포인트를 확인하세요.');
        throw new Error('API 서버에서 HTML을 반환했습니다. 엔드포인트를 확인하세요.');
      }
      
      const allResults = response.data || [];
      
      // 운영중인 식당만 필터링
      const operatingRestaurants = filterOperatingRestaurants(allResults);
      
      console.log('전체 검색 결과:', allResults.length);
      console.log('운영중인 식당:', operatingRestaurants.length);
      
      setRestaurants(operatingRestaurants);
      setFilteredRestaurants(operatingRestaurants);
      setHasSearched(true);
      
      // 지역 목록 추출
      const uniqueRegions = [...new Set(operatingRestaurants.map(restaurant => restaurant.regionName).filter(Boolean))];
      setRegions(uniqueRegions.sort());
      
    } catch (error) {
      console.error('검색 실패:', error);
      
      let errorMessage = '검색 중 오류가 발생했습니다.';
      
      if (error.response) {
        // 서버에서 응답을 받았지만 에러 상태
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
        
        if (error.response.status === 404) {
          errorMessage = 'API 서버를 찾을 수 없습니다. 서버 상태를 확인하세요.';
        } else if (error.response.status === 500) {
          errorMessage = '서버 내부 오류가 발생했습니다.';
        } else if (error.response.status === 0) {
          errorMessage = '네트워크 연결을 확인하세요.';
        }
      } else if (error.request) {
        // 요청을 보냈지만 응답을 받지 못함
        console.error('요청 실패:', error.request);
        errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인하세요.';
      } else {
        // 기타 오류
        console.error('오류 메시지:', error.message);
        errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 지역 필터링
  const filterByRegionType = (region) => {
    const filtered = filterByRegion(restaurants, region);
    setFilteredRestaurants(filtered);
    return filtered;
  };

  // 서비스 필터링
  const filterByServiceType = (service) => {
    const filtered = filterByService(restaurants, service);
    setFilteredRestaurants(filtered);
    return filtered;
  };

  return {
    restaurants,
    filteredRestaurants,
    setFilteredRestaurants,
    loading,
    error,
    hasSearched,
    regions,
    handleSearch,
    filterByRegionType,
    filterByServiceType,
    setError
  };
};
