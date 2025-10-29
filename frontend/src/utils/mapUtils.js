// 지도 관련 유틸리티 함수들

// 지도에 식당 마커 표시
export const updateMapWithRestaurants = (map, markers, setMarkers, restaurantList, onMarkerClick) => {
  try {
    if (!map || !restaurantList || restaurantList.length === 0) {
      return;
    }

    // 기존 마커와 인포윈도우 제거 (더 확실하게)
    if (window.currentMarkers && window.currentMarkers.length > 0) {
      window.currentMarkers.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
    }
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

          // 선택된 식당으로 지도 중심 이동 (부드러운 애니메이션)
          map.panTo(position);
          
          // 줌 레벨 조정 (더 확실하게)
          setTimeout(() => {
            map.setLevel(3);
          }, 300);
          
          // 추가 확대 보장
          setTimeout(() => {
            map.setLevel(2);
          }, 600);
          
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
    window.currentMarkers = newMarkers;

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
      console.log('showSelectedRestaurantMarker: 유효하지 않은 파라미터');
      return;
    }

    console.log('showSelectedRestaurantMarker 호출:', restaurant.restaurantName);

    // 기존 마커와 인포윈도우 모두 제거 (더 확실하게)
    if (window.currentMarkers && window.currentMarkers.length > 0) {
      console.log('기존 마커 제거 중:', window.currentMarkers.length, '개');
      window.currentMarkers.forEach(marker => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (error) {
          console.error('마커 제거 실패:', error);
        }
      });
    }
    const newMarkers = [];

    // 기존 인포윈도우 제거
    if (window.currentInfoWindow) {
      try {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
      } catch (error) {
        console.error('인포윈도우 제거 실패:', error);
      }
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
    window.currentMarkers = newMarkers;

    // 선택된 식당으로 지도 중심 이동 (부드러운 애니메이션)
    map.panTo(position);
    
    // 줌 레벨 조정 (더 확실하게)
    setTimeout(() => {
      map.setLevel(3); // 더 확대된 레벨로 설정
    }, 300);
    
    // 추가 확대 보장
    setTimeout(() => {
      map.setLevel(2); // 최대 확대
    }, 600);

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
    
    console.log('clearMapMarkers 호출, 기존 마커 수:', window.currentMarkers?.length || markers?.length || 0);
    
    // 기존 마커 모두 제거 (더 확실하게)
    if (window.currentMarkers && window.currentMarkers.length > 0) {
      window.currentMarkers.forEach((marker, index) => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (error) {
          console.error(`마커 ${index} 제거 실패:`, error);
        }
      });
    } else if (markers && markers.length > 0) {
      markers.forEach((marker, index) => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (error) {
          console.error(`마커 ${index} 제거 실패:`, error);
        }
      });
    }
    
    // 전역 마커 배열도 확인 (혹시 모를 경우 대비)
    if (window.kakaoMarkers && Array.isArray(window.kakaoMarkers)) {
      window.kakaoMarkers.forEach((marker, index) => {
        try {
          if (marker && typeof marker.setMap === 'function') {
            marker.setMap(null);
          }
        } catch (error) {
          console.error(`전역 마커 ${index} 제거 실패:`, error);
        }
      });
      window.kakaoMarkers = [];
    }
    
    // 마커 배열 즉시 초기화
    setMarkers([]);
    window.currentMarkers = [];
    
    // 현재 인포윈도우 제거
    if (window.currentInfoWindow) {
      try {
        window.currentInfoWindow.close();
        window.currentInfoWindow = null;
      } catch (error) {
        console.error('인포윈도우 제거 실패:', error);
      }
    }
    
    // DOM에서 남아있는 모든 마커 이미지 제거
    const markerImages = document.querySelectorAll('.kakao-maps-marker, .kakao-maps-custom-overlay, img[data-type="marker"]');
    markerImages.forEach(img => {
      try {
        if (img && img.parentNode) {
          img.parentNode.removeChild(img);
        }
      } catch (error) {
        console.error('마커 이미지 제거 실패:', error);
      }
    });
    
    // DOM에서 인포윈도우 제거
    const infoWindows = document.querySelectorAll('.kakao-maps-info-window');
    infoWindows.forEach(infoWindow => {
      try {
        if (infoWindow && infoWindow.parentNode) {
          infoWindow.parentNode.removeChild(infoWindow);
        }
      } catch (error) {
        console.error('인포윈도우 DOM 제거 실패:', error);
      }
    });
    
    console.log('clearMapMarkers 완료');
  } catch (error) {
    console.error('지도 마커 제거 오류:', error);
  }
};
