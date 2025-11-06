package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 1:1 문의 Repository
 */
@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    // 가게 주인별 문의 목록 조회 (최신순)
    List<Inquiry> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    
    // 식당별 문의 목록 조회 (최신순)
    List<Inquiry> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    
    // 상태별 문의 목록 조회
    List<Inquiry> findByStatusOrderByCreatedAtDesc(Inquiry.InquiryStatus status);
}

