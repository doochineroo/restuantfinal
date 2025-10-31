package com.example.choprest.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 테스트용 사용자 엔티티 - 데모 종료 시 제거 예정
 * Role: ADMIN(관리자), OWNER(가게), USER(일반회원)
 */
@Entity
@Table(name = "demo_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean emailVerified;
    
    @Column(nullable = false)
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    // 가게 주인인 경우 연결된 식당 (JPA 관계 매핑)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", foreignKey = @ForeignKey(name = "fk_user_restaurant"))
    private com.example.choprest.entity.Restaurant restaurant;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
        if (emailVerified == null) {
            emailVerified = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum UserRole {
        ADMIN,  // 관리자
        OWNER,  // 가게 주인
        USER    // 일반 회원
    }
    
    public enum UserStatus {
        ACTIVE,     // 활동
        SUSPENDED,  // 정지
        DELETED     // 탈퇴
    }
}

