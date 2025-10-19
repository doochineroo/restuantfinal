package com.example.choprest.repository;

import com.example.choprest.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    
    List<UserFavorite> findByUserId(Long userId);
    
    Optional<UserFavorite> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    
    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);
    
    void deleteByUserIdAndRestaurantId(Long userId, Long restaurantId);
}


