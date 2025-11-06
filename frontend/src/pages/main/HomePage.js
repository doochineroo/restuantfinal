import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import RestaurantDetailModal from '../../components/modals/RestaurantDetailModal';
import { restaurantAPI, statisticsAPI } from '../../demo/services/api';
import { useAuth } from '../../demo/context/AuthContext';
import { getImageUrl, API_BASE_URL } from '../../constants/config/apiConfig';
import FavoriteHeart from '../../components/common/FavoriteHeart';
import { useAllRestaurants, usePopularRestaurants } from '../../hooks/useRestaurants';
import { useChatUnreadCount } from '../../hooks/useChatUnreadCount';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: chatUnreadCount = 0 } = useChatUnreadCount();

  const convertToAbsoluteUrl = (url) => {
    return getImageUrl(url);
  };
  
  // 카테고리 이미지 매핑 (cate_img 디렉토리 이미지 사용)
  const getCategoryImage = (categoryName) => {
    const categoryImages = {
      '한식': '/images/categories/korean_food.png',
      '중식': '/images/categories/china_food.png',
      '일식': '/images/categories/japan_food.png',
      '양식': '/images/categories/italia_food.png',
      '분식': '/images/categories/dduckbbokki_food.png',
      '치킨': '/images/categories/chicken_food.png',
      '기타': '/images/categories/else.food.png',
      '전체': '/images/categories/all_food.png'
    };
    return categoryImages[categoryName] || '/images/categories/else.food.png';
  };

  // React Query로 데이터 로드
  const { data: allRestaurants = [], isLoading: restaurantsLoading, isFetching: restaurantsFetching } = useAllRestaurants();
  const { data: popularRestaurants = [], isLoading: popularLoading, isFetching: popularFetching } = usePopularRestaurants(10);
  
  // 최신 식당 10개 (ID 기준으로 내림차순 정렬)
  const latestRestaurants = useMemo(() => {
    if (!allRestaurants || allRestaurants.length === 0) return [];
    return [...allRestaurants]
      .sort((a, b) => (b.id || 0) - (a.id || 0)) // ID 내림차순 (최신순)
      .slice(0, 10);
  }, [allRestaurants]);

  // TODO: 관리자 대시보드에서 등록한 메인 배너 데이터를 가져올 API
  // 예: const { data: mainBanners = [] } = useMainBanners();
  const mainBanners = []; // 빈 배열로 초기화 - 나중에 API 연결

  const initialLoading = restaurantsLoading && allRestaurants.length === 0;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null); // { lat, lng }
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 거리 계산 함수 (하버사인 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
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

  // 거리 포맷팅 (미터 또는 킬로미터)
  const formatDistance = (distanceInMeters) => {
    if (distanceInMeters === null) return null;
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  };

  // 좌표를 주소로 변환 (역지오코딩) - 백엔드를 통해 호출
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/reverse-geocode?lat=${lat}&lng=${lng}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('역지오코딩 API 호출 실패');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        return data.address;
      }
      
      return null;
    } catch (error) {
      console.error('역지오코딩 오류:', error);
      return null;
    }
  };

  // 현재 위치 가져오기 및 주소 변환 (페이지 로드 시 자동 실행)
  useEffect(() => {
    // 위치 정보를 가져오는 함수
    const getLocation = () => {
      if (navigator.geolocation) {
        // 위치 권한 요청 (자동으로 팝업 표시)
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ lat: latitude, lng: longitude });
            
            // 좌표를 주소로 변환 (구까지만)
            const address = await reverseGeocode(latitude, longitude);
            if (address) {
              setCurrentLocation(address);
            } else {
              // 주소 변환 실패 시 기본값
              setCurrentLocation('위치 정보 없음');
            }
          },
          (error) => {
            console.log('위치 정보를 가져올 수 없습니다:', error);
            // 기본 위치 설정 (서울 시청)
            setCurrentPosition({ lat: 37.5665, lng: 126.9780 });
            // 기본 주소도 설정 (구까지만)
            reverseGeocode(37.5665, 126.9780).then(address => {
              setCurrentLocation(address || '서울특별시 중구');
            });
          },
          {
            enableHighAccuracy: true, // 높은 정확도 사용
            timeout: 15000, // 타임아웃 증가
            maximumAge: 0 // 캐시 사용 안 함 (항상 최신 위치)
          }
        );
      } else {
        // Geolocation을 지원하지 않는 경우
        console.log('Geolocation을 지원하지 않는 브라우저입니다.');
        // 기본 위치 설정
        setCurrentPosition({ lat: 37.5665, lng: 126.9780 });
        // 기본 주소도 설정
        reverseGeocode(37.5665, 126.9780).then(address => {
          setCurrentLocation(address || '서울특별시 중구');
        });
      }
    };

    // 페이지 로드 시 즉시 위치 정보 요청
    getLocation();
  }, []);

  // 카테고리 계산 (아시아, 술집 제외하고 나머지는 기타로)
  const categories = useMemo(() => {
    if (!allRestaurants || allRestaurants.length === 0) return [];
    
    const excludedCategories = ['아시아', '술집'];
    const validCategories = ['한식', '중식', '일식', '양식', '분식', '치킨'];
    const categoryCount = {};
    
    allRestaurants.forEach(restaurant => {
      let category = restaurant.category || '기타';
      
      // 아시아, 술집 제외
      if (excludedCategories.includes(category)) {
        return; // 카운트하지 않음
      }
      
      // 유효한 카테고리가 아니면 기타로 분류
      if (!validCategories.includes(category)) {
        category = '기타';
      }
      
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
    // 빈도순으로 정렬하되, 기타는 항상 마지막에
    const sortedCategories = Object.entries(categoryCount)
      .sort(([nameA, countA], [nameB, countB]) => {
        // 기타는 항상 마지막
        if (nameA === '기타') return 1;
        if (nameB === '기타') return -1;
        // 나머지는 빈도순
        return countB - countA;
      });
    
    return sortedCategories
          .slice(0, 8)
          .map(([name, count]) => ({
            name,
            count
          }));
  }, [allRestaurants]);

  // 내 주변 추천 맛집 계산 (거리 기준 정렬)
  const nearbyRestaurants = useMemo(() => {
    if (!allRestaurants || allRestaurants.length === 0 || !currentPosition) {
      return [];
    }

    // 위치 정보가 있는 식당만 필터링하고 거리 계산
    const restaurantsWithDistance = allRestaurants
      .filter(restaurant => restaurant.lat && restaurant.lng)
      .map(restaurant => {
        const distance = calculateDistance(
          currentPosition.lat,
          currentPosition.lng,
          restaurant.lat,
          restaurant.lng
        );
        return {
          ...restaurant,
          distance
        };
      })
      .filter(restaurant => restaurant.distance !== null) // 거리 계산이 가능한 것만
      .sort((a, b) => a.distance - b.distance) // 거리순 정렬
      .slice(0, 5); // 상위 5개만

    return restaurantsWithDistance;
  }, [allRestaurants, currentPosition]);

  const handleRestaurantClick = async (restaurantId) => {
    try {
      await statisticsAPI.recordClick(restaurantId, user?.id || null);
    } catch (error) {
      console.error('클릭 통계 기록 실패:', error);
    }
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      const encodedKeyword = encodeURIComponent(searchKeyword.trim());
      navigate(`/search/${encodedKeyword}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestaurantCardClick = (restaurant) => {
    handleRestaurantClick(restaurant.id);
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  const handleModalReservation = (restaurant) => {
    handleCloseModal();
    navigate('/reservation', { state: { restaurant } });
  };

  const handleCategoryClick = (categoryName) => {
    // 카테고리는 기존 방식 유지 (state로 전달)
    navigate('/search', { state: { category: categoryName } });
  };

  if (initialLoading) {
    return (
      <div className="home-page">
        <TopNav />
        <main className="home-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </main>
        <MainNav />
      </div>
    );
  }

  return (
    <div className="home-page">
      <TopNav />
      <main className="home-main">
        
        {/* 헤더 */}
        <header className="home-header">
          {/* 검색 바 */}
          <div className="home-search-bar">
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              placeholder="맛집을 검색해보세요"
              className="home-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button className="home-search-btn" onClick={handleSearch}>
              검색
            </button>
          </div>
        </header>

        {/* 메인 카테고리 */}
        <section className="main-categories-section">
          {(restaurantsLoading || restaurantsFetching) ? (
            <div className="section-loading">
              <img src="/images/loading.png" alt="로딩 중" className="loading-image" />
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className="categories-grid">
              <button 
                className="category-btn"
                onClick={() => handleCategoryClick('전체')}
              >
                <div className="category-icon">
                  <img 
                    src={getCategoryImage('전체')} 
                    alt="전체" 
                    onError={(e) => { 
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }} 
                  />
                  <div className="category-icon-placeholder" style={{display: 'none'}}>전체</div>
                </div>
                <div className="category-name">전체</div>
              </button>
              {categories.map((category, index) => (
                <button 
                  key={index}
                  className="category-btn"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="category-icon">
                    <img 
                      src={getCategoryImage(category.name)} 
                      alt={category.name}
                      onError={(e) => { 
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextSibling;
                        if (placeholder) placeholder.style.display = 'block';
                      }} 
                    />
                    <div className="category-icon-placeholder" style={{display: 'none'}}>
                      {category.name.charAt(0)}
                    </div>
                  </div>
                  <div className="category-name">{category.name}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 메인 프로모션 배너 (캐러셀) - 관리자 대시보드에서 관리 */}
        <section className="promotion-banner-section">
          {mainBanners.length > 0 ? (
            <div className="promotion-banner-carousel">
              {mainBanners.map((banner) => (
                <div 
                  key={banner.id} 
                  className="promotion-banner"
                  onClick={() => {
                    // TODO: 배너 클릭 시 동작 (식당 상세 페이지 또는 특정 링크로 이동)
                    if (banner.restaurantId) {
                      // 식당 상세 페이지로 이동
                      // navigate(`/restaurant/${banner.restaurantId}`);
                    } else if (banner.linkUrl) {
                      // 외부 링크로 이동
                      // window.open(banner.linkUrl, '_blank');
                    }
                  }}
                >
                  <div className="promotion-banner-bg">
                    <img 
                      src={convertToAbsoluteUrl(banner.imageUrl) || '/image-placeholder.svg'} 
                      alt={banner.title}
                      onError={(e) => {
                        e.target.src = '/image-placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="promotion-banner-content">
                    <div className="promotion-banner-title">{banner.title}</div>
                    {banner.subtitle && (
                      <div className="promotion-banner-restaurant">{banner.subtitle}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          ) : (
            // 배너가 없을 때는 표시하지 않음 (또는 placeholder 표시)
            null
          )}
        </section>

        {/* 지금 가장 HOT한 식당 */}
        <section className="hot-restaurants-section">
              <div className="section-header">
            <h2 className="section-title">지금 가장 HOT한 식당 🔥</h2>
          </div>
          {(popularLoading || popularFetching) ? (
            <div className="section-loading">
              <img src="/images/loading.png" alt="로딩 중" className="loading-image" />
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className="restaurant-carousel">
              {popularRestaurants.length > 0 ? (
                popularRestaurants.slice(0, 6).map((item) => {
                  const restaurant = item.restaurant || item;
                  return (
                  <div 
                    key={restaurant.id} 
                      className="restaurant-card-small"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                      <div className="restaurant-card-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                        <FavoriteHeart restaurantId={restaurant.id} />
                      </div>
                      <div className="restaurant-card-info">
                        <div className="restaurant-card-name">{restaurant.restaurantName}</div>
                        <div className="restaurant-card-rating">
                          ⭐ {(restaurant.rating || 0).toFixed(1)} ({restaurant.reviewCount || 0})
                    </div>
                        <div className="restaurant-card-category">{restaurant.category || '기타'}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">인기 식당이 없습니다.</div>
              )}
            </div>
          )}
          </section>

        {/* 내 주변 추천 맛집 */}
        <section className="nearby-restaurants-section">
            <div className="section-header">
            <h2 className="section-title">내 주변 추천 맛집 📍</h2>
            <button 
              className="map-view-btn"
              onClick={() => navigate('/nearme')}
            >
              🗺️ 지도로 보기
            </button>
              </div>
          {(restaurantsLoading || restaurantsFetching) ? (
            <div className="section-loading">
              <img src="/images/loading.png" alt="로딩 중" className="loading-image" />
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : nearbyRestaurants.length > 0 ? (
            <div className="nearby-restaurants-list">
              {nearbyRestaurants.map((restaurant) => {
                const distanceText = formatDistance(restaurant.distance);
                return (
                  <div 
                    key={restaurant.id} 
                    className="nearby-restaurant-item"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                    <div className="nearby-restaurant-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="nearby-restaurant-info">
                      <div className="nearby-restaurant-name">{restaurant.restaurantName}</div>
                      <div className="nearby-restaurant-meta">
                        <span className="rating">⭐ {(restaurant.rating || 0).toFixed(1)} ({restaurant.reviewCount || 0})</span>
                        {distanceText && (
                          <span className="distance">{distanceText}</span>
                        )}
                      </div>
                      <div className="nearby-restaurant-category">{restaurant.category || '기타'}</div>
                      {restaurant.roadAddress && (
                        <div className="nearby-restaurant-address">{restaurant.roadAddress}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-nearby-restaurants">
              <p>주변에 위치 정보가 있는 맛집이 없습니다.</p>
          </div>
          )}
        </section>

        {/* 새로 입점했어요! */}
        <section className="new-restaurants-section">
            <div className="section-header">
            <h2 className="section-title">새로 입점했어요! ✨</h2>
              </div>
          {(restaurantsLoading || restaurantsFetching) ? (
            <div className="section-loading">
              <img src="/images/loading.png" alt="로딩 중" className="loading-image" />
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className="restaurant-carousel">
              {latestRestaurants.length > 0 ? (
                latestRestaurants.map((restaurant) => {
                return (
                  <div 
                    key={restaurant.id} 
                      className="restaurant-card-small"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                      <div className="restaurant-card-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                        <div className="new-badge">NEW</div>
                        <FavoriteHeart restaurantId={restaurant.id} />
                      </div>
                      <div className="restaurant-card-info">
                        <div className="restaurant-card-name">{restaurant.restaurantName}</div>
                        <div className="restaurant-card-rating">
                          ⭐ {(restaurant.rating || 0).toFixed(1)} ({restaurant.reviewCount || 0})
                        </div>
                        <div className="restaurant-card-category">{restaurant.category || '기타'}</div>
                    </div>
                  </div>
                );
                })
              ) : (
                <div className="no-data">최신 식당이 없습니다.</div>
              )}
            </div>
          )}
        </section>

      </main>
      
      <MainNav />
      
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10L10 5M10 5L5 10M10 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReservation={handleModalReservation}
      />
    </div>
  );
};

export default HomePage;
