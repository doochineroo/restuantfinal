package com.example.batchupdater.repository;

import com.example.batchupdater.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    /**
     * 위치 정보가 없는 식당들 조회
     */
    @Query("SELECT r FROM Restaurant r WHERE r.lat IS NULL OR r.lng IS NULL OR r.roadAddress IS NULL OR r.roadAddress = ''")
    List<Restaurant> findRestaurantsWithoutLocation();
    
    /**
     * 위치 정보가 있는 식당들 조회
     */
    @Query("SELECT r FROM Restaurant r WHERE r.lat IS NOT NULL AND r.lng IS NOT NULL AND r.roadAddress IS NOT NULL AND r.roadAddress != ''")
    List<Restaurant> findRestaurantsWithLocation();
    
    /**
     * 전체 식당 수 조회
     */
    @Query("SELECT COUNT(r) FROM Restaurant r")
    long countAllRestaurants();
    
    /**
     * 위치 정보가 있는 식당 수 조회
     */
    @Query("SELECT COUNT(r) FROM Restaurant r WHERE r.lat IS NOT NULL AND r.lng IS NOT NULL AND r.roadAddress IS NOT NULL AND r.roadAddress != ''")
    long countRestaurantsWithLocation();
}
