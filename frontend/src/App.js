import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchFilter, setSearchFilter] = useState('통합검색');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [regions, setRegions] = useState([]);

  // Kakao Map 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      const mapContainer = document.getElementById('map');
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7
      };
      
      const mapInstance = new window.kakao.maps.Map(mapContainer, mapOption);
      setMap(mapInstance);
    } else {
      // Kakao Maps API가 아직 로드되지 않은 경우 잠시 후 다시 시도
      const timer = setTimeout(() => {
        if (window.kakao && window.kakao.maps) {
          const mapContainer = document.getElementById('map');
          const mapOption = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 7
          };
          
          const mapInstance = new window.kakao.maps.Map(mapContainer, mapOption);
          setMap(mapInstance);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadAllRestaurants();
  }, []);

  // 검색어가 변경될 때 자동 검색 방지
  useEffect(() => {
    // 검색어가 변경되어도 자동으로 검색하지 않음
  }, [searchKeyword]);

  // 지역 목록은 loadAllRestaurants에서 처리됨

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

  // 식당 목록 로드
  const loadAllRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/restaurants/all`);
      setRestaurants(response.data);
      // 지역 목록 추출
      const uniqueRegions = [...new Set(response.data.map(restaurant => restaurant.regionName).filter(Boolean))];
      setRegions(uniqueRegions.sort());
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터별 검색 처리
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      console.log('검색 시작:', searchKeyword, '필터:', searchFilter);
      
      let filteredRestaurants = [];
      
      if (searchFilter === '통합검색') {
        // 기존 API 검색 사용
        const response = await axios.get(`${API_BASE_URL}/restaurants?keyword=${encodeURIComponent(searchKeyword)}`);
        filteredRestaurants = response.data;
      } else if (searchFilter === '지역') {
        // 지역별 클라이언트 사이드 필터링
        const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
        filteredRestaurants = allRestaurants.data.filter(restaurant => 
          restaurant.regionName && restaurant.regionName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      } else if (searchFilter === '이름') {
        // 이름별 클라이언트 사이드 필터링
        const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
        filteredRestaurants = allRestaurants.data.filter(restaurant => 
          (restaurant.restaurantName && restaurant.restaurantName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          (restaurant.branchName && restaurant.branchName.toLowerCase().includes(searchKeyword.toLowerCase()))
        );
      }
      
      console.log('검색 결과:', filteredRestaurants);
      setRestaurants(filteredRestaurants);
      updateMapWithRestaurants(filteredRestaurants);
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // 필터 선택
  const handleFilterSelect = (filter) => {
    setSearchFilter(filter);
    setShowFilterDropdown(false);
    setSearchKeyword(''); // 필터 변경 시 검색어 초기화
  };


  // 지도에 식당 마커 표시
  const updateMapWithRestaurants = (restaurantList) => {
    if (!map || !restaurantList || restaurantList.length === 0) return;

    console.log('지도 업데이트 시작:', restaurantList);

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // 위치 정보가 있는 식당들만 마커로 표시
    const validRestaurants = restaurantList.filter(restaurant => 
      restaurant.lat && restaurant.lng
    );
    
    console.log('유효한 식당 수:', validRestaurants.length);

    validRestaurants.forEach(restaurant => {
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
    });

    setMarkers(newMarkers);

    // 첫 번째 유효한 식당으로 지도 중심 이동
    if (validRestaurants.length > 0) {
      const firstRestaurant = validRestaurants[0];
      map.setCenter(new window.kakao.maps.LatLng(firstRestaurant.lat, firstRestaurant.lng));
      map.setLevel(7); // 검색 결과 전체를 볼 수 있도록 적절한 레벨로 설정
    }
  };

  // Y/N 값을 한국어로 변환
  const getKoreanValue = (value) => {
    if (value === 'Y' || value === '가능') return '가능';
    if (value === 'N' || value === '불가능') return '불가능';
    return value || '정보 없음';
  };

  // 카드 클릭 시 상세정보 토글
  const toggleCardExpansion = (restaurantId) => {
    setExpandedCard(expandedCard === restaurantId ? null : restaurantId);
  };

  // 식당 선택
  const selectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (restaurant.lat && restaurant.lng) {
      const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
      
      // 부드러운 지도 이동 애니메이션
      const moveLatLng = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
      map.panTo(moveLatLng);
      
      // 레벨 변경도 부드럽게
      setTimeout(() => {
        map.setLevel(3);
      }, 500);
      
      // 해당 마커에 인포윈도우 표시
      const marker = markers.find(m => {
        const markerPos = m.getPosition();
        return markerPos.getLat() === restaurant.lat && markerPos.getLng() === restaurant.lng;
      });

      if (marker) {
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px;">${restaurant.restaurantName}</h3>
              ${restaurant.branchName ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${restaurant.branchName}</p>` : ''}
              <p style="margin: 0; color: #888; font-size: 11px;">${restaurant.mainMenu || '메뉴 정보 없음'}</p>
            </div>
          `,
          removable: true
        });
        infoWindow.open(map, marker);
      }
    }
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
                    const allRestaurants = await axios.get(`${API_BASE_URL}/restaurants/all`);
                    const filteredRestaurants = allRestaurants.data.filter(restaurant => 
                      restaurant.regionName && restaurant.regionName.toLowerCase().includes(region.toLowerCase())
                    );
                    setRestaurants(filteredRestaurants);
                    updateMapWithRestaurants(filteredRestaurants);
                  } catch (error) {
                    console.error('검색 실패:', error);
                    alert('검색 중 오류가 발생했습니다.');
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

      <div className="main-content">
        <div className="map-section">
          <div id="map" className="map"></div>
        </div>

        <div className="restaurant-list-section">
          <h3>
            {searchKeyword ? `검색 결과 (${restaurants.length}개)` : '등록업체 99개'}
          </h3>
          <div className="restaurant-list">
            {restaurants.length === 0 ? (
              <div className="no-results">
                <p>검색어를 입력하고 검색 버튼을 눌러주세요.</p>
              </div>
            ) : (
              restaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id || `restaurant-${index}`}
                  className={`restaurant-card ${selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                >
                  <div 
                    className="restaurant-card-header"
                    onClick={() => selectRestaurant(restaurant)}
                  >
                    <div className="restaurant-name">{restaurant.restaurantName}</div>
                    {restaurant.branchName && (
                      <div className="restaurant-branch">{restaurant.branchName}</div>
                    )}
                    <div className="restaurant-info">
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
                    onClick={() => toggleCardExpansion(restaurant.id)}
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
                      <p><strong>상태:</strong> {restaurant.status || '정보 없음'}</p>
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedRestaurant && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedRestaurant(null)}>&times;</span>
            <div className="restaurant-details">
              <h2>{selectedRestaurant.restaurantName}</h2>
              {selectedRestaurant.branchName && <h3>{selectedRestaurant.branchName}</h3>}
              
              <div className="detail-section">
                <h4>위치 정보</h4>
                <p><strong>지역:</strong> {selectedRestaurant.regionName}</p>
                {selectedRestaurant.roadAddress && (
                  <p><strong>주소:</strong> {selectedRestaurant.roadAddress}</p>
                )}
                {selectedRestaurant.areaInfo && (
                  <p><strong>상세지역:</strong> {selectedRestaurant.areaInfo}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>메뉴 정보</h4>
                <p><strong>주요 메뉴:</strong> {selectedRestaurant.mainMenu || '정보 없음'}</p>
                <p><strong>다국어 메뉴:</strong> {selectedRestaurant.multilingualMenu || '정보 없음'}</p>
              </div>

              <div className="detail-section">
                <h4>운영 정보</h4>
                <p><strong>영업시간:</strong> {selectedRestaurant.openingHours || '정보 없음'}</p>
                <p><strong>휴무일:</strong> {selectedRestaurant.holidayInfo || '정보 없음'}</p>
                <p><strong>상태:</strong> {selectedRestaurant.status || '정보 없음'}</p>
              </div>

              <div className="detail-section">
                <h4>편의시설</h4>
                <div className="facility-grid">
                  <span className={`facility-item ${selectedRestaurant.parking === '가능' ? 'available' : 'unavailable'}`}>
                    주차 {selectedRestaurant.parking || '정보 없음'}
                  </span>
                  <span className={`facility-item ${selectedRestaurant.wifi === '가능' ? 'available' : 'unavailable'}`}>
                    WiFi {selectedRestaurant.wifi || '정보 없음'}
                  </span>
                  <span className={`facility-item ${selectedRestaurant.kidsZone === '가능' ? 'available' : 'unavailable'}`}>
                    키즈존 {selectedRestaurant.kidsZone || '정보 없음'}
                  </span>
                  <span className={`facility-item ${selectedRestaurant.delivery === '가능' ? 'available' : 'unavailable'}`}>
                    배달 {selectedRestaurant.delivery || '정보 없음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>처리 중...</p>
        </div>
      )}
    </div>
  );
}

export default App;
