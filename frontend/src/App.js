import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ReservationPage from './ReservationPage';

const API_BASE_URL = 'http://localhost:8080/api';

// 메인 페이지 컴포넌트
function MainPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('통합검색');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [regions, setRegions] = useState([]);

  // Kakao Map 초기화
  useEffect(() => {
    const initMap = () => {
      try {
        if (window.kakao && window.kakao.maps) {
          const mapContainer = document.getElementById('map');
          if (mapContainer) {
            const mapOption = {
              center: new window.kakao.maps.LatLng(37.5665, 126.9780),
              level: 7
            };
            
            const mapInstance = new window.kakao.maps.Map(mapContainer, mapOption);
            setMap(mapInstance);
            console.log('지도 초기화 완료');
          } else {
            console.log('지도 컨테이너를 찾을 수 없습니다');
            setTimeout(initMap, 500);
          }
        } else {
          console.log('Kakao Maps API 로딩 중...');
          // Kakao Maps API가 아직 로드되지 않은 경우 잠시 후 다시 시도
          setTimeout(initMap, 1000);
        }
      } catch (error) {
        console.error('지도 초기화 오류:', error);
        setError('지도를 불러오는데 실패했습니다.');
      }
    };

    // 컴포넌트가 마운트된 후 지도 초기화
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, []);


  // 지도가 초기화되면 마커 업데이트
  useEffect(() => {
    if (map && restaurants.length > 0) {
      updateMapWithRestaurants(restaurants);
    }
  }, [map, restaurants]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);


  // 필터별 검색 처리
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('검색 시작:', searchKeyword, '필터:', searchFilter);
      
      let filteredRestaurants = [];
      
      if (searchFilter === '통합검색') {
        // 기존 API 검색 사용
        const response = await axios.get(`${API_BASE_URL}/restaurants?keyword=${encodeURIComponent(searchKeyword)}`);
        filteredRestaurants = response.data || [];
      } else if (searchFilter === '지역') {
        // 지역별 클라이언트 사이드 필터링
        const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
        filteredRestaurants = allRestaurants.data.filter(restaurant => 
          restaurant.regionName && restaurant.regionName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        
        // 지역 목록 추출 (검색 시에만)
        const uniqueRegions = [...new Set(allRestaurants.data.map(restaurant => restaurant.regionName).filter(Boolean))];
        setRegions(uniqueRegions.sort());
      } else if (searchFilter === '이름') {
        // 이름별 클라이언트 사이드 필터링
        const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
        filteredRestaurants = allRestaurants.data.filter(restaurant => 
          (restaurant.restaurantName && restaurant.restaurantName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          (restaurant.branchName && restaurant.branchName.toLowerCase().includes(searchKeyword.toLowerCase()))
        );
        
        // 지역 목록 추출 (검색 시에만)
        const uniqueRegions = [...new Set(allRestaurants.data.map(restaurant => restaurant.regionName).filter(Boolean))];
        setRegions(uniqueRegions.sort());
      }
      
      // 운영중인 식당만 필터링
      const operatingRestaurants = filterOperatingRestaurants(filteredRestaurants);
      
      console.log('전체 검색 결과:', filteredRestaurants.length);
      console.log('운영중인 식당:', operatingRestaurants.length);
      setRestaurants(operatingRestaurants);
      updateMapWithRestaurants(operatingRestaurants);
    } catch (error) {
      console.error('검색 실패:', error);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 선택
  const handleFilterSelect = (filter) => {
    setSearchFilter(filter);
    setShowFilterDropdown(false);
    setSearchKeyword('');
  };

  // 지도에 식당 마커 표시
  const updateMapWithRestaurants = (restaurantList) => {
    try {
      if (!map || !restaurantList || restaurantList.length === 0) {
        console.log('지도 업데이트 조건 불만족:', { map: !!map, restaurantList: restaurantList?.length });
        return;
      }

      console.log('지도 업데이트 시작:', restaurantList);

      // 기존 마커와 인포윈도우 제거
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      // 현재 인포윈도우 제거
      if (window.currentInfoWindow) {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
      }

      // 위치 정보가 있는 식당들만 마커로 표시
      const validRestaurants = restaurantList.filter(restaurant => 
        restaurant.lat && restaurant.lng && 
        !isNaN(parseFloat(restaurant.lat)) && 
        !isNaN(parseFloat(restaurant.lng))
      );
      
      console.log('유효한 식당 수:', validRestaurants.length);

      if (validRestaurants.length === 0) {
        console.log('유효한 위치 정보가 있는 식당이 없습니다');
        return;
      }

      validRestaurants.forEach((restaurant, index) => {
        try {
          const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map,
            title: restaurant.restaurantName
          });

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            setSelectedRestaurant(restaurant);
            // 선택된 식당으로 지도 중심 이동
            map.setCenter(position);
            map.setLevel(3);
          });

          newMarkers.push(marker);
          console.log(`마커 ${index + 1} 추가:`, restaurant.restaurantName);
        } catch (markerError) {
          console.error('마커 생성 오류:', markerError, restaurant);
        }
      });

      setMarkers(newMarkers);
      console.log('마커 업데이트 완료:', newMarkers.length);

      // 첫 번째 유효한 식당으로 지도 중심 이동
      if (validRestaurants.length > 0) {
        const firstRestaurant = validRestaurants[0];
        map.setCenter(new window.kakao.maps.LatLng(firstRestaurant.lat, firstRestaurant.lng));
        map.setLevel(7);
        console.log('지도 중심 이동:', firstRestaurant.restaurantName);
      }
    } catch (error) {
      console.error('지도 업데이트 오류:', error);
    }
  };

  // 선택된 식당의 마커만 표시
  const showSelectedRestaurantMarker = (restaurant) => {
    try {
      if (!map || !restaurant || !restaurant.lat || !restaurant.lng) {
        console.log('선택된 식당 마커 표시 조건 불만족');
        return;
      }

      console.log('선택된 식당 마커 표시:', restaurant.restaurantName);

      // 기존 마커와 인포윈도우 모두 제거
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      // 기존 인포윈도우 제거
      if (window.currentInfoWindow) {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
      }

      // 선택된 식당의 마커만 생성
      const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map,
        title: restaurant.restaurantName
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedRestaurant(restaurant);
        map.setCenter(position);
        map.setLevel(3);
      });

      newMarkers.push(marker);
      setMarkers(newMarkers);

      // 선택된 식당으로 지도 중심 이동
      map.setCenter(position);
      map.setLevel(5);

      // 인포윈도우 표시
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 15px; min-width: 250px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: bold;">
              ${restaurant.restaurantName}
            </h3>
            ${restaurant.branchName ? `
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                ${restaurant.branchName}
              </p>
            ` : ''}
            <p style="margin: 0 0 8px 0; color: #888; font-size: 13px;">
              ${restaurant.roadAddress || '주소 정보 없음'}
            </p>
            <p style="margin: 0; color: #667eea; font-size: 12px; font-weight: 600;">
              ${restaurant.mainMenu || '메뉴 정보 없음'}
            </p>
          </div>
        `,
        removable: true
      });
      infoWindow.open(map, marker);
      
      // 현재 인포윈도우를 전역 변수에 저장
      window.currentInfoWindow = infoWindow;

      console.log('선택된 식당 마커 표시 완료');
    } catch (error) {
      console.error('선택된 식당 마커 표시 오류:', error);
    }
  };

  // 지도 마커와 인포윈도우 제거
  const clearMapMarkers = () => {
    try {
      if (!map) return;
      
      // 기존 마커 모두 제거
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      
      // 현재 인포윈도우 제거
      if (window.currentInfoWindow) {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
      }
      
      // DOM에서 인포윈도우 제거
      const infoWindows = document.querySelectorAll('.kakao-maps-info-window');
      infoWindows.forEach(infoWindow => {
        if (infoWindow.parentNode) {
          infoWindow.parentNode.removeChild(infoWindow);
        }
      });
      
      console.log('지도 마커와 인포윈도우 제거 완료');
    } catch (error) {
      console.error('지도 마커 제거 오류:', error);
    }
  };

  // Y/N 값을 한국어로 변환
  const getKoreanValue = (value) => {
    if (value === 'Y' || value === '가능') return '가능';
    if (value === 'N' || value === '불가능') return '불가능';
    return value || '정보 없음';
  };

  // 상태 값을 한국어로 변환
  const getStatusValue = (restaurant) => {
    // lat, lng 값이 없으면 운영중지예상
    if (!restaurant.lat || !restaurant.lng) {
      return '운영중지예상';
    }
    
    // NORMAL이면 운영중
    if (restaurant.status === 'NORMAL') {
      return '운영중';
    }
    
    // 기타 상태값이 있으면 그대로 표시
    return restaurant.status || '정보 없음';
  };

  // 운영중인 식당만 필터링하는 함수
  const filterOperatingRestaurants = (restaurantList) => {
    return restaurantList.filter(restaurant => {
      // lat, lng 값이 있고 status가 NORMAL인 경우만 표시
      return restaurant.lat && restaurant.lng && restaurant.status === 'NORMAL';
    });
  };

  // 카드 클릭 시 상세정보 토글
  const toggleCardExpansion = (restaurantId) => {
    const isCurrentlyExpanded = expandedCard === restaurantId;
    
    // 다른 카드가 선택되면 이전 마커와 라벨 제거
    if (expandedCard && expandedCard !== restaurantId) {
      clearMapMarkers();
    }
    
    setExpandedCard(isCurrentlyExpanded ? null : restaurantId);
    
    // 선택된 식당도 함께 업데이트
    if (!isCurrentlyExpanded) {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
        // 선택된 식당의 마커만 표시
        showSelectedRestaurantMarker(restaurant);
      }
    } else {
      setSelectedRestaurant(null);
      // 모든 마커 다시 표시
      updateMapWithRestaurants(restaurants);
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

  // 식당 선택 (지도 이동 없이 선택만)
  const selectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>레스토랑 검색 서비스</h1>
        <p>원하는 식당을 검색하고 지도에서 위치를 확인하세요!</p>
      </header>

      <div className="search-section">
        <div className="search-container">
          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              {searchFilter} ▼
            </button>
            {showFilterDropdown && (
              <div className="filter-options">
                <div 
                  className={`filter-option ${searchFilter === '통합검색' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('통합검색')}
                >
                  통합검색
                </div>
                <div 
                  className={`filter-option ${searchFilter === '지역' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('지역')}
                >
                  지역
                </div>
                <div 
                  className={`filter-option ${searchFilter === '이름' ? 'active' : ''}`}
                  onClick={() => handleFilterSelect('이름')}
                >
                  이름
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={
              searchFilter === '통합검색' ? '식당명 또는 지점명을 입력하세요...' :
              searchFilter === '지역' ? '지역명을 입력하세요 (예: 중구, 강남구)...' :
              '식당명을 입력하세요...'
            }
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">검색</button>
        </div>
        
        {/* 지역 빠른 선택 */}
        {searchFilter === '지역' && regions.length > 0 && (
          <div className="region-tags">
            <span className="region-tags-label">빠른 선택:</span>
            {regions.slice(0, 8).map(region => (
              <button
                key={region}
                className="region-tag"
                onClick={async () => {
                  setSearchKeyword(region);
                  try {
                    setLoading(true);
                    setError(null);
                    const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
                    const filteredRestaurants = allRestaurants.data.filter(restaurant => 
                      restaurant.regionName && restaurant.regionName.toLowerCase().includes(region.toLowerCase())
                    );
                    setRestaurants(filteredRestaurants);
                    updateMapWithRestaurants(filteredRestaurants);
                  } catch (error) {
                    console.error('검색 실패:', error);
                    setError('검색 중 오류가 발생했습니다.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {region}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="retry-btn">닫기</button>
        </div>
      )}

      <div className="main-content">
        <div className="map-section">
          <div id="map" className="map"></div>
          {selectedRestaurant && (
            <div className="map-label">
              <div className="map-label-content">
                <h3>{selectedRestaurant.restaurantName}</h3>
                {selectedRestaurant.branchName && (
                  <p className="branch-name">{selectedRestaurant.branchName}</p>
                )}
                <p className="address">{selectedRestaurant.roadAddress || '주소 정보 없음'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="restaurant-list-section">
          <h3>
            {searchKeyword ? `검색 결과 (${restaurants.length}개)` : '식당 검색'}
          </h3>
          <div className="restaurant-list">
            {restaurants.length === 0 ? (
              <div className="no-results">
                <p>식당을 검색해주세요.</p>
              </div>
            ) : (
              restaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id || `restaurant-${index}`}
                  className={`restaurant-card ${expandedCard === restaurant.id ? 'selected' : ''}`}
                >
                  <div 
                    className="restaurant-card-header"
                    onClick={() => toggleCardExpansion(restaurant.id)}
                  >
                    <div className="restaurant-name">{restaurant.restaurantName}</div>
                    {restaurant.branchName && (
                      <div className="restaurant-branch">{restaurant.branchName}</div>
                    )}
                    <div className="restaurant-info">
                      <span className={`info-badge ${
                        getStatusValue(restaurant) === '운영중' ? 'status-operating' : 
                        getStatusValue(restaurant) === '운영중지예상' ? 'status-closed' : 
                        'unavailable'
                      }`}>
                        {getStatusValue(restaurant)}
                      </span>
                      <span className={`info-badge ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
                        주차 {getKoreanValue(restaurant.parking)}
                      </span>
                      <span className={`info-badge ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
                        WiFi {getKoreanValue(restaurant.wifi)}
                      </span>
                      <span className={`info-badge ${getKoreanValue(restaurant.kidsZone) === '가능' ? 'available' : 'unavailable'}`}>
                        키즈존 {getKoreanValue(restaurant.kidsZone)}
                      </span>
                      <span className={`info-badge ${getKoreanValue(restaurant.delivery) === '가능' ? 'available' : 'unavailable'}`}>
                        배달 {getKoreanValue(restaurant.delivery)}
                      </span>
                    </div>
                    <div className="restaurant-main-menu">
                      {restaurant.mainMenu || '메뉴 정보 없음'}
                    </div>
                    {restaurant.roadAddress ? (
                      <div className="restaurant-location">{restaurant.roadAddress}</div>
                    ) : (
                      <div className="restaurant-location no-location">위치 정보 로딩 중...</div>
                    )}
                    <div className="expand-indicator">
                      {expandedCard === restaurant.id ? '▲' : '▼'}
                    </div>
                  </div>
                  
                  <div 
                    className={`restaurant-card-details ${expandedCard === restaurant.id ? 'expanded' : ''}`}
                  >
                    <div className="detail-section">
                      <h4>위치 정보</h4>
                      <p><strong>지역:</strong> {restaurant.regionName || '정보 없음'}</p>
                      {restaurant.roadAddress && (
                        <p><strong>주소:</strong> {restaurant.roadAddress}</p>
                      )}
                      {restaurant.areaInfo && (
                        <p><strong>상세지역:</strong> {restaurant.areaInfo}</p>
                      )}
                    </div>

                    <div className="detail-section">
                      <h4>메뉴 정보</h4>
                      <p><strong>주요 메뉴:</strong> {restaurant.mainMenu || '정보 없음'}</p>
                      <p><strong>다국어 메뉴:</strong> {getKoreanValue(restaurant.multilingualMenu)}</p>
                    </div>

                    <div className="detail-section">
                      <h4>운영 정보</h4>
                      <p><strong>영업시간:</strong> {restaurant.openingHours || '정보 없음'}</p>
                      <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보 없음'}</p>
                      <p><strong>상태:</strong> {getStatusValue(restaurant)}</p>
                    </div>

                    <div className="detail-section">
                      <h4>편의시설</h4>
                      <div className="facility-grid">
                        <span className={`facility-item ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
                          주차 {getKoreanValue(restaurant.parking)}
                        </span>
                        <span className={`facility-item ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
                          WiFi {getKoreanValue(restaurant.wifi)}
                        </span>
                        <span className={`facility-item ${getKoreanValue(restaurant.kidsZone) === '가능' ? 'available' : 'unavailable'}`}>
                          키즈존 {getKoreanValue(restaurant.kidsZone)}
                        </span>
                        <span className={`facility-item ${getKoreanValue(restaurant.delivery) === '가능' ? 'available' : 'unavailable'}`}>
                          배달 {getKoreanValue(restaurant.delivery)}
                        </span>
                        <span className={`facility-item ${getKoreanValue(restaurant.smartOrder) === '가능' ? 'available' : 'unavailable'}`}>
                          스마트오더 {getKoreanValue(restaurant.smartOrder)}
                        </span>
                      </div>
                    </div>

                    <div className="reservation-section">
                      <button 
                        className="reservation-btn"
                        onClick={(e) => handleReservation(restaurant, e)}
                      >
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>처리 중...</p>
        </div>
      )}
    </div>
  );
}

// 메인 App 컴포넌트 (라우터 설정)
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Routes>
    </Router>
  );
}

export default App;