package com.example.choprest.service;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.repository.RestaurantRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantService {
    
    private final RestaurantRepository restaurantRepository;
    private final WebClient webClient;
    
    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Value("${kakao.api.url}")
    private String kakaoApiUrl;

    @Value("${kakao.api.reverse.url}")
    private String kakaoReverseApiUrl;
    
    /**
     * 키워드로 식당 검색 및 Kakao API로 위도/경도/도로명 주소 업데이트
     */
    public List<Restaurant> searchRestaurants(String keyword) {
        log.info("Searching restaurants with keyword: {}", keyword);
        
        // 먼저 데이터베이스에서 검색 (캐시된 데이터)
        List<Restaurant> cachedRestaurants = restaurantRepository
                .findByRestaurantNameContainingIgnoreCaseOrBranchNameContainingIgnoreCase(keyword, keyword);
        
        // 지역명으로도 검색해서 추가
        List<Restaurant> regionRestaurants = restaurantRepository
                .findByRegionNameContainingIgnoreCase(keyword);
        
        // 중복 제거하면서 합치기
        Set<Restaurant> uniqueRestaurants = new HashSet<>(cachedRestaurants);
        uniqueRestaurants.addAll(regionRestaurants);
        List<Restaurant> allCachedRestaurants = new ArrayList<>(uniqueRestaurants);
        
        if (!allCachedRestaurants.isEmpty()) {
            log.info("Found {} cached restaurants in database", allCachedRestaurants.size());
            return allCachedRestaurants;
        }
        
        // 데이터베이스에 없으면 CSV에서 로드하고 키워드로 필터링
        log.info("No cached data found, loading from CSV and filtering with keyword: '{}'", keyword);
        
        List<Restaurant> allRestaurants = loadRestaurantsFromCsv();
        log.info("Loaded {} restaurants from CSV", allRestaurants.size());
        
        // 키워드로 필터링 (식당명, 지점명, 지역명에 포함)
        List<Restaurant> filteredRestaurants = new ArrayList<>();
        for (Restaurant restaurant : allRestaurants) {
            boolean matches = false;
            
            // 식당명 검색
            if (restaurant.getRestaurantName() != null && 
                restaurant.getRestaurantName().toLowerCase().contains(keyword.toLowerCase())) {
                log.info("Match found in restaurant name: {}", restaurant.getRestaurantName());
                matches = true;
            }
            
            // 지점명 검색
            if (restaurant.getBranchName() != null && 
                restaurant.getBranchName().toLowerCase().contains(keyword.toLowerCase())) {
                log.info("Match found in branch name: {}", restaurant.getBranchName());
                matches = true;
            }
            
            // 지역명 검색
            if (restaurant.getRegionName() != null && 
                restaurant.getRegionName().toLowerCase().contains(keyword.toLowerCase())) {
                log.info("Match found in region name: {}", restaurant.getRegionName());
                matches = true;
            }
            
            if (matches) {
                filteredRestaurants.add(restaurant);
            }
        }
        
        log.info("Found {} restaurants matching keyword '{}' in CSV", filteredRestaurants.size(), keyword);
        
        // 필터링된 결과를 데이터베이스에 저장 (위치 정보 없이)
        List<Restaurant> savedRestaurants = new ArrayList<>();
        for (Restaurant restaurant : filteredRestaurants) {
            try {
                Restaurant savedRestaurant = restaurantRepository.save(restaurant);
                savedRestaurants.add(savedRestaurant);
                log.info("Saved restaurant to database: {}", savedRestaurant.getRestaurantName());
            } catch (Exception e) {
                log.error("Error saving restaurant {}: {}", restaurant.getRestaurantName(), e.getMessage());
            }
        }
        
        log.info("Returning {} restaurants from CSV search", savedRestaurants.size());
        return savedRestaurants;
    }
    
    /**
     * 특정 식당 상세 정보 조회
     */
    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }
    
    /**
     * 모든 식당 조회 (데이터베이스 캐시 우선)
     */
    public List<Restaurant> getAllRestaurants() {
        // 데이터베이스에서 모든 식당 조회
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        
        if (!allRestaurants.isEmpty()) {
            log.info("Found {} restaurants in database", allRestaurants.size());
            return allRestaurants;
        }
        
        // 데이터베이스가 비어있으면 CSV에서 로드 (API 호출 없이)
        log.info("No restaurants in database, loading from CSV without API calls");
        return loadRestaurantsFromCsv();
    }
    
    /**
     * 지역명으로 식당 검색 및 Kakao API로 위도/경도/도로명 주소 업데이트
     */
    public List<Restaurant> searchRestaurantsByRegion(String regionName) {
        log.info("Searching restaurants by region: {}", regionName);
        
        // 먼저 데이터베이스에서 검색 (캐시된 데이터)
        List<Restaurant> cachedRestaurants = restaurantRepository.findByRegionNameContainingIgnoreCase(regionName);
        
        if (!cachedRestaurants.isEmpty()) {
            log.info("Found {} cached restaurants in database for region: {}", cachedRestaurants.size(), regionName);
            return cachedRestaurants;
        }
        
        // 데이터베이스에 없으면 CSV에서 로드
        List<Restaurant> allRestaurants = loadRestaurantsFromCsv();
        
        // 지역명으로 필터링
        List<Restaurant> filteredRestaurants = allRestaurants.stream()
                .filter(restaurant -> 
                    restaurant.getRegionName() != null && 
                    restaurant.getRegionName().toLowerCase().contains(regionName.toLowerCase())
                )
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
        
        // 각 식당에 대해 위치 정보 업데이트 및 데이터베이스 저장
        List<Restaurant> savedRestaurants = new ArrayList<>();
        for (Restaurant restaurant : filteredRestaurants) {
            Restaurant updatedRestaurant = updateLocationInfoAndSave(restaurant);
            if (updatedRestaurant != null) {
                savedRestaurants.add(updatedRestaurant);
            }
        }
        
        return savedRestaurants;
    }
    
    /**
     * 식당명으로 식당 검색 및 Kakao API로 위도/경도/도로명 주소 업데이트
     */
    public List<Restaurant> searchRestaurantsByName(String restaurantName) {
        log.info("Searching restaurants by name: {}", restaurantName);
        
        // 먼저 데이터베이스에서 검색 (캐시된 데이터)
        List<Restaurant> cachedRestaurants = restaurantRepository
                .findByRestaurantNameContainingIgnoreCaseOrBranchNameContainingIgnoreCase(restaurantName, restaurantName);
        
        if (!cachedRestaurants.isEmpty()) {
            log.info("Found {} cached restaurants in database", cachedRestaurants.size());
            return cachedRestaurants;
        }
        
        // 데이터베이스에 없으면 CSV에서 로드
        List<Restaurant> allRestaurants = loadRestaurantsFromCsv();
        
        // 식당명 또는 지점명으로 필터링
        List<Restaurant> filteredRestaurants = allRestaurants.stream()
                .filter(restaurant -> 
                    (restaurant.getRestaurantName() != null && 
                     restaurant.getRestaurantName().toLowerCase().contains(restaurantName.toLowerCase())) ||
                    (restaurant.getBranchName() != null && 
                     restaurant.getBranchName().toLowerCase().contains(restaurantName.toLowerCase()))
                )
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
        
        // 각 식당에 대해 위치 정보 업데이트 및 데이터베이스 저장
        List<Restaurant> savedRestaurants = new ArrayList<>();
        for (Restaurant restaurant : filteredRestaurants) {
            Restaurant updatedRestaurant = updateLocationInfoAndSave(restaurant);
            if (updatedRestaurant != null) {
                savedRestaurants.add(updatedRestaurant);
            }
        }
        
        return savedRestaurants;
    }
    
    /**
     * CSV 파일에서 식당 데이터를 메모리에 로드
     */
    private List<Restaurant> loadRestaurantsFromCsv() {
        List<Restaurant> restaurants = new ArrayList<>();
        try {
            ClassPathResource resource = new ClassPathResource("restaurants.csv");
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), "UTF-8"))) {
                String line;
                boolean isFirstLine = true;
                
                while ((line = reader.readLine()) != null) {
                    if (isFirstLine) {
                        isFirstLine = false;
                        continue; // 헤더 스킵
                    }
                    
                    // CSV 파싱 (쉼표로 분리하되 따옴표 안의 쉼표는 무시)
                    List<String> values = parseCsvLine(line);
                    
                    if (values.size() >= 23) {
                        Restaurant restaurant = Restaurant.builder()
                                .id(parseLong(cleanValue(values.get(0)))) // 식당 ID
                                .restaurantName(cleanValue(values.get(1))) // 식당명
                                .branchName(cleanValue(values.get(2))) // 지점명
                                .regionName(cleanValue(values.get(3))) // 지역명
                                .parking(cleanValue(values.get(4))) // 주차가능여부
                                .wifi(cleanValue(values.get(5))) // 와이파이제공여부
                                .kidsZone(cleanValue(values.get(6))) // 놀이방유무
                                .multilingualMenu(cleanValue(values.get(7))) // 다국어메뉴판제공여부
                                .restroomInfo(cleanValue(values.get(8))) // 화장실정보내용
                                .holidayInfo(cleanValue(values.get(9))) // 휴무일정보내용
                                .openingHours(cleanValue(values.get(10))) // 영업시간내용
                                .delivery(cleanValue(values.get(11))) // 배달서비스유무
                                .onlineReservation(cleanValue(values.get(12))) // 온라인예약정보내용
                                .homepageUrl(cleanValue(values.get(13))) // 홈페이지(URL)
                                .landmarkName(cleanValue(values.get(14))) // 인근랜드마크명
                                .landmarkLat(parseDouble(cleanValue(values.get(15)))) // 인근랜드마크위도
                                .landmarkLng(parseDouble(cleanValue(values.get(16)))) // 인근랜드마크경도
                                .landmarkDistance(parseDouble(cleanValue(values.get(17)))) // 인근랜드마크와거리
                                .smartOrder(cleanValue(values.get(18))) // 스마트오더유무
                                .mainMenu(cleanValue(values.get(19))) // 대표메뉴명
                                .status(cleanValue(values.get(20))) // 식당상태
                                .hashtags(cleanValue(values.get(21))) // 해시태그
                                .areaInfo(cleanValue(values.get(22))) // 면적정보내용
                                .build();
                        
                        restaurants.add(restaurant);
                    }
                }
            }
            
            log.info("Loaded {} restaurants from CSV file", restaurants.size());
            
        } catch (IOException e) {
            log.error("Error loading restaurants from CSV: {}", e.getMessage());
        }
        
        return restaurants;
    }
    
    /**
     * CSV 라인을 파싱하여 값들을 리스트로 반환
     */
    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentValue = new StringBuilder();
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                values.add(currentValue.toString());
                currentValue = new StringBuilder();
            } else {
                currentValue.append(c);
            }
        }
        values.add(currentValue.toString());
        
        return values;
    }
    
    /**
     * 값에서 따옴표 제거 및 정리
     */
    private String cleanValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.replaceAll("^\"|\"$", "").trim();
    }
    
    /**
     * 문자열을 Double로 변환
     */
    private Double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 문자열을 Long으로 변환
     */
    private Long parseLong(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 위치 정보 업데이트 및 데이터베이스 저장
     */
    private Restaurant updateLocationInfoAndSave(Restaurant restaurant) {
        try {
            // 이미 위치 정보가 있는지 확인
            if (restaurant.getLat() != null && restaurant.getLng() != null && 
                restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                log.info("Restaurant {} already has location info, skipping API call", restaurant.getRestaurantName());
                return restaurant;
            }
            
            // 데이터베이스에서 이미 저장된 정보가 있는지 확인
            Optional<Restaurant> existingRestaurant = restaurantRepository.findById(restaurant.getId());
            if (existingRestaurant.isPresent() && 
                existingRestaurant.get().getLat() != null && 
                existingRestaurant.get().getLng() != null && 
                existingRestaurant.get().getRoadAddress() != null && 
                !existingRestaurant.get().getRoadAddress().trim().isEmpty()) {
                log.info("Found existing location info in database for {}", restaurant.getRestaurantName());
                return existingRestaurant.get();
            }
            
            // API 호출하여 위치 정보 업데이트
            updateLocationInfo(restaurant);
            
            // 데이터베이스에 저장
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);
            log.info("Saved restaurant {} to database with location info", savedRestaurant.getRestaurantName());
            
            return savedRestaurant;
            
        } catch (Exception e) {
            log.error("Error updating and saving location info for {}: {}", restaurant.getRestaurantName(), e.getMessage());
            return null;
        }
    }

    /**
     * Kakao Local API를 사용하여 위도/경도/도로명 주소 업데이트
     */
    private void updateLocationInfo(Restaurant restaurant) {
        try {
            final String searchQuery = restaurant.getRestaurantName() +
                    (restaurant.getBranchName() != null && !restaurant.getBranchName().isEmpty()
                            ? " " + restaurant.getBranchName() : "");

            log.info("Updating location info for: {}", searchQuery);
            log.info("Using Kakao API key: {}", kakaoApiKey != null ? kakaoApiKey.substring(0, 8) + "..." : "NULL");

            // API 호출 제한을 위한 지연 시간 추가 (0.5초)
            Thread.sleep(500);

            String apiUrl = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + 
                           java.net.URLEncoder.encode(searchQuery, "UTF-8") + 
                           "&size=1&category_group_code=FD6";
            log.info("API URL: {}", apiUrl);

            KakaoApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("dapi.kakao.com")
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", searchQuery)
                            .queryParam("size", "1")
                            .queryParam("category_group_code", "FD6") // 음식점 카테고리
                            .build())
                    .header("Authorization", "KakaoAK " + kakaoApiKey)
                    .retrieve()
                    .bodyToMono(KakaoApiResponse.class)
                    .block();

                log.info("Kakao API response for '{}': {}", searchQuery, response);

                if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
                    KakaoApiResponse.Document document = response.getDocuments().get(0);

                    // 위도/경도 업데이트
                    restaurant.setLat(Double.parseDouble(document.getY()));
                    restaurant.setLng(Double.parseDouble(document.getX()));

                    // 먼저 검색 결과에서 직접 도로명 주소 확인
                    String address = document.getRoadAddressName();
                    if (address == null || address.trim().isEmpty()) {
                        // 검색 결과에 도로명 주소가 없으면 Reverse Geocoding API 사용
                        address = getDetailedAddressFromCoordinates(restaurant.getLat(), restaurant.getLng());
                    } else {
                        // 검색 결과의 주소를 더 상세하게 구성
                        address = buildDetailedAddress(document.getRoadAddressName(), document.getAddressName());
                    }
                    restaurant.setRoadAddress(address);

                    log.info("Updated location info for {}: lat={}, lng={}, address={}",
                            searchQuery, restaurant.getLat(), restaurant.getLng(), restaurant.getRoadAddress());
                } else {
                    log.warn("No location data found for: {}", searchQuery);
                    // 위치 정보를 찾을 수 없는 경우 기본값 설정
                    restaurant.setLat(null);
                    restaurant.setLng(null);
                    restaurant.setRoadAddress(null);
                }

            } catch (Exception e) {
                log.error("Error updating location info for {}: {}", restaurant.getRestaurantName(), e.getMessage(), e);
                // 에러 발생 시 기본값 설정
                restaurant.setLat(null);
                restaurant.setLng(null);
                restaurant.setRoadAddress(null);
            }
        }

    /**
     * 상세한 주소 정보 구성
     */
    private String buildDetailedAddress(String roadAddress, String regularAddress) {
        if (roadAddress != null && !roadAddress.trim().isEmpty()) {
            return roadAddress.trim();
        } else if (regularAddress != null && !regularAddress.trim().isEmpty()) {
            return regularAddress.trim();
        }
        return null;
    }

    /**
     * 위도/경도로 상세한 도로명 주소 조회 (Kakao Reverse Geocoding API)
     */
    private String getDetailedAddressFromCoordinates(Double lat, Double lng) {
        try {
            if (lat == null || lng == null) {
                return null;
            }

            log.info("Getting detailed address for coordinates: lat={}, lng={}", lat, lng);

            KakaoReverseApiResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("dapi.kakao.com")
                            .path("/v2/local/geo/coord2address.json")
                            .queryParam("x", lng.toString())
                            .queryParam("y", lat.toString())
                            .queryParam("input_coord", "WGS84")
                            .build())
                    .header("Authorization", "KakaoAK " + kakaoApiKey)
                    .retrieve()
                    .bodyToMono(KakaoReverseApiResponse.class)
                    .block();

            log.info("Reverse geocoding API response for lat={}, lng={}: {}", lat, lng, response);

            if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
                KakaoReverseApiResponse.Document document = response.getDocuments().get(0);
                
                // 도로명 주소 우선, 없으면 지번 주소
                String address = null;
                if (document.getRoadAddress() != null && document.getRoadAddress().getAddressName() != null) {
                    address = document.getRoadAddress().getAddressName();
                    log.info("Detailed road address found: {}", address);
                } else if (document.getAddress() != null && document.getAddress().getAddressName() != null) {
                    address = document.getAddress().getAddressName();
                    log.info("Detailed regular address found: {}", address);
                }
                
                log.info("Final detailed address for coordinates: {}", address);
                return address;
            } else {
                log.warn("No detailed address found for coordinates: lat={}, lng={}", lat, lng);
                return null;
            }

        } catch (Exception e) {
            log.error("Error getting detailed address for coordinates lat={}, lng={}: {}", lat, lng, e.getMessage());
            return null;
        }
    }

    
    /**
     * Kakao API 응답을 위한 내부 클래스들
     */
    public static class KakaoApiResponse {
        private List<Document> documents;
        
        public List<Document> getDocuments() {
            return documents;
        }
        
        public void setDocuments(List<Document> documents) {
            this.documents = documents;
        }
        
        public static class Document {
            private String x; // 경도
            private String y; // 위도
            @JsonProperty("road_address_name")
            private String roadAddressName; // 도로명 주소
            @JsonProperty("address_name")
            private String addressName; // 지번 주소
            
            public String getX() {
                return x;
            }
            
            public void setX(String x) {
                this.x = x;
            }
            
            public String getY() {
                return y;
            }
            
            public void setY(String y) {
                this.y = y;
            }
            
            public String getRoadAddressName() {
                return roadAddressName;
            }
            
            public void setRoadAddressName(String roadAddressName) {
                this.roadAddressName = roadAddressName;
            }
            
            public String getAddressName() {
                return addressName;
            }
            
            public void setAddressName(String addressName) {
                this.addressName = addressName;
            }
        }
    }

    /**
     * Kakao Reverse Geocoding API 응답을 위한 내부 클래스들
     */
    public static class KakaoReverseApiResponse {
        private List<Document> documents;
        private Meta meta;

        public List<Document> getDocuments() {
            return documents;
        }

        public void setDocuments(List<Document> documents) {
            this.documents = documents;
        }

        public Meta getMeta() {
            return meta;
        }

        public void setMeta(Meta meta) {
            this.meta = meta;
        }

        public static class Document {
            private RoadAddress roadAddress;
            private Address address;

            public RoadAddress getRoadAddress() {
                return roadAddress;
            }

            public void setRoadAddress(RoadAddress roadAddress) {
                this.roadAddress = roadAddress;
            }

            public Address getAddress() {
                return address;
            }

            public void setAddress(Address address) {
                this.address = address;
            }
        }

        public static class RoadAddress {
            private String addressName;
            private String region1DepthName;
            private String region2DepthName;
            private String region3DepthName;
            private String roadName;
            private String undergroundYn;
            private String mainBuildingNo;
            private String subBuildingNo;
            private String buildingName;
            private String zoneNo;

            public String getAddressName() {
                return addressName;
            }

            public void setAddressName(String addressName) {
                this.addressName = addressName;
            }

            public String getRegion1DepthName() {
                return region1DepthName;
            }

            public void setRegion1DepthName(String region1DepthName) {
                this.region1DepthName = region1DepthName;
            }

            public String getRegion2DepthName() {
                return region2DepthName;
            }

            public void setRegion2DepthName(String region2DepthName) {
                this.region2DepthName = region2DepthName;
            }

            public String getRegion3DepthName() {
                return region3DepthName;
            }

            public void setRegion3DepthName(String region3DepthName) {
                this.region3DepthName = region3DepthName;
            }

            public String getRoadName() {
                return roadName;
            }

            public void setRoadName(String roadName) {
                this.roadName = roadName;
            }

            public String getUndergroundYn() {
                return undergroundYn;
            }

            public void setUndergroundYn(String undergroundYn) {
                this.undergroundYn = undergroundYn;
            }

            public String getMainBuildingNo() {
                return mainBuildingNo;
            }

            public void setMainBuildingNo(String mainBuildingNo) {
                this.mainBuildingNo = mainBuildingNo;
            }

            public String getSubBuildingNo() {
                return subBuildingNo;
            }

            public void setSubBuildingNo(String subBuildingNo) {
                this.subBuildingNo = subBuildingNo;
            }

            public String getBuildingName() {
                return buildingName;
            }

            public void setBuildingName(String buildingName) {
                this.buildingName = buildingName;
            }

            public String getZoneNo() {
                return zoneNo;
            }

            public void setZoneNo(String zoneNo) {
                this.zoneNo = zoneNo;
            }
        }

        public static class Address {
            private String addressName;
            private String region1DepthName;
            private String region2DepthName;
            private String region3DepthName;
            private String region3DepthHName;
            private String hCode;
            private String bCode;
            private String mountainYn;
            private String mainAddressNo;
            private String subAddressNo;
            private String x;
            private String y;

            public String getAddressName() {
                return addressName;
            }

            public void setAddressName(String addressName) {
                this.addressName = addressName;
            }

            public String getRegion1DepthName() {
                return region1DepthName;
            }

            public void setRegion1DepthName(String region1DepthName) {
                this.region1DepthName = region1DepthName;
            }

            public String getRegion2DepthName() {
                return region2DepthName;
            }

            public void setRegion2DepthName(String region2DepthName) {
                this.region2DepthName = region2DepthName;
            }

            public String getRegion3DepthName() {
                return region3DepthName;
            }

            public void setRegion3DepthName(String region3DepthName) {
                this.region3DepthName = region3DepthName;
            }

            public String getRegion3DepthHName() {
                return region3DepthHName;
            }

            public void setRegion3DepthHName(String region3DepthHName) {
                this.region3DepthHName = region3DepthHName;
            }

            public String getHCode() {
                return hCode;
            }

            public void setHCode(String hCode) {
                this.hCode = hCode;
            }

            public String getBCode() {
                return bCode;
            }

            public void setBCode(String bCode) {
                this.bCode = bCode;
            }

            public String getMountainYn() {
                return mountainYn;
            }

            public void setMountainYn(String mountainYn) {
                this.mountainYn = mountainYn;
            }

            public String getMainAddressNo() {
                return mainAddressNo;
            }

            public void setMainAddressNo(String mainAddressNo) {
                this.mainAddressNo = mainAddressNo;
            }

            public String getSubAddressNo() {
                return subAddressNo;
            }

            public void setSubAddressNo(String subAddressNo) {
                this.subAddressNo = subAddressNo;
            }

            public String getX() {
                return x;
            }

            public void setX(String x) {
                this.x = x;
            }

            public String getY() {
                return y;
            }

            public void setY(String y) {
                this.y = y;
            }
        }

        public static class Meta {
            private int totalCount;

            public int getTotalCount() {
                return totalCount;
            }

            public void setTotalCount(int totalCount) {
                this.totalCount = totalCount;
            }
        }
    }
    
    /**
     * 키워드로 식당 삭제
     */
    public int deleteRestaurantsByKeyword(String keyword) {
        log.info("Deleting restaurants with keyword: {}", keyword);
        
        List<Restaurant> restaurants = restaurantRepository
                .findByRestaurantNameContainingIgnoreCaseOrBranchNameContainingIgnoreCase(keyword, keyword);
        
        if (restaurants.isEmpty()) {
            log.info("No restaurants found to delete for keyword: {}", keyword);
            return 0;
        }
        
        log.info("Found {} restaurants to delete for keyword: {}", restaurants.size(), keyword);
        
        for (Restaurant restaurant : restaurants) {
            restaurantRepository.delete(restaurant);
        }
        
        log.info("Successfully deleted {} restaurants for keyword: {}", restaurants.size(), keyword);
        return restaurants.size();
    }
}
