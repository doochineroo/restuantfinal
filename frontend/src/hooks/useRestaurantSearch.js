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
    // 항상 EC2 백엔드 직접 호출
    return 'http://ec2-52-78-137-215.ap-northeast-2.compute.amazonaws.com:8080/api';
  };

  
  // 백엔드 DB 검색 (좌표가 없는 식당들은 실시간 카카오 API로 자동 업데이트)
  const handleSearch = async (searchKeyword) => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 백엔드 API 호출 (좌표가 없는 식당들은 자동으로 카카오 API 호출하여 업데이트)
      const proxyUrl = `https://dpt8rhufx9b4x.cloudfront.net/api/restaurants?keyword=${encodeURIComponent(searchKeyword)}`;
      
      const response = await axios.get(proxyUrl, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        timeout: 30000 // 모든 식당 좌표 업데이트를 위해 타임아웃 증가
      });
      
      const restaurants = Array.isArray(response.data) ? response.data : [];
      
      // 데이터 변환
      const processedRestaurants = restaurants.map((restaurant) => {
        return {
          ...restaurant,
          dataSource: '백엔드DB',
          // 좌표가 문자열인 경우 숫자로 변환
          lat: restaurant.lat ? parseFloat(restaurant.lat) : null,
          lng: restaurant.lng ? parseFloat(restaurant.lng) : null
        };
      });
      
      setRestaurants(processedRestaurants);
      setFilteredRestaurants(processedRestaurants);
      setHasSearched(true);
      
      // 지역 목록 추출
      const uniqueRegions = [...new Set(processedRestaurants.map(restaurant => restaurant.regionName).filter(Boolean))];
      setRegions(uniqueRegions.sort());
      
    } catch (error) {
      let errorMessage = '검색 중 오류가 발생했습니다.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'API 서버를 찾을 수 없습니다. 서버 상태를 확인하세요.';
        } else if (error.response.status === 500) {
          errorMessage = '서버 내부 오류가 발생했습니다.';
        } else if (error.response.status === 0) {
          errorMessage = '네트워크 연결을 확인하세요.';
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인하세요.';
      } else {
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
