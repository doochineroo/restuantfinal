package com.example.choprest.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 채팅 메시지 엔티티
 */
@Entity
@Table(name = "demo_chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId; // 메시지 보낸 사람의 user_id
    
    @Column(name = "sender_name", nullable = false)
    private String senderName;
    
    @Column(name = "sender_role", nullable = false)
    @Enumerated(EnumType.STRING)
    private SenderRole senderRole; // USER 또는 OWNER
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isRead = false;
    }
    
    public enum SenderRole {
        USER,  // 회원
        OWNER  // 가게 주인
    }
}



