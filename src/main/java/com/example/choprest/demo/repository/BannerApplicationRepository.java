package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.BannerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 배너 신청 Repository
 */
@Repository
public interface BannerApplicationRepository extends JpaRepository<BannerApplication, Long> {
    
    // 식당별 배너 신청 목록 조회 (최신순)
    List<BannerApplication> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    // 가게 주인별 배너 신청 목록 조회 (최신순)
    List<BannerApplication> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    
    // 상태별 배너 신청 목록 조회
    List<BannerApplication> findByStatusOrderByCreatedAtDesc(BannerApplication.ApplicationStatus status);
    
    // 승인된 배너 신청 목록 조회
    List<BannerApplication> findByStatusAndRestaurantIdOrderByCreatedAtDesc(
        BannerApplication.ApplicationStatus status, Long restaurantId);
}

