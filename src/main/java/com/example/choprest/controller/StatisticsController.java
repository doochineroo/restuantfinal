package com.example.choprest.controller;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.entity.SearchKeyword;
import com.example.choprest.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 통계 API 컨트롤러
 */
@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    /**
     * 식당 클릭 기록
     */
    @PostMapping("/click")
    public ResponseEntity<Void> recordClick(@RequestBody Map<String, Long> request) {
        Long restaurantId = request.get("restaurantId");
        Long userId = request.get("userId"); // null 가능 (비로그인)
        
        statisticsService.recordClick(restaurantId, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 검색어 기록 (기본)
     */
    @PostMapping("/search")
    public ResponseEntity<Void> recordSearch(@RequestBody Map<String, String> request) {
        String keyword = request.get("keyword");
        statisticsService.recordSearch(keyword);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 상세 검색어 기록
     */
    @PostMapping("/search/detailed")
    public ResponseEntity<Void> recordDetailedSearch(@RequestBody Map<String, Object> request) {
        String keyword = (String) request.get("keyword");
        Long userId = request.get("userId") != null ? Long.valueOf(request.get("userId").toString()) : null;
        String category = (String) request.get("category");
        String region = (String) request.get("region");
        String searchType = (String) request.getOrDefault("searchType", "KEYWORD");
        Integer resultCount = request.get("resultCount") != null ? 
            Integer.valueOf(request.get("resultCount").toString()) : 0;
        
        statisticsService.recordSearch(keyword, userId, category, region, searchType, resultCount);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 인기 식당 조회 (TOP 10)
     */
    @GetMapping("/popular-restaurants")
    public ResponseEntity<List<Restaurant>> getPopularRestaurants(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getPopularRestaurants(limit));
    }
    
    /**
     * 인기 식당 조회 (클릭 수와 함께)
     */
    @GetMapping("/popular-restaurants-with-count")
    public ResponseEntity<List<Map<String, Object>>> getPopularRestaurantsWithClickCount(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getPopularRestaurantsWithClickCount(limit));
    }
    
    /**
     * 최근 7일 인기 식당
     */
    @GetMapping("/recent-popular-restaurants")
    public ResponseEntity<List<Restaurant>> getRecentPopularRestaurants(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getRecentPopularRestaurants(limit));
    }
    
    /**
     * 오늘 인기 식당
     */
    @GetMapping("/today-popular-restaurants")
    public ResponseEntity<List<Restaurant>> getTodayPopularRestaurants(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getTodayPopularRestaurants(limit));
    }
    
    /**
     * 인기 검색어 조회 (TOP 10)
     */
    @GetMapping("/popular-keywords")
    public ResponseEntity<List<SearchKeyword>> getPopularKeywords(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getPopularKeywords(limit));
    }
    
    /**
     * 카테고리별 인기 검색어
     */
    @GetMapping("/popular-keywords/category/{category}")
    public ResponseEntity<List<SearchKeyword>> getPopularKeywordsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getPopularKeywordsByCategory(category, limit));
    }
    
    /**
     * 지역별 인기 검색어
     */
    @GetMapping("/popular-keywords/region/{region}")
    public ResponseEntity<List<SearchKeyword>> getPopularKeywordsByRegion(
            @PathVariable String region,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getPopularKeywordsByRegion(region, limit));
    }
    
    /**
     * 사용자별 검색 기록
     */
    @GetMapping("/search-history/{userId}")
    public ResponseEntity<List<SearchKeyword>> getUserSearchHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(statisticsService.getUserSearchHistory(userId));
    }
    
    /**
     * 성공적인 검색어 (결과가 많은 검색)
     */
    @GetMapping("/successful-keywords")
    public ResponseEntity<List<SearchKeyword>> getSuccessfulKeywords(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getSuccessfulKeywords(limit));
    }
    
    /**
     * 실패한 검색어 (결과가 없는 검색)
     */
    @GetMapping("/failed-keywords")
    public ResponseEntity<List<SearchKeyword>> getFailedKeywords(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getFailedKeywords(limit));
    }
    
    /**
     * 최근 검색어
     */
    @GetMapping("/recent-keywords")
    public ResponseEntity<List<SearchKeyword>> getRecentKeywords(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getRecentKeywords(limit));
    }
    
    /**
     * 검색어 자동완성
     */
    @GetMapping("/keyword-suggestions")
    public ResponseEntity<List<String>> getKeywordSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(statisticsService.getKeywordSuggestions(keyword));
    }
}


