package com.example.choprest.controller;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.service.RestaurantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@Slf4j
@CrossOrigin(origins = "*") // CORS 설정
public class RestaurantController {
    
    private final RestaurantService restaurantService;
    private final WebClient webClient;
    
    // 카카오 API 키 배열 (로테이션용) - 3개 키로 429 오류 방지
    private final String[] KAKAO_API_KEYS;
    private int currentApiKeyIndex = 0;
    
    // 생성자에서 application.properties에서 API 키 읽어오기
    public RestaurantController(RestaurantService restaurantService, WebClient webClient,
                                @Value("${kakao.api.key1:${kakao.api.key}}") String key1,
                                @Value("${kakao.api.key2:${kakao.api.key}}") String key2,
                                @Value("${kakao.api.key3:${kakao.api.key}}") String key3) {
        this.restaurantService = restaurantService;
        this.webClient = webClient;
        
        // API 키 배열 초기화 (application.properties에서 읽어옴)
        this.KAKAO_API_KEYS = new String[] {
            key1 != null && !key1.isEmpty() ? key1 : "363d03dddf733d17f5b3edb9be1e8911",
            key2 != null && !key2.isEmpty() ? key2 : "5d1502f95e6ae410f5ce45abf596d639",
            key3 != null && !key3.isEmpty() ? key3 : "674451cc66e051ddfca840a7f734213c"
        };
        
        log.info("Initialized with {} Kakao API keys", KAKAO_API_KEYS.length);
    }
    
    /**
     * 다음 API 키를 가져오는 메서드 (로테이션)
     */
    private String getNextApiKey() {
        String apiKey = KAKAO_API_KEYS[currentApiKeyIndex];
        currentApiKeyIndex = (currentApiKeyIndex + 1) % KAKAO_API_KEYS.length;
        log.debug("Using API key index: {} (total: {})", currentApiKeyIndex, KAKAO_API_KEYS.length);
        return "KakaoAK " + apiKey;
    }
    
