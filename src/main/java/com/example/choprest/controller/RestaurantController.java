package com.example.choprest.controller;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // CORS 설정
public class RestaurantController {
    
    private final RestaurantService restaurantService;
    private final WebClient webClient;
    
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
                
                // 실시간으로 좌표 업데이트 (동기 처리) - 모든 식당 처리
                for (Restaurant restaurant : prioritizedList) {
                    try {
                        updateSingleRestaurantCoordinates(restaurant);
                        updatedRestaurants.add(restaurant);
                        
                        // API 호출 제한 방지를 위한 짧은 딜레이
                        Thread.sleep(100); // 100ms 딜레이
                    } catch (Exception e) {
                        log.error("Error updating coordinates for restaurant {}: {}", 
                            restaurant.getRestaurantName(), e.getMessage());
                        // 좌표 업데이트 실패해도 원본 데이터는 포함
                        updatedRestaurants.add(restaurant);
                    }
                }
            }
            
            // 4. 업데이트된 데이터 반환
            log.info("Returning {} total restaurants ({} with coordinates, {} without coordinates)", 
                updatedRestaurants.size(),
                updatedRestaurants.stream().mapToInt(r -> (r.getLat() != null && r.getLng() != null) ? 1 : 0).sum(),
                updatedRestaurants.stream().mapToInt(r -> (r.getLat() == null || r.getLng() == null) ? 1 : 0).sum());
            
            return ResponseEntity.ok(updatedRestaurants);
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
            final String kakaoApiKey = "KakaoAK 0daaba62d376e0a4633352753a28827c";
            
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
                    
                    // JSON 파싱
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(response);
                    
                    if (jsonNode.has("documents") && jsonNode.get("documents").size() > 0) {
                        com.fasterxml.jackson.databind.JsonNode firstResult = jsonNode.get("documents").get(0);
                        
                        Double lat = firstResult.get("y").asDouble();
                        Double lng = firstResult.get("x").asDouble();
                        String roadAddress = firstResult.has("road_address_name") && 
                                           !firstResult.get("road_address_name").isNull() ? 
                                           firstResult.get("road_address_name").asText() : 
                                           firstResult.get("address_name").asText();
                        String phone = firstResult.has("phone") && !firstResult.get("phone").isNull() ? 
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
                
                // API 호출 간 짧은 딜레이
                Thread.sleep(50);
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
            String kakaoApiKey = "KakaoAK 0daaba62d376e0a4633352753a28827c"; // REST API 키
            
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
    
    
}

