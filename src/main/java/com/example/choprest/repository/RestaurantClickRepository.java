package com.example.choprest.repository;

import com.example.choprest.entity.RestaurantClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RestaurantClickRepository extends JpaRepository<RestaurantClick, Long> {
    
    // 최근 30일 인기 식당 (클릭 수 기준)
    @Query("SELECT rc.restaurantId, COUNT(rc.id) as clickCount " +
           "FROM RestaurantClick rc " +
           "WHERE rc.clickedAt >= :since " +
           "GROUP BY rc.restaurantId " +
           "ORDER BY clickCount DESC")
    List<Object[]> findPopularRestaurants(LocalDateTime since);
    
    // 특정 식당 클릭 수
    Long countByRestaurantIdAndClickedAtAfter(Long restaurantId, LocalDateTime since);
}