    /**
     * 키워드로 식당 검색 (카카오 API로 좌표 보완)
     * GET /api/restaurants?keyword=검색어
     */
    @GetMapping
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String keyword) {
        log.info("Search request received for keyword: {}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            // 1. 기존 DB에서 키워드로 검색
            List<Restaurant> restaurants = restaurantService.searchRestaurants(keyword.trim());
            log.info("Found {} restaurants from DB for keyword: {}", restaurants.size(), keyword);
            
            // 2. 검색된 식당들을 좌표 유무에 따라 분류
            List<Restaurant> restaurantsWithCoordinates = new ArrayList<>();
            List<Restaurant> restaurantsNeedingCoordinates = new ArrayList<>();
            
            for (Restaurant restaurant : restaurants) {
                if (restaurant.getLat() != null && restaurant.getLng() != null && 
                    restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                    restaurantsWithCoordinates.add(restaurant);
                } else {
                    restaurantsNeedingCoordinates.add(restaurant);
                }
            }
            
            log.info("Found {} restaurants with coordinates, {} restaurants needing coordinates", 
                restaurantsWithCoordinates.size(), restaurantsNeedingCoordinates.size());
            
            // 3. 좌표가 없는 모든 식당들을 카카오 API로 실시간 업데이트 (제한 없음)
            List<Restaurant> updatedRestaurants = new ArrayList<>(restaurantsWithCoordinates);
            
            if (!restaurantsNeedingCoordinates.isEmpty()) {
                // 검색 키워드와 관련성 높은 순으로 정렬
                List<Restaurant> prioritizedList = restaurantsNeedingCoordinates.stream()
                    .sorted((r1, r2) -> {
                        // 검색 키워드가 포함된 식당을 우선 처리
                        boolean r1Contains = r1.getRestaurantName().toLowerCase().contains(keyword.toLowerCase());
                        boolean r2Contains = r2.getRestaurantName().toLowerCase().contains(keyword.toLowerCase());
                        if (r1Contains && !r2Contains) return -1;
                        if (!r1Contains && r2Contains) return 1;
                        return 0;
                    })
                    .collect(java.util.stream.Collectors.toList());
                
                log.info("Processing {} restaurants for real-time coordinate update (no limit)", prioritizedList.size());
                
                // 실시간으로 좌표 업데이트 (동기 처리) - 좌표가 없는 식당만 처리
                for (Restaurant restaurant : prioritizedList) {
                    try {
                        // 이미 좌표가 있는 식당은 API 호출하지 않고 바로 추가
                        if (restaurant.getLat() != null && restaurant.getLng() != null && 
                            restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                            updatedRestaurants.add(restaurant);
                            log.info("✅ Restaurant already has coordinates: {}", restaurant.getRestaurantName());
                            continue;
                        }
                        
                        // 좌표가 없는 식당만 API 호출
                        updateSingleRestaurantCoordinates(restaurant);
                        
                        // 좌표가 있든 없든 모든 매장을 리스트에 추가 (새로 등록된 매장 포함)
                        updatedRestaurants.add(restaurant);
                        if (restaurant.getLat() != null && restaurant.getLng() != null) {
                            log.info("✅ Added restaurant with coordinates: {}", restaurant.getRestaurantName());
                        } else {
                            log.info("✅ Added restaurant without coordinates (newly registered): {}", restaurant.getRestaurantName());
                        }
                        
                        // API 키 로테이션으로 딜레이 단축 (429 에러 방지)
                        Thread.sleep(1000); // 1초 딜레이로 429 에러 확률 감소
                    } catch (Exception e) {
                        log.error("Error updating coordinates for restaurant {}: {}", 
                            restaurant.getRestaurantName(), e.getMessage());
                        // 좌표를 못 찾은 식당도 리스트에 추가 (새로 등록된 매장일 수 있음)
                        updatedRestaurants.add(restaurant);
                    }
                }
            }
            
            // 4. 업데이트된 데이터 반환
            long withCoords = updatedRestaurants.stream().mapToInt(r -> (r.getLat() != null && r.getLng() != null) ? 1 : 0).sum();
            long withoutCoords = updatedRestaurants.stream().mapToInt(r -> (r.getLat() == null || r.getLng() == null) ? 1 : 0).sum();
            
            log.info("Returning {} total restaurants ({} with coordinates, {} without coordinates)", 
                updatedRestaurants.size(), withCoords, withoutCoords);
            
            // 빈 리스트인 경우도 로그로 확인
            if (updatedRestaurants.isEmpty()) {
                log.warn("⚠️ Empty result list for keyword: {}", keyword);
                log.warn("DB search result was: {} restaurants", restaurants.size());
            }
            
            return ResponseEntity.ok(updatedRestaurants != null ? updatedRestaurants : new ArrayList<>());
        } catch (Exception e) {
            log.error("Error searching restaurants for keyword {}: {}", keyword, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    
    /**
     * 단일 식당의 좌표 업데이트 (여러 방식으로 시도)
     */
    private void updateSingleRestaurantCoordinates(Restaurant restaurant) {
        try {
            // 이미 좌표가 있는 식당은 API 호출하지 않음
            if (restaurant.getLat() != null && restaurant.getLng() != null && 
                restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                log.info("Restaurant {} already has coordinates, skipping API call", restaurant.getRestaurantName());
                return;
            }
            
            final String kakaoApiKey = getNextApiKey(); // 로테이션 API 키
            
            // 검색 방식 1: 식당명 + 지점명
            String query1 = restaurant.getRestaurantName();
            if (restaurant.getBranchName() != null && !restaurant.getBranchName().trim().isEmpty()) {
                query1 += " " + restaurant.getBranchName();
            }
            
            // 검색 방식 2: 식당명만
            String query2 = restaurant.getRestaurantName();
            
            // 순차적으로 시도
            String[] queries = {query1, query2};
            boolean found = false;
            
            for (String searchQuery : queries) {
                if (searchQuery == null || searchQuery.trim().isEmpty()) continue;
                
                log.info("Searching coordinates for: {}", searchQuery);
                
                try {
                    // 카카오 API 호출
                    String response = webClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .scheme("https")
                                    .host("dapi.kakao.com")
                                    .path("/v2/local/search/keyword.json")
                                    .queryParam("query", searchQuery)
                                    .queryParam("category_group_code", "FD6")
                                    .queryParam("size", "1")
                                    .build())
                            .header("Authorization", kakaoApiKey)
                            .retrieve()
                            .bodyToMono(String.class)
                            .timeout(java.time.Duration.ofSeconds(10))
                            .block();
                    
                    // 응답 로그 (디버깅용)
                    if (response != null && !response.isEmpty()) {
                        log.debug("Kakao API raw response: {}", response.length() > 200 ? response.substring(0, 200) + "..." : response);
                    } else {
                        log.warn("Empty response from Kakao API for query: {}", searchQuery);
                        continue;
                    }
                    
                    // JSON 파싱
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode jsonNode = null;
                    
                    try {
                        jsonNode = mapper.readTree(response);
                    } catch (Exception e) {
                        log.error("❌ JSON 파싱 실패 for query '{}': {}", searchQuery, e.getMessage());
                        log.error("Response content: {}", response);
                        continue;
                    }
                    
                    // 에러 응답 체크
                    if (jsonNode.has("error")) {
                        String errorMessage = jsonNode.has("message") ? jsonNode.get("message").asText() : "Unknown error";
                        log.error("❌ Kakao API error for query '{}': {}", searchQuery, errorMessage);
                        continue;
                    }
                    
                    // documents 배열 확인
                    if (jsonNode.has("documents") && jsonNode.get("documents").isArray() && jsonNode.get("documents").size() > 0) {
                        com.fasterxml.jackson.databind.JsonNode firstResult = jsonNode.get("documents").get(0);
                        
                        // 필수 필드 확인
                        if (!firstResult.has("y") || !firstResult.has("x")) {
                            log.warn("❌ Missing coordinates in response for query '{}'", searchQuery);
                            log.debug("Response structure: {}", firstResult.toString());
                            continue;
                        }
                        
                        // 좌표 추출 (안전하게)
                        Double lat = null;
                        Double lng = null;
                        try {
                            lat = firstResult.get("y").asDouble();
                            lng = firstResult.get("x").asDouble();
                            log.debug("Parsed coordinates: lat={}, lng={} for query '{}'", lat, lng, searchQuery);
                        } catch (Exception e) {
                            log.error("❌ 좌표 파싱 실패 for query '{}': {}", searchQuery, e.getMessage());
                            log.debug("y value: {}, x value: {}", 
                                firstResult.has("y") ? firstResult.get("y").asText() : "N/A",
                                firstResult.has("x") ? firstResult.get("x").asText() : "N/A");
                            continue;
                        }
                        
                        if (lat == null || lng == null) {
                            log.warn("❌ 좌표가 null입니다 for query '{}'", searchQuery);
                            continue;
                        }
                        // 주소 추출 (안전하게)
                        String roadAddress = null;
                        if (firstResult.has("road_address_name") && 
                            !firstResult.get("road_address_name").isNull() &&
                            !firstResult.get("road_address_name").asText().isEmpty()) {
                            roadAddress = firstResult.get("road_address_name").asText();
                        } else if (firstResult.has("address_name") && 
                                   !firstResult.get("address_name").isNull()) {
                            roadAddress = firstResult.get("address_name").asText();
                        }
                        
                        // 전화번호 추출
                        String phone = firstResult.has("phone") && 
                                      !firstResult.get("phone").isNull() && 
                                      !firstResult.get("phone").asText().isEmpty() ? 
                                      firstResult.get("phone").asText() : null;
                        String categoryFull = firstResult.has("category_name") && !firstResult.get("category_name").isNull() ? 
                                             firstResult.get("category_name").asText() : null;
                        
                        // 카테고리에서 중간 부분만 추출 (예: "음식점 > 패스트푸드 > 맥도날드" → "패스트푸드")
                        String category = null;
                        if (categoryFull != null && !categoryFull.isEmpty()) {
                            String[] parts = categoryFull.split(">");
                            if (parts.length >= 2) {
                                category = parts[1].trim(); // 중간 부분
                            } else if (parts.length == 1) {
                                category = parts[0].trim(); // 하나밖에 없으면 그거 사용
                            }
                        }
                        
                        // DB 업데이트
                        restaurant.setLat(lat);
                        restaurant.setLng(lng);
                        if (restaurant.getRoadAddress() == null || restaurant.getRoadAddress().isEmpty()) {
                            restaurant.setRoadAddress(roadAddress);
                        }
                        if (phone != null && !phone.isEmpty()) {
                            restaurant.setPhoneNumber(phone);
                        }
                        if (category != null && !category.isEmpty()) {
                            restaurant.setCategory(category);
                        }
                        
                        restaurantService.updateRestaurant(restaurant);
                        log.info("✅ Updated coordinates for {} (query: {}): lat={}, lng={}, address={}, phone={}, category={}", 
                            restaurant.getRestaurantName(), searchQuery, lat, lng, roadAddress, phone, category);
                        
                        found = true;
                        break; // 성공하면 더 이상 시도 안 함
                    } else {
                        log.warn("❌ No location data found for query: {}", searchQuery);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Error searching with query '{}': {}", searchQuery, e.getMessage());
                }
                
                // API 키 로테이션으로 딜레이 단축 (429 에러 방지)
                Thread.sleep(500); // 0.5초 딜레이로 429 에러 확률 감소
            }
            
            if (!found) {
                log.warn("❌ Failed to find coordinates for {} after trying all search methods", 
                    restaurant.getRestaurantName());
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to update coordinates for {}: {}", 
                restaurant.getRestaurantName(), e.getMessage(), e);
        }
    }
    
    
    /**
     * 키워드로 식당 검색 (검색 경로)
     * GET /api/restaurants/search?keyword=검색어
     */
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurantsByPath(@RequestParam String keyword) {
        log.info("Search endpoint called with keyword: {}", keyword);
        ResponseEntity<List<Restaurant>> response = searchRestaurants(keyword);
        log.info("Search response: status={}, body size={}", 
            response.getStatusCode(), 
            response.getBody() != null ? response.getBody().size() : 0);
        return response;
    }
    
    /**
     * 지역명으로 식당 검색
     * GET /api/restaurants/region?region=지역명
     */
    @GetMapping("/region")
    public ResponseEntity<List<Restaurant>> searchRestaurantsByRegion(@RequestParam String region) {
        log.info("Region search request received for region: {}", region);
        
        if (region == null || region.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Restaurant> restaurants = restaurantService.searchRestaurantsByRegion(region.trim());
            log.info("Found {} restaurants for region: {}", restaurants.size(), region);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error searching restaurants for region {}: {}", region, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 식당명으로 식당 검색
     * GET /api/restaurants/name?name=식당명
     */
    @GetMapping("/name")
    public ResponseEntity<List<Restaurant>> searchRestaurantsByName(@RequestParam String name) {
        log.info("Name search request received for name: {}", name);
        
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Restaurant> restaurants = restaurantService.searchRestaurantsByName(name.trim());
            log.info("Found {} restaurants for name: {}", restaurants.size(), name);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error searching restaurants for name {}: {}", name, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 식당 검색 (코드 또는 이름으로 검색)
     * GET /api/restaurants/search-for-signup?query=검색어&type=code|name
     * 회원가입 시 식당 선택용
     * type: 'code' (식당 코드로 검색) 또는 'name' (식당 이름으로 검색)
     * 주의: 이 경로는 /{id}보다 먼저 선언되어야 함
     */
    @GetMapping("/search-for-signup")
    public ResponseEntity<List<Map<String, Object>>> searchRestaurantsForSignup(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "code") String type) {
        log.info("Search restaurants for signup with query: {}, type: {}", query, type);
        
        try {
            List<Restaurant> restaurants = new ArrayList<>();
            
            if (query == null || query.trim().isEmpty()) {
                log.warn("Empty query provided");
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            String trimmedQuery = query.trim();
            
            if ("code".equalsIgnoreCase(type)) {
                // 식당 코드로 검색 (restaurant_code)
                if (trimmedQuery.matches("\\d+")) {
                    Long codeQuery = Long.parseLong(trimmedQuery);
                    Optional<Restaurant> byCode = restaurantService.getRestaurantByCode(codeQuery);
                    if (byCode.isPresent()) {
                        restaurants.add(byCode.get());
                    }
                } else {
                    log.warn("Invalid code format: {}", trimmedQuery);
                }
            } else if ("name".equalsIgnoreCase(type)) {
                // 식당 이름으로 검색
                restaurants = restaurantService.searchRestaurants(trimmedQuery);
            } else {
                log.warn("Invalid search type: {}", type);
                return ResponseEntity.badRequest().build();
            }
            
            // 응답 형식 변환 (가게 이름/지점/주소 포함)
            List<Map<String, Object>> result = new ArrayList<>();
            for (Restaurant restaurant : restaurants) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", restaurant.getId());
                item.put("restaurantCode", restaurant.getRestaurantCode());
                item.put("restaurantName", restaurant.getRestaurantName());
                item.put("branchName", restaurant.getBranchName());
                item.put("roadAddress", restaurant.getRoadAddress());
                item.put("regionName", restaurant.getRegionName());
                result.add(item);
            }
            
            log.info("Found {} restaurants for signup (type: {})", result.size(), type);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error searching restaurants for signup: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 식당 상세 정보 조회
     * GET /api/restaurants/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        log.info("Restaurant detail request received for id: {}", id);
        
        try {
            Optional<Restaurant> restaurant = restaurantService.getRestaurantById(id);
            if (restaurant.isPresent()) {
                log.info("Restaurant found: {}", restaurant.get().getRestaurantName());
                return ResponseEntity.ok(restaurant.get());
            } else {
                log.warn("Restaurant not found for id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving restaurant with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 가게 ID로 가게 이름 조회 (예약용)
     * GET /api/restaurants/{id}/name
     */
    @GetMapping("/{id}/name")
    public ResponseEntity<String> getRestaurantNameById(@PathVariable Long id) {
        log.info("Restaurant name request received for id: {}", id);
        
        try {
            Optional<Restaurant> restaurant = restaurantService.getRestaurantById(id);
            if (restaurant.isPresent()) {
                String restaurantName = restaurant.get().getRestaurantName();
                if (restaurant.get().getBranchName() != null && !restaurant.get().getBranchName().trim().isEmpty()) {
                    restaurantName += " " + restaurant.get().getBranchName();
                }
                log.info("Restaurant name found: {}", restaurantName);
                return ResponseEntity.ok(restaurantName);
            } else {
                log.warn("Restaurant not found for id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving restaurant name with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 식당 조회 (개발/테스트용)
     * GET /api/restaurants/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        log.info("All restaurants request received");
        
        try {
            List<Restaurant> restaurants = restaurantService.getAllRestaurants();
            log.info("Retrieved {} restaurants", restaurants.size());
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error retrieving all restaurants: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 키워드로 식당 삭제 (개발/테스트용)
     * DELETE /api/restaurants?keyword=검색어
     */
    @DeleteMapping
    public ResponseEntity<String> deleteRestaurantsByKeyword(@RequestParam String keyword) {
        log.info("Delete request received for keyword: {}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Keyword is required");
        }
        
        try {
            int deletedCount = restaurantService.deleteRestaurantsByKeyword(keyword.trim());
            log.info("Deleted {} restaurants for keyword: {}", deletedCount, keyword);
            return ResponseEntity.ok("Deleted " + deletedCount + " restaurants for keyword: " + keyword);
        } catch (Exception e) {
            log.error("Error deleting restaurants for keyword {}: {}", keyword, e.getMessage());
            return ResponseEntity.internalServerError().body("Error deleting restaurants: " + e.getMessage());
        }
    }
    
    /**
     * 좌표가 없는 식당들 삭제 (데이터베이스 크기 절약)
     * DELETE /api/restaurants/cleanup/without-coordinates
     */
    @DeleteMapping("/cleanup/without-coordinates")
    public ResponseEntity<Map<String, Object>> deleteRestaurantsWithoutCoordinates() {
        log.info("Delete request received for restaurants without coordinates");
        
        try {
            // 삭제 전 통계
            Map<String, Long> beforeStats = restaurantService.getCoordinateStatistics();
            long beforeCount = beforeStats.get("withoutCoordinates");
            
            // 삭제 실행
            int deletedCount = restaurantService.deleteRestaurantsWithoutCoordinates();
            
            // 삭제 후 통계
            Map<String, Long> afterStats = restaurantService.getCoordinateStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("deletedCount", deletedCount);
            response.put("beforeStats", beforeStats);
            response.put("afterStats", afterStats);
            response.put("message", "Successfully deleted " + deletedCount + " restaurants without coordinates");
            
            log.info("Deleted {} restaurants without coordinates. Before: {}, After: {}", 
                    deletedCount, beforeCount, afterStats.get("withoutCoordinates"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting restaurants without coordinates: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error deleting restaurants: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * 좌표 통계 조회
     * GET /api/restaurants/statistics/coordinates
     */
    @GetMapping("/statistics/coordinates")
    public ResponseEntity<Map<String, Long>> getCoordinateStatistics() {
        log.info("Coordinate statistics request received");
        
        try {
            Map<String, Long> stats = restaurantService.getCoordinateStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting coordinate statistics: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 카카오 API 프록시 - 장소 검색
     * GET /api/restaurants/kakao/search?query=검색어
     */
    @GetMapping("/kakao/search")
    public Mono<ResponseEntity<String>> searchKakaoPlaces(@RequestParam(required = false) String query) {
        log.info("Kakao API proxy request for query: {}", query);
        
        if (query == null || query.trim().isEmpty()) {
            log.warn("Query parameter is missing or empty");
            return Mono.just(ResponseEntity.badRequest().body("{\"error\":\"Query parameter is required\"}"));
        }
        
        try {
            String kakaoApiKey = getNextApiKey(); // 로테이션 API 키
            
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("dapi.kakao.com")
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", query)
                            .queryParam("category_group_code", "FD6") // 음식점 카테고리
                            .queryParam("size", "15") // 최대 15개 결과
                            .build())
                    .header("Authorization", kakaoApiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(ResponseEntity::ok)
                    .doOnSuccess(response -> log.info("Kakao API response received for query: {}", query))
                    .doOnError(error -> log.error("Kakao API error for query {}: {}", query, error.getMessage()))
                    .onErrorReturn(ResponseEntity.internalServerError().body("{\"error\":\"Kakao API call failed\"}"));
                    
        } catch (Exception e) {
            log.error("Error calling Kakao API for query {}: {}", query, e.getMessage(), e);
            return Mono.just(ResponseEntity.internalServerError().body("{\"error\":\"Error calling Kakao API: " + e.getMessage() + "\"}"));
        }
    }
    
    /**
     * 카카오 API 프록시 테스트용 - 간단한 응답
     * GET /api/restaurants/kakao/test?query=검색어
     */
    @GetMapping("/kakao/test")
    public ResponseEntity<String> testKakaoProxy(@RequestParam(required = false) String query) {
        log.info("Kakao API test request for query: {}", query);
        
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\":\"Query parameter is required\"}");
        }
        
        // 간단한 테스트 응답
        String testResponse = String.format(
            "{\"test\":\"success\",\"query\":\"%s\",\"message\":\"카카오 API 프록시 테스트 성공\"}", 
            query
        );
        
        return ResponseEntity.ok(testResponse);
    }
    
    /**
     * 배치 좌표 업데이트 - 429 에러 방지 포함
     * POST /api/restaurants/batch-update-coordinates
     * 
     * 좌표가 없는 모든 식당의 좌표를 한번에 업데이트합니다.
     * API 키 로테이션, 적절한 딜레이, 429 에러 재시도 로직이 포함되어 있습니다.
     * 
     * 참고: 일부 식당은 Kakao API에서 찾을 수 없을 수 있습니다 (정상).
     */
    @PostMapping("/batch-update-coordinates")
    public ResponseEntity<Map<String, Object>> batchUpdateCoordinates(
            @RequestParam(required = false, defaultValue = "1500") long delayMs) {
        log.info("Batch coordinate update started with delay: {}ms", delayMs);
        
        Map<String, Object> result = new HashMap<>();
        List<Restaurant> restaurantsWithoutCoordinates = restaurantService.findAllRestaurantsWithoutCoordinates();
        
        if (restaurantsWithoutCoordinates.isEmpty()) {
            result.put("message", "좌표가 없는 식당이 없습니다. 모든 식당이 이미 좌표를 가지고 있습니다.");
            result.put("total", 0);
            result.put("success", 0);
            result.put("failed", 0);
            result.put("skipped", 0);
            return ResponseEntity.ok(result);
        }
        
        int total = restaurantsWithoutCoordinates.size();
        int success = 0;
        int failed = 0;
        int skipped = 0;
        
        log.info("Found {} restaurants without coordinates. Starting batch update...", total);
        
        for (int i = 0; i < restaurantsWithoutCoordinates.size(); i++) {
            Restaurant restaurant = restaurantsWithoutCoordinates.get(i);
            
            try {
                log.info("Processing {}/{}: {}", i + 1, total, restaurant.getRestaurantName());
                
                // 이미 좌표가 있는 경우 스킵
                if (restaurant.getLat() != null && restaurant.getLng() != null && 
                    restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                    skipped++;
                    log.info("✅ Skipped (already has coordinates): {}", restaurant.getRestaurantName());
                    continue;
                }
                
                // 좌표 업데이트 (429 에러 재시도 포함)
                boolean updated = updateRestaurantCoordinatesWithRetry(restaurant);
                
                if (updated) {
                    success++;
                    log.info("✅ Successfully updated {}/{}: {}", i + 1, total, restaurant.getRestaurantName());
                } else {
                    failed++;
                    log.warn("❌ Failed to update {}/{}: {}", i + 1, total, restaurant.getRestaurantName());
                }
                
                // 진행 상황 로깅 (10개마다)
                if ((i + 1) % 10 == 0) {
                    log.info("📊 Progress: {}/{} (Success: {}, Failed: {}, Skipped: {})", 
                        i + 1, total, success, failed, skipped);
                }
                
                // API 호출 제한 방지: 딜레이 (마지막 항목 제외)
                if (i < restaurantsWithoutCoordinates.size() - 1) {
                    Thread.sleep(delayMs); // 기본 1.5초 딜레이
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Batch update interrupted");
                break;
            } catch (Exception e) {
                failed++;
                log.error("❌ Error processing {}/{} ({}): {}", 
                    i + 1, total, restaurant.getRestaurantName(), e.getMessage());
            }
        }
        
        result.put("message", "배치 좌표 업데이트 완료");
        result.put("total", total);
        result.put("success", success);
        result.put("failed", failed);
        result.put("skipped", skipped);
        
        log.info("✅ Batch update completed. Total: {}, Success: {}, Failed: {}, Skipped: {}", 
            total, success, failed, skipped);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 429 에러 재시도 로직이 포함된 좌표 업데이트
     */
    private boolean updateRestaurantCoordinatesWithRetry(Restaurant restaurant) {
        int maxRetries = 3;
        long baseDelay = 1500; // 기본 딜레이 1.5초
        long retryDelay = 30000; // 429 에러 시 30초 대기
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 원래 업데이트 로직 호출
                updateSingleRestaurantCoordinates(restaurant);
                
                // 업데이트 성공 확인
                if (restaurant.getLat() != null && restaurant.getLng() != null && 
                    restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
                    return true;
                }
                
                // 결과가 없으면 다음 시도
                if (attempt < maxRetries) {
                    log.warn("⚠️ No coordinates found for {} (attempt {}/{})", 
                        restaurant.getRestaurantName(), attempt, maxRetries);
                    Thread.sleep(baseDelay * attempt); // 점진적 딜레이
                }
                
            } catch (org.springframework.web.reactive.function.client.WebClientResponseException.TooManyRequests e) {
                // 429 에러: 긴 대기 시간
                log.warn("⚠️ 429 Too Many Requests error for {} (attempt {}/{}). Waiting {} seconds...", 
                    restaurant.getRestaurantName(), attempt, maxRetries, retryDelay / 1000);
                
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay);
                        // API 키 인덱스도 다음으로 이동 (로테이션)
                        currentApiKeyIndex = (currentApiKeyIndex + 1) % KAKAO_API_KEYS.length;
                        log.info("Switched to next API key. Retrying...");
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return false;
                    }
                } else {
                    log.error("❌ Max retries reached for {} due to 429 error", restaurant.getRestaurantName());
                    return false;
                }
                
            } catch (Exception e) {
                // 기타 에러
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    // 429 에러가 메시지에 포함된 경우
                    log.warn("⚠️ 429 error detected in message for {} (attempt {}/{}). Waiting...", 
                        restaurant.getRestaurantName(), attempt, maxRetries);
                    
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(retryDelay);
                            currentApiKeyIndex = (currentApiKeyIndex + 1) % KAKAO_API_KEYS.length;
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return false;
                        }
                    }
                } else {
                    log.warn("⚠️ Error updating {} (attempt {}/{}): {}", 
                        restaurant.getRestaurantName(), attempt, maxRetries, e.getMessage());
                    
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(baseDelay * attempt);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return false;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 식당 정보 업데이트
     * PUT /api/restaurants/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        log.info("Restaurant update request received for id: {}", id);
        
        try {
            // ID가 일치하는지 확인
            if (!id.equals(restaurant.getId())) {
                log.warn("ID mismatch: path variable {} vs request body {}", id, restaurant.getId());
                return ResponseEntity.badRequest().build();
            }
            
            // 식당이 존재하는지 확인
            Optional<Restaurant> existingRestaurant = restaurantService.getRestaurantById(id);
            if (!existingRestaurant.isPresent()) {
                log.warn("Restaurant not found for id: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // 식당 정보 업데이트
            Restaurant updatedRestaurant = restaurantService.updateRestaurant(restaurant);
            log.info("Restaurant updated successfully: {}", updatedRestaurant.getRestaurantName());
            
            return ResponseEntity.ok(updatedRestaurant);
        } catch (Exception e) {
            log.error("Error updating restaurant with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    
}

