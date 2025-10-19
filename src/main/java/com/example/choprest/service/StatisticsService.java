package com.example.choprest.service;

import com.example.choprest.entity.Restaurant;
import com.example.choprest.entity.RestaurantClick;
import com.example.choprest.entity.SearchKeyword;
import com.example.choprest.repository.RestaurantClickRepository;
import com.example.choprest.repository.RestaurantRepository;
import com.example.choprest.repository.SearchKeywordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 클릭/검색 통계 서비스
 */
@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final RestaurantClickRepository clickRepository;
    private final SearchKeywordRepository keywordRepository;
    private final RestaurantRepository restaurantRepository;
    
    /**
     * 식당 클릭 기록
     */
    @Transactional
    public void recordClick(Long restaurantId, Long userId) {
        RestaurantClick click = RestaurantClick.builder()
                .restaurantId(restaurantId)
                .userId(userId)
                .build();
        clickRepository.save(click);
        
        // 식당 조회수 증가
        restaurantRepository.findById(restaurantId).ifPresent(restaurant -> {
            // view_count 증가 로직은 Restaurant 엔티티에 필드 추가 필요
            restaurantRepository.save(restaurant);
        });
    }
    
    /**
     * 검색어 기록 (이미 있으면 카운트 증가)
     */
    @Transactional
    public void recordSearch(String keyword) {
        recordSearch(keyword, null, null, null, "KEYWORD", 0);
    }
    
    /**
     * 상세 검색어 기록
     */
    @Transactional
    public void recordSearch(String keyword, Long userId, String category, String region, String searchType, int resultCount) {
        SearchKeyword searchKeyword = keywordRepository.findByKeyword(keyword)
                .orElse(SearchKeyword.builder()
                        .keyword(keyword)
                        .searchCount(0)
                        .resultCount(0)
                        .searchType(searchType)
                        .build());
        
        searchKeyword.setSearchCount(searchKeyword.getSearchCount() + 1);
        searchKeyword.setResultCount(resultCount);
        searchKeyword.setLastSearchedAt(LocalDateTime.now());
        
        if (userId != null) {
            searchKeyword.setUserId(userId);
        }
        if (category != null) {
            searchKeyword.setCategory(category);
        }
        if (region != null) {
            searchKeyword.setRegion(region);
        }
        
        keywordRepository.save(searchKeyword);
    }
    
    /**
     * 인기 식당 조회 (최근 30일 기준)
     */
    @Transactional(readOnly = true)
    public List<Restaurant> getPopularRestaurants(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        List<Object[]> results = clickRepository.findPopularRestaurants(thirtyDaysAgo);
        
        List<Long> restaurantIds = results.stream()
                .limit(limit)
                .map(result -> (Long) result[0])
                .collect(Collectors.toList());
        
        return restaurantRepository.findAllById(restaurantIds);
    }
    
    /**
     * 인기 식당 조회 (클릭 수와 함께)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPopularRestaurantsWithClickCount(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        List<Object[]> results = clickRepository.findPopularRestaurants(thirtyDaysAgo);
        
        List<Map<String, Object>> popularRestaurants = new ArrayList<>();
        
        for (Object[] result : results.stream().limit(limit).collect(Collectors.toList())) {
            Long restaurantId = (Long) result[0];
            Long clickCount = (Long) result[1];
            
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            if (restaurant != null) {
                Map<String, Object> restaurantData = new HashMap<>();
                restaurantData.put("restaurant", restaurant);
                restaurantData.put("clickCount", clickCount);
                popularRestaurants.add(restaurantData);
            }
        }
        
        return popularRestaurants;
    }
    
    /**
     * 최근 7일 인기 식당
     */
    @Transactional(readOnly = true)
    public List<Restaurant> getRecentPopularRestaurants(int limit) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        
        List<Object[]> results = clickRepository.findPopularRestaurants(sevenDaysAgo);
        
        List<Long> restaurantIds = results.stream()
                .limit(limit)
                .map(result -> (Long) result[0])
                .collect(Collectors.toList());
        
        return restaurantRepository.findAllById(restaurantIds);
    }
    
    /**
     * 오늘 인기 식당
     */
    @Transactional(readOnly = true)
    public List<Restaurant> getTodayPopularRestaurants(int limit) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        
        List<Object[]> results = clickRepository.findPopularRestaurants(today);
        
        List<Long> restaurantIds = results.stream()
                .limit(limit)
                .map(result -> (Long) result[0])
                .collect(Collectors.toList());
        
        return restaurantRepository.findAllById(restaurantIds);
    }
    
    /**
     * 인기 검색어 조회 (최근 30일 기준)
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getPopularKeywords(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return keywordRepository.findPopularKeywords(thirtyDaysAgo)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리별 인기 검색어
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getPopularKeywordsByCategory(String category, int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return keywordRepository.findPopularKeywordsByCategory(thirtyDaysAgo, category)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 지역별 인기 검색어
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getPopularKeywordsByRegion(String region, int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return keywordRepository.findPopularKeywordsByRegion(thirtyDaysAgo, region)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자별 검색 기록
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getUserSearchHistory(Long userId) {
        return keywordRepository.findUserSearchHistory(userId);
    }
    
    /**
     * 성공적인 검색어 (결과가 많은 검색)
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getSuccessfulKeywords(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return keywordRepository.findSuccessfulKeywords(thirtyDaysAgo)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 실패한 검색어 (결과가 없는 검색)
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getFailedKeywords(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return keywordRepository.findFailedKeywords(thirtyDaysAgo)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 최근 검색어
     */
    @Transactional(readOnly = true)
    public List<SearchKeyword> getRecentKeywords(int limit) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return keywordRepository.findRecentKeywords(sevenDaysAgo)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * 검색어 자동완성
     */
    @Transactional(readOnly = true)
    public List<String> getKeywordSuggestions(String keyword) {
        return keywordRepository.findKeywordsContaining(keyword)
                .stream()
                .limit(10)
                .collect(Collectors.toList());
    }
}


