import React, { useState } from 'react';

const MapSection = ({ selectedRestaurant, isMapLoading, mapError }) => {
  const [isMapOpen, setIsMapOpen] = useState(true);

  return (
    <div className="map-section">
      {/* 모바일 토글 버튼 */}
      <button 
        className="map-toggle-btn" 
        onClick={() => setIsMapOpen(!isMapOpen)}
      >
        {isMapOpen ? '지도 숨기기 ▲' : '지도 보기 ▼'}
      </button>

      <div id="map" className={`map ${isMapOpen ? 'map-open' : 'map-closed'}`}>
        {isMapLoading && (
          <div className="map-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>지도 로딩 중...</p>
            </div>
          </div>
        )}
        {mapError && (
          <div className="map-error">
            <p>{mapError}</p>
          </div>
        )}
      </div>
      {selectedRestaurant && isMapOpen && (
        <div className="map-label">
          <div className="map-label-content">
            <h3>{selectedRestaurant.restaurantName}</h3>
            {selectedRestaurant.branchName && (
              <p className="branch-name">{selectedRestaurant.branchName}</p>
            )}
            <p className="address">{selectedRestaurant.roadAddress || '주소 정보 없음'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSection;
