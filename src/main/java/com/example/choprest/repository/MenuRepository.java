package com.example.choprest.repository;

import com.example.choprest.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    List<Menu> findByStoreIdOrderBySortOrderAsc(Long storeId);
    
    List<Menu> findByStoreIdAndIsAvailableTrueOrderBySortOrderAsc(Long storeId);
    
    List<Menu> findByStoreIdAndIsPopularTrueOrderBySortOrderAsc(Long storeId);
    
    List<Menu> findByStoreIdAndIsRecommendedTrueOrderBySortOrderAsc(Long storeId);
    
    List<Menu> findByStoreIdAndCategoryOrderBySortOrderAsc(Long storeId, String category);
    
    @Query("SELECT DISTINCT m.category FROM Menu m WHERE m.storeId = :storeId AND m.category IS NOT NULL ORDER BY m.category")
    List<String> findDistinctCategoriesByStoreId(@Param("storeId") Long storeId);
}
