package com.example.choprest.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 채팅 메시지 전송 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private Long chatRoomId; // 채팅방 ID (이미 존재하는 채팅방인 경우)
    private Long userId; // 현재 로그인한 사용자 ID
    private Long restaurantId; // 식당 ID (새 채팅방 생성 시 필요)
    private String message;
}

