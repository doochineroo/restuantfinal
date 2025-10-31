import axios from 'axios';

// OpenWeatherMap API 사용 (무료 버전)
// 🔑 API 키 받는 방법: https://openweathermap.org/ → Sign Up → API Keys 메뉴에서 키 복사
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '4b2bb20d2f5a025350b0d5745f53f41a';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherAPI = {
  // 현재 날씨 조회
  getCurrentWeather: async (lat, lon) => {
    try {
      console.log('날씨 API 호출:', { lat, lon, apiKey: WEATHER_API_KEY.substring(0, 8) + '...' });
      
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      
      console.log('날씨 API 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('날씨 API 오류:', error);
      if (error.response) {
        console.error('API 응답 오류:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  // 과거 날씨 조회 (One Call API 사용)
  getHistoricalWeather: async (lat, lon, date) => {
    try {
      const timestamp = Math.floor(new Date(date).getTime() / 1000);
      const response = await axios.get(`${WEATHER_BASE_URL}/onecall/timemachine`, {
        params: {
          lat,
          lon,
          dt: timestamp,
          appid: WEATHER_API_KEY,
          units: 'metric',
          lang: 'kr'
        }
      });
      return response.data;
    } catch (error) {
      console.error('과거 날씨 API 오류:', error);
      throw error;
    }
  },

  // 날씨 조건을 카테고리로 변환
  categorizeWeather: (weatherData) => {
    if (!weatherData || !weatherData.weather) return 'unknown';
    
    const main = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description.toLowerCase();
    
    // 날씨 카테고리 분류
    if (main === 'clear' || description.includes('맑음')) {
      return 'sunny';
    } else if (main === 'clouds' || description.includes('구름')) {
      return 'cloudy';
    } else if (main === 'rain' || main === 'drizzle' || description.includes('비')) {
      return 'rainy';
    } else if (main === 'snow' || description.includes('눈')) {
      return 'snowy';
    } else if (main === 'mist' || main === 'fog' || description.includes('안개')) {
      return 'foggy';
    } else if (main === 'thunderstorm' || description.includes('뇌우')) {
      return 'stormy';
    } else {
      return 'other';
    }
  },

  // 온도 범위별 카테고리
  categorizeTemperature: (temp) => {
    if (temp < 0) return 'very_cold';
    else if (temp < 10) return 'cold';
    else if (temp < 20) return 'cool';
    else if (temp < 30) return 'warm';
    else return 'hot';
  }
};

// 완전 무료 날씨 API 옵션들 (가입 불필요)
export const freeWeatherAPI = {
  // 1. wttr.in - 완전 무료, 가입 불필요
  getWeatherFromWttr: async (city = 'Seoul') => {
    try {
      const response = await axios.get(`https://wttr.in/${city}?format=j1`);
      return {
        location: response.data.nearest_area[0].areaName[0].value,
        current: {
          temp: response.data.current_condition[0].temp_C,
          condition: response.data.current_condition[0].weatherDesc[0].value,
          humidity: response.data.current_condition[0].humidity
        }
      };
    } catch (error) {
      console.error('wttr.in API 오류:', error);
      throw error;
    }
  },

  // 2. Open-Meteo - 완전 무료, 가입 불필요
  getWeatherFromOpenMeteo: async (lat, lon) => {
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
          timezone: 'Asia/Seoul'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Open-Meteo API 오류:', error);
      throw error;
    }
  },

  // 3. 7Timer! - 완전 무료, 가입 불필요
  getWeatherFrom7Timer: async (lat, lon) => {
    try {
      const response = await axios.get('https://www.7timer.info/bin/api.pl', {
        params: {
          lon: lon,
          lat: lat,
          product: 'civillight',
          output: 'json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('7Timer API 오류:', error);
      throw error;
    }
  }
};
