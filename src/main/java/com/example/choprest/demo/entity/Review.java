package com.example.choprest.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 리뷰 엔티티
 */
@Entity
@Table(name = "demo_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "reservation_id", nullable = false)
    private Long reservationId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    
    @Column(name = "user_name", nullable = false)
    private String userName;
    
    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5점
    
    @Column(name = "content", length = 1000)
    private String content;
    
    @Column(name = "images", length = 2000)
    private String images; // JSON 형태로 이미지 URL들 저장
    
    @Column(name = "owner_comment", length = 1000)
    private String ownerComment; // 가게 주인 댓글
    
    @Column(name = "owner_comment_at")
    private LocalDateTime ownerCommentAt; // 가게 주인 댓글 작성 시간
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}