package com.example.choprest.controller;

import com.example.choprest.entity.Menu;
import com.example.choprest.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MenuController {
    
    private final MenuRepository menuRepository;
    private final WebClient webClient;
    
    /**
     * 특정 매장의 메뉴 목록 조회
     * GET /api/menus?storeId=1
     */
    @GetMapping
    public ResponseEntity<List<Menu>> getMenusByStore(@RequestParam Long storeId) {
        log.info("Getting menus for store: {}", storeId);
        
        try {
            List<Menu> menus = menuRepository.findByStoreIdAndIsAvailableTrueOrderBySortOrderAsc(storeId);
            log.info("Found {} menus for store: {}", menus.size(), storeId);
            
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            log.error("Error getting menus for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 인기 메뉴 조회
     * GET /api/menus/popular?storeId=1
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Menu>> getPopularMenus(@RequestParam Long storeId) {
        log.info("Getting popular menus for store: {}", storeId);
        
        try {
            List<Menu> menus = menuRepository.findByStoreIdAndIsPopularTrueOrderBySortOrderAsc(storeId);
            log.info("Found {} popular menus for store: {}", menus.size(), storeId);
            
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            log.error("Error getting popular menus for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 추천 메뉴 조회
     * GET /api/menus/recommended?storeId=1
     */
    @GetMapping("/recommended")
    public ResponseEntity<List<Menu>> getRecommendedMenus(@RequestParam Long storeId) {
        log.info("Getting recommended menus for store: {}", storeId);
        
        try {
            List<Menu> menus = menuRepository.findByStoreIdAndIsRecommendedTrueOrderBySortOrderAsc(storeId);
            log.info("Found {} recommended menus for store: {}", menus.size(), storeId);
            
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            log.error("Error getting recommended menus for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 카테고리별 메뉴 조회
     * GET /api/menus/category?storeId=1&category=메인
     */
    @GetMapping("/category")
    public ResponseEntity<List<Menu>> getMenusByCategory(
            @RequestParam Long storeId, 
            @RequestParam String category) {
        log.info("Getting menus for store: {} and category: {}", storeId, category);
        
        try {
            List<Menu> menus = menuRepository.findByStoreIdAndCategoryOrderBySortOrderAsc(storeId, category);
            log.info("Found {} menus for store: {} and category: {}", menus.size(), storeId, category);
            
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            log.error("Error getting menus for store {} and category {}: {}", storeId, category, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 매장의 메뉴 카테고리 목록 조회
     * GET /api/menus/categories?storeId=1
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getMenuCategories(@RequestParam Long storeId) {
        log.info("Getting menu categories for store: {}", storeId);
        
        try {
            List<String> categories = menuRepository.findDistinctCategoriesByStoreId(storeId);
            log.info("Found {} categories for store: {}", categories.size(), storeId);
            
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error getting menu categories for store {}: {}", storeId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 메뉴 상세 조회
     * GET /api/menus/{menuId}
     */
    @GetMapping("/{menuId}")
    public ResponseEntity<Menu> getMenuById(@PathVariable Long menuId) {
        log.info("Getting menu by id: {}", menuId);
        
        try {
            Optional<Menu> menu = menuRepository.findById(menuId);
            if (menu.isPresent()) {
                log.info("Found menu: {}", menu.get().getName());
                return ResponseEntity.ok(menu.get());
            } else {
                log.warn("Menu not found with id: {}", menuId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting menu by id {}: {}", menuId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}





