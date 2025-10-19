package com.example.choprest.controller;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 찜 API 컨트롤러
 */
@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    /**
     * 찜 추가
     */
    @PostMapping
    public ResponseEntity<Void> addFavorite(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long restaurantId = request.get("restaurantId");
        
        favoriteService.addFavorite(userId, restaurantId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 찜 제거
     */
    @DeleteMapping
    public ResponseEntity<Void> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long restaurantId) {
        favoriteService.removeFavorite(userId, restaurantId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 찜 토글
     */
    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long restaurantId = request.get("restaurantId");
        
        boolean isFavorited = favoriteService.toggleFavorite(userId, restaurantId);
        return ResponseEntity.ok(Map.of("isFavorited", isFavorited));
    }
    
    /**
     * 사용자의 찜 목록 조회
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Restaurant>> getUserFavorites(@PathVariable Long userId) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId));
    }
    
    /**
     * 찜 여부 확인
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @RequestParam Long userId,
            @RequestParam Long restaurantId) {
        boolean isFavorite = favoriteService.isFavorite(userId, restaurantId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}


