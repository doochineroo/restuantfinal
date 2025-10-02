package com.example.choprest.controller;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
     * 키워드로 식당 검색
     * GET /api/restaurants?keyword=검색어
     */
    @GetMapping
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String keyword) {
        log.info("Search request received for keyword: {}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Restaurant> restaurants = restaurantService.searchRestaurants(keyword.trim());
            log.info("Found {} restaurants for keyword: {}", restaurants.size(), keyword);
            return ResponseEntity.ok(restaurants);
        } catch (Exception e) {
            log.error("Error searching restaurants for keyword {}: {}", keyword, e.getMessage());
            return ResponseEntity.internalServerError().build();
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

