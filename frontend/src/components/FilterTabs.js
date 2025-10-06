import React, { useState, useEffect } from 'react';

const FilterTabs = ({ 
  hasSearched, 
  restaurants, 
  regions, 
  activeFilterTab, 
  selectedServices,
  onFilterChange 
}) => {
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRegionDropdown && !event.target.closest('.region-dropdown')) {
        setShowRegionDropdown(false);
      }
      if (showServiceDropdown && !event.target.closest('.service-dropdown')) {
        setShowServiceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegionDropdown, showServiceDropdown]);

  if (!hasSearched) return null;

  return (
    <div className="filter-tabs">
      <div className="filter-row">
        {/* 전체 버튼 */}
        <button 
          className={`filter-main-btn ${activeFilterTab === '전체' ? 'active' : ''}`}
          onClick={() => onFilterChange('전체', 'all')}
        >
          전체 ({restaurants.length})
        </button>

        {/* 지역 드롭다운 */}
        <div className="filter-dropdown region-dropdown">
          <button 
            className={`filter-dropdown-btn ${regions.includes(activeFilterTab) ? 'active' : ''}`}
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
          >
            지역 ▼
          </button>
          {showRegionDropdown && (
            <div className="filter-dropdown-menu">
              {regions.slice(0, 8).map(region => (
                <div
                  key={region}
                  className={`filter-dropdown-item ${activeFilterTab === region ? 'active' : ''}`}
                  onClick={() => {
                    onFilterChange(region, 'region');
                    setShowRegionDropdown(false);
                  }}
                >
                  {region}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 서비스 드롭다운 */}
        <div className="filter-dropdown service-dropdown">
          <button 
            className={`filter-dropdown-btn ${selectedServices.length > 0 ? 'active' : ''}`}
            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
          >
            서비스 {selectedServices.length > 0 ? `(${selectedServices.length})` : ''} ▼
          </button>
          {showServiceDropdown && (
            <div className="filter-dropdown-menu">
              <div
                className={`filter-dropdown-item ${selectedServices.includes('주차가능') ? 'active' : ''}`}
                onClick={() => {
                  onFilterChange('주차가능', 'service');
                }}
              >
                {selectedServices.includes('주차가능') && '✓ '}주차가능
              </div>
              <div
                className={`filter-dropdown-item ${selectedServices.includes('WiFi') ? 'active' : ''}`}
                onClick={() => {
                  onFilterChange('WiFi', 'service');
                }}
              >
                {selectedServices.includes('WiFi') && '✓ '}WiFi
              </div>
              <div
                className={`filter-dropdown-item ${selectedServices.includes('키즈존') ? 'active' : ''}`}
                onClick={() => {
                  onFilterChange('키즈존', 'service');
                }}
              >
                {selectedServices.includes('키즈존') && '✓ '}키즈존
              </div>
              <div
                className={`filter-dropdown-item ${selectedServices.includes('배달') ? 'active' : ''}`}
                onClick={() => {
                  onFilterChange('배달', 'service');
                }}
              >
                {selectedServices.includes('배달') && '✓ '}배달
              </div>
              <div
                className={`filter-dropdown-item ${selectedServices.includes('스마트오더') ? 'active' : ''}`}
                onClick={() => {
                  onFilterChange('스마트오더', 'service');
                }}
              >
                {selectedServices.includes('스마트오더') && '✓ '}스마트오더
              </div>
            </div>
          )}
        </div>

        {/* 필터 초기화 버튼 */}
        {(activeFilterTab !== '전체' || selectedServices.length > 0) && (
          <button 
            className="filter-reset-btn"
            onClick={() => onFilterChange('전체', 'all')}
            title="필터 초기화"
          >
            초기화 ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterTabs;
