/**
 * Owner 전용 매장 관리 대시보드
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { weatherAPI, freeWeatherAPI } from '../../services/weatherAPI';
import { statisticsAPI, imageUploadAPI } from '../../demo/services/api';
import { chatAPI } from '../../demo/services/chatAPI';
import { API_ENDPOINTS, getImageUrl } from '../../constants/config/apiConfig';
import axios from 'axios';
import OwnerReservationDetailModal from '../../components/modals/OwnerReservationDetailModal';
import ReservationCalendar from '../../components/calendar/ReservationCalendar';
import NoShowReasonModal from '../../components/modals/NoShowReasonModal';
import BlacklistReasonModal from '../../components/modals/BlacklistReasonModal';
import './OwnerDashboard.css'; // 캘린더 CSS보다 먼저 로드

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
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
    photo1: null,
    photo2: null,
    photo3: null,
    photo4: null,
    photo5: null
  });
  const [uploadingImages, setUploadingImages] = useState({
    main: false,
    photo1: false,
    photo2: false,
    photo3: false,
    photo4: false,
    photo5: false
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
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
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [processingReservation, setProcessingReservation] = useState(null); // 처리 중인 예약 ID
  
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
      loadChatUnreadCount();
    }
  }, [user]);

  // 채팅 읽지 않은 메시지 개수 조회 (5초마다)
  useEffect(() => {
    if (user?.userId) {
      loadChatUnreadCount();
      const interval = setInterval(loadChatUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadChatUnreadCount = async () => {
    if (!user?.userId) return;
    try {
      const response = await chatAPI.getUnreadChatRoomCount(user.userId);
      setChatUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('채팅 알림 개수 조회 오류:', error);
    }
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  // 예약, 리뷰 데이터가 로드된 후 통계 계산
  useEffect(() => {
    if (reservations.length > 0 || reviews.length > 0) {
      loadStatistics();
    }
  }, [reservations, reviews]);

  // 식당 정보가 로드된 후 날씨 분석 실행
  useEffect(() => {
    if (restaurant && (reservations.length > 0 || reviews.length > 0)) {
      analyzeWeatherVisits();
    }
  }, [restaurant, reservations, reviews]);

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

  // 날씨별 방문 분석 (OpenWeatherMap API 사용)
  const analyzeWeatherVisits = async () => {
    console.log('🌤️ 날씨 분석 시작:', { 
      restaurant: restaurant?.restaurantName, 
      lat: restaurant?.lat, 
      lng: restaurant?.lng,
      reservationsCount: reservations.length 
    });
    
    // 식당 위치 정보가 없으면 서울 기본값 사용
    const lat = restaurant?.lat || 37.5665; // 서울 위도
    const lng = restaurant?.lng || 126.9780; // 서울 경도
    
    if (!restaurant?.lat || !restaurant?.lng) {
      console.warn('식당 위치 정보가 없어서 서울 기본값을 사용합니다:', { lat, lng });
    }

    try {
      const weatherAnalysis = {
        sunny: 0,
        cloudy: 0,
        rainy: 0,
        snowy: 0,
        foggy: 0,
        stormy: 0,
        other: 0
      };

      // OpenWeatherMap API로 현재 날씨 조회
      try {
        const currentWeather = await weatherAPI.getCurrentWeather(lat, lng);
        
        console.log('OpenWeatherMap 날씨 데이터:', currentWeather);
        
        // 현재 날씨를 기반으로 분석
        const weatherCategory = weatherAPI.categorizeWeather(currentWeather);
        const totalReservations = reservations.length;
        
        // 실제 날씨에 따른 분포 계산
        weatherAnalysis[weatherCategory] = Math.floor(totalReservations * 0.4); // 현재 날씨 기준 40%
        
        // 나머지 분포는 일반적인 패턴으로 설정
        weatherAnalysis.sunny = Math.floor(totalReservations * 0.25);
        weatherAnalysis.cloudy = Math.floor(totalReservations * 0.2);
        weatherAnalysis.rainy = Math.floor(totalReservations * 0.1);
        weatherAnalysis.other = Math.floor(totalReservations * 0.05);
        
        console.log('날씨별 방문 분석 결과:', weatherAnalysis);
        console.log('statistics 업데이트 전:', statistics);
        
      } catch (error) {
        console.warn('OpenWeatherMap API 실패, 기본값 사용:', error);
        // API 실패 시 기본 분포
        const totalReservations = reservations.length;
        weatherAnalysis.sunny = Math.floor(totalReservations * 0.4);
        weatherAnalysis.cloudy = Math.floor(totalReservations * 0.3);
        weatherAnalysis.rainy = Math.floor(totalReservations * 0.2);
        weatherAnalysis.other = Math.floor(totalReservations * 0.1);
      }

      // 통계 업데이트
      setStatistics(prev => {
        const newStats = {
          ...prev,
          weatherDistribution: weatherAnalysis
        };
        console.log('통계 업데이트 완료:', newStats.weatherDistribution);
        return newStats;
      });

    } catch (error) {
      console.error('날씨 분석 오류:', error);
    }
  };

  // 통계 로드 함수
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
        weatherDistribution: statistics.weatherDistribution || { sunny: 50, cloudy: 30, rainy: 20 } // 날씨 분석 결과 유지
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
    setProcessingReservation(reservationId);
    try {
      const requestData = {
        status: newStatus
      };

      // 거절인 경우 사유 추가
      if (newStatus === 'REJECTED') {
        const reason = prompt('거절 사유를 입력해주세요:');
        if (!reason) {
          alert('거절 사유를 입력해주세요.');
          return;
        }
        requestData.reason = reason;
      }

      await axios.put(`${API_ENDPOINTS.DEMO}/reservations/${reservationId}/status`, requestData);
      
      // 예약 목록 새로고침
      loadReservations();
      
      alert(`예약이 ${newStatus === 'APPROVED' ? '승인' : newStatus === 'REJECTED' ? '거절' : '완료'}되었습니다.`);
    } catch (error) {
      console.error('예약 상태 변경 오류:', error);
      
      // 더 구체적인 에러 메시지
      if (error.response?.status === 404) {
        alert('예약을 찾을 수 없습니다.');
      } else if (error.response?.status === 400) {
        alert('잘못된 요청입니다.');
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다.');
      } else {
        alert('예약 상태 변경에 실패했습니다.');
      }
    } finally {
      setProcessingReservation(null);
    }
  };

  // 블랙리스트 처리 (팝업 열기)
  const handleBlacklist = (reservation) => {
    setSelectedReservation(reservation);
    setShowBlacklistModal(true);
    setIsReservationModalOpen(false); // 예약 상세 모달 닫기
  };

  // 블랙리스트 처리 실행
  const handleBlacklistConfirm = async (reservation, reason) => {
    try {
      // 블랙리스트 추가 API 호출
      await axios.post(`${API_ENDPOINTS.DEMO}/blacklist`, {
        userId: reservation.userId,
        restaurantId: user.restaurantId,
        userName: reservation.userName,
        userPhone: reservation.userPhone,
        reason: reason,
        reservationId: reservation.id,
        createdBy: user.userId
      });

      // 예약 상태를 블랙리스트로 변경
      await axios.put(`${API_ENDPOINTS.DEMO}/reservations/${reservation.id}/status`, {
        status: 'BLACKLISTED',
        reason: reason
      });

      // 데이터 새로고침
      loadReservations();
      loadBlacklist();
      
      alert('블랙리스트 처리되었습니다.');
    } catch (error) {
      console.error('블랙리스트 처리 오류:', error);
      alert('블랙리스트 처리에 실패했습니다.');
      throw error;
    }
  };

  // 노쇼 처리 (팝업 열기)
  const handleNoShow = (reservation) => {
    setSelectedReservation(reservation);
    setShowNoShowModal(true);
    setIsReservationModalOpen(false); // 예약 상세 모달 닫기
  };

  // 노쇼 처리 실행
  const handleNoShowConfirm = async (reservation, reason) => {
    try {
      // 방문 상태를 노쇼로 변경
      await axios.put(`${API_ENDPOINTS.DEMO}/reservations/visit-status`, {
        reservationId: reservation.id,
        visitStatus: 'NO_SHOW',
        reason: reason,
        createdBy: user.userId
      });

      // 예약 상태를 완료로 변경 (노쇼도 완료된 것으로 처리)
      await axios.put(`${API_ENDPOINTS.DEMO}/reservations/${reservation.id}/status`, {
        status: 'COMPLETED',
        reason: `노쇼: ${reason}`
      });

      // 데이터 새로고침
      loadReservations();
      
      alert('노쇼 처리되었습니다.');
    } catch (error) {
      console.error('노쇼 처리 오류:', error);
      alert('노쇼 처리에 실패했습니다.');
      throw error;
    }
  };

  // 방문 상태 업데이트
  const updateVisitStatus = async (visitStatus, reason) => {
    try {
      console.log('방문 상태 업데이트 요청:', {
        reservationId: selectedReservation?.id,
        visitStatus,
        reason,
        createdBy: user?.userId,
        selectedReservation
      });

      if (!selectedReservation?.id) {
        console.error('selectedReservation:', selectedReservation);
        alert('예약 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        return;
      }

      const requestData = {
        reservationId: selectedReservation.id,
        visitStatus: visitStatus,
        reason: reason || '',
        createdBy: user.userId
      };

      console.log('전송 데이터:', requestData);

      await axios.put(`${API_ENDPOINTS.DEMO}/reservations/visit-status`, requestData);

      // 블랙리스트에 추가하는 경우
      if (visitStatus === 'BLACKLISTED' && reason) {
        await axios.post(`${API_ENDPOINTS.DEMO}/blacklist`, {
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
      console.error('오류 상세:', error.response?.data);
      alert('오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
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
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS}/${user.restaurantId}`);
      const restaurantData = response.data;
      setRestaurant(restaurantData);
      setFormData(restaurantData);
      
      // 이미지 정보 로드 (절대 URL로 변환)
      const convertToAbsoluteUrl = (url) => {
        return getImageUrl(url);
      };
      
      setImages({
        main: convertToAbsoluteUrl(restaurantData.mainImage),
        photo1: convertToAbsoluteUrl(restaurantData.restaurantPhoto1),
        photo2: convertToAbsoluteUrl(restaurantData.restaurantPhoto2),
        photo3: convertToAbsoluteUrl(restaurantData.restaurantPhoto3),
        photo4: convertToAbsoluteUrl(restaurantData.restaurantPhoto4),
        photo5: convertToAbsoluteUrl(restaurantData.restaurantPhoto5)
      });
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
      
      // 이미지 URL을 포함한 데이터 준비
      // 절대 URL에서 상대 경로 추출
      const getRelativePath = (url) => {
        if (!url) return null;
        // 이미 절대 경로인 경우 (http://... 형태)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // /uploads/... 형태로 추출
          const match = url.match(/\/uploads\/.*$/);
          return match ? match[0] : null;
        }
        // 이미 상대 경로인 경우
        return url;
      };
      
      // 세부사항 정보도 함께 가져오기
      const descriptionEl = document.getElementById('description');
      const parkingInfoEl = document.getElementById('parkingInfo');
      const transportationEl = document.getElementById('transportation');
      const specialNotesEl = document.getElementById('specialNotes');
      
      // 이미지 데이터 저장
      const saveData = {
        ...formData,
        mainImage: getRelativePath(images.main),
        restaurantPhoto1: getRelativePath(images.photo1),
        restaurantPhoto2: getRelativePath(images.photo2),
        restaurantPhoto3: getRelativePath(images.photo3),
        restaurantPhoto4: getRelativePath(images.photo4),
        restaurantPhoto5: getRelativePath(images.photo5),
        // 세부사항 정보 포함
        description: descriptionEl ? descriptionEl.value : formData.description || '',
        parkingInfo: parkingInfoEl ? parkingInfoEl.value : formData.parkingInfo || '',
        transportation: transportationEl ? transportationEl.value : formData.transportation || '',
        specialNotes: specialNotesEl ? specialNotesEl.value : formData.specialNotes || '',
        cardPayment: document.getElementById('cardPayment')?.checked ? 'Y' : 'N',
        cashPayment: document.getElementById('cashPayment')?.checked ? 'Y' : 'N',
        mobilePayment: document.getElementById('mobilePayment')?.checked ? 'Y' : 'N',
        accountTransfer: document.getElementById('accountTransfer')?.checked ? 'Y' : 'N'
      };
      
      await axios.put(`${API_ENDPOINTS.RESTAURANTS}/${user.restaurantId}`, saveData);
      alert('매장 정보가 저장되었습니다.');
      setRestaurant(saveData);
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

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 검사 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setUploadingImages(prev => ({ ...prev, [imageType]: true }));
      const response = await imageUploadAPI.uploadRestaurantImage(file, imageType);
      
      if (response.data.success) {
        // 절대 URL로 변환
        const imageUrl = getImageUrl(response.data.fileUrl);
        
        setImages(prev => ({
          ...prev,
          [imageType]: imageUrl
        }));
        alert('이미지가 성공적으로 업로드되었습니다.');
      } else {
        alert(response.data.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const removeImage = async (imageType) => {
    const currentImageUrl = images[imageType];
    if (!currentImageUrl) return;

    try {
      // 서버에서 이미지 삭제
      const response = await imageUploadAPI.deleteImage(currentImageUrl);
      
      if (response.data.success) {
        setImages(prev => ({
          ...prev,
          [imageType]: null
        }));
        alert('이미지가 삭제되었습니다.');
      } else {
        alert(response.data.message || '이미지 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image delete error:', error);
      // 서버 삭제 실패해도 로컬에서 제거
      setImages(prev => ({
        ...prev,
        [imageType]: null
      }));
      alert('이미지가 삭제되었습니다.');
    }
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

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus/${menuId}`);
        setMenuItems(menuItems.filter(m => m.menuId !== menuId));
      alert('메뉴가 삭제되었습니다.');
      } catch (error) {
        console.error('메뉴 삭제 실패:', error);
        alert('메뉴 삭제에 실패했습니다.');
      }
    }
  };

  const handleMoveMenuOrder = async (menu, categoryMenus, direction) => {
    const currentIndex = categoryMenus.indexOf(menu);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= categoryMenus.length) return;

    // 카테고리 내에서 순서 변경
    const newCategoryMenus = [...categoryMenus];
    [newCategoryMenus[currentIndex], newCategoryMenus[newIndex]] = [newCategoryMenus[newIndex], newCategoryMenus[currentIndex]];

    // 백엔드에 순서 저장
    try {
      const category = menu.category || '분류 없음';
      
      for (let idx = 0; idx < newCategoryMenus.length; idx++) {
        const m = newCategoryMenus[idx];
        await axios.put(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus/${m.menuId}`, {
          ...m,
          sortOrder: idx
        });
      }
      
      // 저장 후 전체 메뉴 다시 로드
      await loadMenus();
    } catch (error) {
      console.error('순서 저장 실패:', error);
      alert('메뉴 순서 변경에 실패했습니다.');
    }
  };

  const handleSaveMenu = async (menuData) => {
    try {
      // 기존 메뉴가 있으면 그 sortOrder를 사용하고, 없으면 현재 메뉴 개수를 사용
      const maxSortOrder = Math.max(...menuItems.map(m => m.sortOrder || 0), 0);
      
      const menuPayload = {
        storeId: restaurant?.id,
        name: menuData.name,
        description: menuData.description,
        price: parseInt(menuData.price),
        imageUrl: menuData.image,
        isAvailable: menuData.available,
        isPopular: menuData.isPopular || false,
        isRecommended: menuData.isRecommended || false,
        category: menuData.category || '',
        sortOrder: editingItem ? editingItem.sortOrder : maxSortOrder + 1
      };

      let response;
    if (editingItem) {
      // 수정
        response = await axios.put(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus/${editingItem.menuId}`, menuPayload);
        setMenuItems(menuItems.map(m => m.menuId === editingItem.menuId ? response.data : m));
      alert('메뉴가 수정되었습니다.');
    } else {
      // 추가
        response = await axios.post(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus`, menuPayload);
        setMenuItems([...menuItems, response.data]);
      alert('메뉴가 추가되었습니다.');
    }
    setShowMenuModal(false);
    setEditingItem(null);
    } catch (error) {
      console.error('메뉴 저장 실패:', error);
      alert('메뉴 저장에 실패했습니다.');
    }
  };

  // 메뉴 목록 로드
  const loadMenus = async () => {
    if (!restaurant?.id) return;
    try {
      const response = await axios.get(`${API_ENDPOINTS.RESTAURANTS.replace('/restaurants', '')}/menus?storeId=${restaurant.id}`);
      // sortOrder로 정렬하고, 없으면 메뉴 ID로 정렬
      const sortedMenus = response.data.sort((a, b) => {
        const orderA = a.sortOrder !== null && a.sortOrder !== undefined ? a.sortOrder : 999;
        const orderB = b.sortOrder !== null && b.sortOrder !== undefined ? b.sortOrder : 999;
        return orderA - orderB;
      });
      setMenuItems(sortedMenus);
      
      // 카테고리 목록 추출
      const categories = [...new Set(sortedMenus.map(m => m.category || '분류 없음'))];
      if (categoryOrder.length === 0) {
        setCategoryOrder(categories);
      }
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [restaurant?.id]);

  // 세부사항 저장 (이제 handleSave에서 처리되므로 사용하지 않음)
  const handleSaveDetails = async () => {
    if (!restaurant?.id) {
      alert('매장 정보를 불러올 수 없습니다.');
      return;
    }
    
    try {
      const descriptionEl = document.getElementById('description');
      const parkingInfoEl = document.getElementById('parkingInfo');
      const transportationEl = document.getElementById('transportation');
      const specialNotesEl = document.getElementById('specialNotes');
      
      const detailsData = {
        id: restaurant.id,
        description: descriptionEl ? descriptionEl.value : '',
        parkingInfo: parkingInfoEl ? parkingInfoEl.value : '',
        transportation: transportationEl ? transportationEl.value : '',
        specialNotes: specialNotesEl ? specialNotesEl.value : '',
        cardPayment: document.getElementById('cardPayment')?.checked ? 'Y' : 'N',
        cashPayment: document.getElementById('cashPayment')?.checked ? 'Y' : 'N',
        mobilePayment: document.getElementById('mobilePayment')?.checked ? 'Y' : 'N',
        accountTransfer: document.getElementById('accountTransfer')?.checked ? 'Y' : 'N',
        restaurantName: restaurant.restaurantName,
        branchName: restaurant.branchName,
        regionName: restaurant.regionName,
        mainImage: restaurant.mainImage,
        restaurantPhoto1: restaurant.restaurantPhoto1,
        restaurantPhoto2: restaurant.restaurantPhoto2,
        restaurantPhoto3: restaurant.restaurantPhoto3,
        restaurantPhoto4: restaurant.restaurantPhoto4,
        restaurantPhoto5: restaurant.restaurantPhoto5
      };
      
      await axios.put(`${API_ENDPOINTS.RESTAURANTS}/${restaurant.id}`, detailsData);
      
      loadRestaurantInfo();
      
      alert('세부사항이 저장되었습니다.');
    } catch (error) {
      console.error('세부사항 저장 실패:', error);
      alert('세부사항 저장에 실패했습니다.');
    }
  };

  // 카테고리 순서 변경
  const handleMoveCategory = (category, direction) => {
    const currentIndex = categoryOrder.indexOf(category);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= categoryOrder.length) return;

    const newOrder = [...categoryOrder];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    setCategoryOrder(newOrder);
  };

  // 카테고리별로 정렬된 메뉴 반환
  const getOrderedMenuGroups = () => {
    const groupedMenus = menuItems.reduce((acc, menu) => {
      const category = menu.category || '분류 없음';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(menu);
      return acc;
    }, {});

    // 카테고리 순서대로 정렬
    const orderedCategories = categoryOrder.length > 0 
      ? categoryOrder.filter(cat => groupedMenus[cat])
      : Object.keys(groupedMenus);

    return orderedCategories.map(category => ({
      category,
      menus: groupedMenus[category]
    }));
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
      await axios.post(`${API_ENDPOINTS.DEMO}/reviews/${selectedReview.id}/owner-comment`, {
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
            {reservations.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="unread-dot"></span>
            )}
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
            <button 
              className="chat-notification-btn" 
              onClick={handleChatClick}
              title="채팅 보기"
            >
              💬 채팅
              {chatUnreadCount > 0 && (
                <span className="chat-badge">{chatUnreadCount}</span>
              )}
            </button>
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        name="roadAddress"
                        value={formData.roadAddress || ''}
                        onChange={handleChange}
                        placeholder="서울 중구 명동길 14"
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          // 카카오 주소 검색 팝업 (가장 편함)
                          if (!window.daum) {
                            const script = document.createElement('script');
                            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
                            script.onload = () => {
                              new window.daum.Postcode({
                                oncomplete: (data) => {
                                  // 도로명 주소 선택
                                  if (data.userSelectedType === 'R') {
                                    handleChange({ target: { name: 'roadAddress', value: data.roadAddress } });
                                  } else {
                                    handleChange({ target: { name: 'roadAddress', value: data.jibunAddress } });
                                  }
                                }
                              }).open();
                            };
                            document.body.appendChild(script);
                          } else {
                            new window.daum.Postcode({
                              oncomplete: (data) => {
                                // 도로명 주소 선택
                                if (data.userSelectedType === 'R') {
                                  handleChange({ target: { name: 'roadAddress', value: data.roadAddress } });
                                } else {
                                  handleChange({ target: { name: 'roadAddress', value: data.jibunAddress } });
                                }
                              }
                            }).open();
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#00a699',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        주소 검색
                      </button>
                    </div>
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

                <div className="info-item">
                  <label>아이존</label>
                  {isEditing ? (
                    <select
                      name="kidsZone"
                      value={formData.kidsZone || 'N'}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="Y">가능</option>
                      <option value="N">불가능</option>
                    </select>
                  ) : (
                    <p>{restaurant.kidsZone === 'Y' ? '가능' : '불가능'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>다국어 메뉴</label>
                  {isEditing ? (
                    <select
                      name="multilingualMenu"
                      value={formData.multilingualMenu || 'N'}
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="Y">제공</option>
                      <option value="N">미제공</option>
                    </select>
                  ) : (
                    <p>{restaurant.multilingualMenu === 'Y' ? '제공' : '미제공'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>해시태그</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="hashtags"
                      value={formData.hashtags || ''}
                      onChange={handleChange}
                      placeholder="#해시태그 #입력"
                    />
                  ) : (
                    <p>{restaurant.hashtags || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>홈페이지</label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="homepageUrl"
                      value={formData.homepageUrl || ''}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p>{restaurant.homepageUrl || '-'}</p>
                  )}
                </div>

                <div className="info-item full-width">
                  <label>지역</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="regionName"
                      value={formData.regionName || ''}
                      onChange={handleChange}
                      placeholder="서울, 부산 등"
                    />
                  ) : (
                    <p>{restaurant.regionName || '-'}</p>
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
                        <img 
                          src={images.main} 
                          alt="메인" 
                          onError={(e) => {
                            console.error('이미지 로딩 실패:', images.main);
                            e.target.style.display = 'none';
                          }}
                        />
                        <button 
                          className="remove-image-btn" 
                          onClick={() => removeImage('main')}
                          type="button"
                          disabled={uploadingImages.main}
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
                          disabled={uploadingImages.main}
                        />
                        <div className="upload-placeholder">
                          {uploadingImages.main ? (
                            <>
                              <span className="upload-icon">⏳</span>
                              <span>업로드 중...</span>
                            </>
                          ) : (
                            <>
                              <span className="upload-icon">📷</span>
                              <span>메인 이미지 업로드</span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>

                  {/* 매장 사진들 */}
                  {['photo1', 'photo2', 'photo3', 'photo4', 'photo5'].map((photoKey, idx) => (
                    <div key={photoKey} className="image-upload-item">
                      <label>매장 사진 {idx + 1}</label>
                      {images[photoKey] ? (
                        <div className="image-preview">
                          <img 
                            src={images[photoKey]} 
                            alt={`매장 사진 ${idx + 1}`} 
                            onError={(e) => {
                              console.error('이미지 로딩 실패:', images[photoKey]);
                              e.target.style.display = 'none';
                            }}
                          />
                          <button 
                            className="remove-image-btn" 
                            onClick={() => removeImage(photoKey)}
                            type="button"
                            disabled={uploadingImages[photoKey]}
                          >
                            ✕
                          </button>
                  </div>
                      ) : (
                        <label className="image-upload-box">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, photoKey)}
                            style={{display: 'none'}}
                            disabled={uploadingImages[photoKey]}
                          />
                          <div className="upload-placeholder">
                            {uploadingImages[photoKey] ? (
                              <>
                                <span className="upload-icon">⏳</span>
                                <span>업로드 중...</span>
                              </>
                            ) : (
                              <>
                                <span className="upload-icon">📷</span>
                                <span>매장 사진 업로드</span>
                              </>
                            )}
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
                  {(() => {
                    // 업로드된 이미지들을 배열로 수집
                    const uploadedImages = [
                      images.main,
                      images.photo1,
                      images.photo2,
                      images.photo3,
                      images.photo4,
                      images.photo5
                    ].filter(Boolean); // null 값 제거
                    
                    return uploadedImages.length > 0 ? (
                    <div className="preview-image-gallery">
                        {/* 메인 이미지 슬라이더 */}
                        <div className="image-slider-container">
                          <div className="image-slider-main">
                            <img 
                              src={uploadedImages[currentImageIndex] || uploadedImages[0]} 
                              alt="매장 이미지" 
                              className="slider-main-image"
                            />
                            {/* 이전/다음 버튼 */}
                            {uploadedImages.length > 1 && (
                              <>
                                <button 
                                  className="slider-btn slider-btn-prev"
                                  onClick={() => setCurrentImageIndex((prev) => 
                                    prev > 0 ? prev - 1 : uploadedImages.length - 1
                                  )}
                                >
                                  ‹
                                </button>
                                <button 
                                  className="slider-btn slider-btn-next"
                                  onClick={() => setCurrentImageIndex((prev) => 
                                    prev < uploadedImages.length - 1 ? prev + 1 : 0
                                  )}
                                >
                                  ›
                                </button>
                              </>
                            )}
                            {/* 이미지 인디케이터 */}
                            {uploadedImages.length > 1 && (
                              <div className="slider-indicators">
                                {uploadedImages.map((_, index) => (
                                  <span 
                                    key={index}
                                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                  />
                                ))}
                        </div>
                      )}
                      </div>
                          {/* 썸네일 목록 */}
                          {uploadedImages.length > 1 && (
                            <div className="slider-thumbnails">
                              {uploadedImages.map((img, index) => (
                                <img 
                                  key={index}
                                  src={img} 
                                  alt={`썸네일 ${index + 1}`}
                                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                              ))}
                    </div>
                  )}
                        </div>
                      </div>
                    ) : null;
                  })()}

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
                  ) : (() => {
                    // 카테고리별로 정렬된 메뉴 그룹 가져오기
                    const orderedMenus = getOrderedMenuGroups();

                    return orderedMenus.map(({ category, menus }) => (
                      <div key={category} className="menu-category-group">
                        <div className="menu-category-header">
                          <div className="category-title-wrapper">
                            <h3>{category}</h3>
                            <span className="menu-count">({menus.length})</span>
                          </div>
                          <div className="category-order-buttons">
                            <button 
                              className="order-btn order-up" 
                              onClick={() => handleMoveCategory(category, 'up')}
                              disabled={orderedMenus.indexOf(orderedMenus.find(o => o.category === category)) === 0}
                              title="위로"
                            >
                              ↑
                            </button>
                            <button 
                              className="order-btn order-down" 
                              onClick={() => handleMoveCategory(category, 'down')}
                              disabled={orderedMenus.indexOf(orderedMenus.find(o => o.category === category)) === orderedMenus.length - 1}
                              title="아래로"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        {menus.map((menu) => (
                          <div key={menu.menuId} className="menu-list-item">
                            <div className="menu-list-image">
                              {menu.imageUrl ? (
                                <img src={getImageUrl(menu.imageUrl)} alt={menu.name} />
                              ) : (
                                <div className="menu-placeholder">🍽️</div>
                              )}
                            </div>
                            <div className="menu-list-content">
                              <div className="menu-list-name">
                                <h3>{menu.name}</h3>
                                <span className={`menu-status ${menu.isAvailable ? 'available' : 'unavailable'}`}>
                                  {menu.isAvailable ? '판매중' : '품절'}
                                </span>
                              </div>
                              {menu.description && (
                                <p className="menu-list-description">{menu.description}</p>
                              )}
                              <div className="menu-list-price">₩{menu.price?.toLocaleString()}</div>
                            </div>
                            <div className="menu-list-actions">
                              <div className="menu-order-buttons">
                                <button 
                                  className="order-btn order-up" 
                                  onClick={() => handleMoveMenuOrder(menu, menus, 'up')}
                                  disabled={menus.indexOf(menu) === 0}
                                  title="위로"
                                >
                                  ↑
                                </button>
                                <button 
                                  className="order-btn order-down" 
                                  onClick={() => handleMoveMenuOrder(menu, menus, 'down')}
                                  disabled={menus.indexOf(menu) === menus.length - 1}
                                  title="아래로"
                                >
                                  ↓
                                </button>
                              </div>
                              <button className="edit-menu-btn" onClick={() => handleEditMenu(menu)}>수정</button>
                              <button className="delete-menu-btn" onClick={() => handleDeleteMenu(menu.menuId)}>삭제</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
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
                  ) : (() => {
                    // 카테고리별로 그룹화
                    const groupedMenus = menuItems.reduce((acc, menu) => {
                      const category = menu.category || '분류 없음';
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(menu);
                      return acc;
                    }, {});

                    return (
                      <div className="preview-menu-grid">
                        {Object.entries(groupedMenus).map(([category, menus]) => (
                          <div key={category} className="preview-category-group">
                            <div className="preview-category-header">
                              <h3>{category}</h3>
                            </div>
                            {menus.map((menu) => (
                              <div key={menu.menuId} className="preview-menu-list-item">
                                <div className="preview-menu-image">
                                  {menu.imageUrl ? (
                                    <img 
                                      src={getImageUrl(menu.imageUrl)} 
                                      alt={menu.name} 
                                      onError={(e) => {
                                        console.error('이미지 로딩 실패:', menu.imageUrl);
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className="preview-menu-placeholder" style={{ display: menu.imageUrl ? 'none' : 'flex' }}>🍽️</div>
                                </div>
                                <div className="preview-menu-info">
                                  <div className="preview-menu-header">
                                    <h4>{menu.name}</h4>
                                    <div className="preview-menu-price">₩{menu.price?.toLocaleString()}</div>
                                  </div>
                                  {menu.description && <p>{menu.description}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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
                      id="description"
                      placeholder="매장을 소개하는 내용을 작성해주세요"
                      rows="5"
                      defaultValue={restaurant.description || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>주차 정보</label>
                    <textarea 
                      id="parkingInfo"
                      placeholder="주차 관련 상세 정보 (예: 건물 지하 1층, 2시간 무료)"
                      rows="3"
                      defaultValue={restaurant.parkingInfo || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>교통편</label>
                    <textarea 
                      id="transportation"
                      placeholder="대중교통 이용 방법 (예: 2호선 강남역 3번 출구 도보 5분)"
                      rows="3"
                      defaultValue={restaurant.transportation || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>특별 사항</label>
                    <textarea 
                      id="specialNotes"
                      placeholder="예약 시 유의사항, 특별 메뉴, 단체 예약 가능 여부 등"
                      rows="4"
                      defaultValue={restaurant.specialNotes || ''}
                    />
                  </div>

                  <div className="detail-group">
                    <label>결제 방법</label>
                    <div className="checkbox-group">
                      <label><input type="checkbox" id="cardPayment" defaultChecked /> 카드</label>
                      <label><input type="checkbox" id="cashPayment" defaultChecked /> 현금</label>
                      <label><input type="checkbox" id="mobilePayment" /> 간편결제</label>
                      <label><input type="checkbox" id="accountTransfer" /> 계좌이체</label>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button 
                      className="save-detail-btn" 
                      onClick={handleSaveDetails}
                    >
                      저장
                    </button>
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
                      <h4> 주차 정보</h4>
                      <p>{restaurant.parkingInfo || '주차 정보가 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>교통편</h4>
                      <p>{restaurant.transportation || '교통편 정보가 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4>특별 사항</h4>
                      <p>{restaurant.specialNotes || '특별 사항이 등록되지 않았습니다.'}</p>
                    </div>

                    <div className="preview-details-section">
                      <h4> 결제 방법</h4>
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
                <h3>
                  최근 예약 현황
                  <span className="help-icon" data-tooltip="최근 등록된 예약 5개를 최신순으로 표시합니다. 예약 상태: 대기(노란색), 승인(청록색), 거절(빨간색)">
                    ?
                  </span>
                </h3>
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
                                  axios.delete(`${API_ENDPOINTS.DEMO}/blacklist/${item.id}`)
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
                        {(() => {
                          const weatherData = statistics.weatherDistribution;
                          const total = weatherData.sunny + weatherData.cloudy + weatherData.rainy + weatherData.snowy + weatherData.foggy + weatherData.stormy + weatherData.other;
                          if (total === 0) return null;
                          
                          let offset = 0;
                          const colors = {
                            sunny: '#ffd700',
                            cloudy: '#87ceeb', 
                            rainy: '#4682b4',
                            snowy: '#f0f8ff',
                            foggy: '#d3d3d3',
                            stormy: '#2f4f4f',
                            other: '#9370db'
                          };
                          
                          return Object.entries(weatherData).map(([key, value], index) => {
                            if (value === 0) return null;
                            const percentage = (value / total) * 100;
                            const circumference = 2 * Math.PI * 20;
                            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -offset;
                            offset += (percentage / 100) * circumference;
                            
                            return (
                              <circle
                                key={key}
                                cx="50" cy="50" r="20"
                                fill="none"
                                stroke={colors[key]}
                                strokeWidth="40"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 50 50)"
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="pie-legend">
                      {Object.entries(statistics.weatherDistribution).map(([key, value]) => {
                        if (value === 0) return null;
                        const total = Object.values(statistics.weatherDistribution).reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        const labels = {
                          sunny: '맑음',
                          cloudy: '흐림',
                          rainy: '비',
                          snowy: '눈',
                          foggy: '안개',
                          stormy: '폭풍',
                          other: '기타'
                        };
                        const colors = {
                          sunny: '#ffd700',
                          cloudy: '#87ceeb',
                          rainy: '#4682b4',
                          snowy: '#f0f8ff',
                          foggy: '#d3d3d3',
                          stormy: '#2f4f4f',
                          other: '#9370db'
                        };
                        
                        return (
                          <div key={key} className="legend-item">
                            <span className="legend-color" style={{background: colors[key]}}></span>
                            <span className="legend-label">{labels[key]}</span>
                            <span className="legend-value">{percentage}%</span>
                          </div>
                        );
                      })}
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

      {/* 새로운 모달 컴포넌트들 */}
      <NoShowReasonModal
        isOpen={showNoShowModal}
        onClose={() => setShowNoShowModal(false)}
        reservation={selectedReservation}
        onConfirm={handleNoShowConfirm}
      />
      
      <BlacklistReasonModal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        reservation={selectedReservation}
        onConfirm={handleBlacklistConfirm}
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
    image: null,
    imagePreview: null,
    category: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('type', 'menu');

      const response = await axios.post(`${API_ENDPOINTS.UPLOAD}`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const imageUrl = response.data.fileUrl;
        setFormData({
          ...formData,
          image: imageUrl,
          imagePreview: imageUrl
        });
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

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
              <label>카테고리</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 메인, 사이드, 음료 등"
              />
            </div>
            <div className="form-group">
              <label>메뉴 사진</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {formData.imagePreview && (
                <div className="image-preview" style={{ marginTop: '12px', width: '100%', maxWidth: '200px' }}>
                  <img 
                    src={getImageUrl(formData.imagePreview)} 
                    alt="메뉴 미리보기" 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              )}
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
            <button type="submit" className="btn-submit" disabled={uploading}>저장</button>
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
    console.log('모달에서 전달하는 데이터:', { reservation, visitStatus, reason });
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