// 지도 관련 유틸리티 함수들

// 지도에 식당 마커 표시
export const updateMapWithRestaurants = (map, markers, setMarkers, restaurantList, onMarkerClick) => {
  try {
    if (!map || !restaurantList || restaurantList.length === 0) {
      return;
    }

    // 기존 마커와 인포윈도우 제거
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // 현재 인포윈도우 제거
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close();
      window.currentInfoWindow = null;
    }

    // 위치 정보가 있는 식당들만 마커로 표시
    const validRestaurants = restaurantList.filter(restaurant => 
      restaurant.lat && restaurant.lng && 
      !isNaN(parseFloat(restaurant.lat)) && 
      !isNaN(parseFloat(restaurant.lng))
    );

    if (validRestaurants.length === 0) {
      return;
    }

    validRestaurants.forEach((restaurant, index) => {
      try {
        const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
          title: restaurant.restaurantName
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          // 기존 인포윈도우 제거
          if (window.currentInfoWindow) {
            window.currentInfoWindow.close();
            window.currentInfoWindow = null;
          }

          // 선택된 식당으로 지도 중심 이동
          map.setCenter(position);
          map.setLevel(3);
          
          // 인포윈도우 표시
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding: 15px; min-width: 250px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: bold;">
                  ${restaurant.restaurantName}
                </h3>
                ${restaurant.branchName ? `
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    ${restaurant.branchName}
                  </p>
                ` : ''}
                <p style="margin: 0 0 8px 0; color: #888; font-size: 13px;">
                  ${restaurant.roadAddress || '주소 정보 없음'}
                </p>
                <p style="margin: 0; color: #667eea; font-size: 12px; font-weight: 600;">
                  ${restaurant.mainMenu || '메뉴 정보 없음'}
                </p>
              </div>
            `,
            removable: true
          });
          infoWindow.open(map, marker);
          window.currentInfoWindow = infoWindow;
          
          // 카드 자동 선택 콜백 호출
          if (onMarkerClick) {
            onMarkerClick(restaurant);
          }
        });

        newMarkers.push(marker);
      } catch (markerError) {
        console.error('마커 생성 오류:', markerError, restaurant);
      }
    });

    setMarkers(newMarkers);

    // 첫 번째 유효한 식당으로 지도 중심 이동
    if (validRestaurants.length > 0) {
      const firstRestaurant = validRestaurants[0];
      map.setCenter(new window.kakao.maps.LatLng(firstRestaurant.lat, firstRestaurant.lng));
      map.setLevel(7);
    }
  } catch (error) {
    console.error('지도 업데이트 오류:', error);
  }
};

// 선택된 식당의 마커만 표시
export const showSelectedRestaurantMarker = (map, markers, setMarkers, restaurant, setSelectedRestaurant) => {
  try {
    if (!map || !restaurant || !restaurant.lat || !restaurant.lng) {
      return;
    }

    // 기존 마커와 인포윈도우 모두 제거
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // 기존 인포윈도우 제거
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close();
      window.currentInfoWindow = null;
    }

    // 선택된 식당의 마커만 생성
    const position = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng);
    const marker = new window.kakao.maps.Marker({
      position: position,
      map: map,
      title: restaurant.restaurantName
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      setSelectedRestaurant(restaurant);
      map.setCenter(position);
      map.setLevel(3);
    });

    newMarkers.push(marker);
    setMarkers(newMarkers);

    // 선택된 식당으로 지도 중심 이동
    map.setCenter(position);
    map.setLevel(5);

    // 인포윈도우 표시
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding: 15px; min-width: 250px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: bold;">
            ${restaurant.restaurantName}
          </h3>
          ${restaurant.branchName ? `
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
              ${restaurant.branchName}
            </p>
          ` : ''}
          <p style="margin: 0 0 8px 0; color: #888; font-size: 13px;">
            ${restaurant.roadAddress || '주소 정보 없음'}
          </p>
          <p style="margin: 0; color: #667eea; font-size: 12px; font-weight: 600;">
            ${restaurant.mainMenu || '메뉴 정보 없음'}
          </p>
        </div>
      `,
      removable: true
    });
    infoWindow.open(map, marker);
    
    // 현재 인포윈도우를 전역 변수에 저장
    window.currentInfoWindow = infoWindow;
  } catch (error) {
    console.error('선택된 식당 마커 표시 오류:', error);
  }
};

// 지도 마커와 인포윈도우 제거
export const clearMapMarkers = (map, markers, setMarkers) => {
  try {
    if (!map) return;
    
    // 기존 마커 모두 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    // 현재 인포윈도우 제거
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close();
      window.currentInfoWindow = null;
    }
    
    // DOM에서 인포윈도우 제거
    const infoWindows = document.querySelectorAll('.kakao-maps-info-window');
    infoWindows.forEach(infoWindow => {
      if (infoWindow.parentNode) {
        infoWindow.parentNode.removeChild(infoWindow);
      }
    });
    
    console.log('지도 마커와 인포윈도우 제거 완료');
  } catch (error) {
    console.error('지도 마커 제거 오류:', error);
  }
};
