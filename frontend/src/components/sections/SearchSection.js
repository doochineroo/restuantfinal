import React, { useState, useEffect } from 'react';

const SearchSection = ({ onSearch, currentRegion = null }) => {
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

