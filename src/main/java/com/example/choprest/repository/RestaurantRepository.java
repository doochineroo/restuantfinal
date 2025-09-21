package com.example.choprest.repository;

import com.example.choprest.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    /**
     * 식당명 또는 지점명으로 검색 (대소문자 구분 없음)
     */
    List<Restaurant> findByRestaurantNameContainingIgnoreCaseOrBranchNameContainingIgnoreCase(
            String restaurantName, String branchName);
    
    /**
     * 지역명으로 검색 (대소문자 구분 없음)
     */
    List<Restaurant> findByRegionNameContainingIgnoreCase(String regionName);
    
    /**
     * 위치 정보가 있는 식당들만 조회
     */
    List<Restaurant> findByLatIsNotNullAndLngIsNotNullAndRoadAddressIsNotNull();
}

