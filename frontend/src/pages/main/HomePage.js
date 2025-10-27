import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/navigation/TopNav';
import MainNav from '../../components/navigation/MainNav';
import { restaurantAPI, statisticsAPI } from '../../demo/services/api';
import { useAuth } from '../../demo/context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // OWNER는 Owner Dashboard로 리다이렉트
  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 인기 식당 (클릭수 포함) 가져오기
        const popularResponse = await statisticsAPI.getPopularRestaurantsWithCount(10);
        setPopularRestaurants(popularResponse.data);
        
        // 모든 식당 가져와서 카테고리별 개수 계산
        const allRestaurantsResponse = await restaurantAPI.getAll();
        const restaurants = allRestaurantsResponse.data;
        
        // 카테고리별 개수 계산
        const categoryCount = {};
        restaurants.forEach(restaurant => {
          const category = restaurant.foodCategory || restaurant.category || '기타';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        // 카테고리 아이콘 매핑 (이모티콘 제거)
        const categoryIcons = {
          '한식': '한',
          '일식': '일',
          '중식': '중',
          '양식': '양',
          '카페': '카',
          '치킨': '치',
          '피자': '피',
          '분식': '분',
          '디저트': '디',
          '패스트푸드': '패',
          '기타': '기'
        };
        
        const categoryList = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a) // 개수 순으로 정렬
          .slice(0, 8) // 상위 8개만
          .map(([name, count]) => ({
            name,
            icon: categoryIcons[name] || '기',
            count
          }));
        
        setCategories(categoryList);
        
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        
        // 에러 시 기본 데이터
        setPopularRestaurants([]);
        setCategories([
          { name: '한식', icon: '한', count: 0 },
          { name: '일식', icon: '일', count: 0 },
          { name: '중식', icon: '중', count: 0 },
          { name: '양식', icon: '양', count: 0 },
          { name: '카페', icon: '카', count: 0 },
          { name: '치킨', icon: '치', count: 0 },
          { name: '피자', icon: '피', count: 0 },
          { name: '분식', icon: '분', count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 식당 클릭 시 통계 기록
  const handleRestaurantClick = async (restaurantId) => {
    try {
      await statisticsAPI.recordClick(restaurantId, user?.id || null);
    } catch (error) {
      console.error('클릭 통계 기록 실패:', error);
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    if (searchKeyword.trim()) {
      statisticsAPI.recordSearch(searchKeyword);
      navigate('/search', { state: { keyword: searchKeyword } });
    }
  };

  if (loading) {
    return (
      <div className="search-home-page">
        <TopNav />
        <main className="search-main">
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
    <div className="search-home-page">
      <TopNav />
      <main className="search-main">
        
        {/* 검색바 섹션 */}
        <section className="search-section">
          <div className="search-container">
            <div className="search-bar">
              <div className="search-icon">🔍</div>
              <input 
                type="text" 
                placeholder="지역, 음식종류, 레스토랑명으로 검색하세요"
                className="search-input"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* 퀵 필터 섹션 */}
        <section className="quick-filter-section">
          <div className="filter-container">
            <h2>카테고리로 식당 찾기</h2>
            <div className="filter-tags">
              {categories.map((category, index) => (
                <button 
                  key={index}
                  className="filter-tag"
                  onClick={() => navigate('/search', { state: { category: category.name } })}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Editor's Pick 섹션 */}
        <section className="editors-pick-section">
          <div className="pick-container">
            <h2>Editor's Pick: 이번 주, 놓치지 말아야 할 곳</h2>
            <div className="pick-grid">
              {popularRestaurants.slice(0, 3).map((item, index) => {
                const restaurant = item.restaurant || item;
                const clickCount = item.clickCount || 0;
                return (
                  <div 
                    key={restaurant.id} 
                    className="pick-card"
                    onClick={() => {
                      handleRestaurantClick(restaurant.id);
                      navigate('/search', { state: { restaurantId: restaurant.id } });
                    }}
                  >
                    <div className="pick-image">
                      <img 
                        src={convertToAbsoluteUrl(restaurant.mainImage || restaurant.imageUrl) || '/image-placeholder.svg'} 
                        alt={restaurant.restaurantName || restaurant.name}
                        onError={(e) => {
                          e.target.src = '/image-placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="pick-info">
                      <h3>{restaurant.restaurantName || restaurant.name}</h3>
                      <div className="rating-info">
                        <span className="rating">⭐ {restaurant.rating || '4.9'}</span>
                        <span className="review-count">({clickCount})</span>
                      </div>
                      <p className="location">{restaurant.roadAddress || restaurant.address}</p>
                      <p className="category">{restaurant.foodCategory || restaurant.category || '기타'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 지역별 추천 TOP 10 섹션 */}
        <section className="top10-section">
          <div className="top10-container">
            <div className="section-header">
              <h2>TOP 10: 누적 클릭수로 인기 순위</h2>
              <button className="more-btn" onClick={() => navigate('/search')}>
                전체보기 →
              </button>
            </div>
            <div className="top10-list">
              {popularRestaurants.slice(0, 10).map((item, index) => {
                const restaurant = item.restaurant || item;
                const clickCount = item.clickCount || 0;
                return (
                  <div 
                    key={restaurant.id} 
                    className="top10-item"
                    onClick={() => {
                      handleRestaurantClick(restaurant.id);
                      navigate('/search', { state: { restaurantId: restaurant.id } });
                    }}
                  >
                    <div className="rank">{index + 1}</div>
                    <div className="restaurant-info">
                      <h3>{restaurant.restaurantName || restaurant.name}</h3>
                      <div className="rating-location">
                        <span className="rating">⭐ {restaurant.rating || '4.9'}</span>
                        <span className="location">{restaurant.roadAddress || restaurant.address}</span>
                        <span className="category">| {restaurant.foodCategory || restaurant.category || '기타'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 관심 분야 카드 CTA 섹션 */}
        <section className="interest-cta-section">
          <div className="cta-container">
            <h2>당신의 취향을 알려주세요</h2>
            <p>간단한 질문에 답하고 맞춤형 레스토랑을 추천받아보세요</p>
            <div className="interest-cards">
              <div className="interest-card" onClick={() => navigate('/search')}>
                <div className="card-icon">🍽️</div>
                <h3>음식 취향 테스트</h3>
                <p>나만의 맛 취향을 찾아보세요</p>
              </div>
              <div className="interest-card" onClick={() => navigate('/nearme')}>
                <div className="card-icon">📍</div>
                <h3>지역별 추천</h3>
                <p>내 주변 맛집을 발견하세요</p>
              </div>
              <div className="interest-card" onClick={() => navigate('/search')}>
                <div className="card-icon">💝</div>
                <h3>특별한 날</h3>
                <p>기념일에 딱 맞는 곳을 찾으세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="company-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" className="footer-link">회사소개</a>
              <a href="#" className="footer-link">제휴문의</a>
              <a href="#" className="footer-link">이용약관</a>
              <a href="#" className="footer-link">개인정보처리방침</a>
              <a href="#" className="footer-link">고객센터</a>
            </div>
            <div className="footer-bottom">
              <p>© 2024 찹플랜. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
      
      <MainNav />
    </div>
  );
};

export default HomePage;