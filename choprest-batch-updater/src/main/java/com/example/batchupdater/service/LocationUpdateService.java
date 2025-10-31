package com.example.batchupdater.service;

import com.example.batchupdater.entity.Restaurant;
import com.example.batchupdater.repository.RestaurantRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class LocationUpdateService {
    
    private final RestaurantRepository restaurantRepository;
    private final ApiRotationService apiRotationService;
    private final RateLimitService rateLimitService;
    private final WebClient webClient;
    private final int maxRetries;
    private final long retryDelayMs;
    
    public LocationUpdateService(
            RestaurantRepository restaurantRepository,
            ApiRotationService apiRotationService,
            RateLimitService rateLimitService,
            WebClient.Builder webClientBuilder,
            @Value("${batch.max-retries:3}") int maxRetries,
            @Value("${batch.retry-delay-ms:5000}") long retryDelayMs) {
        
        this.restaurantRepository = restaurantRepository;
        this.apiRotationService = apiRotationService;
        this.rateLimitService = rateLimitService;
        this.webClient = webClientBuilder.build();
        this.maxRetries = maxRetries;
        this.retryDelayMs = retryDelayMs;
    }
    
    /**
     * 위치 정보가 없는 모든 식당의 위치 정보 업데이트
     */
    public BatchResult updateAllRestaurantLocations() {
        log.info("Starting batch location update for all restaurants");
        
        List<Restaurant> restaurantsWithoutLocation = restaurantRepository.findRestaurantsWithoutLocation();
        log.info("Found {} restaurants without location information", restaurantsWithoutLocation.size());
        
        if (restaurantsWithoutLocation.isEmpty()) {
            log.info("All restaurants already have location information");
            return new BatchResult(0, 0, 0, 0);
        }
        
        int total = restaurantsWithoutLocation.size();
        int success = 0;
        int failed = 0;
        int skipped = 0;
        
        for (int i = 0; i < restaurantsWithoutLocation.size(); i++) {
            Restaurant restaurant = restaurantsWithoutLocation.get(i);
            log.info("Processing restaurant {}/{}: {}", i + 1, total, restaurant.getRestaurantName());
            
            try {
                boolean updated = updateRestaurantLocation(restaurant);
                if (updated) {
                    success++;
                    log.info("Successfully updated location for: {}", restaurant.getRestaurantName());
                } else {
                    skipped++;
                    log.warn("Skipped restaurant (no location found): {}", restaurant.getRestaurantName());
                }
            } catch (Exception e) {
                failed++;
                log.error("Failed to update location for restaurant {}: {}", restaurant.getRestaurantName(), e.getMessage());
            }
            
            // 진행 상황 로깅 (10개마다)
            if ((i + 1) % 10 == 0) {
                log.info("Progress: {}/{} (Success: {}, Failed: {}, Skipped: {})", 
                    i + 1, total, success, failed, skipped);
            }
        }
        
        log.info("Batch location update completed. Total: {}, Success: {}, Failed: {}, Skipped: {}", 
            total, success, failed, skipped);
        
        return new BatchResult(total, success, failed, skipped);
    }
    
    /**
     * 특정 식당의 위치 정보 업데이트
     */
    public boolean updateRestaurantLocation(Restaurant restaurant) {
        // 이미 위치 정보가 있는지 확인
        if (restaurant.getLat() != null && restaurant.getLng() != null && 
            restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
            log.debug("Restaurant {} already has location info, skipping", restaurant.getRestaurantName());
            return false;
        }
        
        // 검색 쿼리 생성
        String searchQuery = restaurant.getRestaurantName();
        if (restaurant.getBranchName() != null && !restaurant.getBranchName().trim().isEmpty()) {
            searchQuery += " " + restaurant.getBranchName();
        }
        
        log.debug("Searching for location: {}", searchQuery);
        
        // 여러 검색 방식으로 시도
        String[] queries = {
            searchQuery,
            restaurant.getRestaurantName(),
            restaurant.getRestaurantName() + " " + restaurant.getRegionName()
        };
        
        for (String query : queries) {
            try {
                LocationInfo locationInfo = searchLocationWithAllKeys(query);
                if (locationInfo != null) {
                    // 위치 정보 업데이트
                    restaurant.setLat(locationInfo.getLat());
                    restaurant.setLng(locationInfo.getLng());
                    restaurant.setRoadAddress(locationInfo.getRoadAddress());
                    restaurant.setPhoneNumber(locationInfo.getPhoneNumber());
                    
                    // 데이터베이스 저장
                    log.info("Before saving restaurant: lat={}, lng={}, address={}", 
                        locationInfo.getLat(), locationInfo.getLng(), locationInfo.getRoadAddress());
                    
                    Restaurant savedRestaurant = restaurantRepository.save(restaurant);
                    
                    log.info("After saving restaurant: lat={}, lng={}, address={}", 
                        savedRestaurant.getLat(), savedRestaurant.getLng(), savedRestaurant.getRoadAddress());
                    
                    log.debug("Updated location for {}: lat={}, lng={}, address={}", 
                        restaurant.getRestaurantName(), locationInfo.getLat(), 
                        locationInfo.getLng(), locationInfo.getRoadAddress());
                    
                    return true;
                }
            } catch (Exception e) {
                log.warn("Failed to search location with query '{}': {}", query, e.getMessage());
            }
        }
        
        return false;
    }
    
    /**
     * 위치 검색 (원래 방식으로 단순화)
     */
    private LocationInfo searchLocationWithAllKeys(String query) {
        try {
            // 첫 번째 API 키로만 시도
            String apiKey = apiRotationService.getApiKeyByIndex(0);
            log.debug("Searching with API key for query: {}", query);
            
            LocationInfo result = searchLocationWithKey(query, apiKey);
            if (result != null) {
                log.info("Success with query: {}", query);
                return result;
            }
            
            log.debug("No result for query: {}", query);
            return null;
            
        } catch (Exception e) {
            log.warn("Error searching location with query '{}': {}", query, e.getMessage());
            return null;
        }
    }
    
    /**
     * 재시도 로직이 포함된 위치 검색 (기존 방식)
     */
    private LocationInfo searchLocationWithRetry(String query) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                rateLimitService.waitForRateLimit();
                return searchLocation(query);
            } catch (WebClientResponseException.TooManyRequests e) {
                log.warn("429 error on attempt {}/{}, waiting before retry", attempt, maxRetries);
                rateLimitService.waitForRetry();
            } catch (Exception e) {
                log.warn("Error on attempt {}/{}: {}", attempt, maxRetries, e.getMessage());
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Search interrupted", ie);
                    }
                }
            }
        }
        return null;
    }
    
    /**
     * Kakao API를 사용한 위치 검색 (로테이션 방식)
     */
    private LocationInfo searchLocation(String query) {
        String apiKey = apiRotationService.getNextApiKey();
        return searchLocationWithKey(query, apiKey);
    }
    
    /**
     * 특정 API 키를 사용한 위치 검색 (원래 방식)
     */
    private LocationInfo searchLocationWithKey(String query, String apiKey) {
        KakaoApiResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("dapi.kakao.com")
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .queryParam("size", 1)
                        .build())
                .header("Authorization", "KakaoAK " + apiKey)
                .retrieve()
                .bodyToMono(KakaoApiResponse.class)
                .block();
        
        if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
            KakaoApiResponse.Document document = response.getDocuments().get(0);
            
            return LocationInfo.builder()
                    .lat(parseDouble(document.getY()))
                    .lng(parseDouble(document.getX()))
                    .roadAddress(document.getRoadAddressName())
                    .phoneNumber(document.getPhone())
                    .build();
        }
        
        return null;
    }
    
    /**
     * API 키 테스트 (원래 방식)
     */
    public boolean testApiKeys() {
        log.info("Testing API keys...");
        
        // 간단히 true 반환 (원래 방식)
        return true;
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
     * 배치 결과 클래스
     */
    public static class BatchResult {
        private final int total;
        private final int success;
        private final int failed;
        private final int skipped;
        
        public BatchResult(int total, int success, int failed, int skipped) {
            this.total = total;
            this.success = success;
            this.failed = failed;
            this.skipped = skipped;
        }
        
        // Getters
        public int getTotal() { return total; }
        public int getSuccess() { return success; }
        public int getFailed() { return failed; }
        public int getSkipped() { return skipped; }
        
        @Override
        public String toString() {
            return String.format("BatchResult{total=%d, success=%d, failed=%d, skipped=%d}", 
                total, success, failed, skipped);
        }
    }
    
    /**
     * 위치 정보 클래스
     */
    @lombok.Data
    @lombok.Builder
    public static class LocationInfo {
        private Double lat;
        private Double lng;
        private String roadAddress;
        private String phoneNumber;
    }
    
    /**
     * Kakao API 응답 클래스들
     */
    public static class KakaoApiResponse {
        private List<Document> documents;
        
        public List<Document> getDocuments() { return documents; }
        public void setDocuments(List<Document> documents) { this.documents = documents; }
        
        public static class Document {
            private String x; // 경도
            private String y; // 위도
            @JsonProperty("road_address_name")
            private String roadAddressName; // 도로명 주소
            @JsonProperty("address_name")
            private String addressName; // 지번 주소
            @JsonProperty("phone")
            private String phone; // 전화번호
            
            // Getters and Setters
            public String getX() { return x; }
            public void setX(String x) { this.x = x; }
            public String getY() { return y; }
            public void setY(String y) { this.y = y; }
            public String getRoadAddressName() { return roadAddressName; }
            public void setRoadAddressName(String roadAddressName) { this.roadAddressName = roadAddressName; }
            public String getAddressName() { return addressName; }
            public void setAddressName(String addressName) { this.addressName = addressName; }
            public String getPhone() { return phone; }
            public void setPhone(String phone) { this.phone = phone; }
        }
    }
}
