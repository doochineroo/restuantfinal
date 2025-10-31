package com.example.choprest.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 채팅방 엔티티 - 회원과 가게 주인(식당) 간의 1:1 채팅방
 */
@Entity
@Table(name = "demo_chat_rooms", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "restaurant_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;
    
    @Column(name = "restaurant_name")
    private String restaurantName;
    
    @Column(name = "user_name")
    private String userName;
    
    @Column(name = "owner_id")
    private Long ownerId; // 가게 주인의 user_id
    
    @Column(name = "last_message")
    private String lastMessage;
    
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Column(name = "unread_count_user")
    @Builder.Default
    private Integer unreadCountUser = 0; // 회원의 읽지 않은 메시지 수
    
    @Column(name = "unread_count_owner")
    @Builder.Default
    private Integer unreadCountOwner = 0; // 가게 주인의 읽지 않은 메시지 수
    
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



