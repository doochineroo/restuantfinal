import React, { useState, useEffect, useRef } from 'react';
import './AddressSearch.css';

const SimpleAddressSearch = ({ onAddressSelect, placeholder = "주소를 검색하세요" }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 간단한 주소 데이터베이스 (실제로는 API에서 가져와야 함)
  const addressDatabase = [
    { address: "서울특별시 강남구 강남대로 396", region: "서울 강남구", lat: 37.5665, lng: 127.0780 },
    { address: "서울특별시 강남구 테헤란로 123", region: "서울 강남구", lat: 37.5665, lng: 127.0780 },
    { address: "서울특별시 강남구 역삼동 123-45", region: "서울 강남구", lat: 37.5665, lng: 127.0780 },
    { address: "서울특별시 중구 명동길 14", region: "서울 중구", lat: 37.5636, lng: 126.9826 },
    { address: "서울특별시 중구 을지로 281", region: "서울 중구", lat: 37.5636, lng: 126.9826 },
    { address: "서울특별시 마포구 홍대입구역 2번출구", region: "서울 마포구", lat: 37.5563, lng: 126.9226 },
    { address: "서울특별시 마포구 와우산로 94", region: "서울 마포구", lat: 37.5563, lng: 126.9226 },
    { address: "서울특별시 종로구 인사동길 12", region: "서울 종로구", lat: 37.5735, lng: 126.9788 },
    { address: "서울특별시 종로구 세종대로 175", region: "서울 종로구", lat: 37.5735, lng: 126.9788 },
    { address: "서울특별시 송파구 올림픽로 300", region: "서울 송파구", lat: 37.5146, lng: 127.1029 },
    { address: "서울특별시 송파구 잠실동 40-1", region: "서울 송파구", lat: 37.5146, lng: 127.1029 },
    { address: "경기도 수원시 영통구 월드컵로 206", region: "경기 수원시", lat: 37.2636, lng: 127.0286 },
    { address: "경기도 성남시 분당구 판교역로 166", region: "경기 성남시", lat: 37.3947, lng: 127.1112 },
    { address: "인천광역시 연수구 컨벤시아대로 165", region: "인천 연수구", lat: 37.4563, lng: 126.7052 },
    { address: "부산광역시 해운대구 해운대로 264", region: "부산 해운대구", lat: 35.1796, lng: 129.1756 }
  ];

  // 주소 검색 함수
  const searchAddress = (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    console.log('🔍 주소 검색 시작:', searchQuery);
    
    // 간단한 필터링 (실제로는 API 호출)
    setTimeout(() => {
      const filtered = addressDatabase.filter(item => 
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      console.log('✅ 검색 결과:', filtered);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setIsLoading(false);
    }, 300);
  };

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    console.log('📝 입력 변경:', value);
    
    if (value.trim().length >= 2) {
      searchAddress(value);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // 제안 선택 핸들러
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.address);
    setIsOpen(false);
    setSuggestions([]);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: suggestion.address,
        roadAddress: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng,
        region: suggestion.region
      });
    }
    console.log('📍 주소 선택됨:', suggestion);
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
        ✅ 간단 주소 검색 | 제안: {suggestions.length}개 | 열림: {isOpen ? '예' : '아니오'}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="address-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="address-suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-address">{suggestion.address}</div>
              <div className="suggestion-region">{suggestion.region}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleAddressSearch;


