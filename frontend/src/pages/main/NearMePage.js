import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { restaurantAPI } from '../../demo/services/api';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import SearchSection from '../../components/sections/SearchSection';
import FilterTabs from '../../components/FilterTabs';
import MapSection from '../../components/sections/MapSection';
import RestaurantList from '../../components/sections/RestaurantList';
import RestaurantDetailModal from '../../components/modals/RestaurantDetailModal';
import { useRestaurantSearch } from '../../hooks/useRestaurantSearch';
import { useMap } from '../../hooks/useMap';
import '../../styles/common.css';
import './NearMePage.css';

const NearMePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('전체');
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSingleMarkerMode, setIsSingleMarkerMode] = useState(false);
  const isManuallyControllingMarkers = useRef(false);

  const { map, updateMap, showSelectedMarker, clearMarkers, isMapLoading, mapError } = useMap();
  const [allRestaurants, setAllRestaurants] = useState([]);
  
  // 모든 식당 데이터 미리 로드
  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        setAllRestaurants(response.data);
        console.log('전체 식당 로드 완료:', response.data.length);
      } catch (error) {
        console.error('식당 데이터 로딩 실패:', error);
      }
    };
    fetchAllRestaurants();
  }, []);
  
  // 현재 위치로 이동 핸들러
  const handleCurrentLocation = () => {
    if (map) {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000
        };
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude);
            map.setCenter(moveLatLon);
            map.setLevel(3);
            setCurrentLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error('현재 위치를 가져올 수 없습니다:', error);
            alert('현재 위치를 가져올 수 없습니다. 위치 권한을 허용해주세요.');
          },
          options
        );
      } else {
        alert('이 브라우저는 지리 위치를 지원하지 않습니다.');
      }
    }
  };

  // 거리 계산 함수 (하버사인 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 거리 (미터)
  };

  // 근처 가게 찾기 핸들러
  const handleFindNearby = () => {
    if (!map) {
      alert('지도가 로드되지 않았습니다.');
      return;
    }
    
    // 검색한 데이터가 있으면 그것을, 없으면 전체 식당 데이터를 사용
    const searchTarget = restaurants && restaurants.length > 0 ? restaurants : allRestaurants;
    
    if (!searchTarget || searchTarget.length === 0) {
      alert('식당 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    const center = map.getCenter();
    const centerLat = center.getLat();
    const centerLng = center.getLng();
    
    console.log('지도 중심 좌표:', centerLat, centerLng);
    console.log('사용할 식당 수:', searchTarget.length);
    
    // 1킬로미터 이내 식당 필터링
    const nearbyRestaurants = searchTarget.filter(restaurant => {
      if (!restaurant.lat || !restaurant.lng) {
        console.log(`식당 ${restaurant.restaurantName}: 좌표 없음`);
        return false;
      }
      const distance = calculateDistance(centerLat, centerLng, restaurant.lat, restaurant.lng);
      console.log(`식당 ${restaurant.restaurantName}: 거리 ${distance.toFixed(2)}미터`);
      return distance <= 1000; // 1킬로미터 이내
    });
    
    console.log('근처 식당 수:', nearbyRestaurants.length);
    
    if (nearbyRestaurants.length > 0) {
      // 기존 마커 제거
      clearMarkers();
      
      // 새로운 필터링된 식당만 표시
      setFilteredRestaurants(nearbyRestaurants);
      setHasSearched(true); // 검색된 것으로 표시하여 리스트에 표시
      
      // 마커는 useEffect에서 자동으로 업데이트됨
      alert(`해당 위치에서 1킬로미터 이내 가게 ${nearbyRestaurants.length}개를 찾았습니다.`);
    } else {
      setFilteredRestaurants([]);
      clearMarkers();
      alert('1킬로미터 이내에 가게가 없습니다.');
    }
  };

  // 지도 확대 버튼
  const handleZoomIn = () => {
    if (map) {
      const level = map.getLevel();
      map.setLevel(level - 1);
    }
  };

  // 지도 축소 버튼
  const handleZoomOut = () => {
    if (map) {
      const level = map.getLevel();
      map.setLevel(level + 1);
    }
  };

  // OWNER는 Owner Dashboard로 리다이렉트
  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 커스텀 훅 사용
  const {
    restaurants,
    filteredRestaurants,
    setFilteredRestaurants,
    loading,
    error,
    hasSearched,
    setHasSearched,
    regions,
    handleSearch,
    filterByRegionType,
    filterByServiceType,
    setError
  } = useRestaurantSearch();

  // 마커 클릭 시 카드 자동 선택 핸들러
  const handleMarkerClick = React.useCallback((restaurant) => {
    // 해당 식당 카드 자동 선택
    setSelectedRestaurant(restaurant);
    setExpandedCard(restaurant.id);
    
    // 카드가 보이도록 스크롤 (선택사항)
    const cardElement = document.getElementById(`restaurant-card-${restaurant.id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // 검색/필터 결과가 변경될 때 마커 업데이트
  React.useEffect(() => {
    if (!map || !hasSearched) return;
    
    // 수동으로 마커를 제어하고 있으면 useEffect 실행 안 함
    if (isManuallyControllingMarkers.current) {
      console.log('수동 마커 제어 중 - useEffect 건너뛰기');
      return;
    }
    
    console.log('useEffect 실행, filteredRestaurants:', filteredRestaurants.length);
    
    if (filteredRestaurants.length > 0) {
      // lat, lng가 있는 식당만 지도에 표시
      const restaurantsWithCoords = filteredRestaurants.filter(
        restaurant => restaurant.lat && restaurant.lng
      );
      if (restaurantsWithCoords.length > 0) {
        console.log('마커 업데이트:', restaurantsWithCoords.length, '개');
        updateMap(restaurantsWithCoords, handleMarkerClick);
      }
    } else if (filteredRestaurants.length === 0) {
      // 필터링된 식당이 없으면 마커 제거
      console.log('마커 제거');
      clearMarkers();
    }
  }, [map, hasSearched, filteredRestaurants.length]);

  // 필터 변경 핸들러
  const handleFilterChange = (filterValue, filterType) => {
    if (filterType === 'service') {
      // 서비스 다중 선택 처리
      setSelectedServices(prev => {
        const isSelected = prev.includes(filterValue);
        let newServices;
        
        if (isSelected) {
          // 이미 선택된 서비스면 제거
          newServices = prev.filter(service => service !== filterValue);
        } else {
          // 선택되지 않은 서비스면 추가
          newServices = [...prev, filterValue];
        }
        
        // 서비스 필터링 적용
        if (newServices.length === 0) {
          // 선택된 서비스가 없으면 모든 식당 표시
          setFilteredRestaurants(restaurants);
          setActiveFilterTab('전체');
        } else {
          // 선택된 서비스들로 필터링
          const filtered = restaurants.filter(restaurant => 
            newServices.some(service => {
              switch(service) {
                case '주차가능':
                  return restaurant.parkingAvailable === 'Y';
                case 'WiFi':
                  return restaurant.wifiAvailable === 'Y';
                case '키즈존':
                  return restaurant.kidsZoneAvailable === 'Y';
                case '배달':
                  return restaurant.deliveryAvailable === 'Y';
                case '스마트오더':
                  return restaurant.smartOrderAvailable === 'Y';
                default:
                  return false;
              }
            })
          );
          setFilteredRestaurants(filtered);
          setActiveFilterTab(newServices.join(', '));
        }
        
        return newServices;
      });
    } else {
      // 지역 필터링은 기존과 동일
      setActiveFilterTab(filterValue);
      setSelectedServices([]); // 지역 선택 시 서비스 선택 초기화
      
      switch(filterType) {
        case 'region':
          filterByRegionType(filterValue);
          break;
        case 'all':
          // 전체 선택 시 - 모든 식당 표시
          setActiveFilterTab('전체');
          setFilteredRestaurants(restaurants);
          break;
        default:
          break;
      }
    }
  };

  // 카드 클릭 시 상세정보 토글
  const toggleCardExpansion = (restaurantId) => {
    const isCurrentlyExpanded = expandedCard === restaurantId;
    
    setExpandedCard(isCurrentlyExpanded ? null : restaurantId);
    
    // 선택된 식당도 함께 업데이트
    if (!isCurrentlyExpanded) {
      const restaurant = filteredRestaurants.find(r => r.id === restaurantId);
      if (restaurant && restaurant.lat && restaurant.lng) {
        console.log('카드 선택:', restaurant.restaurantName);
        
        // 수동 마커 제어 모드로 전환 (가장 먼저!)
        isManuallyControllingMarkers.current = true;
        
        // 모든 마커 제거
        console.log('모든 마커 제거 시작');
        clearMarkers();
        
        // 즉시 상태 업데이트
        setIsSingleMarkerMode(true);
        setSelectedRestaurant(restaurant);
        
        // 짧은 지연 후 선택된 마커만 표시
        setTimeout(() => {
          console.log('선택된 식당 마커만 표시:', restaurant.restaurantName);
          showSelectedMarker(restaurant, setSelectedRestaurant);
        }, 100);
      }
    } else {
      // 다시 모든 마커 모드로 전환
      console.log('모든 마커 다시 표시');
      
      // 모든 마커 제거
      clearMarkers();
      
      // 상태 초기화
      isManuallyControllingMarkers.current = false;
      setIsSingleMarkerMode(false);
      setSelectedRestaurant(null);
      
      // 짧은 지연 후 모든 마커 다시 표시
      setTimeout(() => {
        updateMap(filteredRestaurants, handleMarkerClick);
      }, 100);
    }
  };


  // 예약하기 버튼 클릭
  const handleReservation = (restaurant, event) => {
    event.stopPropagation();
    try {
      navigate('/reservation', { state: { restaurant } });
    } catch (error) {
      console.error('예약 페이지 이동 오류:', error);
      alert('예약 페이지로 이동하는데 실패했습니다.');
    }
  };

  // 상세정보 모달 핸들러
  const handleDetailView = (restaurant) => {
    setModalRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalRestaurant(null);
  };

  const handleModalReservation = (restaurant) => {
    handleReservation(restaurant, { stopPropagation: () => {} });
    handleCloseModal();
  };

  return (
    <div className="nearme-page">
      <TopNav />
      <MainNav />
      
      <main className="nearme-main">
        {/* 헤더 */}
    
        <SearchSection 
          onSearch={handleSearch} 
          onCurrentLocation={handleCurrentLocation} 
          onFindNearby={handleFindNearby}
        />
        
        <FilterTabs
          hasSearched={hasSearched}
          restaurants={restaurants}
          regions={regions}
          activeFilterTab={activeFilterTab}
          selectedServices={selectedServices}
          onFilterChange={handleFilterChange}
        />

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-btn">닫기</button>
          </div>
        )}

        <div className="main-content">
          <div className="map-container-wrapper">
            <MapSection 
              selectedRestaurant={selectedRestaurant} 
              isMapLoading={isMapLoading}
              mapError={mapError}
            />
            {/* 지도 확대/축소 버튼 */}
            <div className="map-controls">
              <button className="zoom-control-btn" onClick={handleZoomIn} title="확대">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="zoom-control-btn" onClick={handleZoomOut} title="축소">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <RestaurantList
            hasSearched={hasSearched}
            filteredRestaurants={filteredRestaurants}
            activeFilterTab={activeFilterTab}
            expandedCard={expandedCard}
            onCardClick={toggleCardExpansion}
            onReservation={handleReservation}
            onDetailView={handleDetailView}
          />
        </div>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>처리 중...</p>
          </div>
        )}

        {/* 상세정보 모달 */}
        <RestaurantDetailModal
          restaurant={modalRestaurant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onReservation={handleModalReservation}
        />
      </main>
    </div>
  );
};

export default NearMePage;