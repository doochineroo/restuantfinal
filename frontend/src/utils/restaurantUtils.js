// 식당 관련 유틸리티 함수들

// Y/N 값을 한국어로 변환
export const getKoreanValue = (value) => {
  if (value === 'Y' || value === '가능') return '가능';
  if (value === 'N' || value === '불가능') return '불가능';
  return value || '정보 없음';
};

// 상태 값을 한국어로 변환
export const getStatusValue = (restaurant) => {
  // lat, lng 값이 없으면 운영중지예상
  if (!restaurant.lat || !restaurant.lng) {
    return '운영중지예상';
  }
  
  // NORMAL이면 운영중
  if (restaurant.status === 'NORMAL') {
    return '운영중';
  }
  
  // 기타 상태값이 있으면 그대로 표시
  return restaurant.status || '정보 없음';
};

// 운영중인 식당만 필터링하는 함수
export const filterOperatingRestaurants = (restaurantList) => {
  return restaurantList.filter(restaurant => {
    // lat, lng 값이 있고 status가 NORMAL인 경우만 표시
    return restaurant.lat && restaurant.lng && restaurant.status === 'NORMAL';
  });
};


// 지역별 필터링 함수
export const filterByRegion = (restaurants, region) => {
  return restaurants.filter(restaurant => 
    restaurant.regionName && restaurant.regionName.includes(region)
  );
};

// 서비스별 필터링 함수
export const filterByService = (restaurants, service) => {
  return restaurants.filter(restaurant => {
    switch(service) {
      case '주차가능':
        return restaurant.parking === 'Y';
      case 'WiFi':
        return restaurant.wifi === 'Y';
      case '키즈존':
        return restaurant.kidsZone === 'Y';
      case '배달':
        return restaurant.delivery === 'Y';
      case '스마트오더':
        return restaurant.smartOrder === 'Y';
      default:
        return true;
    }
  });
};
