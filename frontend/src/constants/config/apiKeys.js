// API 키 설정
// 카카오 JavaScript 키
export const KAKAO_MAP_API_KEY = '4338d5e19b8efcb2bf2d96333a91e07d';

// API 키 유효성 검사
export const validateApiKey = (key) => {
  return key && key.length === 32 && /^[0-9a-f]+$/i.test(key);
};
