import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationCalendar.css';

const ReservationCalendar = ({ reservations, onDateClick, onReservationClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservationsByDate, setReservationsByDate] = useState({});
  const [selectedDateReservations, setSelectedDateReservations] = useState([]);

  // 예약 데이터를 날짜별로 그룹화
  useEffect(() => {
    const grouped = {};
    reservations.forEach(reservation => {
      const date = new Date(reservation.reservationDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(reservation);
    });
    setReservationsByDate(grouped);
  }, [reservations]);

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateString = date.toDateString();
    const dayReservations = reservationsByDate[dateString] || [];
    setSelectedDateReservations(dayReservations);
    onDateClick(date, dayReservations);
  };

  // 초기 선택된 날짜의 예약 설정
  useEffect(() => {
    const dateString = selectedDate.toDateString();
    const dayReservations = reservationsByDate[dateString] || [];
    setSelectedDateReservations(dayReservations);
  }, [selectedDate, reservationsByDate]);

  // 특정 날짜의 예약 개수 반환
  const getReservationCount = (date) => {
    const dateString = date.toDateString();
    return reservationsByDate[dateString]?.length || 0;
  };

  // 특정 날짜의 예약 상태별 개수 반환
  const getReservationStatusCount = (date, status) => {
    const dateString = date.toDateString();
    const dayReservations = reservationsByDate[dateString] || [];
    return dayReservations.filter(r => r.status === status).length;
  };

  // 날짜 타일 렌더링 커스터마이징
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const totalCount = getReservationCount(date);
      const pendingCount = getReservationStatusCount(date, 'PENDING');
      const approvedCount = getReservationStatusCount(date, 'APPROVED');
      const completedCount = getReservationStatusCount(date, 'COMPLETED');

      return (
        <div className="calendar-tile-content">
          {totalCount > 0 && (
            <div className="reservation-indicators">
              {pendingCount > 0 && (
                <span className="indicator pending" title={`대기중 ${pendingCount}건`}>
                  {pendingCount}
                </span>
              )}
              {approvedCount > 0 && (
                <span className="indicator approved" title={`승인됨 ${approvedCount}건`}>
                  {approvedCount}
                </span>
              )}
              {completedCount > 0 && (
                <span className="indicator completed" title={`완료됨 ${completedCount}건`}>
                  {completedCount}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 날짜 클래스명 커스터마이징
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const totalCount = getReservationCount(date);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // 일요일(0) 또는 토요일(6)
      
      let classes = [];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (totalCount > 0) classes.push('has-reservations');
      if (isWeekend) classes.push('weekend');
      
      return classes.join(' ');
    }
    return '';
  };

  return (
    <div className="reservation-calendar">
      <div className="calendar-header">
        <h3>예약 캘린더</h3>
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color pending"></span>
            <span>대기중</span>
          </div>
          <div className="legend-item">
            <span className="legend-color approved"></span>
            <span>승인됨</span>
          </div>
          <div className="legend-item">
            <span className="legend-color completed"></span>
            <span>완료됨</span>
          </div>
        </div>
      </div>
      
      <div className="calendar-layout">
        <div className="calendar-section">
          <div className="calendar-container">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              showNeighboringMonth={false}
              calendarType="gregory"
              locale="ko-KR"
              formatShortWeekday={(locale, date) => {
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                return weekdays[date.getDay()];
              }}
            />
          </div>
        </div>
        
        <div className="reservations-section">
          <div className="selected-date-info">
            <h4>{selectedDate.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}</h4>
            <p>총 {getReservationCount(selectedDate)}건의 예약</p>
          </div>
          
          <div className="reservations-list">
            {selectedDateReservations.length > 0 ? (
              selectedDateReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="reservation-card"
                  onClick={() => onReservationClick && onReservationClick(reservation)}
                >
                  <div className="reservation-time">
                    {reservation.reservationTime}
                  </div>
                  <div className="reservation-details">
                    <div className="customer-name">{reservation.userName}</div>
                    <div className="reservation-guests">{reservation.guests}명</div>
                    <div className="reservation-phone">{reservation.userPhone}</div>
                  </div>
                  <div className="reservation-status">
                    <span className={`status-badge ${reservation.status.toLowerCase()}`}>
                      {reservation.status === 'PENDING' && '대기중'}
                      {reservation.status === 'APPROVED' && '승인됨'}
                      {reservation.status === 'REJECTED' && '거절됨'}
                      {reservation.status === 'CANCELLED' && '취소됨'}
                      {reservation.status === 'COMPLETED' && '완료됨'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reservations">
                <p>선택한 날짜에 예약이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;


