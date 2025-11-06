import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { statisticsAPI } from '../../demo/services/apiService';
import { restaurantAPI } from '../../demo/services/api';
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
  const { keyword } = useParams(); // URL 경로에서 검색어 가져오기
  const { user } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('전체');
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortOption, setSortOption] = useState('default'); // 정렬 옵션: 'default', 'rating', 'reviewCount', 'popular'
  const [modalRestaurant, setModalRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // 커스텀 훅 사용 (내주변 탭과 동일)
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

  // OWNER는 Owner Dashboard로 리다이렉트
  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // URL 경로에서 검색어 가져와서 검색 실행
  useEffect(() => {
    if (keyword) {
      // URL 디코딩
      const decodedKeyword = decodeURIComponent(keyword);
      // URL에서 검색어가 있으면 검색 실행
      handleSearch(decodedKeyword);
      // 검색 통계 기록
      statisticsAPI.recordSearch(decodedKeyword).catch(err => {
        console.error('검색 통계 기록 실패:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]); // keyword가 변경될 때만 실행 (handleSearch는 useRestaurantSearch에서 나오므로 dependency 제외)

  // state에서 카테고리 파라미터 가져오기 (기존 호환성 유지)
  useEffect(() => {
    const category = location.state?.category;
    if (category) {
      setCategoryLoading(true);
      // 모든 식당 불러오기
      restaurantAPI.getAll().then(response => {
        const excludedCategories = ['아시아', '술집'];
        const validCategories = ['한식', '중식', '일식', '양식', '분식', '치킨'];
        
        const filtered = response.data.filter(restaurant => {
          let restaurantCategory = restaurant.category || '기타';
          
          // "전체"인 경우 모든 식당 표시 (아시아, 술집 제외)
          if (category === '전체') {
            return !excludedCategories.includes(restaurantCategory);
          }
          
          // "기타"인 경우: 유효한 카테고리가 아니고, 아시아/술집이 아닌 것들
          if (category === '기타') {
            // 아시아, 술집 제외
            if (excludedCategories.includes(restaurantCategory)) {
              return false;
            }
            // 유효한 카테고리가 아니면 기타로 분류
            return !validCategories.includes(restaurantCategory);
          }
          
          // 특정 카테고리인 경우 정확히 매칭
          return restaurantCategory === category;
        });
        
        setFilteredRestaurants(filtered);
        setActiveFilterTab(category);
        setHasSearched(true);
        setCategoryLoading(false);
      }).catch(error => {
        console.error('카테고리 필터링 오류:', error);
        setCategoryLoading(false);
      });
    }
  }, [location.state, setFilteredRestaurants, setHasSearched]);

  // 인기 검색어 가져오기 - 로딩 상태 추가
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPopularKeywords = async () => {
      try {
        setKeywordsLoading(true);
        const response = await statisticsAPI.getPopularKeywords(10);
        console.log('인기 검색어 데이터:', response.data);
        setPopularKeywords(response.data.map(item => ({
          keyword: item.keyword,
          count: item.searchCount || 0
        })));
      } catch (err) {
        console.error('인기 검색어 로딩 오류:', err);
        setPopularKeywords([]);
      } finally {
        setKeywordsLoading(false);
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
    const encodedKeyword = encodeURIComponent(keyword.trim());
    navigate(`/search/${encodedKeyword}`, { replace: true });
  };

  // SearchSection에서 검색할 때 URL 업데이트
  const handleSearchWithUrl = (searchKeyword) => {
    const encodedKeyword = encodeURIComponent(searchKeyword.trim());
    navigate(`/search/${encodedKeyword}`, { replace: true });
  };

  // 정렬된 식당 목록 계산
  const sortedRestaurants = useMemo(() => {
    if (!filteredRestaurants || filteredRestaurants.length === 0) {
      return [];
    }

    const sorted = [...filteredRestaurants];
    
    switch (sortOption) {
      case 'rating':
        // 리뷰 좋은 순 (평점 높은 순)
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA; // 평점 높은 순
          }
          // 평점이 같으면 리뷰 개수 많은 순
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
      
      case 'reviewCount':
        // 리뷰 많은 순
        return sorted.sort((a, b) => {
          const countA = a.reviewCount || 0;
          const countB = b.reviewCount || 0;
          if (countB !== countA) {
            return countB - countA; // 리뷰 개수 많은 순
          }
          // 리뷰 개수가 같으면 평점 높은 순
          return (b.rating || 0) - (a.rating || 0);
        });
      
      case 'popular':
        // 인기순 (리뷰 개수와 평점 종합)
        return sorted.sort((a, b) => {
          const scoreA = ((a.rating || 0) * 0.7) + ((a.reviewCount || 0) * 0.3);
          const scoreB = ((b.rating || 0) * 0.7) + ((b.reviewCount || 0) * 0.3);
          return scoreB - scoreA;
        });
      
      case 'default':
      default:
        // 기본순 (변경 없음)
        return sorted;
    }
  }, [filteredRestaurants, sortOption]);

  return (
    <div className="search-page">
      <TopNav />
      <MainNav />
      
      <main className="search-main">
        {/* 헤더 */}
        

        <SearchSection onSearch={handleSearchWithUrl} />
        
        <FilterTabs
          hasSearched={hasSearched}
          restaurants={restaurants}
          filteredRestaurants={filteredRestaurants}
          regions={regions}
          activeFilterTab={activeFilterTab}
          selectedServices={selectedServices}
          onFilterChange={handleFilterChange}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {/* 인기 검색어 섹션 */}
        <section className="popular-keywords-section">
          <div className="section-header">
            <h2>인기 검색어</h2>
          </div>
          {keywordsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              로딩 중...
            </div>
          ) : (
            <div className="keywords-grid">
              {popularKeywords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  인기 검색어가 없습니다
                </div>
              ) : (
                popularKeywords.map((item, index) => (
                  <button
                    key={index}
                    className="keyword-item"
                    onClick={() => handleKeywordClick(item.keyword)}
                  >
                    <span className="keyword-rank">{index + 1}위</span>
                    <span className="keyword-text">{item.keyword}</span>
                    <span className="keyword-count">{item.count}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        {/* 에러 메시지 */}
        {error && (
              <div className="error-message">
                <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-btn">닫기</button>
              </div>
            )}

        {/* 카테고리 로딩 중 */}
        {categoryLoading && (
          <div className="section-loading">
            <img src="/images/loading.png" alt="로딩 중" className="loading-image" />
            <p>데이터를 불러오는 중...</p>
          </div>
        )}

        {!categoryLoading && (
          <SearchRestaurantList
            hasSearched={hasSearched}
            filteredRestaurants={sortedRestaurants}
            activeFilterTab={activeFilterTab}
            expandedCard={expandedCard}
            onCardClick={toggleCardExpansion}
            onReservation={handleReservation}
            onDetailView={handleDetailView}
          />
        )}

        {loading && !categoryLoading && (
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