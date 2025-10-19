package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 블랙리스트 Repository
 */
@Repository
public interface BlacklistRepository extends JpaRepository<Blacklist, Long> {
    List<Blacklist> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);
    List<Blacklist> findByUserId(Long userId);
}

