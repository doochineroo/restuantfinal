import { useState, useEffect, useCallback } from 'react';
import { updateMapWithRestaurants, showSelectedRestaurantMarker, clearMapMarkers } from '../utils/mapUtils';
import { loadKakaoMapAPI } from '../utils/kakaoMapLoader';

export const useMap = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Kakao Map 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsMapLoading(true);
        setMapError(null);
        
        // 카카오 지도 API 로드
        await loadKakaoMapAPI();
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
          const mapOption = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 7
          };
          
          const mapInstance = new window.kakao.maps.Map(mapContainer, mapOption);
          setMap(mapInstance);
          setIsMapLoading(false);
        } else {
          setTimeout(initMap, 500);
        }
      } catch (error) {
        setMapError('지도를 불러오는데 실패했습니다.');
        setIsMapLoading(false);
      }
    };

    // 컴포넌트가 마운트된 후 지도 초기화
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, []);

  // 지도에 식당 마커 업데이트
  const updateMap = useCallback((restaurantList, onMarkerClick) => {
    if (map && restaurantList && restaurantList.length > 0) {
      updateMapWithRestaurants(map, markers, setMarkers, restaurantList, onMarkerClick);
    }
  }, [map]); // markers 의존성 제거

  // 선택된 식당 마커 표시
  const showSelectedMarker = (restaurant, setSelectedRestaurant) => {
    showSelectedRestaurantMarker(map, markers, setMarkers, restaurant, setSelectedRestaurant);
  };

  // 마커 제거
  const clearMarkers = () => {
    clearMapMarkers(map, markers, setMarkers);
  };

  return {
    map,
    markers,
    isMapLoading,
    mapError,
    updateMap,
    showSelectedMarker,
    clearMarkers
  };
};
