import React, { useState } from 'react';

const SearchSection = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = () => {
    onSearch(searchKeyword);
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
          placeholder="식당명 또는 지점명을 입력하세요..."
          className="search-input"
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} className="search-btn">검색</button>
      </div>
    </div>
  );
};

export default SearchSection;

