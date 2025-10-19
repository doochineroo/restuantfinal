package com.example.choprest.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 블랙리스트 엔티티
 */
@Entity
@Table(name = "demo_blacklist")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Blacklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    
    @Column(name = "user_name", nullable = false)
    private String userName;
    
    @Column(name = "user_phone", nullable = false)
    private String userPhone;
    
    @Column(name = "reason", length = 1000, nullable = false)
    private String reason;
    
    @Column(name = "reservation_id")
    private Long reservationId; // 블랙리스트가 된 예약 ID
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "created_by")
    private Long createdBy; // 블랙리스트를 등록한 관리자 ID
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

