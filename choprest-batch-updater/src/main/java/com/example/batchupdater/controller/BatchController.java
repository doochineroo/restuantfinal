package com.example.batchupdater.controller;

import com.example.batchupdater.entity.Restaurant;
import com.example.batchupdater.repository.RestaurantRepository;
import com.example.batchupdater.service.LocationUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
@Slf4j
public class BatchController {
    
    private final LocationUpdateService locationUpdateService;
    private final RestaurantRepository restaurantRepository;
    
    /**
     * 전체 식당 위치 정보 업데이트 시작
     */
    @PostMapping("/update-locations")
    public ResponseEntity<Map<String, Object>> updateAllLocations() {
        log.info("Starting batch location update via API");
        
        try {
            LocationUpdateService.BatchResult result = locationUpdateService.updateAllRestaurantLocations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Batch location update completed");
            response.put("result", result);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during batch location update", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Batch location update failed: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 위치 정보 업데이트 상태 조회
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        try {
            long totalRestaurants = restaurantRepository.countAllRestaurants();
            long restaurantsWithLocation = restaurantRepository.countRestaurantsWithLocation();
            long restaurantsWithoutLocation = totalRestaurants - restaurantsWithLocation;
            
            double completionRate = totalRestaurants > 0 ? 
                (double) restaurantsWithLocation / totalRestaurants * 100 : 0;
            
            Map<String, Object> status = new HashMap<>();
            status.put("totalRestaurants", totalRestaurants);
            status.put("restaurantsWithLocation", restaurantsWithLocation);
            status.put("restaurantsWithoutLocation", restaurantsWithoutLocation);
            status.put("completionRate", String.format("%.2f%%", completionRate));
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error getting status", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get status: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 위치 정보가 없는 식당 목록 조회
     */
    @GetMapping("/restaurants-without-location")
    public ResponseEntity<List<Restaurant>> getRestaurantsWithoutLocation(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            List<Restaurant> restaurants = restaurantRepository.findRestaurantsWithoutLocation();
            
            // 간단한 페이징 (실제로는 Pageable 사용 권장)
            int start = page * size;
            int end = Math.min(start + size, restaurants.size());
            
            if (start >= restaurants.size()) {
                return ResponseEntity.ok(List.of());
            }
            
            List<Restaurant> pagedRestaurants = restaurants.subList(start, end);
            return ResponseEntity.ok(pagedRestaurants);
        } catch (Exception e) {
            log.error("Error getting restaurants without location", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 위치 정보가 있는 식당 목록 조회
     */
    @GetMapping("/restaurants-with-location")
    public ResponseEntity<List<Restaurant>> getRestaurantsWithLocation(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            List<Restaurant> restaurants = restaurantRepository.findRestaurantsWithLocation();
            
            // 간단한 페이징
            int start = page * size;
            int end = Math.min(start + size, restaurants.size());
            
            if (start >= restaurants.size()) {
                return ResponseEntity.ok(List.of());
            }
            
            List<Restaurant> pagedRestaurants = restaurants.subList(start, end);
            return ResponseEntity.ok(pagedRestaurants);
        } catch (Exception e) {
            log.error("Error getting restaurants with location", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API 키 테스트
     */
    @GetMapping("/test-api")
    public ResponseEntity<Map<String, Object>> testApi() {
        try {
            // 간단한 테스트 쿼리로 API 키 검증
            boolean result = locationUpdateService.testApiKeys();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", result);
            response.put("message", result ? "API keys are working" : "API keys failed");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error testing API keys", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "API test failed: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 특정 식당의 위치 정보 수동 업데이트
     */
    @PostMapping("/update-restaurant/{id}")
    public ResponseEntity<Map<String, Object>> updateRestaurantLocation(@PathVariable Long id) {
        try {
            Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
            
            boolean updated = locationUpdateService.updateRestaurantLocation(restaurant);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", updated);
            response.put("message", updated ? "Location updated successfully" : "No location found for this restaurant");
            response.put("restaurant", restaurant);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating restaurant location for id: {}", id, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update restaurant location: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
