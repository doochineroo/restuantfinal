/**
 * Owner 전용 매장 관리 대시보드
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { statisticsAPI } from '../../demo/services/api';
import axios from 'axios';
import OwnerReservationDetailModal from '../../components/modals/OwnerReservationDetailModal';
import ReservationCalendar from '../../components/calendar/ReservationCalendar';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState('store'); // 사이드 메뉴
  const [activeSubMenu, setActiveSubMenu] = useState('info'); // 상단 서브 메뉴
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false); // 예약 상세보기 모달
  const [selectedDate, setSelectedDate] = useState(new Date()); // 캘린더 선택된 날짜
  const [selectedDateReservations, setSelectedDateReservations] = useState([]); // 선택된 날짜의 예약들
  const [images, setImages] = useState({
    main: null,
    menu1: null,
    menu2: null,
    menu3: null
  });
  const [menuItems, setMenuItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showReviewReplyModal, setShowReviewReplyModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reservationFilter, setReservationFilter] = useState('ALL');
  const [blacklist, setBlacklist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showVisitStatusModal, setShowVisitStatusModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  
  // 통계 데이터 상태
  const [statistics, setStatistics] = useState({
    totalReservations: 0,
    totalVisits: 0,
    averageRating: 0,
    monthlyViews: 0,
    monthlyReservations: 0,
    monthlyVisits: 0,
    conversionRate: 0,
    popularKeywords: [],
    timeDistribution: [],
    dayDistribution: [],
    ageDistribution: [],
    genderDistribution: { male: 0, female: 0 },
    weatherDistribution: { sunny: 0, cloudy: 0, rainy: 0 }
  });

  // 매장 정보 조회
  useEffect(() => {
    if (user?.restaurantId) {
      loadRestaurantInfo();
      loadReservations();
      loadBlacklist();
      loadReviews();
    }
  }, [user]);

  // 예약, 리뷰 데이터가 로드된 후 통계 계산
  useEffect(() => {
    if (reservations.length > 0 || reviews.length > 0) {
      loadStatistics();
    }
  }, [reservations, reviews]);

  // 예약 목록 조회
  const loadReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/demo/reservations/restaurant/${user.restaurantId}`);
      setReservations(response.data);
    } catch (error) {
      console.error('예약 조회 오류:', error);
    }
  };

  // 예약 승인
  const handleApproveReservation = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/demo/reservations/${id}/approve`);
      loadReservations();
      alert('예약이 승인되었습니다.');
    } catch (error) {
      console.error('예약 승인 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // 예약 거절
  const handleRejectReservation = async (id) => {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;

    try {
      await axios.put(`http://localhost:8080/api/demo/reservations/${id}/reject`, { reason });
      loadReservations();
      alert('예약이 거절되었습니다.');
    } catch (error) {
      console.error('예약 거절 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // 블랙리스트 조회
  const loadBlacklist = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/demo/blacklist/restaurant/${user.restaurantId}`);
      setBlacklist(response.data);
    } catch (error) {
      console.error('블랙리스트 조회 오류:', error);
    }
  };

  // 리뷰 조회
  const loadReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/demo/reviews/restaurant/${user.restaurantId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('리뷰 조회 오류:', error);
    }
  };

  // 통계 데이터 로드
  const loadStatistics = async () => {
    try {
      // 기본 통계 계산
      const totalReservations = reservations.length;
      const totalVisits = reservations.filter(r => r.visitStatus === 'VISITED').length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // 월별 데이터 (실제로는 API에서 가져와야 함)
      const monthlyReservations = reservations.filter(r => {
        const reservationDate = new Date(r.reservationDate);
        const currentMonth = new Date().getMonth();
        return reservationDate.getMonth() === currentMonth;
      }).length;

      const monthlyVisits = reservations.filter(r => {
        const reservationDate = new Date(r.reservationDate);
        const currentMonth = new Date().getMonth();
        return reservationDate.getMonth() === currentMonth && r.visitStatus === 'VISITED';
      }).length;

      // 전환율 계산 (조회수 대비 예약수 - 실제로는 조회수 API 필요)
      const conversionRate = totalReservations > 0 ? (totalReservations / (totalReservations * 10)) * 100 : 0;

      // 인기 키워드 로드
      const keywordsResponse = await statisticsAPI.getPopularKeywords(10);
      const popularKeywords = keywordsResponse.data || [];

      // 시간대별 분포 (실제 데이터 기반)
      const timeDistribution = [
        { time: '11시', value: reservations.filter(r => r.reservationTime?.startsWith('11')).length, percent: 0 },
        { time: '12시', value: reservations.filter(r => r.reservationTime?.startsWith('12')).length, percent: 0 },
        { time: '13시', value: reservations.filter(r => r.reservationTime?.startsWith('13')).length, percent: 0 },
        { time: '14시', value: reservations.filter(r => r.reservationTime?.startsWith('14')).length, percent: 0 },
        { time: '17시', value: reservations.filter(r => r.reservationTime?.startsWith('17')).length, percent: 0 },
        { time: '18시', value: reservations.filter(r => r.reservationTime?.startsWith('18')).length, percent: 0 },
        { time: '19시', value: reservations.filter(r => r.reservationTime?.startsWith('19')).length, percent: 0 },
        { time: '20시', value: reservations.filter(r => r.reservationTime?.startsWith('20')).length, percent: 0 },
        { time: '21시', value: reservations.filter(r => r.reservationTime?.startsWith('21')).length, percent: 0 }
      ];

      // 최대값 기준으로 퍼센트 계산
      const maxTimeValue = Math.max(...timeDistribution.map(t => t.value));
      timeDistribution.forEach(item => {
        item.percent = maxTimeValue > 0 ? (item.value / maxTimeValue) * 100 : 0;
      });

      // 요일별 분포 (실제 데이터 기반)
      const dayDistribution = [
        { day: '월요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 1).length, percent: 0 },
        { day: '화요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 2).length, percent: 0 },
        { day: '수요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 3).length, percent: 0 },
        { day: '목요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 4).length, percent: 0 },
        { day: '금요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 5).length, percent: 0 },
        { day: '토요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 6).length, percent: 0 },
        { day: '일요일', value: reservations.filter(r => new Date(r.reservationDate).getDay() === 0).length, percent: 0 }
      ];

      const maxDayValue = Math.max(...dayDistribution.map(d => d.value));
      dayDistribution.forEach(item => {
        item.percent = maxDayValue > 0 ? (item.value / maxDayValue) * 100 : 0;
      });

      // 연령대 분포 (실제로는 사용자 데이터 필요)
      const ageDistribution = [
        { age: '10대', count: 0, percent: 0, color: '#ff6b6b' },
        { age: '20대', count: 0, percent: 0, color: '#4ecdc4' },
        { age: '30대', count: 0, percent: 0, color: '#45b7d1' },
        { age: '40대', count: 0, percent: 0, color: '#96ceb4' },
        { age: '50대+', count: 0, percent: 0, color: '#dda15e' }
      ];

      setStatistics({
        totalReservations,
        totalVisits,
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyViews: monthlyReservations * 10, // 추정값
        monthlyReservations,
        monthlyVisits,
        conversionRate: Math.round(conversionRate * 10) / 10,
        popularKeywords,
        timeDistribution,
        dayDistribution,
        ageDistribution,
        genderDistribution: { male: Math.floor(totalReservations * 0.6), female: Math.floor(totalReservations * 0.4) },
        weatherDistribution: { sunny: 50, cloudy: 30, rainy: 20 } // 추정값
      });
    } catch (error) {
      console.error('통계 데이터 로드 오류:', error);
    }
  };

  // 예약 상세보기
  const handleReservationDetail = (reservation) => {
    setSelectedReservation(reservation);
    setIsReservationModalOpen(true);
  };

  // 예약 상세보기 모달 닫기
  const handleCloseReservationModal = () => {
    setIsReservationModalOpen(false);
    setSelectedReservation(null);
  };

  // 캘린더 날짜 클릭 핸들러
  const handleCalendarDateClick = (date, dayReservations) => {
    setSelectedDate(date);
    setSelectedDateReservations(dayReservations);
  };

  // 방문 상태 변경
  const handleVisitStatusChange = (reservation) => {
    setSelectedReservation(reservation);
    setShowVisitStatusModal(true);
  };

  // 예약 상태 변경
  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/demo/reservations/${reservationId}/status`, {
        status: newStatus
      });
      
      // 예약 목록 새로고침
      loadReservations();
      
      alert(`예약이 ${newStatus === 'APPROVED' ? '승인' : newStatus === 'REJECTED' ? '거절' : '완료'}되었습니다.`);
    } catch (error) {
      console.error('예약 상태 변경 오류:', error);
      alert('예약 상태 변경에 실패했습니다.');
    }
  };

  // 블랙리스트 처리
  const handleBlacklist = (reservation) => {
    const reason = prompt('블랙리스트 사유를 입력해주세요:');
    if (reason) {
      // 블랙리스트 처리 로직
      console.log('블랙리스트 처리:', reservation.id, reason);
      alert('블랙리스트 처리되었습니다.');
    }
  };

  // 노쇼 처리
  const handleNoShow = (reservation) => {
    const reason = prompt('노쇼 사유를 입력해주세요:');
    if (reason) {
      // 노쇼 처리 로직
      console.log('노쇼 처리:', reservation.id, reason);
      alert('노쇼 처리되었습니다.');
    }
  };

  // 방문 상태 업데이트
  const updateVisitStatus = async (visitStatus, reason) => {
    try {
      await axios.put('http://localhost:8080/api/demo/reservations/visit-status', {
        reservationId: selectedReservation.id,
        visitStatus: visitStatus,
        reason: reason,
        createdBy: user.userId
      });

      // 블랙리스트에 추가하는 경우
      if (visitStatus === 'BLACKLISTED') {
        await axios.post('http://localhost:8080/api/demo/blacklist', {
          userId: selectedReservation.userId,
          restaurantId: user.restaurantId,
          userName: selectedReservation.userName,
          userPhone: selectedReservation.userPhone,
          reason: reason,
          reservationId: selectedReservation.id,
          createdBy: user.userId
        });
        loadBlacklist();
      }

      loadReservations();
      setShowVisitStatusModal(false);
      setSelectedReservation(null);
      alert('방문 상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('방문 상태 업데이트 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };


  // 예약 필터링
  const filteredReservations = reservations.filter(reservation => {
    if (reservationFilter === 'ALL') return true;
    return reservation.status === reservationFilter;
  });

  const loadRestaurantInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/restaurants/${user.restaurantId}`);
      setRestaurant(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('매장 정보 조회 오류:', error);
      alert('매장 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`http://localhost:8080/api/restaurants/${user.restaurantId}`, formData);
      alert('매장 정보가 저장되었습니다.');
      setRestaurant(formData);
      setIsEditing(false);
      loadRestaurantInfo(); // 최신 정보 다시 로드
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(restaurant);
    setIsEditing(false);
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          [imageType]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageType) => {
    setImages(prev => ({
      ...prev,
      [imageType]: null
    }));
  };

  // 메뉴 추가/수정
  const handleAddMenu = () => {
    setEditingItem(null);
    setShowMenuModal(true);
  };

  const handleEditMenu = (menu) => {
    setEditingItem(menu);
    setShowMenuModal(true);
  };

  const handleDeleteMenu = (menuId) => {
    if (window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
      setMenuItems(menuItems.filter(m => m.id !== menuId));
      alert('메뉴가 삭제되었습니다.');
    }
  };

  const handleSaveMenu = (menuData) => {
    if (editingItem) {
      // 수정
      setMenuItems(menuItems.map(m => m.id === editingItem.id ? { ...menuData, id: editingItem.id } : m));
      alert('메뉴가 수정되었습니다.');
    } else {
      // 추가
      setMenuItems([...menuItems, { ...menuData, id: Date.now() }]);
      alert('메뉴가 추가되었습니다.');
    }
    setShowMenuModal(false);
    setEditingItem(null);
  };

  // 이벤트 추가/수정
  const handleAddEvent = () => {
    setEditingItem(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingItem(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('정말 이 이벤트를 삭제하시겠습니까?')) {
      setEvents(events.filter(e => e.id !== eventId));
      alert('이벤트가 삭제되었습니다.');
    }
  };

  const handleSaveEvent = (eventData) => {
    if (editingItem) {
      setEvents(events.map(e => e.id === editingItem.id ? { ...eventData, id: editingItem.id } : e));
      alert('이벤트가 수정되었습니다.');
    } else {
      setEvents([...events, { ...eventData, id: Date.now(), status: 'active' }]);
      alert('이벤트가 추가되었습니다.');
    }
    setShowEventModal(false);
    setEditingItem(null);
  };

  // 리뷰 댓글
  const handleReplyReview = (review) => {
    setSelectedReview(review);
    setShowReviewReplyModal(true);
  };

  const handleSaveReply = async (replyText) => {
    try {
      await axios.post(`http://localhost:8080/api/demo/reviews/${selectedReview.id}/owner-comment`, {
        comment: replyText
      });
      alert('댓글이 등록되었습니다.');
      loadReviews(); // 리뷰 목록 새로고침
      setShowReviewReplyModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('댓글 저장 오류:', error);
      alert('댓글 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="owner-dashboard">
        <div className="loading">
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="owner-dashboard">
        <div className="error-message">
          <p>매장 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      {/* 왼쪽 사이드바 */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">매장 관리</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeMenu === 'store' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('store'); setActiveSubMenu('info'); }}
          >
            <span className="nav-text">가게 관리</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'reservations' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('reservations'); setActiveSubMenu('list'); }}
          >
            <span className="nav-text">예약 관리</span>
            <span className="badge">0</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'visitors' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('visitors'); setActiveSubMenu('blacklist'); }}
          >
            <span className="nav-text">방문자 관리</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'marketing' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('marketing'); setActiveSubMenu('stats'); }}
          >
            <span className="nav-text">상점 관리</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('settings'); setActiveSubMenu('auto'); }}
          >
            <span className="nav-text">설정</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'statistics' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('statistics'); setActiveSubMenu('overview'); }}
          >
            <span className="nav-text">통계</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'notice' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('notice'); setActiveSubMenu('list'); }}
          >
            <span className="nav-text">공지사항</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="restaurant-info">
            <div className="restaurant-details">
              <p className="restaurant-name">{restaurant.restaurantName}</p>
              <p className="restaurant-branch">{restaurant.branchName || '본점'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="dashboard-main">
        {/* 상단 헤더 */}
        <header className="dashboard-top-header">
          <div className="header-left">
            <h1>
              {activeMenu === 'store' && '가게 관리'}
              {activeMenu === 'reservations' && '예약 관리'}
              {activeMenu === 'visitors' && '방문자 관리'}
              {activeMenu === 'marketing' && '상점 관리'}
              {activeMenu === 'settings' && '설정'}
              {activeMenu === 'statistics' && '통계'}
              {activeMenu === 'notice' && '공지사항'}
            </h1>
          </div>
          <div className="header-right">
            {activeMenu === 'store' && !isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                정보 수정
              </button>
            ) : activeMenu === 'store' && isEditing ? (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  취소
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {/* 상단 가로 서브 메뉴 탭 */}
        <div className="top-sub-menu">
          {activeMenu === 'store' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'info' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('info')}
              >
                기본 정보
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('menu')}
              >
                메뉴 관리
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'details' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('details')}
              >
                세부사항
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'events' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('events')}
              >
                이벤트
              </div>
            </>
          )}
          
          {activeMenu === 'reservations' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'list' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('list')}
              >
                예약 목록
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('calendar')}
              >
                캘린더
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('stats')}
              >
                통계
              </div>
            </>
          )}

          {activeMenu === 'visitors' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'blacklist' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('blacklist')}
              >
                블랙리스트
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'regulars' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('regulars')}
              >
                단골 고객
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'visits' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('visits')}
              >
                방문 통계
              </div>
            </>
          )}

          {activeMenu === 'marketing' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('stats')}
              >
                유입 통계
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'conversion' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('conversion')}
              >
                전환율
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('reviews')}
              >
                리뷰 관리
              </div>
            </>
          )}

          {activeMenu === 'settings' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'auto' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('auto')}
              >
                자동 예약
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'general' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('general')}
              >
                일반 설정
              </div>
            </>
          )}

          {activeMenu === 'statistics' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('overview')}
              >
                전체 통계
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'detailed' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('detailed')}
              >
                상세 분석
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('monthly')}
              >
                월별 분석
              </div>
            </>
          )}

          {activeMenu === 'notice' && (
            <>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'list' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('list')}
              >
                공지사항
              </div>
              <div 
                className={`sub-menu-item ${activeSubMenu === 'event' ? 'active' : ''}`}
                onClick={() => setActiveSubMenu('event')}
              >
                이벤트
              </div>
            </>
          )}
        </div>

        {/* 컨텐츠 영역 */}
        <div className="content-wrapper">
          
          {/* 1. 가게 관리 - 기본 정보 (좌우 50/50 레이아웃) */}
          {activeMenu === 'store' && activeSubMenu === 'info' && (
            <div className="split-layout">
              {/* 좌측: 편집 가능한 기본 정보 */}
              <div className="split-left">
              <h2>매장 기본 정보</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>식당명</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{restaurant.restaurantName}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>지점명</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{restaurant.branchName || '-'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>카테고리</label>
                  {isEditing ? (
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="한식">한식</option>
                      <option value="중식">중식</option>
                      <option value="일식">일식</option>
                      <option value="양식">양식</option>
                      <option value="카페/디저트">카페/디저트</option>
                      <option value="분식">분식</option>
                      <option value="치킨">치킨</option>
                      <option value="피자">피자</option>
                      <option value="패스트푸드">패스트푸드</option>
                      <option value="아시안">아시안</option>
                      <option value="뷔페">뷔페</option>
                      <option value="기타">기타</option>
                    </select>
                  ) : (
                    <p>{restaurant.category || '-'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>전화번호</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      placeholder="02-1234-5678"
                    />
                  ) : (
                    <p>{restaurant.phoneNumber || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>도로명 주소</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="roadAddress"
                      value={formData.roadAddress || ''}
                      onChange={handleChange}
                      placeholder="서울 중구 명동길 14"
                    />
                  ) : (
                    <p>{restaurant.roadAddress || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>영업시간</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="openingHours"
                      value={formData.openingHours || ''}
                      onChange={handleChange}
                      placeholder="매일 11:00~22:00"
                    />
                  ) : (
                    <p>{restaurant.openingHours || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>휴무일</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="holidayInfo"
                      value={formData.holidayInfo || ''}
                      onChange={handleChange}
                      placeholder="연중무휴 또는 매주 월요일"
                    />
                  ) : (
                    <p>{restaurant.holidayInfo || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>대표 메뉴</label>
                  {isEditing ? (
                    <textarea
                      name="mainMenu"
                      value={formData.mainMenu || ''}
                      onChange={handleChange}
                      placeholder="대표 메뉴를 입력하세요"
                      rows="3"
                    />
                  ) : (
                    <p>{restaurant.mainMenu || '-'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>주차 가능</label>
                  {isEditing ? (
                    <select
                      name="parking"
                      value={formData.parking || 'N'}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="Y">가능</option>
                      <option value="N">불가능</option>
                    </select>
                  ) : (
                    <p>{restaurant.parking === 'Y' ? '가능' : '불가능'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>Wi-Fi 제공</label>
                  {isEditing ? (
                    <select
                      name="wifi"
                      value={formData.wifi || 'N'}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="Y">제공</option>
                      <option value="N">미제공</option>
                    </select>
                  ) : (
                    <p>{restaurant.wifi === 'Y' ? '제공' : '미제공'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>배달 서비스</label>
                  {isEditing ? (
                    <select
                      name="delivery"
                      value={formData.delivery || 'N'}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="Y">가능</option>
                      <option value="N">불가능</option>
                    </select>
                  ) : (
                    <p>{restaurant.delivery === 'Y' ? '가능' : '불가능'}</p>
                  )}
                </div>
              </div>

              {/* 이미지 업로드 섹션 */}
              <div className="image-upload-section">
                <h3>매장 이미지</h3>
                <div className="image-upload-grid">
                  {/* 메인 이미지 */}
                  <div className="image-upload-item main-image">
                    <label>메인 이미지</label>
                    {images.main ? (
                      <div className="image-preview">
                        <img src={images.main} alt="메인" />
                        <button 
                          className="remove-image-btn" 
                          onClick={() => removeImage('main')}
                          type="button"
                        >
                          ✕
                        </button>
            </div>
                    ) : (
                      <label className="image-upload-box">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'main')}
                          style={{display: 'none'}}
                        />
                        <div className="upload-placeholder">
                          <span className="upload-icon">📷</span>
                          <span>메인 이미지 업로드</span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* 메뉴 이미지들 */}
                  {['menu1', 'menu2', 'menu3'].map((menuKey, idx) => (
                    <div key={menuKey} className="image-upload-item">
                      <label>메뉴 이미지 {idx + 1}</label>
                      {images[menuKey] ? (
                        <div className="image-preview">
                          <img src={images[menuKey]} alt={`메뉴 ${idx + 1}`} />
                          <button 
                            className="remove-image-btn" 
                            onClick={() => removeImage(menuKey)}
                            type="button"
                          >
                            ✕
                          </button>
                  </div>
                      ) : (
                        <label className="image-upload-box">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, menuKey)}
                            style={{display: 'none'}}
                          />
                          <div className="upload-placeholder">
                            <span className="upload-icon">🍽️</span>
                            <span>메뉴 사진</span>
                  </div>
                        </label>
                      )}
                </div>
                  ))}
              </div>
            </div>
            </div>
            
            {/* 우측: 사용자 화면 미리보기 */}
            <div className="split-right">
              <h2>사용자 화면 미리보기</h2>
              <div className="preview-modal-wrapper">
                <div className="preview-modal-content">
                  <div className="preview-modal-header">
                    <h2>{formData.restaurantName || restaurant.restaurantName}</h2>
                    {(formData.branchName || restaurant.branchName) && (
                      <h3>{formData.branchName || restaurant.branchName}</h3>
                    )}
                    <button className="preview-modal-close-btn">✕</button>
                  </div>

                  {/* 이미지 갤러리 */}
                  {(images.main || images.menu1 || images.menu2 || images.menu3) && (
                    <div className="preview-image-gallery">
                      {images.main && (
                        <div className="preview-main-image">
                          <img src={images.main} alt="메인" />
                        </div>
                      )}
                      <div className="preview-menu-images">
                        {images.menu1 && <img src={images.menu1} alt="메뉴1" />}
                        {images.menu2 && <img src={images.menu2} alt="메뉴2" />}
                        {images.menu3 && <img src={images.menu3} alt="메뉴3" />}
                      </div>
                    </div>
                  )}

                  <div className="preview-modal-body">
                    <div className="preview-detail-section">
                      <h4>기본 정보</h4>
                      <p><strong>주소:</strong> {formData.roadAddress || restaurant.roadAddress || '정보없음'}</p>
                      <p><strong>전화번호:</strong> {formData.phoneNumber || restaurant.phoneNumber || '정보없음'}</p>
                    </div>

                    <div className="preview-detail-section">
                      <h4>운영 정보</h4>
                      <p><strong>영업시간:</strong> {formData.openingHours || restaurant.openingHours || '정보없음'}</p>
                      <p><strong>휴무일:</strong> {formData.holidayInfo || restaurant.holidayInfo || '정보없음'}</p>
                    </div>

                    <div className="preview-detail-section">
                      <h4>메뉴 정보</h4>
                      <p><strong>대표메뉴:</strong> {formData.mainMenu || restaurant.mainMenu || '정보없음'}</p>
                    </div>

                    <div className="preview-detail-section">
                      <h4>편의시설</h4>
                      <div className="preview-facility-grid">
                        <div className={`preview-facility-item ${(formData.parking || restaurant.parking) === 'Y' ? 'available' : 'unavailable'}`}>
                          주차 {(formData.parking || restaurant.parking) === 'Y' ? '가능' : '불가'}
                        </div>
                        <div className={`preview-facility-item ${(formData.wifi || restaurant.wifi) === 'Y' ? 'available' : 'unavailable'}`}>
                          WiFi {(formData.wifi || restaurant.wifi) === 'Y' ? '가능' : '불가'}
                        </div>
                        <div className={`preview-facility-item ${(formData.delivery || restaurant.delivery) === 'Y' ? 'available' : 'unavailable'}`}>
                          배달 {(formData.delivery || restaurant.delivery) === 'Y' ? '가능' : '불가'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="preview-modal-footer">
                    <button className="preview-modal-cancel-btn">닫기</button>
                    <button className="preview-modal-reservation-btn">예약하기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 가게 관리 - 메뉴 관리 (50/50 레이아웃) */}
          {activeMenu === 'store' && activeSubMenu === 'menu' && (
            <div className="split-layout">
              {/* 좌측: 메뉴 관리 */}
              <div className="split-left">
                <div className="section-header-with-button">
                  <h2>메뉴 관리</h2>
                  <button className="add-menu-btn" onClick={handleAddMenu}>+ 메뉴 추가</button>
                </div>

                <div className="menu-list">
                  {menuItems.length === 0 ? (
                    <div className="empty-state">
                      <p>등록된 메뉴가 없습니다.</p>
                      <button className="add-first-menu-btn" onClick={handleAddMenu}>첫 메뉴 등록하기</button>
                    </div>
                  ) : (
                    menuItems.map((menu) => (
                      <div key={menu.id} className="menu-card">
                        <div className="menu-card-image">
                          {menu.image ? (
                            <img src={menu.image} alt={menu.name} />
                          ) : (
                            <div className="menu-placeholder">🍽️</div>
                          )}
                        </div>
                        <div className="menu-card-content">
                          <h3>{menu.name}</h3>
                          <p className="menu-description">{menu.description}</p>
                          <div className="menu-info">
                            <span className="menu-price">₩{menu.price?.toLocaleString()}</span>
                            <span className={`menu-status ${menu.available ? 'available' : 'unavailable'}`}>
                              {menu.available ? '판매중' : '품절'}
                            </span>
                          </div>
                        </div>
                        <div className="menu-card-actions">
                          <button className="edit-menu-btn" onClick={() => handleEditMenu(menu)}>수정</button>
                          <button className="delete-menu-btn" onClick={() => handleDeleteMenu(menu.id)}>삭제</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 우측: 메뉴 미리보기 */}
              <div className="split-right">
                <h2>메뉴 미리보기</h2>
                <div className="preview-menu-section">
                  {menuItems.length === 0 ? (
                    <div className="empty-preview">
                      <p>등록된 메뉴가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="preview-menu-grid">
                      {menuItems.map((menu) => (
                        <div key={menu.id} className="preview-menu-item">
                          <div className="preview-menu-image">
                            {menu.image ? (
                              <img src={menu.image} alt={menu.name} />
                            ) : (
                              <div className="preview-menu-placeholder">🍽️</div>
                            )}
                          </div>
                          <div className="preview-menu-info">
                            <h4>{menu.name}</h4>
                            <p>{menu.description}</p>
                            <div className="preview-menu-price">₩{menu.price?.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 가게 관리 - 세부사항 (50/50 레이아웃) */}
          {activeMenu === 'store' && activeSubMenu === 'details' && (
            <div className="split-layout">
              {/* 좌측: 세부사항 편집 */}
              <div className="split-left">
                <h2>세부사항</h2>
                
                <div className="details-form">
                  <div className="detail-group">
                    <label>매장 소개</label>
                    <textarea 
                      placeholder="매장을 소개하는 내용을 작성해주세요"
                      rows="5"
                      defaultValue={restaurant.description || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>주차 정보</label>
                    <textarea 
                      placeholder="주차 관련 상세 정보 (예: 건물 지하 1층, 2시간 무료)"
                      rows="3"
                      defaultValue={restaurant.parkingInfo || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>교통편</label>
                    <textarea 
                      placeholder="대중교통 이용 방법 (예: 2호선 강남역 3번 출구 도보 5분)"
                      rows="3"
                      defaultValue={restaurant.transportation || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>특별 사항</label>
                    <textarea 
                      placeholder="예약 시 유의사항, 특별 메뉴, 단체 예약 가능 여부 등"
                      rows="4"
                      defaultValue={restaurant.specialNotes || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>결제 방법</label>
                    <div className="checkbox-group">
                      <label><input type="checkbox" defaultChecked /> 현금</label>
                      <label><input type="checkbox" defaultChecked /> 카드</label>
                      <label><input type="checkbox" /> 계좌이체</label>
                      <label><input type="checkbox" /> 간편결제</label>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="save-detail-btn">저장</button>
                  </div>
                </div>
              </div>

              {/* 우측: 세부사항 미리보기 */}
              <div className="split-right">
                <h2>세부사항 미리보기</h2>
                <div className="preview-details-wrapper">
                  <div className="preview-details-content">
                    <div className="preview-details-section">
                      <h4>매장 소개</h4>
                      <p>{restaurant.description || '매장 소개가 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>🅿️ 주차 정보</h4>
                      <p>{restaurant.parkingInfo || '주차 정보가 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>🚇 교통편</h4>
                      <p>{restaurant.transportation || '교통편 정보가 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>📌 특별 사항</h4>
                      <p>{restaurant.specialNotes || '특별 사항이 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>💳 결제 방법</h4>
                      <div className="preview-payment-methods">
                        <span className="payment-badge">현금</span>
                        <span className="payment-badge">카드</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 가게 관리 - 이벤트 (50/50 레이아웃) */}
          {activeMenu === 'store' && activeSubMenu === 'events' && (
            <div className="split-layout">
              {/* 좌측: 이벤트 관리 */}
              <div className="split-left">
                <div className="section-header-with-button">
                  <h2>이벤트 관리</h2>
                  <button className="add-event-btn" onClick={handleAddEvent}>+ 이벤트 추가</button>
                </div>

                <div className="events-list">
                  {events.length === 0 ? (
                    <div className="empty-state">
                      <p>진행 중인 이벤트가 없습니다.</p>
                      <button className="add-first-event-btn" onClick={handleAddEvent}>첫 이벤트 등록하기</button>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="event-card">
                        <div className="event-header">
                          <span className={`event-badge ${event.status}`}>
                            {event.status === 'active' ? '진행중' : event.status === 'scheduled' ? '예정' : '종료'}
                          </span>
                          <div className="event-menu-dropdown">
                            <button className="event-menu-btn">⋯</button>
                            <div className="event-dropdown-content">
                              <button onClick={() => handleEditEvent(event)}>수정</button>
                              <button onClick={() => handleDeleteEvent(event.id)}>삭제</button>
                            </div>
                          </div>
                        </div>
                        {event.image && (
                          <div className="event-image">
                            <img src={event.image} alt={event.title} />
                          </div>
                        )}
                        <div className="event-content">
                          <h3>{event.title}</h3>
                          <p className="event-description">{event.description}</p>
                          <div className="event-period">
                            <span>📅 {event.startDate} ~ {event.endDate}</span>
                          </div>
                          <div className="event-discount">
                            <span className="discount-badge">{event.discount}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 우측: 이벤트 미리보기 */}
              <div className="split-right">
                <h2>이벤트 미리보기</h2>
                <div className="preview-events-wrapper">
                  {events.length === 0 ? (
                    <div className="empty-preview">
                      <p>등록된 이벤트가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="preview-events-grid">
                      {events.map((event) => (
                        <div key={event.id} className="preview-event-card">
                          {event.image && (
                            <div className="preview-event-image">
                              <img src={event.image} alt={event.title} />
                            </div>
                          )}
                          <div className="preview-event-content">
                            <div className="preview-event-badge-wrapper">
                              <span className={`preview-event-badge ${event.status}`}>
                                {event.status === 'active' ? '진행중' : event.status === 'scheduled' ? '예정' : '종료'}
                              </span>
                            </div>
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="preview-event-period">
                              📅 {event.startDate} ~ {event.endDate}
                            </div>
                            <div className="preview-event-discount">
                              {event.discount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. 예약 관리 - 목록 */}
          {activeMenu === 'reservations' && activeSubMenu === 'list' && (
            <div className="reservation-list-section">
              <div className="filter-bar">
                <select 
                  className="filter-select"
                  value={reservationFilter}
                  onChange={(e) => setReservationFilter(e.target.value)}
                >
                  <option value="ALL">전체 ({reservations.length})</option>
                  <option value="PENDING">대기 ({reservations.filter(r => r.status === 'PENDING').length})</option>
                  <option value="APPROVED">승인 ({reservations.filter(r => r.status === 'APPROVED').length})</option>
                  <option value="REJECTED">거절 ({reservations.filter(r => r.status === 'REJECTED').length})</option>
                </select>
                <button 
                  className="refresh-btn"
                  onClick={loadReservations}
                >
                  새로고침
                </button>
              </div>
              <div className="table-container">
                <table className="data-table reservation-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>예약일</th>
                      <th>예약 시간</th>
                      <th>예약자</th>
                      <th>인원</th>
                      <th>연락처</th>
                      <th>상태</th>
                      <th>방문상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="empty-row">예약 내역이 없습니다</td>
                      </tr>
                    ) : (
                      filteredReservations.map((reservation, index) => (
                        <tr key={reservation.id}>
                          <td>{index + 1}</td>
                          <td>{reservation.reservationDate}</td>
                          <td>{reservation.reservationTime}</td>
                          <td>
                            <div className="reservation-user">
                              <strong>{reservation.userName}</strong>
                              {reservation.userEmail && (
                                <div className="user-email">{reservation.userEmail}</div>
                              )}
                            </div>
                          </td>
                          <td>{reservation.guests}명</td>
                          <td>{reservation.userPhone}</td>
                          <td>
                            <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                              {reservation.status === 'PENDING' && '대기중'}
                              {reservation.status === 'APPROVED' && '승인됨'}
                              {reservation.status === 'REJECTED' && '거절됨'}
                              {reservation.status === 'COMPLETED' && '완료됨'}
                            </span>
                          </td>
                          <td>
                            <span className={`visit-status-badge visit-${(reservation.visitStatus || 'PENDING').toLowerCase()}`}>
                              {reservation.visitStatus === 'PENDING' && '대기중'}
                              {reservation.visitStatus === 'VISITED' && '방문함'}
                              {reservation.visitStatus === 'NO_SHOW' && '노쇼'}
                              {reservation.visitStatus === 'BLACKLISTED' && '블랙리스트'}
                              {!reservation.visitStatus && '대기중'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-detail"
                                onClick={() => handleReservationDetail(reservation)}
                                title="상세보기"
                              >
                                상세보기
                              </button>
                              {reservation.status === 'PENDING' && (
                                <>
                                  <button 
                                    className="btn-approve"
                                    onClick={() => handleApproveReservation(reservation.id)}
                                  >
                                    승인
                                  </button>
                                  <button 
                                    className="btn-reject"
                                    onClick={() => handleRejectReservation(reservation.id)}
                                  >
                                    거절
                                  </button>
                                </>
                              )}
                              {reservation.status === 'APPROVED' && (
                                <>
                                  <button 
                                    className="btn-visit"
                                    onClick={() => handleVisitStatusChange(reservation)}
                                  >
                                    방문확인
                                  </button>
                                </>
                              )}
                              {reservation.status === 'REJECTED' && reservation.rejectionReason && (
                                <div className="rejection-reason">
                                  <small>사유: {reservation.rejectionReason}</small>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 예약 관리 - 캘린더 */}
          {activeMenu === 'reservations' && activeSubMenu === 'calendar' && (
            <div className="calendar-section">
              <ReservationCalendar 
                reservations={reservations}
                onDateClick={handleCalendarDateClick}
                onReservationClick={handleReservationDetail}
                selectedDateReservations={selectedDateReservations}
              />
            </div>
          )}

          {/* 예약 관리 - 통계 */}
          {activeMenu === 'reservations' && activeSubMenu === 'stats' && (
            <div className="reservation-stats-section">
              <h2>예약 통계</h2>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>전체 예약</h3>
                    <p className="stat-value">{statistics.totalReservations}</p>
                    <span className="stat-change">총 예약 건수</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>대기중</h3>
                    <p className="stat-value">{reservations.filter(r => r.status === 'PENDING').length}</p>
                    <span className="stat-change">승인 대기중</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>승인됨</h3>
                    <p className="stat-value">{reservations.filter(r => r.status === 'APPROVED').length}</p>
                    <span className="stat-change">확정된 예약</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>방문 완료</h3>
                    <p className="stat-value">{statistics.totalVisits}</p>
                    <span className="stat-change">실제 방문 건수</span>
                  </div>
                </div>
              </div>
              
              <div className="reservation-chart">
                <h3>최근 예약 현황</h3>
                <div className="chart-container">
                  {reservations.length === 0 ? (
                    <div className="empty-chart">
                      <p>예약 데이터가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="reservation-list-mini">
                      {reservations.slice(0, 5).map((reservation, index) => (
                        <div key={reservation.id} className="mini-reservation-item">
                          <div className="mini-reservation-info">
                            <span className="reservation-date">{reservation.reservationDate}</span>
                            <span className="reservation-time">{reservation.reservationTime}</span>
                            <span className="reservation-user">{reservation.userName}</span>
                            <span className="reservation-guests">{reservation.guests}명</span>
                          </div>
                          <span className={`mini-status status-${reservation.status.toLowerCase()}`}>
                            {reservation.status === 'PENDING' && '대기'}
                            {reservation.status === 'APPROVED' && '승인'}
                            {reservation.status === 'REJECTED' && '거절'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 시간대별 예약 분포 */}
              <div className="chart-section">
                <div className="section-header">
                  <h3>시간대별 예약 분포</h3>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#00a699'}}></div>
                </div>
                <div className="chart-labels">
                  <span>11-12시</span>
                  <span>12-13시</span>
                  <span>13-14시</span>
                  <span>17-18시</span>
                  <span>18-19시</span>
                  <span>19-20시</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. 방문자 관리 - 블랙리스트 */}
          {activeMenu === 'visitors' && activeSubMenu === 'blacklist' && (
            <div className="blacklist-section">
              <h2>블랙리스트 관리</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>고객명</th>
                      <th>연락처</th>
                      <th>사유</th>
                      <th>등록일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklist.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row">블랙리스트가 없습니다</td>
                      </tr>
                    ) : (
                      blacklist.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.userName}</td>
                          <td>{item.userPhone}</td>
                          <td>{item.reason}</td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn-remove"
                              onClick={() => {
                                if (window.confirm('블랙리스트에서 제거하시겠습니까?')) {
                                  // 블랙리스트 제거 API 호출
                                  axios.delete(`http://localhost:8080/api/demo/blacklist/${item.id}`)
                                    .then(() => {
                                      loadBlacklist();
                                      alert('블랙리스트에서 제거되었습니다.');
                                    })
                                    .catch(error => {
                                      console.error('블랙리스트 제거 오류:', error);
                                      alert('오류가 발생했습니다.');
                                    });
                                }
                              }}
                            >
                              제거
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 방문자 관리 - 단골 고객 */}
          {activeMenu === 'visitors' && activeSubMenu === 'regulars' && (
            <div className="regulars-section">
              <h2>단골 고객</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>고객명</th>
                      <th>누적 방문</th>
                      <th>최근 방문</th>
                      <th>특이사항</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="empty-row">단골 고객 데이터가 없습니다</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 방문자 관리 - 방문 통계 */}
          {activeMenu === 'visitors' && activeSubMenu === 'visits' && (
            <div className="visits-section">
              <h2>방문 통계</h2>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>총 방문자</h3>
                    <p className="stat-value">{statistics.totalVisits}</p>
                    <span className="stat-change">누적 방문 건수</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>이번 달 방문</h3>
                    <p className="stat-value">{statistics.monthlyVisits}</p>
                    <span className="stat-change">월간 방문 건수</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>방문률</h3>
                    <p className="stat-value">
                      {statistics.totalReservations > 0 
                        ? Math.round((statistics.totalVisits / statistics.totalReservations) * 100)
                        : 0}%
                    </p>
                    <span className="stat-change">예약 대비 방문</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>평균 평점</h3>
                    <p className="stat-value">{statistics.averageRating}</p>
                    <span className="stat-change">고객 만족도</span>
                  </div>
                </div>
              </div>

              <div className="visit-charts">
                <div className="chart-section">
                  <h3>시간대별 방문 분포</h3>
                  <div className="bar-chart">
                    {statistics.timeDistribution.map((item, idx) => (
                      <div key={idx} className="bar-item">
                        <div className="bar-value">{item.value}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar-fill" 
                            style={{ height: `${item.percent}%` }}
                          ></div>
                        </div>
                        <div className="bar-label">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h3>요일별 방문 분포</h3>
                  <div className="bar-chart horizontal">
                    {statistics.dayDistribution.map((item, idx) => (
                      <div key={idx} className="bar-item-horizontal">
                        <div className="bar-label-left">{item.day}</div>
                        <div className="bar-wrapper-horizontal">
                          <div 
                            className="bar-fill-horizontal" 
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                        <div className="bar-value-right">{item.value}명</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 상점 관리 - 유입 통계 */}
          {activeMenu === 'marketing' && activeSubMenu === 'stats' && (
            <div className="marketing-stats-section">
              <h2>유입 통계</h2>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>이번 달 조회수</h3>
                    <p className="stat-value">{statistics.monthlyViews}</p>
                    <span className="stat-change">페이지 뷰</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>이번 달 예약</h3>
                    <p className="stat-value">{statistics.monthlyReservations}</p>
                    <span className="stat-change">예약 건수</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>전환율</h3>
                    <p className="stat-value">{statistics.conversionRate}%</p>
                    <span className="stat-change">조회 대비 예약</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>평균 평점</h3>
                    <p className="stat-value">{statistics.averageRating}</p>
                    <span className="stat-change">고객 만족도</span>
                  </div>
                </div>
              </div>

              <div className="keywords-section">
                <h3>인기 검색 키워드</h3>
                <div className="keywords-list">
                  {statistics.popularKeywords.length > 0 ? (
                    statistics.popularKeywords.map((keyword, index) => (
                      <div key={index} className="keyword-item">
                        <span className="keyword-rank">#{index + 1}</span>
                        <span className="keyword-text">{keyword.keyword}</span>
                        <span className="keyword-count">{keyword.count}회</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">검색 키워드 데이터가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 상점 관리 - 전환율 */}
          {activeMenu === 'marketing' && activeSubMenu === 'conversion' && (
            <div className="conversion-section">
              <h2>전환율 분석</h2>
              
              <div className="conversion-overview">
                <div className="conversion-main-stat">
                  <h3>전체 전환율</h3>
                  <div className="conversion-rate-large">{statistics.conversionRate}%</div>
                  <p>조회수 대비 예약 전환율</p>
                </div>
                
                <div className="conversion-funnel">
                  <div className="funnel-step">
                    <div className="funnel-label">페이지 조회</div>
                    <div className="funnel-value">{statistics.monthlyViews}명</div>
                    <div className="funnel-bar" style={{width: '100%'}}></div>
                  </div>
                  
                  <div className="funnel-arrow">↓</div>
                  
                  <div className="funnel-step">
                    <div className="funnel-label">예약 신청</div>
                    <div className="funnel-value">{statistics.monthlyReservations}명</div>
                    <div className="funnel-bar" style={{width: `${statistics.conversionRate}%`}}></div>
                  </div>
                  
                  <div className="funnel-arrow">↓</div>
                  
                  <div className="funnel-step">
                    <div className="funnel-label">실제 방문</div>
                    <div className="funnel-value">{statistics.monthlyVisits}명</div>
                    <div className="funnel-bar" style={{width: `${statistics.monthlyReservations > 0 ? (statistics.monthlyVisits / statistics.monthlyReservations) * 100 : 0}%`}}></div>
                  </div>
                </div>
              </div>

              <div className="conversion-tips">
                <h3>전환율 개선 팁</h3>
                <ul>
                  <li>매장 이미지를 더 매력적으로 업데이트하세요</li>
                  <li>고객 리뷰에 빠르게 응답하세요</li>
                  <li>메뉴 정보를 상세하게 작성하세요</li>
                  <li>특별한 이벤트나 할인을 제공하세요</li>
                </ul>
              </div>
            </div>
          )}

          {/* 상점 관리 - 리뷰 관리 */}
          {activeMenu === 'marketing' && activeSubMenu === 'reviews' && (
            <div className="reviews-management-section">
              <h2>리뷰 관리</h2>
              <div className="table-container">
                <table className="data-table reviews-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>작성자</th>
                      <th>평점</th>
                      <th>내용</th>
                      <th>작성일</th>
                      <th>댓글</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-row">리뷰가 없습니다</td>
                      </tr>
                    ) : (
                      reviews.map((review, index) => (
                        <tr key={review.id} className="review-row">
                          <td>{index + 1}</td>
                          <td>{review.userName}</td>
                          <td>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ color: i < review.rating ? '#ffd700' : '#ddd' }}>
                                ⭐
                              </span>
                            ))}
                          </td>
                          <td className="review-content">
                            <div className="review-text">{review.content}</div>
                            {review.ownerComment && (
                              <div className="owner-comment-display">
                                <strong>사장님 댓글:</strong> {review.ownerComment}
                                <div className="owner-comment-date">
                                  {new Date(review.ownerCommentAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </td>
                          <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                          <td>
                            {review.ownerComment ? (
                              <span className="replied-badge">댓글 완료</span>
                            ) : (
                              <button 
                                className="reply-btn" 
                                onClick={() => handleReplyReview(review)}
                              >
                                댓글 달기
                              </button>
                            )}
                          </td>
                          <td>
                            <button className="delete-btn" onClick={() => alert('리뷰 삭제는 관리자만 가능합니다.')}>삭제</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. 설정 - 자동 예약 */}
          {activeMenu === 'settings' && activeSubMenu === 'auto' && (
            <div className="auto-settings-section">
              <h2>자동 예약 설정</h2>
              <div className="settings-form">
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    예약 자동 승인
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    예약 알림 받기
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 설정 - 일반 설정 */}
          {activeMenu === 'settings' && activeSubMenu === 'general' && (
            <div className="general-settings-section">
              <h2>일반 설정</h2>
              <div className="empty-state">
                <p>일반 설정 준비 중...</p>
              </div>
            </div>
          )}

          {/* 6. 통계 - 전체 통계 */}
          {activeMenu === 'statistics' && activeSubMenu === 'overview' && (
            <div className="overview-stats-section">
              <h2>전체 통계</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>총 예약</h3>
                    <p className="stat-value">{statistics.totalReservations}</p>
                    <span className="stat-change">이번 달 {statistics.monthlyReservations}건</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>총 방문</h3>
                    <p className="stat-value">{statistics.totalVisits}</p>
                    <span className="stat-change">이번 달 {statistics.monthlyVisits}건</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>평균 평점</h3>
                    <p className="stat-value">{statistics.averageRating}</p>
                    <span className="stat-change">리뷰 {reviews.length}개</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>전환율</h3>
                    <p className="stat-value">{statistics.conversionRate}%</p>
                    <span className="stat-change">조회 대비 예약</span>
                  </div>
                </div>
              </div>

              {/* 월별 예약 추이 차트 */}
              <div className="chart-section">
                <div className="section-header">
                  <h3>월별 예약 추이</h3>
                  <select className="period-select">
                    <option>최근 6개월</option>
                    <option>최근 12개월</option>
                  </select>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                  <div className="chart-bar" style={{height: '10%', '--color': '#ff5a5f'}}></div>
                </div>
                <div className="chart-labels">
                  <span>5월</span>
                  <span>6월</span>
                  <span>7월</span>
                  <span>8월</span>
                  <span>9월</span>
                  <span>10월</span>
                </div>
              </div>

              {/* 방문자 & 예약 비교 */}
              <div className="comparison-section">
                <div className="section-header">
                  <h3>방문자 vs 예약 전환</h3>
                </div>
                <div className="comparison-stats">
                  <div className="comparison-item">
                    <span className="label">총 방문자</span>
                    <span className="value">{statistics.monthlyViews}명</span>
                  </div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-item">
                    <span className="label">예약 전환</span>
                    <span className="value">{statistics.monthlyReservations}명 ({statistics.conversionRate}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 통계 - 상세 분석 */}
          {activeMenu === 'statistics' && activeSubMenu === 'detailed' && (
            <div className="detailed-stats-section">
              <h2>상세 분석</h2>

              {/* 시간별 평균 */}
              <div className="analysis-card">
                <div className="analysis-card-header">
                  <h3>⏰ 시간별 평균 방문자</h3>
                  <span className="analysis-period">최근 30일</span>
                </div>
                <div className="chart-container">
                  <div className="bar-chart">
                    {statistics.timeDistribution.map((item, idx) => (
                      <div key={idx} className="bar-item">
                        <div className="bar-value">{item.value}</div>
                        <div className="bar-wrapper">
                          <div 
                            className="bar-fill" 
                            style={{ height: `${item.percent}%` }}
                          ></div>
                        </div>
                        <div className="bar-label">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 요일별 평균 */}
              <div className="analysis-card">
                <div className="analysis-card-header">
                  <h3>📅 요일별 평균 방문자</h3>
                  <span className="analysis-period">최근 4주</span>
                </div>
                <div className="chart-container">
                  <div className="bar-chart horizontal">
                    {statistics.dayDistribution.map((item, idx) => (
                      <div key={idx} className="bar-item-horizontal">
                        <div className="bar-label-left">{item.day}</div>
                        <div className="bar-wrapper-horizontal">
                          <div 
                            className="bar-fill-horizontal" 
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                        <div className="bar-value-right">{item.value}명</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 날씨별 & 성별 분석 (2열) */}
              <div className="analysis-grid-2">
                {/* 날씨별 분석 */}
                <div className="analysis-card">
                  <div className="analysis-card-header">
                    <h3>🌤️ 날씨별 방문 분석</h3>
                  </div>
                  <div className="pie-chart-container">
                    <div className="pie-chart">
                      <svg viewBox="0 0 100 100" className="pie-svg">
                        <circle cx="50" cy="50" r="40" fill="#e7f5ff" />
                        <circle 
                          cx="50" cy="50" r="20" 
                          fill="none" 
                          stroke="#667eea" 
                          strokeWidth="40"
                          strokeDasharray="50 75.4"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="20" 
                          fill="none" 
                          stroke="#00a699" 
                          strokeWidth="40"
                          strokeDasharray="25 100.4"
                          strokeDashoffset="-50"
                          transform="rotate(-90 50 50)"
                        />
                        <circle 
                          cx="50" cy="50" r="20" 
                          fill="none" 
                          stroke="#ffd700" 
                          strokeWidth="40"
                          strokeDasharray="15 110.4"
                          strokeDashoffset="-75"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="pie-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{background: '#667eea'}}></span>
                        <span className="legend-label">맑음</span>
                        <span className="legend-value">0%</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{background: '#00a699'}}></span>
                        <span className="legend-label">흐림</span>
                        <span className="legend-value">0%</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{background: '#ffd700'}}></span>
                        <span className="legend-label">비/눈</span>
                        <span className="legend-value">0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 성별 분석 */}
                <div className="analysis-card">
                  <div className="analysis-card-header">
                    <h3>👥 성별 방문 분석</h3>
                  </div>
                  <div className="gender-stats">
                    <div className="gender-item male">
                      <div className="gender-icon">👨</div>
                      <div className="gender-info">
                        <div className="gender-label">남성</div>
                        <div className="gender-value">
                          {statistics.genderDistribution.male + statistics.genderDistribution.female > 0 
                            ? Math.round((statistics.genderDistribution.male / (statistics.genderDistribution.male + statistics.genderDistribution.female)) * 100)
                            : 0}%
                        </div>
                        <div className="gender-count">{statistics.genderDistribution.male}명</div>
                      </div>
                    </div>
                    <div className="gender-item female">
                      <div className="gender-icon">👩</div>
                      <div className="gender-info">
                        <div className="gender-label">여성</div>
                        <div className="gender-value">
                          {statistics.genderDistribution.male + statistics.genderDistribution.female > 0 
                            ? Math.round((statistics.genderDistribution.female / (statistics.genderDistribution.male + statistics.genderDistribution.female)) * 100)
                            : 0}%
                        </div>
                        <div className="gender-count">{statistics.genderDistribution.female}명</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연령대 분석 */}
              <div className="analysis-card">
                <div className="analysis-card-header">
                  <h3>👶 연령대별 방문 분석</h3>
                  <span className="analysis-period">최근 30일</span>
                </div>
                <div className="age-stats-grid">
                  {statistics.ageDistribution.map((item, idx) => (
                    <div key={idx} className="age-card">
                      <div className="age-header">
                        <span className="age-label">{item.age}</span>
                        <span className="age-percent">{item.percent}%</span>
                      </div>
                      <div className="age-bar">
                        <div 
                          className="age-bar-fill" 
                          style={{ width: `${item.percent * 2}%`, background: item.color }}
                        ></div>
                      </div>
                      <div className="age-count">{item.count}명</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 메뉴 분석 */}
              <div className="analysis-card">
                <div className="analysis-card-header">
                  <h3>🍽️ 인기 메뉴 TOP 10</h3>
                  <span className="analysis-period">최근 30일</span>
                </div>
                <div className="menu-ranking">
                  <div className="empty-state">
                    <p>메뉴 주문 데이터가 없습니다.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 통계 - 월별 분석 */}
          {activeMenu === 'statistics' && activeSubMenu === 'monthly' && (
            <div className="monthly-stats-section">
              <h2>월별 분석</h2>
              <div className="empty-state">
                <p>월별 통계 준비 중...</p>
              </div>
            </div>
          )}

          {/* 7. 공지사항 - 목록 */}
          {activeMenu === 'notice' && activeSubMenu === 'list' && (
            <div className="notice-section">
              <h2>공지사항</h2>
              <button className="add-btn">공지 등록</button>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>제목</th>
                      <th>작성일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="empty-row">공지사항이 없습니다</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 공지사항 - 이벤트 */}
          {activeMenu === 'notice' && activeSubMenu === 'event' && (
            <div className="event-section">
              <h2>이벤트</h2>
              <button className="add-btn">이벤트 등록</button>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>제목</th>
                      <th>기간</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="empty-row">이벤트가 없습니다</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 메뉴 추가/수정 모달 */}
      {showMenuModal && <MenuModal editingItem={editingItem} onClose={() => setShowMenuModal(false)} onSave={handleSaveMenu} />}

      {/* 이벤트 추가/수정 모달 */}
      {showEventModal && <EventModal editingItem={editingItem} onClose={() => setShowEventModal(false)} onSave={handleSaveEvent} />}

      {/* 리뷰 댓글 모달 */}
      {showReviewReplyModal && <ReviewReplyModal review={selectedReview} onClose={() => setShowReviewReplyModal(false)} onSave={handleSaveReply} />}

      {/* 방문 상태 변경 모달 */}
      {showVisitStatusModal && <VisitStatusModal reservation={selectedReservation} onClose={() => setShowVisitStatusModal(false)} onSave={updateVisitStatus} />}

      {/* 예약 상세보기 모달 */}
      <OwnerReservationDetailModal
        reservation={selectedReservation}
        isOpen={isReservationModalOpen}
        onClose={handleCloseReservationModal}
        onStatusChange={handleStatusChange}
        onVisitStatusChange={handleVisitStatusChange}
        onBlacklist={handleBlacklist}
        onNoShow={handleNoShow}
      />

    </div>
  );
};

// 메뉴 모달 컴포넌트
const MenuModal = ({ editingItem, onClose, onSave }) => {
  const [formData, setFormData] = useState(editingItem || {
    name: '',
    description: '',
    price: '',
    available: true,
    image: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h3>{editingItem ? '메뉴 수정' : '메뉴 추가'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <div className="form-group">
              <label>메뉴명 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="메뉴 이름을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label>설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="메뉴 설명을 입력하세요"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>가격 *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="가격을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                />
                판매중
              </label>
            </div>
          </div>
          <div className="modal-footer-custom">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 이벤트 모달 컴포넌트
const EventModal = ({ editingItem, onClose, onSave }) => {
  const [formData, setFormData] = useState(editingItem || {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    discount: '',
    image: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h3>{editingItem ? '이벤트 수정' : '이벤트 추가'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <div className="form-group">
              <label>이벤트명 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="이벤트 제목을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label>설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="이벤트 설명을 입력하세요"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>시작일 *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>종료일 *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>할인 정보</label>
              <input
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="예: 20% 할인, 1+1"
              />
            </div>
          </div>
          <div className="modal-footer-custom">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 리뷰 댓글 모달 컴포넌트
const ReviewReplyModal = ({ review, onClose, onSave }) => {
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onSave(replyText);
      setReplyText('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h3>리뷰 댓글 작성</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <div className="review-info">
              <p><strong>{review?.author}</strong>님의 리뷰</p>
              <p className="review-content-preview">{review?.content}</p>
            </div>
            <div className="form-group">
              <label>댓글 내용 *</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="고객에게 댓글을 작성해주세요..."
                rows="5"
                required
              />
            </div>
          </div>
          <div className="modal-footer-custom">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit">댓글 등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 방문 상태 변경 모달 컴포넌트
const VisitStatusModal = ({ reservation, onClose, onSave }) => {
  const [visitStatus, setVisitStatus] = useState('VISITED');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (visitStatus === 'NO_SHOW' || visitStatus === 'BLACKLISTED') {
      if (!reason.trim()) {
        alert('사유를 입력해주세요.');
        return;
      }
    }
    onSave(visitStatus, reason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h3>방문 상태 변경</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <div className="reservation-info">
              <p><strong>{reservation?.userName}</strong>님의 예약</p>
              <p>{reservation?.reservationDate} {reservation?.reservationTime}</p>
            </div>
            <div className="form-group">
              <label>방문 상태 *</label>
              <select
                value={visitStatus}
                onChange={(e) => setVisitStatus(e.target.value)}
                required
              >
                <option value="VISITED">방문함</option>
                <option value="NO_SHOW">노쇼</option>
                <option value="BLACKLISTED">블랙리스트</option>
              </select>
            </div>
            {(visitStatus === 'NO_SHOW' || visitStatus === 'BLACKLISTED') && (
              <div className="form-group">
                <label>사유 *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="사유를 입력해주세요"
                  rows="3"
                  required
                />
              </div>
            )}
          </div>
          <div className="modal-footer-custom">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default OwnerDashboard;