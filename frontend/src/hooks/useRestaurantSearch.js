import { useState, useEffect } from 'react';
import axios from 'axios';
import { filterOperatingRestaurants, filterByRegion, filterByService } from '../utils/restaurantUtils';

const API_BASE_URL = 'http://localhost:8080/api';

export const useRestaurantSearch = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [regions, setRegions] = useState([]);

  // 통합검색 처리
  const handleSearch = async (searchKeyword) => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('검색 시작:', searchKeyword);
      
      // 통합검색 (지점+가게명)
      const response = await axios.get(`${API_BASE_URL}/restaurants?keyword=${encodeURIComponent(searchKeyword)}`);
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
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
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
