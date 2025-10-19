package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * 테스트용 사용자 Repository - 데모 종료 시 제거 예정
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(User.UserRole role);
    List<User> findByStatus(User.UserStatus status);
    
    // 식당 ID로 가게 주인 찾기
    @Query("SELECT u FROM User u WHERE u.restaurant.id = :restaurantId AND u.role = 'OWNER'")
    List<User> findOwnersByRestaurantId(Long restaurantId);
}

