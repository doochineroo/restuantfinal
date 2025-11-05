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
    
    /**
     * 좌표가 없는 식당들 조회 (lat 또는 lng가 NULL)
     */
    List<Restaurant> findByLatIsNullOrLngIsNull();
    
    /**
     * 좌표가 없는 식당들 삭제 (lat 또는 lng가 NULL)
     * @Modifying 어노테이션이 필요하지만, Service에서 개별 삭제 방식으로 변경
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByLatIsNullOrLngIsNull();
    
    /**
     * 식당 코드로 검색 (CSV의 식당 ID)
     */
    java.util.Optional<Restaurant> findByRestaurantCode(Long restaurantCode);
    
    /**
     * 최대 식당 코드 조회 (새 식당 등록 시 사용)
     */
    @org.springframework.data.jpa.repository.Query("SELECT MAX(r.restaurantCode) FROM Restaurant r")
    java.util.Optional<Long> findMaxRestaurantCode();
}

