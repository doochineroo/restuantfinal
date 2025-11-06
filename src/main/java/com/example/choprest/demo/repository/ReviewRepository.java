package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 리뷰 Repository
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Review> findByReservationId(Long reservationId);
    Long countByRestaurantId(Long restaurantId);
    
    /**
     * 여러 식당의 리뷰 개수를 한 번에 조회 (배치 최적화)
     */
    @Query("SELECT r.restaurantId, COUNT(r) as count FROM Review r WHERE r.restaurantId IN :restaurantIds GROUP BY r.restaurantId")
    List<Object[]> countByRestaurantIds(@Param("restaurantIds") List<Long> restaurantIds);
    
    /**
     * 여러 식당의 평점을 한 번에 조회 (배치 최적화)
     */
    @Query("SELECT r.restaurantId, AVG(r.rating) as avgRating FROM Review r WHERE r.restaurantId IN :restaurantIds GROUP BY r.restaurantId")
    List<Object[]> getAverageRatingsByRestaurantIds(@Param("restaurantIds") List<Long> restaurantIds);
}