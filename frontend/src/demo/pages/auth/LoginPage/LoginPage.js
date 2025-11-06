/**
 * 테스트용 로그인/회원가입 페이지 - 데모 종료 시 제거 예정
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authAPI, restaurantAPI } from '../../../services/api';
import SimpleAddressSearch from '../../../../components/SimpleAddressSearch';
import NotificationModal from '../../../../components/common/NotificationModal';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    emailVerificationCode: '',
    phone: '',
    role: 'USER',
    restaurantRegistrationType: 'existing', // 'existing' or 'new'
    restaurantId: '',
    restaurantCode: null,
    restaurantName: '',
    branchName: '',
    roadAddress: '',
    category: '한식',
    // 주소 검색으로 자동 설정되는 필드들
    lat: null,
    lng: null,
    regionName: null
  });
  const [error, setError] = useState(''); // 문자열만 저장
  const [loading, setLoading] = useState(false);
  
  // 회원가입 유효성 검사 상태
  const [validation, setValidation] = useState({
    usernameChecked: false,
    usernameAvailable: false,
    passwordValid: false,
    passwordMatch: false,
    emailCodeSent: false,
    emailVerified: false,
  });
  
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // 식당 검색 상태
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [restaurantSearchType, setRestaurantSearchType] = useState('code'); // 'code' or 'name'
  const [restaurantSearchResults, setRestaurantSearchResults] = useState([]);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchingRestaurants, setSearchingRestaurants] = useState(false);
  
  // 알림 모달 상태
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: 'info', // success, error, warning, info
    title: '',
    message: ''
  });
  
  // 알림 모달 표시 함수
  const showNotification = (type, title, message) => {
    setNotificationModal({
      isOpen: true,
      type,
      title,
      message
    });
  };
  
  // 알림 모달 닫기 함수
  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
  };
  
  // 아이디 조건: 영문, 숫자, 4-20자
  const isUsernameValid = (username) => /^[a-zA-Z0-9]{4,20}$/.test(username);
  
  // 비밀번호 조건: 8자 이상, 영문/숫자/특수문자 포함
  const isPasswordValid = (password) => {
    return password.length >= 8 && 
           /[a-zA-Z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };
  
  // 에러 메시지를 문자열로 변환하는 헬퍼 함수
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      // Spring Boot 에러 응답 객체인 경우
      if (error.message) return error.message;
      if (error.error) return error.error;
      // 객체의 모든 값을 문자열로 합치기
      return Object.values(error).filter(v => typeof v === 'string').join(', ') || '오류가 발생했습니다.';
    }
    return String(error);
  };

  // 이메일 인증 코드가 입력되면 검증 상태 업데이트
  useEffect(() => {
    if (formData.emailVerificationCode && formData.emailVerificationCode.length === 6) {
      // 실제로는 백엔드에서 검증하지만, 여기서는 길이만 확인
      // 실제 검증은 회원가입 시 서버에서 이루어짐
      setValidation(prev => ({ ...prev, emailVerified: true }));
    } else {
      setValidation(prev => ({ ...prev, emailVerified: false }));
    }
  }, [formData.emailVerificationCode]);

  // 식당 검색 (버튼 클릭 시)
  const handleSearchRestaurants = async () => {
    if (!restaurantSearchQuery.trim()) {
      showNotification('warning', '입력 오류', '검색어를 입력해주세요.');
      return;
    }

    setSearchingRestaurants(true);
    setShowRestaurantDropdown(false);
    
    try {
      const response = await restaurantAPI.searchForSignup(restaurantSearchQuery, restaurantSearchType);
      setRestaurantSearchResults(response.data || []);
      setShowRestaurantDropdown(true);
      
      if (response.data.length === 0) {
        showNotification('info', '검색 결과', '검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('식당 검색 오류:', error);
      setRestaurantSearchResults([]);
      setShowRestaurantDropdown(false);
      showNotification('error', '검색 오류', '식당 검색 중 오류가 발생했습니다.');
    } finally {
      setSearchingRestaurants(false);
    }
  };

  // 식당 선택 핸들러
  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData(prev => ({
      ...prev,
      restaurantId: restaurant.id,
      restaurantCode: restaurant.restaurantCode
    }));
    setRestaurantSearchQuery(`${restaurant.restaurantName}${restaurant.branchName ? ` (${restaurant.branchName})` : ''}`);
    setShowRestaurantDropdown(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRestaurantDropdown && !event.target.closest('.restaurant-search-container')) {
        setShowRestaurantDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRestaurantDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 실시간 유효성 검사
    if (name === 'password') {
      setValidation(prev => ({
        ...prev,
        passwordValid: isPasswordValid(value),
        passwordMatch: value === formData.passwordConfirm
      }));
    } else if (name === 'passwordConfirm') {
      setValidation(prev => ({
        ...prev,
        passwordMatch: value === formData.password
      }));
    } else if (name === 'username') {
      setValidation(prev => ({
        ...prev,
        usernameChecked: false,
        usernameAvailable: false
      }));
    }
  };
  
  // 아이디 중복확인
  const handleCheckUsername = async () => {
    if (!formData.username) {
      showNotification('warning', '입력 오류', '아이디를 입력해주세요.');
      return;
    }
    
    if (!isUsernameValid(formData.username)) {
      showNotification('warning', '입력 오류', '아이디는 영문, 숫자로 4-20자로 입력해주세요.');
      return;
    }
    
    setCheckingUsername(true);
    setError('');
    
    try {
      const response = await authAPI.checkUsername(formData.username);
      // API가 성공(200)을 반환하면 사용 가능
      setValidation(prev => ({
        ...prev,
        usernameChecked: true,
        usernameAvailable: true
      }));
      showNotification('success', '아이디 확인', '사용 가능한 아이디입니다.');
    } catch (err) {
      // 404 오류: 서버에서 엔드포인트를 찾을 수 없음
      if (err.response?.status === 404) {
        console.error('아이디 확인 API 엔드포인트를 찾을 수 없습니다. 백엔드 서버를 확인해주세요.');
        showNotification('error', '서버 오류', '아이디 확인 기능이 서버에서 지원되지 않습니다. 백엔드 서버 설정을 확인해주세요.');
        return;
      }
      
      // 409 Conflict 또는 에러 메시지에 "존재"가 포함된 경우 중복
      if (err.response?.status === 409 || 
          (typeof err.response?.data === 'string' && err.response.data.includes('존재')) ||
          (typeof err.response?.data === 'string' && err.response.data.includes('사용 중'))) {
        setValidation(prev => ({
          ...prev,
          usernameChecked: true,
          usernameAvailable: false
        }));
        showNotification('error', '아이디 중복', '이미 사용 중인 아이디입니다.');
      } else {
        console.error('아이디 확인 오류:', err);
        const errorData = err.response?.data;
        let errorMsg = '아이디 확인 중 오류가 발생했습니다.';
        
        if (errorData) {
          errorMsg = getErrorMessage(errorData);
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        showNotification('error', '아이디 확인 오류', errorMsg);
      }
    } finally {
      setCheckingUsername(false);
    }
  };
  
  // 이메일 인증 코드 발송 (재발송 포함)
  const handleSendEmailCode = async () => {
    if (!formData.email) {
      showNotification('warning', '입력 오류', '이메일을 입력해주세요.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('warning', '입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return;
    }
    
    setSendingEmail(true);
    setError('');
    
    try {
      // 이미 발송된 경우 재발송 API 사용, 아니면 발송 API 사용
      if (validation.emailCodeSent) {
        await authAPI.resendVerificationEmail(formData.email);
        showNotification('success', '인증 코드 재발송', '인증 코드가 재발송되었습니다.');
      } else {
        await authAPI.sendVerificationEmail(formData.email);
        setValidation(prev => ({
          ...prev,
          emailCodeSent: true
        }));
        showNotification('success', '인증 코드 발송', '인증 코드가 발송되었습니다. 이메일을 확인해주세요.');
      }
    } catch (err) {
      console.error('이메일 인증 코드 발송 오류:', err);
      console.error('에러 응답 데이터:', err.response?.data);
      console.error('에러 상태 코드:', err.response?.status);
      const errorMsg = err.response?.data || err.message || '인증 코드 발송에 실패했습니다.';
      showNotification('error', '이메일 발송 오류', getErrorMessage(errorMsg));
    } finally {
      setSendingEmail(false);
    }
  };
  
  // 이메일 인증 코드 재발송
  const handleResendEmailCode = async () => {
    setSendingEmail(true);
    setError('');
    
    try {
        await authAPI.resendVerificationEmail(formData.email);
        showNotification('success', '인증 코드 재발송', '인증 코드가 재발송되었습니다.');
    } catch (err) {
      const errorMsg = err.response?.data || err.message || '인증 코드 재발송에 실패했습니다.';
      showNotification('error', '재발송 오류', getErrorMessage(errorMsg));
    } finally {
      setSendingEmail(false);
    }
  };

  // 주소 선택 핸들러
  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      roadAddress: addressData.roadAddress,
      lat: addressData.lat,
      lng: addressData.lng,
      regionName: addressData.region
    }));
    console.log('주소 선택됨:', addressData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(isSignup ? '회원가입 버튼 클릭됨' : '로그인 버튼 클릭됨'); // 디버깅용
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // 회원가입 유효성 검사
        if (!validation.usernameChecked || !validation.usernameAvailable) {
          showNotification('warning', '입력 오류', '아이디 중복확인을 해주세요.');
          setLoading(false);
          return;
        }
        
        if (!validation.passwordValid) {
          showNotification('warning', '입력 오류', '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.');
          setLoading(false);
          return;
        }
        
        if (!validation.passwordMatch) {
          showNotification('warning', '입력 오류', '비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        
        if (!validation.emailVerified) {
          showNotification('warning', '입력 오류', '이메일 인증을 완료해주세요.');
          setLoading(false);
          return;
        }
        
        // 회원가입
        const signupData = {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          verificationCode: formData.emailVerificationCode
        };

        // OWNER인 경우 - 매장 정보 검증
        if (formData.role === 'OWNER') {
          if (formData.restaurantRegistrationType === 'existing') {
            // 기존 매장 선택
            if (!selectedRestaurant && (!formData.restaurantId || formData.restaurantId.toString().trim() === '')) {
              showNotification('warning', '입력 오류', '식당을 검색하여 선택해주세요.');
              setLoading(false);
              return;
            }
            // restaurantCode가 있으면 우선 사용, 없으면 restaurantId 사용
            if (formData.restaurantCode) {
              signupData.restaurantCode = formData.restaurantCode;
            } else if (formData.restaurantId) {
              signupData.restaurantId = parseInt(formData.restaurantId);
            }
          } else {
            // 새 매장 등록
            if (!formData.restaurantName || !formData.roadAddress) {
              showNotification('warning', '입력 오류', '매장명과 주소는 필수 입력 항목입니다.');
              setLoading(false);
              return;
            }
            signupData.restaurantName = formData.restaurantName;
            signupData.branchName = formData.branchName || null;
            signupData.roadAddress = formData.roadAddress;
            signupData.category = formData.category;
          }
        }

        const response = await authAPI.signup(signupData);
        
        // 이메일 인증 완료 상태로 업데이트
        setValidation(prev => ({ ...prev, emailVerified: true }));
        
        login(response.data);
        showNotification('success', '회원가입 완료', '회원가입이 완료되었습니다!');
        // OWNER는 대시보드로, 다른 역할은 홈으로
        setTimeout(() => {
          navigate(response.data.role === 'OWNER' ? '/owner-dashboard' : '/');
        }, 1500);
      } else {
        // 로그인
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        login(response.data);
        showNotification('success', '로그인 성공', '로그인되었습니다!');
        // OWNER는 대시보드로, 다른 역할은 홈으로
        setTimeout(() => {
          navigate(response.data.role === 'OWNER' ? '/owner-dashboard' : '/');
        }, 1500);
      }
    } catch (err) {
      console.error('로그인/회원가입 오류:', err);
      if (err.code === 'ERR_NETWORK') {
        showNotification('error', '연결 오류', '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (err.response?.status === 404) {
        showNotification('error', 'API 오류', 'API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.');
      } else {
        const errorData = err.response?.data;
        const errorMsg = errorData?.message || errorData || err.message || '오류가 발생했습니다.';
        showNotification('error', '오류 발생', getErrorMessage(errorMsg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-login-page">
      <div className="demo-login-container">
        <div className="demo-login-header">
          <h1>CHOPLAN</h1>
        </div>

        <div className="demo-login-tabs">
          <button 
            className={!isSignup ? 'active' : ''} 
            onClick={() => setIsSignup(false)}
          >
            로그인
          </button>
          <button 
            className={isSignup ? 'active' : ''} 
            onClick={() => setIsSignup(true)}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="demo-login-form">
          {/* 에러 메시지는 NotificationModal로 표시 */}

          <div className="demo-form-group">
            <label>아이디</label>
            {isSignup ? (
              // 회원가입 모드: 중복확인 버튼 및 조건 검사
              <>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="영문, 숫자 4-20자"
                    className={validation.usernameChecked ? (validation.usernameAvailable ? 'valid' : 'invalid') : ''}
                  />
                  <button
                    type="button"
                    className="check-btn"
                    onClick={handleCheckUsername}
                    disabled={checkingUsername || !formData.username || formData.username.trim().length < 4}
                  >
                    {checkingUsername ? '확인 중...' : '중복확인'}
                  </button>
                </div>
                {formData.username && !isUsernameValid(formData.username) && (
                  <small className="validation-error">영문, 숫자로 4-20자로 입력해주세요.</small>
                )}
                {validation.usernameChecked && validation.usernameAvailable && (
                  <small className="validation-success">✓ 사용 가능한 아이디입니다.</small>
                )}
                {validation.usernameChecked && !validation.usernameAvailable && (
                  <small className="validation-error">✗ 이미 사용 중인 아이디입니다.</small>
                )}
              </>
            ) : (
              // 로그인 모드: 단순 입력만
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="아이디를 입력하세요"
              />
            )}
          </div>

          <div className="demo-form-group">
            <label>비밀번호</label>
            {isSignup ? (
              // 회원가입 모드: 조건 안내
              <>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="8자 이상, 영문/숫자/특수문자 포함"
                  className={formData.password && (validation.passwordValid ? 'valid' : 'invalid')}
                />
                {formData.password && (
                  <div className="password-requirements">
                    <small className={formData.password.length >= 8 ? 'requirement-met' : 'requirement-unmet'}>
                      {formData.password.length >= 8 ? '✓' : '○'} 8자 이상
                    </small>
                    <small className={/[a-zA-Z]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                      {/[a-zA-Z]/.test(formData.password) ? '✓' : '○'} 영문 포함
                    </small>
                    <small className={/[0-9]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} 숫자 포함
                    </small>
                    <small className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'requirement-met' : 'requirement-unmet'}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'} 특수문자 포함
                    </small>
                  </div>
                )}
              </>
            ) : (
              // 로그인 모드: 단순 입력만
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="비밀번호를 입력하세요"
              />
            )}
          </div>

          {isSignup && (
            <div className="demo-form-group">
              <label>비밀번호 재확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                placeholder="비밀번호를 다시 입력하세요"
                className={formData.passwordConfirm && (validation.passwordMatch ? 'valid' : 'invalid')}
              />
              {formData.passwordConfirm && !validation.passwordMatch && (
                <small className="validation-error">비밀번호가 일치하지 않습니다.</small>
              )}
              {formData.passwordConfirm && validation.passwordMatch && (
                <small className="validation-success">✓ 비밀번호가 일치합니다.</small>
              )}
            </div>
          )}

          {isSignup && (
            <>
              <div className="demo-form-group">
                <label>이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="demo-form-group">
                <label>이메일</label>
                <div className="input-with-button">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                  />
                  <button
                    type="button"
                    className="check-btn"
                    onClick={handleSendEmailCode}
                    disabled={sendingEmail || !formData.email}
                  >
                    {sendingEmail ? '발송 중...' : validation.emailCodeSent ? '재발송' : '인증 코드 발송'}
                  </button>
                </div>
                {validation.emailCodeSent && (
                  <>
                    <input
                      type="text"
                      name="emailVerificationCode"
                      value={formData.emailVerificationCode}
                      onChange={handleChange}
                      required
                      placeholder="인증 코드 6자리 입력"
                      className="verification-code-input"
                      maxLength="6"
                    />
                    <div className="email-verification-actions">
                      <button
                        type="button"
                        className="resend-btn"
                        onClick={handleResendEmailCode}
                        disabled={sendingEmail}
                      >
                        {sendingEmail ? '재발송 중...' : '재발송'}
                      </button>
                    </div>
                  </>
                )}
                {formData.emailVerificationCode && formData.emailVerificationCode.length === 6 && (
                  <small className="validation-info">인증 코드를 입력하고 회원가입을 진행해주세요.</small>
                )}
              </div>

              <div className="demo-form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="demo-form-group">
                <label>역할</label>
                <select name="role" value={formData.role} onChange={handleChange} className="common-select">
                  <option value="USER">일반 회원</option>
                  <option value="OWNER">가게 주인</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>

              {formData.role === 'OWNER' && (
                <>
                  <div className="demo-form-group">
                    <label>매장 등록 방식</label>
                    <select 
                      name="restaurantRegistrationType" 
                      value={formData.restaurantRegistrationType} 
                      onChange={handleChange}
                      className="common-select"
                    >
                      <option value="existing">기존 매장 선택</option>
                      <option value="new">새 매장 등록</option>
                    </select>
                  </div>

                  {formData.restaurantRegistrationType === 'existing' && (
                    <div className="demo-form-group restaurant-search-container" style={{ position: 'relative' }}>
                      <label>식당 검색</label>
                      
                      {/* 검색 타입 라디오 버튼 */}
                      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="restaurantSearchType"
                            value="code"
                            checked={restaurantSearchType === 'code'}
                            onChange={(e) => {
                              setRestaurantSearchType(e.target.value);
                              setRestaurantSearchQuery('');
                              setRestaurantSearchResults([]);
                              setShowRestaurantDropdown(false);
                              setSelectedRestaurant(null);
                            }}
                            style={{ marginRight: '6px' }}
                          />
                          식당 코드
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="restaurantSearchType"
                            value="name"
                            checked={restaurantSearchType === 'name'}
                            onChange={(e) => {
                              setRestaurantSearchType(e.target.value);
                              setRestaurantSearchQuery('');
                              setRestaurantSearchResults([]);
                              setShowRestaurantDropdown(false);
                              setSelectedRestaurant(null);
                            }}
                            style={{ marginRight: '6px' }}
                          />
                          식당 이름
                        </label>
                      </div>
                      
                      {/* 검색 입력 필드와 버튼 */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={restaurantSearchQuery}
                          onChange={(e) => {
                            setRestaurantSearchQuery(e.target.value);
                            setSelectedRestaurant(null);
                            setFormData(prev => ({ ...prev, restaurantId: '', restaurantCode: null }));
                            setShowRestaurantDropdown(false);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchRestaurants();
                            }
                          }}
                          placeholder={restaurantSearchType === 'code' ? '식당 코드를 입력하세요 (예: 10012)' : '식당 이름을 입력하세요'}
                          required={!selectedRestaurant}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleSearchRestaurants}
                          disabled={searchingRestaurants || !restaurantSearchQuery.trim()}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: searchingRestaurants ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: searchingRestaurants ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {searchingRestaurants ? '검색 중...' : '검색'}
                        </button>
                      </div>
                      
                      {searchingRestaurants && (
                        <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>검색 중...</small>
                      )}
                      {showRestaurantDropdown && restaurantSearchResults.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          maxHeight: '300px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          marginTop: '4px'
                        }}>
                          {restaurantSearchResults.map((restaurant) => (
                            <div
                              key={restaurant.id}
                              onClick={() => handleSelectRestaurant(restaurant)}
                              style={{
                                padding: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {restaurant.restaurantName}
                                {restaurant.branchName && <span style={{ color: '#666', fontWeight: 'normal' }}> ({restaurant.branchName})</span>}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {restaurant.roadAddress || restaurant.regionName || '주소 정보 없음'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                ID: {restaurant.id} | 코드: {restaurant.restaurantCode || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {showRestaurantDropdown && restaurantSearchResults.length === 0 && restaurantSearchQuery.trim() && !searchingRestaurants && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '12px',
                          zIndex: 1000,
                          marginTop: '4px'
                        }}>
                          검색 결과가 없습니다.
                        </div>
                      )}
                      {selectedRestaurant && (
                        <small style={{ color: '#28a745', display: 'block', marginTop: '4px' }}>
                          선택됨: {selectedRestaurant.restaurantName}
                          {selectedRestaurant.branchName && ` (${selectedRestaurant.branchName})`}
                          {selectedRestaurant.restaurantCode && ` [코드: ${selectedRestaurant.restaurantCode}]`}
                        </small>
                      )}
                      <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                        {restaurantSearchType === 'code' 
                          ? '식당 코드(예: 10012)를 입력하고 검색 버튼을 클릭하세요.' 
                          : '식당 이름을 입력하고 검색 버튼을 클릭하세요.'}
                      </small>
                    </div>
                  )}

                  {formData.restaurantRegistrationType === 'new' && (
                    <>
                      <div className="demo-form-group">
                        <label>식당명</label>
                        <input
                          type="text"
                          name="restaurantName"
                          value={formData.restaurantName}
                          onChange={handleChange}
                          required
                          placeholder="예: 명동정"
                        />
                      </div>

                      <div className="demo-form-group">
                        <label>지점명 (선택)</label>
                        <input
                          type="text"
                          name="branchName"
                          value={formData.branchName}
                          onChange={handleChange}
                          placeholder="예: 강남점"
                        />
                      </div>

                      <div className="demo-form-group">
                        <label>도로명 주소</label>
                        <SimpleAddressSearch
                          onAddressSelect={handleAddressSelect}
                          placeholder="예: 서울 중구 명동길 14"
                        />
                        <small>📍 주소를 검색하면 자동으로 위경도와 지역이 설정됩니다</small>
                        {formData.lat && formData.lng && (
                          <div className="address-info">
                            <span className="address-coords">📍 좌표: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}</span>
                            {formData.regionName && <span className="address-region">🏘️ 지역: {formData.regionName}</span>}
                          </div>
                        )}
                      </div>

                      <div className="demo-form-group">
                        <label>음식 카테고리</label>
                        <select 
                          name="category" 
                          value={formData.category} 
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
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="demo-submit-btn"
            disabled={loading}
          >
            {loading ? '처리 중...' : (isSignup ? '회원가입' : '로그인')}
          </button>
        </form>
      </div>
      
      {/* 알림 팝업 */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        buttonText="확인"
        autoClose={false}
      />
    </div>
  );
};

export default LoginPage;

