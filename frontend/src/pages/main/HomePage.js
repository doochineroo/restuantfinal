import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import RestaurantDetailModal from '../../components/modals/RestaurantDetailModal';
import { restaurantAPI, statisticsAPI } from '../../demo/services/api';
import { useAuth } from '../../demo/context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const convertToAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };
  
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [recentRestaurants, setRecentRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 10;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const featuredResponse = await statisticsAPI.getPopularRestaurantsWithCount(3);
        setFeaturedRestaurants(featuredResponse.data);
        
        const popularResponse = await statisticsAPI.getPopularRestaurantsWithCount(10);
        setPopularRestaurants(popularResponse.data);
        
        const recentResponse = await statisticsAPI.getRecentPopularRestaurants(6);
        setRecentRestaurants(recentResponse.data);
        
        const allRestaurantsResponse = await restaurantAPI.getAll();
        const restaurants = allRestaurantsResponse.data;
        
        const categoryCount = {};
        restaurants.forEach(restaurant => {
          const category = restaurant.category || '기타';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        const categoryList = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([name, count]) => ({
            name,
            count
          }));
        
        setCategories(categoryList);
        setFilteredRestaurants(restaurants);
        
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setFeaturedRestaurants([]);
        setPopularRestaurants([]);
        setRecentRestaurants([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRestaurantClick = async (restaurantId) => {
    try {
      await statisticsAPI.recordClick(restaurantId, user?.id || null);
    } catch (error) {
      console.error('클릭 통계 기록 실패:', error);
    }
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      statisticsAPI.recordSearch(searchKeyword);
      navigate('/search', { state: { keyword: searchKeyword } });
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
    setSelectedCategory(categoryName);
    setCurrentPage(1); // 페이지 초기화
    const allRestaurantsResponse = restaurantAPI.getAll().then(response => {
      const filtered = response.data.filter(restaurant => {
        // "기타"는 category가 null이거나 빈 문자열인 경우도 포함
        if (categoryName === '기타') {
          return !restaurant.category || restaurant.category === '' || restaurant.category === '기타';
        }
        return restaurant.category === categoryName;
      });
      setFilteredRestaurants(filtered);
    });
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
  const startIndex = (currentPage - 1) * restaurantsPerPage;
  const endIndex = startIndex + restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  if (loading) {
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
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="search-hero">
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="지역, 음식종류, 레스토랑명으로 검색"
                className="search-input"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button className="search-button" onClick={handleSearch}>
                검색
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="container">
            <h2 className="section-header-title">카테고리별 탐색</h2>
            <div className="categories-grid">
              <button 
                className={`category-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(null);
                  restaurantAPI.getAll().then(response => {
                    setFilteredRestaurants(response.data);
                  });
                }}
              >
                <div className="category-label">전체</div>
              </button>
              {categories.map((category, index) => (
                <button 
                  key={index}
                  className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="category-label">{category.name}</div>
                  <div className="category-badge">{category.count}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Category Results Section */}
        {selectedCategory && filteredRestaurants.length > 0 && (
          <section className="category-results-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">{selectedCategory} 식당 ({filteredRestaurants.length}개)</h2>
                <button className="clear-filter-btn" onClick={() => {
                  navigate('/search', { state: { category: selectedCategory } });
                }}>
                  전체보기
                </button>
              </div>
              
              <div className="category-results-list">
                {currentRestaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id} 
                    className="category-result-item"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                    <div className="result-item-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="result-item-content">
                      <h3>{restaurant.restaurantName}</h3>
                      <p className="result-location">{restaurant.roadAddress || restaurant.regionName}</p>
                      <div className="result-item-tags">
                        {restaurant.category && (
                          <span className="result-tag">{restaurant.category}</span>
                        )}
                        {restaurant.parking === 'Y' && <span className="result-tag">주차</span>}
                        {restaurant.wifi === 'Y' && <span className="result-tag">와이파이</span>}
                        {restaurant.delivery === 'Y' && <span className="result-tag">배달</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </button>
                  <div className="pagination-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Featured Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <div className="section-header-left">
                <span className="section-badge">추천</span>
                <h2 className="section-title">이번 주 베스트 맛집</h2>
              </div>
            </div>
            <div className="featured-grid">
              {featuredRestaurants.map((item, index) => {
                const restaurant = item.restaurant || item;
                const clickCount = item.clickCount || 0;
                return (
                  <div 
                    key={restaurant.id} 
                    className="featured-card"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                    <div className="featured-badge">BEST {index + 1}</div>
                    <div className="featured-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="featured-content">
                      <h3 className="featured-name">{restaurant.restaurantName}</h3>
                      <div className="featured-meta">
                        <span className="views">{clickCount}명 검색</span>
                      </div>
                      <p className="featured-location">{restaurant.roadAddress || restaurant.regionName}</p>
                      <div className="featured-details">
                        {restaurant.category && (
                          <span className="featured-category">{restaurant.category}</span>
                        )}
                        {restaurant.openingHours && (
                          <span className="featured-hours">🕐 {restaurant.openingHours.split('\n')[0]}</span>
                        )}
                      </div>
                      {restaurant.description && (
                        <p className="featured-description">{restaurant.description.substring(0, 80)}...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trending Section */}
        <section className="trending-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-badge trending">트렌딩</span>
                <h2 className="section-title">요즘 인기 식당</h2>
              </div>
            </div>
            <div className="trending-grid">
              {recentRestaurants.map((item, index) => {
                const restaurant = item.restaurant || item;
                return (
                  <div 
                    key={restaurant.id} 
                    className="trending-card"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                    <div className="trending-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl || restaurant.thumbnailUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="trending-content">
                      <h3>{restaurant.restaurantName}</h3>
                      <div className="trending-meta">
                        {restaurant.category && (
                          <span className="category">{restaurant.category}</span>
                        )}
                      </div>
                      <p className="location">{restaurant.roadAddress || restaurant.regionName}</p>
                      <div className="trending-services">
                        {restaurant.parking === 'Y' && <span className="service-badge">주차</span>}
                        {restaurant.wifi === 'Y' && <span className="service-badge">와이파이</span>}
                        {restaurant.delivery === 'Y' && <span className="service-badge">배달</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Ranking Section */}
        <section className="ranking-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-badge">인기</span>
                <h2 className="section-title">TOP 10 인기 맛집</h2>
              </div>
              <button className="view-all-button" onClick={() => navigate('/search')}>
                전체보기 →
              </button>
            </div>
            <div className="ranking-list">
              {popularRestaurants.slice(0, 10).map((item, index) => {
                const restaurant = item.restaurant || item;
                const clickCount = item.clickCount || 0;
                return (
                  <div 
                    key={restaurant.id} 
                    className="ranking-item"
                    onClick={() => handleRestaurantCardClick(restaurant)}
                  >
                    <div className="rank-badge">
                      <span className={`rank ${index < 3 ? 'rank-top' : ''}`}>{index + 1}</span>
                    </div>
                    <div className="ranking-info">
                      <h3>{restaurant.restaurantName}</h3>
                      <div className="ranking-meta">
                        <span className="location">{restaurant.roadAddress || restaurant.regionName}</span>
                        {restaurant.category && (
                          <span className="category">{restaurant.category}</span>
                        )}
                      </div>
                      {restaurant.mainMenu && (
                        <div className="ranking-menu">메뉴: {restaurant.mainMenu}</div>
                      )}
                    </div>
                    <div className="ranking-count">{clickCount}명</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Explore More Section */}
        <section className="explore-section">
          <div className="container">
            <h2 className="section-title">더 탐색하기</h2>
            <p className="section-description">다양한 방법으로 나에게 맞는 식당을 찾아보세요</p>
            
            <div className="explore-grid">
              <div className="explore-card explore-primary" onClick={() => navigate('/nearme')}>
                <div className="explore-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 15.5C16.4853 15.5 18.5 13.4853 18.5 11C18.5 8.51472 16.4853 6.5 14 6.5C11.5147 6.5 9.5 8.51472 9.5 11C9.5 13.4853 11.5147 15.5 14 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2C10.4101 2 7.5 4.91015 7.5 8.5C7.5 11.2188 9.125 13.5 14 18C18.875 13.5 20.5 11.2188 20.5 8.5C20.5 4.91015 17.5899 2 14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>내 주변 맛집</h3>
                <p>현재 위치에서 가장 가까운 식당을 찾아보세요</p>
                <div className="explore-arrow">→</div>
              </div>
              
              <div className="explore-card" onClick={() => navigate('/search')}>
                <div className="explore-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>검색하기</h3>
                <p>원하는 키워드로 직접 검색해보세요</p>
                <div className="explore-arrow">→</div>
              </div>
              
              <div className="explore-card" onClick={() => navigate('/reservation-history')}>
                <div className="explore-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H24V24H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 4V24M9 4V24M4 10H24M4 18H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>예약 내역</h3>
                <p>다녀간 식당을 다시 확인하세요</p>
                <div className="explore-arrow">→</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-main">
              <div className="footer-brand">
                <span className="footer-logo">Chopplan</span>
              </div>
            <div className="footer-links">
              <a href="#" className="footer-link">회사소개</a>
              <a href="#" className="footer-link">제휴문의</a>
              <a href="#" className="footer-link">이용약관</a>
              <a href="#" className="footer-link">개인정보처리방침</a>
              <a href="#" className="footer-link">고객센터</a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2024 찹플랜. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
      
      <MainNav />
      
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10L10 5M10 5L5 10M10 5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Restaurant Detail Modal */}
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
