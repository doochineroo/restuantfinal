import React, { useState, useEffect } from 'react';

const SearchSection = ({ onSearch, currentRegion = null, onCurrentLocation = null, onFindNearby = null }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [includeRegion, setIncludeRegion] = useState(true);

  // 현재 지역이 변경되면 검색어 초기화
  useEffect(() => {
    if (currentRegion) {
      setSearchKeyword('');
    }
  }, [currentRegion]);

  const handleSearch = () => {
    let finalSearchKeyword = searchKeyword.trim();
    
    // 지역 정보를 포함하는 옵션이 활성화되어 있고, 현재 지역이 있고, 검색어가 있을 때
    if (includeRegion && currentRegion && finalSearchKeyword) {
      // 검색어에 지역명이 이미 포함되어 있는지 확인
      const hasRegionInKeyword = currentRegion.split(' ').some(regionPart => 
        finalSearchKeyword.toLowerCase().includes(regionPart.toLowerCase())
      );
      
      // 지역명이 포함되어 있지 않으면 추가
      if (!hasRegionInKeyword) {
        finalSearchKeyword = `${finalSearchKeyword} ${currentRegion}`;
      }
    }
    
    onSearch(finalSearchKeyword);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-section">
      <div className="search-container">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder={currentRegion ? 
            `식당명 또는 지점명을 입력하세요 (${currentRegion} 지역 우선 검색)` : 
            "식당명 또는 지점명을 입력하세요..."
          }
          className="common-input"
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} className="btn btn-primary">검색</button>
        {onCurrentLocation && (
          <button 
            onClick={onCurrentLocation} 
            className="btn btn-outline-primary current-location-btn" 
            title="현재 위치로 이동"
            style={{ padding: '10px 12px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {onFindNearby && (
          <button 
            onClick={onFindNearby} 
            className="btn btn-success" 
            title="해당 위치에서 가게 찾기"
            style={{ padding: '10px 16px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.58172 6.58172 2 12 2C17.4183 2 21 5.58172 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            근처 가게 찾기
          </button>
        )}
      </div>
      
      {/* 지역 포함 검색 옵션 */}
      {currentRegion && (
        <div className="search-options" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#666' }}>
            <input
              type="checkbox"
              checked={includeRegion}
              onChange={(e) => setIncludeRegion(e.target.checked)}
              style={{ margin: 0 }}
            />
            {currentRegion} 지역 우선 검색
          </label>
        </div>
      )}
    </div>
  );
};

export default SearchSection;

