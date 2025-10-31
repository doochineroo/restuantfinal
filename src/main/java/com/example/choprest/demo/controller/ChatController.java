package com.example.choprest.demo.controller;

import com.example.choprest.demo.dto.ChatMessageRequest;
import com.example.choprest.demo.dto.ChatMessageResponse;
import com.example.choprest.demo.dto.ChatRoomResponse;
import com.example.choprest.demo.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * 채팅 컨트롤러
 */
@RestController
@RequestMapping("/api/demo/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * 채팅방 생성 또는 조회
     */
    @PostMapping("/room")
    public ResponseEntity<?> createOrGetChatRoom(
            @RequestParam Long userId,
            @RequestParam Long restaurantId) {
        try {
            ChatRoomResponse room = ChatRoomResponse.builder()
                    .id(chatService.createOrGetChatRoom(userId, restaurantId).getId())
                    .userId(userId)
                    .restaurantId(restaurantId)
                    .build();
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 회원의 채팅방 목록 조회
     */
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomResponse>> getUserChatRooms(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getUserChatRooms(userId));
    }
    
    /**
     * 가게 주인의 채팅방 목록 조회
     */
    @GetMapping("/rooms/owner/{ownerId}")
    public ResponseEntity<List<ChatRoomResponse>> getOwnerChatRooms(@PathVariable Long ownerId) {
        return ResponseEntity.ok(chatService.getOwnerChatRooms(ownerId));
    }
    
    /**
     * 채팅방의 메시지 목록 조회
     */
    @GetMapping("/room/{chatRoomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(
            @PathVariable Long chatRoomId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(chatService.getChatMessages(chatRoomId, userId));
    }
    
    /**
     * 메시지 전송
     */
    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            ChatMessageResponse response = chatService.sendMessage(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 메시지를 읽음으로 표시
     */
    @PostMapping("/room/{chatRoomId}/read")
    public ResponseEntity<?> markMessagesAsRead(
            @PathVariable Long chatRoomId,
            @RequestParam Long userId) {
        try {
            chatService.markMessagesAsRead(chatRoomId, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 읽지 않은 채팅방 수 조회
     */
    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadChatRoomCount(@PathVariable Long userId) {
        try {
            Long count = chatService.getUnreadChatRoomCount(userId);
            return ResponseEntity.ok(Map.of("count", count != null ? count : 0L));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("count", 0L)); // 에러 발생 시 0 반환
        }
    }
}

