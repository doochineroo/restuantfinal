import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../demo/context/AuthContext';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';
import { chatAPI } from '../../demo/services/chatAPI';
import { API_ENDPOINTS, getImageUrl } from '../../constants/config/apiConfig';
import axios from 'axios';
import './RestaurantDetailModal.css';

const RestaurantDetailModal = ({ restaurant, isOpen, onClose, onReservation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'menu', 'event', 'additional', 'review' 
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 이미지 URL을 절대 URL로 변환하는 함수
  const convertToAbsoluteUrl = (url) => {
    return getImageUrl(url);
  };

  const handleReservation = () => {
    onReservation(restaurant);
    onClose();
  };

  const handleChat = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.role === 'OWNER') {
      alert('가게 주인은 회원과의 채팅만 가능합니다.');
      return;
    }

    try {
      // 채팅방 생성 또는 조회
      await chatAPI.createOrGetChatRoom(user.userId, restaurant.id);
      // 채팅 페이지로 이동
      navigate('/chat');
      onClose();
    } catch (error) {
      console.error('채팅 시작 오류:', error);
      alert('채팅을 시작할 수 없습니다.');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleImageModalClose = () => {
    setSelectedImage(null);
  };

  // 데이터 로딩 함수들
  const loadMenus = useCallback(async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus?storeId=${restaurant.id}`);
      setMenus(response.data);
    } catch (err) {
      console.error('메뉴 로딩 오류:', err);
      setError('메뉴 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  const loadEvents = useCallback(async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/events/active?storeId=${restaurant.id}`);
      setEvents(response.data);
    } catch (err) {
      console.error('이벤트 로딩 오류:', err);
      setError('이벤트 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  const loadAdditionalInfo = useCallback(async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/additional-info/available?storeId=${restaurant.id}`);
      setAdditionalInfo(response.data);
    } catch (err) {
      console.error('추가정보 로딩 오류:', err);
      setError('추가 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  const loadReviews = useCallback(async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.DEMO}/reviews/restaurant/${restaurant.id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('리뷰 로딩 오류:', err);
      setError('리뷰 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  // 모달이 열릴 때 리뷰를 미리 로드 (즉시 표시를 위해)
  useEffect(() => {
    if (isOpen && restaurant?.id && reviews.length === 0) {
      loadReviews();
    }
  }, [isOpen, restaurant?.id, reviews.length, loadReviews]);

  // 탭 변경 시 데이터 로딩
  useEffect(() => {
    if (isOpen && restaurant) {
      switch (activeTab) {
        case 'menu':
          if (menus.length === 0) loadMenus();
          break;
        case 'event':
          if (events.length === 0) loadEvents();
          break;
        case 'additional':
          if (additionalInfo.length === 0) loadAdditionalInfo();
          break;
        default:
          break;
      }
    }
  }, [activeTab, isOpen, restaurant, loadMenus, loadEvents, loadAdditionalInfo, menus.length, events.length, additionalInfo.length]);

  // 조건부 렌더링을 return 문에서 처리
  if (!isOpen || !restaurant) return null;
  
  // 매장 사진들 수집 (restaurant가 확실히 있을 때만)
  const restaurantPhotos = [
    convertToAbsoluteUrl(restaurant.mainImage),
    convertToAbsoluteUrl(restaurant.restaurantPhoto1),
    convertToAbsoluteUrl(restaurant.restaurantPhoto2),
    convertToAbsoluteUrl(restaurant.restaurantPhoto3),
    convertToAbsoluteUrl(restaurant.restaurantPhoto4),
    convertToAbsoluteUrl(restaurant.restaurantPhoto5)
  ].filter(Boolean); // null 값 제거

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{restaurant.restaurantName}</h2>
            {restaurant.branchName && <div className="branch-name">{restaurant.branchName}</div>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            상세정보
          </button>
          <button 
            className={`modal-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            메뉴
          </button>
          <button 
            className={`modal-tab ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            세부사항
          </button>
          <button 
            className={`modal-tab ${activeTab === 'event' ? 'active' : ''}`}
            onClick={() => setActiveTab('event')}
          >
            이벤트
          </button>
          <button 
            className={`modal-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            리뷰 <span className="review-count">({reviews.length})</span>
          </button>
        </div>

        <div className="modal-body">
          {/* 상세정보 탭 */}
          {activeTab === 'info' && (
            <div className="tab-content">
              {/* 매장 사진 슬라이더 */}
              {restaurantPhotos.length > 0 && (
                <div className="restaurant-photos-section">
                  <h4>매장 사진</h4>
                  <div className="restaurant-image-slider">
                    <div className="slider-main-image">
                      <img 
                        src={restaurantPhotos[currentImageIndex]} 
                        alt="매장 사진" 
                      />
                      {restaurantPhotos.length > 1 && (
                        <>
                          <button 
                            className="slider-btn-prev"
                            onClick={() => setCurrentImageIndex((prev) => 
                              prev > 0 ? prev - 1 : restaurantPhotos.length - 1
                            )}
                          >
                            ‹
                          </button>
                          <button 
                            className="slider-btn-next"
                            onClick={() => setCurrentImageIndex((prev) => 
                              prev < restaurantPhotos.length - 1 ? prev + 1 : 0
                            )}
                          >
                            ›
                          </button>
                          <div className="slider-indicators">
                            {restaurantPhotos.map((_, index) => (
                              <span 
                                key={index}
                                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {restaurantPhotos.length > 1 && (
                      <div className="slider-thumbnails">
                        {restaurantPhotos.map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`썸네일 ${index + 1}`}
                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="detail-section">
                <h4>기본 정보</h4>
                <p><strong>주소:</strong> {restaurant.roadAddress || '정보없음'}</p>
                <p><strong>전화번호:</strong> {restaurant.phoneNumber || '정보없음'}</p>
              </div>

              <div className="detail-section">
                <h4>운영 정보</h4>
                <p><strong>영업시간:</strong> {restaurant.openingHours || '정보없음'}</p>
                <p><strong>휴무일:</strong> {restaurant.holidayInfo || '정보없음'}</p>
                <p><strong>상태:</strong> {getStatusValue(restaurant)}</p>
              </div>

              <div className="detail-section">
                <h4>메뉴 정보</h4>
                <p><strong>대표메뉴:</strong> {restaurant.mainMenu || '정보없음'}</p>
                <p><strong>다국어메뉴:</strong> {getKoreanValue(restaurant.multilingualMenu) === '가능' ? '제공' : '미제공'}</p>
              </div>

              <div className="detail-section">
                <h4>편의시설</h4>
                <div className="facility-grid">
                  <div className={`facility-item ${getKoreanValue(restaurant.parking) === '가능' ? 'available' : 'unavailable'}`}>
                    주차 {getKoreanValue(restaurant.parking) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.wifi) === '가능' ? 'available' : 'unavailable'}`}>
                    WiFi {getKoreanValue(restaurant.wifi) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.petFriendly) === '가능' ? 'available' : 'unavailable'}`}>
                    반려동물 {getKoreanValue(restaurant.petFriendly) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.wheelchairAccessible) === '가능' ? 'available' : 'unavailable'}`}>
                    휠체어 {getKoreanValue(restaurant.wheelchairAccessible) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.smokingArea) === '가능' ? 'available' : 'unavailable'}`}>
                    흡연구역 {getKoreanValue(restaurant.smokingArea) === '가능' ? '있음' : '없음'}
                  </div>
                  <div className={`facility-item ${getKoreanValue(restaurant.privateRoom) === '가능' ? 'available' : 'unavailable'}`}>
                    개별실 {getKoreanValue(restaurant.privateRoom) === '가능' ? '있음' : '없음'}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>결제 옵션</h4>
                <div className="payment-grid">
                  <div className={`payment-item ${getKoreanValue(restaurant.cardPayment) === '가능' ? 'available' : 'unavailable'}`}>
                    카드결제 {getKoreanValue(restaurant.cardPayment) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`payment-item ${getKoreanValue(restaurant.mobilePayment) === '가능' ? 'available' : 'unavailable'}`}>
                    모바일결제 {getKoreanValue(restaurant.mobilePayment) === '가능' ? '가능' : '불가'}
                  </div>
                  <div className={`payment-item ${getKoreanValue(restaurant.cashOnly) === '가능' ? 'available' : 'unavailable'}`}>
                    현금만 {getKoreanValue(restaurant.cashOnly) === '가능' ? '가능' : '불가'}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>온라인 서비스</h4>
                <p><strong>홈페이지:</strong> {restaurant.homepageUrl || '정보없음'}</p>
                <p><strong>온라인예약:</strong> {restaurant.onlineReservation || '정보없음'}</p>
                <p><strong>해시태그:</strong> {restaurant.hashtags || '정보없음'}</p>
              </div>
            </div>
          )}

          {/* 메뉴 탭 */}
          {activeTab === 'menu' && (
            <div className="tab-content menu-tab-content">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>메뉴를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={loadMenus} className="retry-btn">다시 시도</button>
                </div>
              ) : menus.length > 0 ? (
                (() => {
                  // 카테고리별로 그룹화
                  const groupedMenus = menus.reduce((acc, menu) => {
                    const category = menu.category || '분류 없음';
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(menu);
                    return acc;
                  }, {});

                  // 카테고리를 정렬 (메인 -> 사이드 -> 음료 -> 디저트 -> 기타 -> 분류 없음 순서)
                  const categoryOrder = ['메인', '사이드', '음료', '디저트', '기타', '분류 없음'];
                  const sortedCategories = Object.keys(groupedMenus).sort((a, b) => {
                    const indexA = categoryOrder.indexOf(a);
                    const indexB = categoryOrder.indexOf(b);
                    
                    // 카테고리 순서가 정의되어 있으면 그 순서대로
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    
                    // 둘 다 정의되지 않았으면 알파벳 순서
                    return a.localeCompare(b);
                  });

                  return (
                    <div className="menu-list-modal">
                      {sortedCategories.map((category) => {
                        const categoryMenus = groupedMenus[category];
                        return (
                        <div key={category} className="menu-category-section">
                          <div className="menu-category-header">
                            <h3>{category}</h3>
                          </div>
                          {categoryMenus.map(menu => (
                            <div key={menu.menuId} className="menu-list-modal-item">
                      <div className="menu-list-modal-image">
                        <img 
                          src={menu.imageUrl ? 
                            getImageUrl(menu.imageUrl) : 
                            '/image-placeholder.svg'
                          } 
                          alt={menu.name}
                          onError={(e) => {
                            e.target.src = '/image-placeholder.svg';
                          }}
                        />
                        {(menu.isPopular || menu.isRecommended) && (
                          <div className="menu-badges">
                            {menu.isPopular && <span className="popular-badge">인기</span>}
                            {menu.isRecommended && <span className="recommended-badge">추천</span>}
                          </div>
                        )}
                      </div>
                      <div className="menu-list-modal-content">
                        <div className="menu-list-modal-header">
                          <h4 className="menu-name">{menu.name}</h4>
                          <span className="menu-price">{menu.price ? `${menu.price.toLocaleString()}원` : '가격 문의'}</span>
                        </div>
                        {menu.description && (
                          <p className="menu-description">{menu.description}</p>
                        )}
                        {menu.allergenInfo && (
                          <p className="allergen-info">⚠️ {menu.allergenInfo}</p>
                        )}
                      </div>
                    </div>
                          ))}
                        </div>
                          );
                        })}
                    </div>
                  );
                })()
              ) : (
                <div className="no-data">
                  <p>메뉴 정보가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* 이벤트 탭 */}
          {activeTab === 'event' && (
            <div className="tab-content event-tab-content">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>이벤트를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={loadEvents} className="retry-btn">다시 시도</button>
                </div>
              ) : events.length > 0 ? (
                <div className="event-list">
                  {events.map(event => (
                    <div key={event.eventId} className="event-item">
                      <div className="event-image">
                        <img 
                          src={event.imageUrl ? 
                            getImageUrl(event.imageUrl) : 
                            '/image-placeholder.svg'
                          } 
                          alt={event.eventName}
                          onError={(e) => {
                            e.target.src = '/image-placeholder.svg';
                          }}
                        />
                        {event.isPopular && <span className="popular-badge">인기</span>}
                      </div>
                      <div className="event-info">
                        <h4 className="event-name">{event.eventName}</h4>
                        {event.eventDescription && (
                          <p className="event-description">{event.eventDescription}</p>
                        )}
                        <div className="event-period">
                          <span>📅 {new Date(event.startDate).toLocaleDateString()} ~ {new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>진행 중인 이벤트가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* 세부사항 탭 */}
          {activeTab === 'additional' && (
            <div className="tab-content additional-tab-content">
              <div className="details-sections">
                {restaurant.description && (
                  <div className="detail-section">
                    <h4>매장 소개</h4>
                    <p>{restaurant.description}</p>
                  </div>
                )}

                {restaurant.parkingInfo && (
                  <div className="detail-section">
                    <h4>주차 정보</h4>
                    <p>{restaurant.parkingInfo}</p>
                  </div>
                )}

                {restaurant.transportation && (
                  <div className="detail-section">
                    <h4>교통편</h4>
                    <p>{restaurant.transportation}</p>
                  </div>
                )}

                {restaurant.specialNotes && (
                  <div className="detail-section">
                    <h4>특별 사항</h4>
                    <p>{restaurant.specialNotes}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>결제 방법</h4>
                  <div className="payment-methods">
                    {restaurant.cardPayment === 'Y' && <span className="payment-badge">카드</span>}
                    {restaurant.cashPayment === 'Y' && <span className="payment-badge">현금</span>}
                    {restaurant.mobilePayment === 'Y' && <span className="payment-badge">간편결제</span>}
                    {restaurant.accountTransfer === 'Y' && <span className="payment-badge">계좌이체</span>}
                  </div>
                </div>

                {(!restaurant.description && !restaurant.parkingInfo && !restaurant.transportation && !restaurant.specialNotes) && (
                  <div className="no-data">
                    <p>세부사항 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 리뷰 탭 */}
          {activeTab === 'review' && (
            <div className="tab-content review-tab-content">
              {loading ? (
                <div className="loading-state">
                  <p>리뷰를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{error}</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-container">
                  {/* 리뷰 통계 */}
                  <div className="review-stats">
                    <div className="review-stat-item">
                      <span className="stat-label">평균 평점</span>
                      <span className="stat-value">
                        {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                    </div>
                    <div className="review-stat-item">
                      <span className="stat-label">리뷰 수</span>
                      <span className="stat-value">{reviews.length}</span>
                    </div>
                  </div>

                  {/* 리뷰 목록 */}
                  <div className="reviews-list">
                    {reviews.map((review) => {
                      // 이미지 파싱
                      let reviewImages = [];
                      try {
                        if (review.images) {
                          reviewImages = JSON.parse(review.images);
                        }
                      } catch (e) {
                        console.error('이미지 파싱 오류:', e);
                      }

                      return (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <div className="review-author">
                              <strong>{review.userName}</strong>
                            </div>
                            <div className="review-rating">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span 
                                  key={i} 
                                  className={`star ${i < review.rating ? 'filled' : ''}`}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="review-content">
                            <p>{review.content}</p>
                            {reviewImages.length > 0 && (
                              <div className="review-images">
                                {reviewImages.map((imageUrl, index) => (
                                  <img 
                                    key={index}
                                    src={getImageUrl(imageUrl)}
                                    alt={`리뷰 이미지 ${index + 1}`}
                                    className="review-image"
                                    onClick={() => handleImageClick(imageUrl)}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                          
                          {/* 가게 주인 댓글 */}
                          {review.ownerComment && (
                            <div className="owner-comment">
                              <div className="owner-comment-header">
                                <span className="owner-label">🏪 사장님 댓글</span>
                                <span className="owner-comment-date">
                                  {new Date(review.ownerCommentAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <div className="owner-comment-content">
                                <p>{review.ownerComment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="no-reviews">
                  <div className="no-reviews-icon">📝</div>
                  <h3>아직 리뷰가 없습니다</h3>
                  <p>첫 번째 리뷰를 작성해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            닫기
          </button>
          {user && user.role === 'USER' && (
            <button className="btn btn-chat" onClick={handleChat}>
              💬 채팅하기
            </button>
          )}
          <button className="btn btn-primary" onClick={handleReservation}>
            예약하기
          </button>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleImageModalClose}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={handleImageModalClose}>
              ✕
            </button>
            <img 
              src={getImageUrl(selectedImage)}
              alt="확대된 리뷰 이미지"
              className="image-modal-content"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailModal;
