package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 테스트용 예약 Repository - 데모 종료 시 제거 예정
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByRestaurantId(Long restaurantId);
    List<Reservation> findByStatus(Reservation.ReservationStatus status);
    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Reservation> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    List<Reservation> findByVisitStatus(Reservation.VisitStatus visitStatus);
    List<Reservation> findByVisitStatusOrderByCreatedAtDesc(Reservation.VisitStatus visitStatus);
    List<Reservation> findByIsBlacklistedTrue();
    List<Reservation> findByIsBlacklistedTrueOrderByCreatedAtDesc();
    
    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId ORDER BY r.createdAt DESC")
    List<Reservation> findUserReservationsWithQuery(@Param("userId") Long userId);
}

