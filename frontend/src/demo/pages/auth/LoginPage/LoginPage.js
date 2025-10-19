/**
 * 테스트용 로그인/회원가입 페이지 - 데모 종료 시 제거 예정
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
import SimpleAddressSearch from '../../../../components/SimpleAddressSearch';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    restaurantRegistrationType: 'existing', // 'existing' or 'new'
    restaurantId: '',
    restaurantName: '',
    branchName: '',
    roadAddress: '',
    category: '한식',
    // 주소 검색으로 자동 설정되는 필드들
    lat: null,
    lng: null,
    regionName: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        // 회원가입
        const signupData = {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        };

        // OWNER인 경우 - 매장 정보 검증
        if (formData.role === 'OWNER') {
          if (formData.restaurantRegistrationType === 'existing') {
            // 기존 매장 선택
            if (!formData.restaurantId || formData.restaurantId.trim() === '') {
              setError('기존 매장 ID를 입력해주세요.');
              setLoading(false);
              return;
            }
            signupData.restaurantId = parseInt(formData.restaurantId);
          } else {
            // 새 매장 등록
            if (!formData.restaurantName || !formData.roadAddress) {
              setError('매장명과 주소는 필수 입력 항목입니다.');
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
        login(response.data);
        alert('회원가입이 완료되었습니다! 매장이 등록되었습니다.');
        // OWNER는 대시보드로, 다른 역할은 홈으로
        navigate(response.data.role === 'OWNER' ? '/owner-dashboard' : '/');
      } else {
        // 로그인
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        login(response.data);
        // OWNER는 대시보드로, 다른 역할은 홈으로
        navigate(response.data.role === 'OWNER' ? '/owner-dashboard' : '/');
      }
    } catch (err) {
      console.error('로그인/회원가입 오류:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (err.response?.status === 404) {
        setError('API 엔드포인트를 찾을 수 없습니다. 서버 설정을 확인해주세요.');
      } else {
        setError(err.response?.data?.message || err.response?.data || '오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-login-page">
      <div className="demo-login-container">
        <div className="demo-login-header">
          <h1>chopplan</h1>
          <p className="demo-badge">테스트 버전</p>
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
          {error && <div className="demo-error-message">{error}</div>}

          <div className="demo-form-group">
            <label>아이디</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className="demo-form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>

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
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
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
                    <div className="demo-form-group">
                      <label>식당 ID</label>
                      <input
                        type="number"
                        name="restaurantId"
                        value={formData.restaurantId}
                        onChange={handleChange}
                        required
                        placeholder="식당 ID를 입력하세요"
                      />
                      <small>예: 1, 2, 3... (기존 등록된 식당 ID)</small>
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

        <div className="demo-test-accounts">
          <h3>🧪 테스트 계정</h3>
          <ul>
            <li><strong>관리자:</strong> admin / admin123</li>
            <li><strong>가게주인:</strong> owner / owner123</li>
            <li><strong>회원:</strong> user / user123</li>
          </ul>
          <p className="demo-note">* 먼저 회원가입을 통해 계정을 생성한 후 로그인하세요</p>
          <p className="demo-note">* 백엔드 서버가 실행 중인지 확인해주세요 (http://localhost:8080)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

