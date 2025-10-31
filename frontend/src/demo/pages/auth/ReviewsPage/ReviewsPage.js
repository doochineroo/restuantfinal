/**
 * 테스트용 리뷰 페이지 - 데모 종료 시 제거 예정
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { reviewAPI } from '../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/config/apiConfig';
import axios from 'axios';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const { user } = useAuth();
  const [myReviews, setMyReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadMyReviews();
    loadRestaurants();
  }, [user]);

  const loadMyReviews = async () => {
    try {
      const response = await reviewAPI.getUserReviews(user.userId);
      setMyReviews(response.data);
    } catch (error) {
      console.error('리뷰 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurants = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS}/all`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('식당 조회 오류:', error);
    }
  };

  const loadRestaurantReviews = async (restaurantId) => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewAPI.getRestaurantReviews(restaurantId),
        reviewAPI.getRestaurantStats(restaurantId)
      ]);
      setRestaurantReviews(reviewsRes.data);
      setReviewStats(statsRes.data);
    } catch (error) {
      console.error('리뷰 조회 오류:', error);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    loadRestaurantReviews(restaurant.id);
    setShowWriteForm(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      await reviewAPI.create({
        userId: user.userId,
        restaurantId: selectedRestaurant.id,
        userName: user.name,
        restaurantName: selectedRestaurant.restaurantName,
        rating: formData.rating,
        content: formData.content,
        images: formData.images
      });

      alert('리뷰가 작성되었습니다!');
      setFormData({ rating: 5, content: '', images: [] });
      setShowWriteForm(false);
      loadMyReviews();
      loadRestaurantReviews(selectedRestaurant.id);
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const maxImages = 5;
    const currentImageCount = formData.images.length;
    const remainingSlots = maxImages - currentImageCount;
    
    if (remainingSlots <= 0) {
      alert('최대 5장까지만 업로드할 수 있습니다.');
      return;
    }
    
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`${remainingSlots}장만 업로드됩니다. (최대 5장 제한)`);
    }
    
    try {
      setUploadingImages(true);
      const uploadPromises = filesToUpload.map(async (file) => {
        // 파일 크기 검사 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: 파일 크기는 5MB를 초과할 수 없습니다.`);
        }
        
        // 파일 타입 검사
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
        }

        const formDataObj = new FormData();
        formDataObj.append('file', file);
        
        const response = await axios.post(`${API_ENDPOINTS.DEMO}/reviews/upload`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImages(false);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLike = async (reviewId) => {
    try {
      await reviewAPI.like(reviewId);
      if (selectedRestaurant) {
        loadRestaurantReviews(selectedRestaurant.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async (reviewId) => {
    try {
      await reviewAPI.dislike(reviewId);
      if (selectedRestaurant) {
        loadRestaurantReviews(selectedRestaurant.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReport = async (reviewId) => {
    if (!window.confirm('이 리뷰를 신고하시겠습니까?')) return;

    try {
      await reviewAPI.report(reviewId);
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error(error);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="demo-loading">로딩 중...</div>;
  }

  return (
    <div className="demo-reviews-page">
      <div className="demo-page-header">
        <h1>✍️ 리뷰 관리</h1>
      </div>

      <div className="reviews-layout">
        {/* 왼쪽: 식당 목록 */}
        <div className="restaurants-sidebar">
          <h2>식당 선택</h2>
          <div className="restaurants-list">
            {restaurants.slice(0, 20).map(restaurant => (
              <div
                key={restaurant.id}
                className={`restaurant-item ${selectedRestaurant?.id === restaurant.id ? 'active' : ''}`}
                onClick={() => handleRestaurantSelect(restaurant)}
              >
                <div className="restaurant-name">{restaurant.restaurantName}</div>
                <div className="restaurant-region">{restaurant.regionName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 리뷰 내용 */}
        <div className="reviews-content">
          {!selectedRestaurant ? (
            <>
              <div className="my-reviews-section">
                <h2>내가 작성한 리뷰 ({myReviews.length})</h2>
                {myReviews.length === 0 ? (
                  <div className="demo-empty">
                    <p>작성한 리뷰가 없습니다.</p>
                  </div>
                ) : (
                  <div className="reviews-grid">
                    {myReviews.map(review => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="review-restaurant">{review.restaurantName}</div>
                          <div className="review-rating">{renderStars(review.rating)}</div>
                        </div>
                        <div className="review-content">{review.content}</div>
                        {(() => {
                          let reviewImages = [];
                          try {
                            if (review.images) {
                              reviewImages = JSON.parse(review.images);
                            }
                          } catch (e) {
                            console.error('이미지 파싱 오류:', e);
                          }
                          return reviewImages.length > 0 && (
                            <div className="review-images">
                              {reviewImages.map((imageUrl, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={`http://localhost:8080${imageUrl}`}
                                  alt={`리뷰 이미지 ${imgIdx + 1}`}
                                  className="review-image"
                                  onClick={() => window.open(`http://localhost:8080${imageUrl}`, '_blank')}
                                />
                              ))}
                            </div>
                          );
                        })()}
                        <div className="review-footer">
                          <small>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</small>
                          <div className="review-stats">
                            👍 {review.likesCount} 👎 {review.dislikesCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="restaurant-detail-header">
                <h2>{selectedRestaurant.restaurantName}</h2>
                <button 
                  className="write-review-btn"
                  onClick={() => setShowWriteForm(!showWriteForm)}
                >
                  {showWriteForm ? '취소' : '리뷰 작성'}
                </button>
              </div>

              {reviewStats && (
                <div className="review-stats-box">
                  <div className="stat-item">
                    <div className="stat-label">평균 평점</div>
                    <div className="stat-value">{reviewStats.averageRating.toFixed(1)} ⭐</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">리뷰 수</div>
                    <div className="stat-value">{reviewStats.reviewCount}개</div>
                  </div>
                </div>
              )}

              {showWriteForm && (
                <form onSubmit={handleSubmitReview} className="review-write-form">
                  <div className="form-group">
                    <label>평점</label>
                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`star ${formData.rating >= star ? 'active' : ''}`}
                          onClick={() => setFormData({ ...formData, rating: star })}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>리뷰 내용</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="식당에 대한 솔직한 리뷰를 작성해주세요."
                      required
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>사진 첨부</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        id="review-image-upload"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="review-image-upload" className="image-upload-btn">
                        {uploadingImages ? '업로드 중...' : '사진 선택'}
                      </label>
                      <span className="image-upload-hint">최대 5장까지 업로드 가능</span>
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="uploaded-images">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="uploaded-image-item">
                            <img 
                              src={`http://localhost:8080${imageUrl}`} 
                              alt={`리뷰 이미지 ${index + 1}`} 
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => handleImageRemove(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="submit-btn">리뷰 등록</button>
                </form>
              )}

              <div className="restaurant-reviews">
                <h3>리뷰 목록 ({restaurantReviews.length})</h3>
                {restaurantReviews.length === 0 ? (
                  <div className="demo-empty">
                    <p>아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>
                  </div>
                ) : (
                  <div className="reviews-grid">
                    {restaurantReviews.map(review => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="review-author">{review.userName}</div>
                          <div className="review-rating">{renderStars(review.rating)}</div>
                        </div>
                        <div className="review-content">{review.content}</div>
                        {(() => {
                          let reviewImages = [];
                          try {
                            if (review.images) {
                              reviewImages = JSON.parse(review.images);
                            }
                          } catch (e) {
                            console.error('이미지 파싱 오류:', e);
                          }
                          return reviewImages.length > 0 && (
                            <div className="review-images">
                              {reviewImages.map((imageUrl, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={`http://localhost:8080${imageUrl}`}
                                  alt={`리뷰 이미지 ${imgIdx + 1}`}
                                  className="review-image"
                                  onClick={() => window.open(`http://localhost:8080${imageUrl}`, '_blank')}
                                />
                              ))}
                            </div>
                          );
                        })()}
                        <div className="review-footer">
                          <small>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</small>
                          <div className="review-actions">
                            <button onClick={() => handleLike(review.id)}>
                              👍 {review.likesCount}
                            </button>
                            <button onClick={() => handleDislike(review.id)}>
                              👎 {review.dislikesCount}
                            </button>
                            {user.userId !== review.userId && (
                              <button 
                                className="report-btn"
                                onClick={() => handleReport(review.id)}
                              >
                                🚨 신고
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;

