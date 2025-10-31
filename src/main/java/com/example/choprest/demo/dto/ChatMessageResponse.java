package com.example.choprest.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 채팅 메시지 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private Boolean isMine; // 현재 사용자가 보낸 메시지인지 여부
}



