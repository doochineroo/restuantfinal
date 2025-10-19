import React, { useState, useEffect, useRef } from 'react';
import './AddressSearch.css';

const AddressSearch = ({ onAddressSelect, placeholder = "주소를 검색하세요" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 카카오 지도 API 로드
  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (window.kakao && window.kakao.maps) {
      console.log('카카오 지도 API 이미 로드됨');
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=0daaba62d376e0a4633352753a28827c&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log('✅ 카카오 지도 API 로드 완료');
    };
    script.onerror = () => {
      console.error('❌ 카카오 지도 API 로드 실패');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 주소 검색 함수
  const searchAddress = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    // 카카오 API가 로드되지 않은 경우 대기
    if (!window.kakao || !window.kakao.maps) {
      console.log('카카오 지도 API 로딩 중...');
      return;
    }

    setIsLoading(true);
    console.log('🔍 주소 검색 시작:', searchQuery);
    
    try {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(searchQuery, (result, status) => {
        setIsLoading(false);
        console.log('📍 검색 결과:', status, result);
        
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const suggestions = result.slice(0, 5).map((item, index) => ({
            id: index,
            address: item.address_name,
            roadAddress: item.road_address_name || item.address_name,
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
            region: extractRegion(item.address_name)
          }));
          
          console.log('✅ 검색 제안 생성:', suggestions);
          setSuggestions(suggestions);
          setIsOpen(true);
        } else {
          console.log('❌ 주소 검색 실패:', status);
          setSuggestions([]);
          setIsOpen(false);
        }
      });
    } catch (error) {
      console.error('❌ 주소 검색 오류:', error);
      setIsLoading(false);
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // 주소에서 지역명 추출
  const extractRegion = (address) => {
    // 서울, 경기, 인천, 부산, 대구, 광주, 대전, 울산, 세종, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주
    const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    
    for (const region of regions) {
      if (address.includes(region)) {
        // 구/시 단위까지 포함
        const parts = address.split(' ');
        const regionIndex = parts.findIndex(part => part.includes(region));
        if (regionIndex !== -1 && regionIndex + 1 < parts.length) {
          return `${region} ${parts[regionIndex + 1]}`;
        }
        return region;
      }
    }
    return null;
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    console.log('📝 입력 변경:', value);
    
    if (value.trim().length >= 2) {
      // 카카오 API가 로드될 때까지 잠시 대기
      setTimeout(() => {
        searchAddress(value);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // 제안 선택 핸들러
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.roadAddress);
    setIsOpen(false);
    setSuggestions([]);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: suggestion.address,
        roadAddress: suggestion.roadAddress,
        lat: suggestion.lat,
        lng: suggestion.lng,
        region: suggestion.region
      });
    }
  };

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="address-search-container">
      <div className="address-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="address-input"
          autoComplete="off"
        />
        {isLoading && (
          <div className="address-loading">
            <div className="spinner"></div>
          </div>
        )}
        <div className="address-search-icon">📍</div>
      </div>
      
      {/* 디버깅 정보 */}
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        {window.kakao ? '✅ 카카오 API 로드됨' : '⏳ 카카오 API 로딩 중...'} | 
        제안: {suggestions.length}개 | 
        열림: {isOpen ? '예' : '아니오'}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="address-suggestions">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="address-suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-address">{suggestion.roadAddress}</div>
              <div className="suggestion-region">{suggestion.region}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearch;
