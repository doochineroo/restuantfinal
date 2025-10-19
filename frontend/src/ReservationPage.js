import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from './components/navigation/TopNav';
import MainNav from './components/navigation/MainNav';
import NotificationModal from './components/common/NotificationModal';
import useNotification from './hooks/useNotification';
import { useAuth } from './demo/context/AuthContext';
import { useNotification as useReservationNotification } from './context/NotificationContext';
import { reservationAPI, restaurantAPI } from './demo/services/api';
import './styles/common.css';
import './ReservationPage.css';

const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurant = location.state?.restaurant;
  const { user } = useAuth();
  const { addReservationNotification } = useReservationNotification();
  const { notificationState, showSuccess, showError, showWarning, hideNotification } = useNotification();

  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 1,
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // OWNER는 Owner Dashboard로 리다이렉트
  useEffect(() => {
    if (user && user.role === 'OWNER') {
      navigate('/owner-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 사용자 정보가 있으면 폼에 미리 채우기
  useEffect(() => {
    if (user) {
      setReservationData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // 테스트용 임시 식당 정보
  const testRestaurant = {
    id: 10026,
    name: '곰국시집 명동점',
    restaurantName: '곰국시집 명동점',
    branchName: '명동점',
    roadAddress: '서울 중구 명동10길 19-3',
    phoneNumber: '02-1234-5678',
    mainMenu: '곰국, 국수',
    openingHours: '매일 11:00~22:30'
  };

  const currentRestaurant = restaurant || testRestaurant;

  console.log('예약 페이지 - 전달받은 가게 정보:', restaurant);
  console.log('예약 페이지 - 사용할 가게 정보:', currentRestaurant);

  if (!currentRestaurant) {
    return (
      <div className="reservation-page">
        <div className="error-message">
          <h2>식당 정보를 찾을 수 없습니다</h2>
          <p>다시 식당을 선택해주세요.</p>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('예약 제출 시작:', reservationData);
    
    // 필수 필드 검증
    if (!reservationData.name.trim()) {
      showWarning('이름을 입력해주세요.', '입력 오류');
      return;
    }
    
    if (!reservationData.phone.trim()) {
      showWarning('전화번호를 입력해주세요.', '입력 오류');
      return;
    }
    
    if (!reservationData.date) {
      showWarning('예약 날짜를 선택해주세요.', '입력 오류');
      return;
    }
    
    if (!reservationData.time) {
      showWarning('예약 시간을 선택해주세요.', '입력 오류');
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(reservationData.phone)) {
      showWarning('올바른 전화번호 형식을 입력해주세요.', '입력 오류');
      return;
    }

    // 로그인하지 않은 사용자는 임시 사용자 ID 사용
    const userId = user ? user.userId : 'guest_' + Date.now();

    setIsSubmitting(true);

    try {
      // 가게 이름 조회 (가게 ID로)
      let restaurantName = currentRestaurant.name || currentRestaurant.restaurantName;
      
      // 가게 이름이 없으면 API로 조회
      if (!restaurantName || restaurantName.trim() === '') {
        try {
          console.log('가게 이름이 없어서 API로 조회합니다. 가게 ID:', currentRestaurant.id);
          const nameResponse = await restaurantAPI.getNameById(currentRestaurant.id);
          restaurantName = nameResponse.data;
          console.log('API로 조회한 가게 이름:', restaurantName);
        } catch (nameError) {
          console.warn('가게 이름 조회 실패:', nameError);
          restaurantName = `가게 ID: ${currentRestaurant.id}`;
        }
      }
      
      console.log('가게 이름 추출:', {
        'currentRestaurant.name': currentRestaurant.name,
        'currentRestaurant.restaurantName': currentRestaurant.restaurantName,
        '최종 선택된 이름': restaurantName
      });

      const reservationPayload = {
        restaurantId: currentRestaurant.id,
        restaurantName: restaurantName,
        userId: userId,
        userName: reservationData.name,
        userPhone: reservationData.phone,
        userEmail: reservationData.email,
        reservationDate: reservationData.date,
        reservationTime: reservationData.time,
        guests: parseInt(reservationData.guests),
        specialRequests: reservationData.specialRequests || null,
        status: 'PENDING' // 기본 상태는 대기중
      };

      console.log('예약 데이터:', reservationPayload);
      console.log('가게 정보:', currentRestaurant);

      // API 호출로 예약 생성
      const response = await reservationAPI.create(reservationPayload);
      
      if (response.status === 200 || response.status === 201) {
        // 예약 완료 알림 추가
        addReservationNotification('RESERVATION_CREATED', restaurantName, response.data?.id);
        
        showSuccess('예약이 성공적으로 완료되었습니다!\n가게 관리자의 승인을 기다려주세요.', '예약 완료');
        // 로그인한 사용자는 예약 목록으로, 비로그인 사용자는 홈으로
        if (user) {
          navigate('/reservation');
        } else {
          navigate('/');
        }
      } else {
        throw new Error('예약 생성 실패');
      }
    } catch (error) {
      console.error('예약 처리 오류:', error);
      if (error.response?.status === 401) {
        showError('로그인이 필요합니다.', '인증 오류');
        navigate('/login');
      } else if (error.response?.status === 400) {
        showError('잘못된 요청입니다. 입력 정보를 확인해주세요.', '요청 오류');
      } else {
        showError('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.', '처리 오류');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="reservation-page">
      <TopNav />
      <MainNav />
      
      <div className="reservation-container">
        <div className="restaurant-info-card">
          <h2>{currentRestaurant.restaurantName || currentRestaurant.name}</h2>
          {currentRestaurant.branchName && <h3>{currentRestaurant.branchName}</h3>}
          <div className="restaurant-details">
            <p><strong>주소:</strong> {currentRestaurant.roadAddress || '주소 정보 없음'}</p>
            <p><strong>전화번호:</strong> {currentRestaurant.phoneNumber || '전화번호 정보 없음'}</p>
            <p><strong>주요 메뉴:</strong> {currentRestaurant.mainMenu || '메뉴 정보 없음'}</p>
            <p><strong>영업시간:</strong> {currentRestaurant.openingHours || '영업시간 정보 없음'}</p>
          </div>
        </div>

        <div className="reservation-form-card">
          <div className="form-header">
            <div className="form-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13.5H12.01M12 17.5H12.01M16 13.5H16.01M16 17.5H16.01M8 13.5H8.01M8 17.5H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>예약하기</h2>
            <p className="form-subtitle">원하는 시간에 테이블을 예약해보세요</p>
          </div>
          
          {user ? (
            <div className="user-info-notice success">
              <div className="notice-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>로그인된 사용자 정보가 자동으로 입력되었습니다.</p>
            </div>
          ) : (
            <div className="user-info-notice info">
              <div className="notice-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p><a href="/login">로그인</a>하시면 개인정보가 자동으로 입력됩니다.</p>
            </div>
          )}
          
          <form onSubmit={(e) => {
            console.log('폼 제출 이벤트 발생');
            handleSubmit(e);
          }} className="reservation-form">
            <div className="form-section">
              <h3 className="section-title">예약자 정보</h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <span className="label-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  이름 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={reservationData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="예약자 이름을 입력하세요"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <span className="label-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  전화번호 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={reservationData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="010-1234-5678"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="label-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  이메일
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={reservationData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">예약 정보</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    <span className="label-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 13.5H12.01M12 17.5H12.01M16 13.5H16.01M16 17.5H16.01M8 13.5H8.01M8 17.5H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    예약 날짜 <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={reservationData.date}
                      onChange={handleInputChange}
                      min={getCurrentDate()}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">
                    <span className="label-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    예약 시간 <span className="required">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="time"
                      name="time"
                      value={reservationData.time}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">시간 선택</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                    </select>
                    <div className="select-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guests" className="form-label">
                  <span className="label-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M9 7C9 9.20914 7.20914 11 5 11C2.79086 11 1 9.20914 1 7C1 4.79086 2.79086 3 5 3C7.20914 3 9 4.79086 9 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21V19C23 17.1362 22.2375 15.3801 20.8284 14.1716C19.4194 12.9631 17.6066 12.5 15.8 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C17.6961 3.39 18.983 4.53 19.2 6.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  인원 수 <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="guests"
                    name="guests"
                    value={reservationData.guests}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}명</option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">추가 요청사항</h3>
              
              <div className="form-group">
                <label htmlFor="specialRequests" className="form-label">
                  <span className="label-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  특별 요청사항
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={reservationData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="알레르기, 좌석 요청 등 특별한 요청사항이 있으시면 입력해주세요"
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                className="btn btn-secondary"
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                취소
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <span className="btn-icon">
                  {isSubmitting ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {isSubmitting ? '예약 처리 중...' : '예약하기'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 공용 알림 팝업 */}
      <NotificationModal
        isOpen={notificationState.isOpen}
        onClose={hideNotification}
        type={notificationState.type}
        title={notificationState.title}
        message={notificationState.message}
        buttonText={notificationState.buttonText}
        autoClose={notificationState.autoClose}
        autoCloseDelay={notificationState.autoCloseDelay}
      />
    </div>
  );
};

export default ReservationPage;
