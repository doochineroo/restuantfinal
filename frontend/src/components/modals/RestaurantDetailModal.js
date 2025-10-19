import React, { useState, useEffect, useCallback } from 'react';
import { getKoreanValue, getStatusValue } from '../../utils/restaurantUtils';
import axios from 'axios';
import './RestaurantDetailModal.css';

const RestaurantDetailModal = ({ restaurant, isOpen, onClose, onReservation }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'menu', 'event', 'additional', 'review'
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleReservation = () => {
    onReservation(restaurant);
    onClose();
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
      const response = await axios.get(`http://localhost:8080/api/menus?storeId=${restaurant.id}`);
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
      const response = await axios.get(`http://localhost:8080/api/events/active?storeId=${restaurant.id}`);
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
      const response = await axios.get(`http://localhost:8080/api/additional-info/available?storeId=${restaurant.id}`);
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
      const response = await axios.get(`http://localhost:8080/api/demo/reviews/restaurant/${restaurant.id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('리뷰 로딩 오류:', err);
      setError('리뷰 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

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
        case 'review':
          if (reviews.length === 0) loadReviews();
          break;
        default:
          break;
      }
    }
  }, [activeTab, isOpen, restaurant, loadMenus, loadEvents, loadAdditionalInfo, loadReviews, menus.length, events.length, additionalInfo.length, reviews.length]);

  // 조건부 렌더링을 return 문에서 처리
  if (!isOpen || !restaurant) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{restaurant.restaurantName}</h2>
          {restaurant.branchName && <h3>{restaurant.branchName}</h3>}
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
            className={`modal-tab ${activeTab === 'event' ? 'active' : ''}`}
            onClick={() => setActiveTab('event')}
          >
            이벤트
          </button>
          <button 
            className={`modal-tab ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            추가정보
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
                <div className="menu-grid">
                  {menus.map(menu => (
                    <div key={menu.menuId} className="menu-item">
                      <div className="menu-image">
                        <img 
                          src={menu.imageUrl ? 
                            `http://localhost:8080/api/proxy/image?url=${encodeURIComponent(menu.imageUrl)}` : 
                            '/image-placeholder.svg'
                          } 
                          alt={menu.name}
                          onError={(e) => {
                            e.target.src = '/image-placeholder.svg';
                          }}
                        />
                        {menu.isPopular && <span className="popular-badge">인기</span>}
                        {menu.isRecommended && <span className="recommended-badge">추천</span>}
                      </div>
                      <div className="menu-info">
                        <h4 className="menu-name">{menu.name}</h4>
                        <p className="menu-description">{menu.description}</p>
                        <div className="menu-details">
                          <span className="menu-price">{menu.price ? `${menu.price.toLocaleString()}원` : '가격 문의'}</span>
                          {menu.category && <span className="menu-category">{menu.category}</span>}
                        </div>
                        {menu.allergenInfo && (
                          <p className="allergen-info">⚠️ {menu.allergenInfo}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                            `http://localhost:8080/api/proxy/image?url=${encodeURIComponent(event.imageUrl)}` : 
                            'https://via.placeholder.com/300x200'
                          } 
                          alt={event.eventName}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200';
                          }}
                        />
                        {event.isPopular && <span className="popular-badge">인기</span>}
                      </div>
                      <div className="event-info">
                        <h4 className="event-name">{event.eventName}</h4>
                        <p className="event-description">{event.eventDescription}</p>
                        <div className="event-details">
                          <span className="event-type">{event.eventType}</span>
                          {event.discountRate && (
                            <span className="discount-rate">{event.discountRate}% 할인</span>
                          )}
                          {event.discountAmount && (
                            <span className="discount-amount">{event.discountAmount.toLocaleString()}원 할인</span>
                          )}
                        </div>
                        <div className="event-period">
                          <span>기간: {new Date(event.startDate).toLocaleDateString()} ~ {new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                        {event.termsAndConditions && (
                          <p className="event-terms">📋 {event.termsAndConditions}</p>
                        )}
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

          {/* 추가정보 탭 */}
          {activeTab === 'additional' && (
            <div className="tab-content additional-tab-content">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>추가 정보를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={loadAdditionalInfo} className="retry-btn">다시 시도</button>
                </div>
              ) : additionalInfo.length > 0 ? (
                <div className="additional-info-grid">
                  {additionalInfo.map(info => (
                    <div key={info.infoId} className="info-item">
                      <div className="info-icon">
                        <img 
                          src={info.iconUrl || 'https://via.placeholder.com/24x24'} 
                          alt={info.infoType}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/24x24';
                          }}
                        />
                      </div>
                      <div className="info-content">
                        <h4 className="info-title">{info.infoTitle || info.infoType}</h4>
                        <p className="info-description">{info.infoDescription}</p>
                        {info.infoValue && (
                          <p className="info-value">{info.infoValue}</p>
                        )}
                        {info.additionalNotes && (
                          <p className="info-notes">💡 {info.additionalNotes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>추가 정보가 없습니다.</p>
                </div>
              )}
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
                                    src={`http://localhost:8080${imageUrl}`}
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
              src={`http://localhost:8080${selectedImage}`}
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
