import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { statisticsAPI } from '../../demo/services/apiService';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import SearchSection from '../../components/sections/SearchSection';
import FilterTabs from '../../components/FilterTabs';
import SearchRestaurantList from '../../components/sections/SearchRestaurantList';
import '../../components/sections/SearchRestaurantList.css';
import RestaurantDetailModal from '../../components/modals/RestaurantDetailModal';
import { useRestaurantSearch } from '../../hooks/useRestaurantSearch';
import '../../styles/common.css';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('전체');
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popularKeywords, setPopularKeywords] = useState([]);

  // 커스텀 훅 사용 (내주변 탭과 동일)
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
  } = useRestaurantSearch();

  // OWNER는 Owner Dashboard로 리다이렉트
  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // URL에서 카테고리 파라미터 가져오기
  useEffect(() => {
    const category = new URLSearchParams(location.search).get('category');
    if (category) {
      handleSearch(category);
    }
  }, [location.search, handleSearch]);

  // 인기 검색어 가져오기
  useEffect(() => {
    const fetchPopularKeywords = async () => {
      try {
        const response = await statisticsAPI.getPopularKeywords(10);
        setPopularKeywords(response.data.map(item => ({
          keyword: item.keyword,
          count: item.searchCount
        })));
      } catch (err) {
        console.error('인기 검색어 로딩 오류:', err);
        setPopularKeywords([]);
      }
    };
    fetchPopularKeywords();
  }, []);

  // 필터 변경 핸들러 (내주변 탭과 동일)
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

  // 카드 클릭 시 상세정보 토글 (내주변 탭과 동일)
  const toggleCardExpansion = (restaurantId) => {
    const isCurrentlyExpanded = expandedCard === restaurantId;
    
    setExpandedCard(isCurrentlyExpanded ? null : restaurantId);
    
    // 선택된 식당도 함께 업데이트
    if (!isCurrentlyExpanded) {
      const restaurant = filteredRestaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      }
    } else {
      setSelectedRestaurant(null);
    }
  };

  // 예약하기 버튼 클릭 (내주변 탭과 동일)
  const handleReservation = (restaurant, event) => {
    event.stopPropagation();
    try {
      navigate('/reservation', { state: { restaurant } });
    } catch (error) {
      console.error('예약 페이지 이동 오류:', error);
      alert('예약 페이지로 이동하는데 실패했습니다.');
    }
  };

  // 상세정보 모달 핸들러 (내주변 탭과 동일)
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

  // 인기 검색어 클릭 핸들러
  const handleKeywordClick = (keyword) => {
    handleSearch(keyword);
  };

  return (
    <div className="search-page">
      <TopNav />
      <MainNav />
      
      <main className="search-main">
        {/* 헤더 */}
        

        <SearchSection onSearch={handleSearch} />
        
        <FilterTabs
          hasSearched={hasSearched}
          restaurants={restaurants}
          regions={regions}
          activeFilterTab={activeFilterTab}
          selectedServices={selectedServices}
          onFilterChange={handleFilterChange}
        />

        {/* 인기 검색어 섹션 */}
        <section className="popular-keywords-section">
          <div className="section-header">
            <h2>인기 검색어</h2>
          </div>
          <div className="keywords-grid">
            {popularKeywords.map((item, index) => (
              <button
                key={index}
                className="keyword-item"
                onClick={() => handleKeywordClick(item.keyword)}
              >
                <span className="keyword-rank">#{index + 1}</span>
                <span className="keyword-text">{item.keyword}</span>
                <span className="keyword-count">{item.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 에러 메시지 */}
        {error && (
              <div className="error-message">
                <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-btn">닫기</button>
              </div>
            )}

        <SearchRestaurantList
          hasSearched={hasSearched}
          filteredRestaurants={filteredRestaurants}
          activeFilterTab={activeFilterTab}
          expandedCard={expandedCard}
          onCardClick={toggleCardExpansion}
          onReservation={handleReservation}
          onDetailView={handleDetailView}
        />

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

export default SearchPage;