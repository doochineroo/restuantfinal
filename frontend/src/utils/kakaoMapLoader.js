// 카카오 지도 API 로드 확인 유틸리티

let isLoaded = false;
let isLoading = false;
let loadPromise = null;

// 카카오 지도 API 로드 대기 함수
export const loadKakaoMapAPI = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (isLoaded && window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }

    // 로딩 중인 경우 기존 Promise 반환
    if (isLoading && loadPromise) {
      loadPromise.then(resolve).catch(reject);
      return;
    }

    // 새로운 로딩 시작
    isLoading = true;
    loadPromise = new Promise((innerResolve, innerReject) => {
      // 카카오 지도 API가 이미 로드되어 있는지 확인
      if (window.kakao && window.kakao.maps) {
        isLoaded = true;
        isLoading = false;
        console.log('카카오 지도 API 이미 로드됨');
        innerResolve(window.kakao);
        return;
      }

      // 카카오 지도 API가 로드되지 않은 경우 동적으로 로드
      if (!window.kakao) {
        const script = document.createElement('script');
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=4338d5e19b8efcb2bf2d96333a91e07d&autoload=false';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('카카오 지도 스크립트 로드 완료');
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              isLoaded = true;
              isLoading = false;
              console.log('카카오 지도 API 초기화 완료');
              innerResolve(window.kakao);
            });
          } else {
            isLoading = false;
            const error = new Error('카카오 지도 API 초기화 실패');
            console.error('카카오 지도 API 초기화 실패');
            innerReject(error);
          }
        };
        
        script.onerror = (error) => {
          isLoading = false;
          const errorMsg = new Error('카카오 지도 API 스크립트 로드 실패');
          console.error('카카오 지도 API 스크립트 로드 실패:', error);
          innerReject(errorMsg);
        };
        
        document.head.appendChild(script);
        return;
      }

      // 폴링으로 로드 완료 대기
      let attempts = 0;
      const maxAttempts = 100; // 10초 대기 (100ms * 100)
      
      const checkLoaded = () => {
        attempts++;
        
        if (window.kakao && window.kakao.maps) {
          isLoaded = true;
          isLoading = false;
          console.log('카카오 지도 API 로드 완료');
          innerResolve(window.kakao);
        } else if (attempts >= maxAttempts) {
          isLoading = false;
          const error = new Error('카카오 지도 API 로드 시간 초과');
          console.error('카카오 지도 API 로드 실패:', error);
          innerReject(error);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      
      // 약간의 지연 후 확인 시작
      setTimeout(checkLoaded, 100);
    });

    loadPromise.then(resolve).catch(reject);
  });
};

// 카카오 지도 API가 로드되었는지 확인
export const isKakaoMapLoaded = () => {
  return isLoaded && window.kakao && window.kakao.maps;
};
