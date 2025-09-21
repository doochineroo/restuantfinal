import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReservationPage.css';

const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restaurant = location.state?.restaurant;

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

  if (!restaurant) {
    return (
      <div className="reservation-page">
        <div className="error-message">
          <h2>식당 정보를 찾을 수 없습니다</h2>
          <p>다시 식당을 선택해주세요.</p>
          <button onClick={() => navigate('/')} className="back-btn">
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
    
    // 필수 필드 검증
    if (!reservationData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (!reservationData.phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    
    if (!reservationData.date) {
      alert('예약 날짜를 선택해주세요.');
      return;
    }
    
    if (!reservationData.time) {
      alert('예약 시간을 선택해주세요.');
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(reservationData.phone)) {
      alert('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 시뮬레이션을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('예약이 성공적으로 완료되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('예약 처리 오류:', error);
      alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      <div className="reservation-container">
        <div className="restaurant-info-card">
          <h2>{restaurant.restaurantName}</h2>
          {restaurant.branchName && <h3>{restaurant.branchName}</h3>}
          <div className="restaurant-details">
            <p><strong>주소:</strong> {restaurant.roadAddress || '주소 정보 없음'}</p>
            <p><strong>전화번호:</strong> {restaurant.phoneNumber || '전화번호 정보 없음'}</p>
            <p><strong>주요 메뉴:</strong> {restaurant.mainMenu || '메뉴 정보 없음'}</p>
            <p><strong>영업시간:</strong> {restaurant.openingHours || '영업시간 정보 없음'}</p>
          </div>
        </div>

        <div className="reservation-form-card">
          <h2>예약하기</h2>
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-group">
              <label htmlFor="name">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={reservationData.name}
                onChange={handleInputChange}
                required
                placeholder="예약자 이름을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">전화번호 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={reservationData.phone}
                onChange={handleInputChange}
                required
                placeholder="010-1234-5678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={reservationData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">예약 날짜 *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={reservationData.date}
                  onChange={handleInputChange}
                  min={getCurrentDate()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">예약 시간 *</label>
                <select
                  id="time"
                  name="time"
                  value={reservationData.time}
                  onChange={handleInputChange}
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
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guests">인원 수 *</label>
              <select
                id="guests"
                name="guests"
                value={reservationData.guests}
                onChange={handleInputChange}
                required
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}명</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">특별 요청사항</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={reservationData.specialRequests}
                onChange={handleInputChange}
                placeholder="알레르기, 좌석 요청 등 특별한 요청사항이 있으시면 입력해주세요"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                className="cancel-btn"
              >
                취소
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '예약 처리 중...' : '예약하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
