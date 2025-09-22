import React from 'react';

const MapSection = ({ selectedRestaurant, isMapLoading, mapError }) => {
  return (
    <div className="map-section">
      <div id="map" className="map">
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
      {selectedRestaurant && (
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
