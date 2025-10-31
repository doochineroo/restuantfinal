import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import './styles/common.css';
import ReservationPage from './ReservationPage';
import SearchSection from './components/sections/SearchSection';
import FilterTabs from './components/FilterTabs';
import MapSection from './components/sections/MapSection';
import RestaurantList from './components/sections/RestaurantList';
import RestaurantDetailModal from './components/modals/RestaurantDetailModal';
import TopNav from './components/navigation/TopNav';
import MainNav from './components/navigation/MainNav';
import ProtectedRoute from './components/ProtectedRoute';
import { useRestaurantSearch } from './hooks/useRestaurantSearch';
import { useMap } from './hooks/useMap';

// 테스트용 Demo 컴포넌트 임포트
import { AuthProvider, useAuth } from './demo/context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './demo/pages/auth/LoginPage';
import DemoLayout from './demo/components/layout/DemoLayout';
import ReviewsPage from './demo/pages/auth/ReviewsPage';
import AdminPage from './demo/pages/admin/AdminPage';
import BottomNav from './demo/components/layout/BottomNav/BottomNav';
import HomePage from './pages/main/HomePage';
import SearchPage from './pages/main/SearchPage';
import NearMePage from './pages/main/NearMePage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ReservationHistoryPage from './pages/user/ReservationHistoryPage';
import MyPageAccordion from './pages/user/MyPageAccordion';
import ChatPage from './pages/chat/ChatPage';

// public 폴더의 커서 이미지 경로
// JS에서 사용하려면 이렇게 참조하세요:
// const cursorPath = process.env.PUBLIC_URL + '/cursor_basic.png';
// 또는 그냥: const cursorPath = '/cursor_basic.png';

// 메인 페이지 컴포넌트
function MainPage() {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('전체');
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);

  const { map, updateMap, showSelectedMarker, clearMarkers, isMapLoading, mapError } = useMap();

  // 검색 완료 시 지도 업데이트 콜백 (useCallback으로 메모이제이션)
  const handleSearchComplete = React.useCallback((searchResults) => {
    if (map && searchResults && searchResults.length > 0) {
      const restaurantsWithCoords = searchResults.filter(
        restaurant => restaurant.lat && restaurant.lng
      );
      if (restaurantsWithCoords.length > 0) {
        updateMap(restaurantsWithCoords, handleMarkerClick);
      } else {
        clearMarkers();
      }
    }
  }, [map, updateMap, clearMarkers, handleMarkerClick]);

  // 커스텀 훅 사용
  const {
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
  } = useRestaurantSearch(handleSearchComplete);

  // 마커 클릭 시 카드 자동 선택 핸들러
  const handleMarkerClick = (restaurant) => {
    // 해당 식당 카드 자동 선택
    setSelectedRestaurant(restaurant);
    setExpandedCard(restaurant.id);
    
    // 카드가 보이도록 스크롤 (선택사항)
    const cardElement = document.getElementById(`restaurant-card-${restaurant.id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 지도가 초기화되면 마커 업데이트 (좌표가 있는 식당만)
  React.useEffect(() => {
    if (map && filteredRestaurants.length > 0) {
      // lat, lng가 있는 식당만 지도에 표시
      const restaurantsWithCoords = filteredRestaurants.filter(
        restaurant => restaurant.lat && restaurant.lng
      );
      updateMap(restaurantsWithCoords, handleMarkerClick);
    } else if (map && filteredRestaurants.length === 0) {
      // 검색 결과가 없으면 기존 마커 제거
      clearMarkers();
    }
  }, [map, filteredRestaurants]); // updateMap, clearMarkers 의존성 제거


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
          setCurrentRegion(filterValue); // 현재 지역 설정
          filterByRegionType(filterValue);
          break;
        case 'all':
          // 전체 선택 시 - 모든 식당 표시
          setActiveFilterTab('전체');
          setCurrentRegion(null); // 현재 지역 초기화
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
        setSelectedRestaurant(restaurant);
        
        // 1. 기존 마커 모두 제거
        clearMarkers();
        
        // 2. 선택된 식당의 마커만 표시 (지도 중심 이동 및 확대 포함)
        setTimeout(() => {
          showSelectedMarker(restaurant, setSelectedRestaurant);
        }, 50); // 더 빠른 응답을 위해 지연 시간 단축
      }
    } else {
      setSelectedRestaurant(null);
      
      // 1. 기존 마커 제거
      clearMarkers();
      
      // 2. 모든 필터링된 식당 마커 다시 표시
      setTimeout(() => {
        const restaurantsWithCoords = filteredRestaurants.filter(
          restaurant => restaurant.lat && restaurant.lng
        );
        if (restaurantsWithCoords.length > 0) {
          updateMap(restaurantsWithCoords, handleMarkerClick);
        }
      }, 50);
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
    <div className="App">
      <TopNav />
      <MainNav />

      <SearchSection onSearch={handleSearch} currentRegion={currentRegion} />
      
            <FilterTabs
              hasSearched={hasSearched}
              restaurants={restaurants}
              filteredRestaurants={filteredRestaurants}
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
        <MapSection 
          selectedRestaurant={selectedRestaurant} 
          isMapLoading={isMapLoading}
          mapError={mapError}
        />

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

    </div>
  );
}

// ProtectedRoute는 이미 import되어 있음

// 메인 App 컴포넌트 (라우터 설정)
function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          {/* 메인 페이지들 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/nearme" element={<NearMePage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/reservation-history" element={
            <ProtectedRoute>
              <ReservationHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MyPageAccordion />
            </ProtectedRoute>
          } />
          <Route path="/my" element={
            <ProtectedRoute>
              <MyPageAccordion />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/owner-dashboard" element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          
          {/* 보호된 Demo 라우트 */}
          <Route
            path="/demo"
            element={
              <ProtectedRoute>
                <DemoLayout />
              </ProtectedRoute>
            }
          >
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;