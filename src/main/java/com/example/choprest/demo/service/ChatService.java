package com.example.choprest.demo.service;

import com.example.choprest.demo.dto.ChatMessageRequest;
import com.example.choprest.demo.dto.ChatMessageResponse;
import com.example.choprest.demo.dto.ChatRoomResponse;
import com.example.choprest.demo.entity.ChatMessage;
import com.example.choprest.demo.entity.ChatRoom;
import com.example.choprest.demo.entity.User;
import com.example.choprest.demo.repository.ChatMessageRepository;
import com.example.choprest.demo.repository.ChatRoomRepository;
import com.example.choprest.demo.repository.UserRepository;
import com.example.choprest.entity.Restaurant;
import com.example.choprest.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 채팅 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    
    /**
     * 채팅방 생성 또는 조회 (회원과 식당 간)
     */
    @Transactional
    public ChatRoom createOrGetChatRoom(Long userId, Long restaurantId) {
        // 기존 채팅방이 있는지 확인
        Optional<ChatRoom> existingRoom = chatRoomRepository.findByUserIdAndRestaurantId(userId, restaurantId);
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }
        
        // 회원 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        
        // 식당 정보 조회
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("식당을 찾을 수 없습니다."));
        
        // 가게 주인 찾기
        List<User> owners = userRepository.findOwnersByRestaurantId(restaurantId);
        Long ownerId = owners.isEmpty() ? null : owners.get(0).getId();
        
        // 새 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .userId(userId)
                .restaurantId(restaurantId)
                .restaurantName(restaurant.getRestaurantName())
                .userName(user.getName())
                .ownerId(ownerId)
                .unreadCountUser(0)
                .unreadCountOwner(0)
                .build();
        
        return chatRoomRepository.save(chatRoom);
    }
    
    /**
     * 회원의 채팅방 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getUserChatRooms(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByUserIdOrderByLastMessageAtDesc(userId);
        return rooms.stream()
                .map(room -> ChatRoomResponse.builder()
                        .id(room.getId())
                        .userId(room.getUserId())
                        .restaurantId(room.getRestaurantId())
                        .restaurantName(room.getRestaurantName())
                        .userName(room.getUserName())
                        .ownerId(room.getOwnerId())
                        .lastMessage(room.getLastMessage())
                        .lastMessageAt(room.getLastMessageAt())
                        .unreadCount(room.getUnreadCountUser())
                        .createdAt(room.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * 가게 주인의 채팅방 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getOwnerChatRooms(Long ownerId) {
        List<ChatRoom> rooms = chatRoomRepository.findByOwnerIdOrderByLastMessageAtDesc(ownerId);
        return rooms.stream()
                .map(room -> ChatRoomResponse.builder()
                        .id(room.getId())
                        .userId(room.getUserId())
                        .restaurantId(room.getRestaurantId())
                        .restaurantName(room.getRestaurantName())
                        .userName(room.getUserName())
                        .ownerId(room.getOwnerId())
                        .lastMessage(room.getLastMessage())
                        .lastMessageAt(room.getLastMessageAt())
                        .unreadCount(room.getUnreadCountOwner())
                        .createdAt(room.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * 채팅방의 메시지 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatMessages(Long chatRoomId, Long currentUserId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoomId);
        return messages.stream()
                .map(msg -> ChatMessageResponse.builder()
                        .id(msg.getId())
                        .chatRoomId(msg.getChatRoomId())
                        .senderId(msg.getSenderId())
                        .senderName(msg.getSenderName())
                        .senderRole(msg.getSenderRole().name())
                        .message(msg.getMessage())
                        .isRead(msg.getIsRead())
                        .readAt(msg.getReadAt())
                        .createdAt(msg.getCreatedAt())
                        .isMine(msg.getSenderId().equals(currentUserId))
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * 메시지 전송
     */
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        // 사용자 정보 조회
        User sender = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        ChatRoom chatRoom;
        
        // 채팅방 ID가 제공된 경우 (이미 존재하는 채팅방)
        if (request.getChatRoomId() != null) {
            chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
            
            // 권한 확인: 가게 주인인 경우 자신의 식당 채팅방인지, 회원인 경우 자신의 채팅방인지 확인
            if (sender.getRole() == User.UserRole.OWNER) {
                if (chatRoom.getOwnerId() == null || !chatRoom.getOwnerId().equals(sender.getId())) {
                    throw new RuntimeException("이 채팅방에 접근할 권한이 없습니다.");
                }
            } else {
                if (!chatRoom.getUserId().equals(sender.getId())) {
                    throw new RuntimeException("이 채팅방에 접근할 권한이 없습니다.");
                }
            }
        } else {
            // 채팅방 ID가 없으면 새로 생성 (회원이 처음 채팅 시작하는 경우)
            if (sender.getRole() == User.UserRole.OWNER) {
                throw new RuntimeException("가게 주인은 기존 채팅방을 통해 메시지를 보내야 합니다.");
            }
            chatRoom = createOrGetChatRoom(request.getUserId(), request.getRestaurantId());
        }
        
        // 메시지 저장
        ChatMessage message = ChatMessage.builder()
                .chatRoomId(chatRoom.getId())
                .senderId(sender.getId())
                .senderName(sender.getName())
                .senderRole(sender.getRole() == User.UserRole.USER 
                        ? ChatMessage.SenderRole.USER 
                        : ChatMessage.SenderRole.OWNER)
                .message(request.getMessage())
                .isRead(false)
                .build();
        
        message = chatMessageRepository.save(message);
        
        // 채팅방 정보 업데이트 (마지막 메시지, 읽지 않은 수 등)
        chatRoom.setLastMessage(request.getMessage());
        chatRoom.setLastMessageAt(LocalDateTime.now());
        
        // 상대방의 읽지 않은 메시지 수 증가
        if (sender.getRole() == User.UserRole.USER) {
            // 회원이 보낸 메시지 -> 가게 주인의 읽지 않은 수 증가
            chatRoom.setUnreadCountOwner(chatRoom.getUnreadCountOwner() + 1);
        } else {
            // 가게 주인이 보낸 메시지 -> 회원의 읽지 않은 수 증가
            chatRoom.setUnreadCountUser(chatRoom.getUnreadCountUser() + 1);
        }
        
        chatRoomRepository.save(chatRoom);
        
        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoomId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderRole(message.getSenderRole().name())
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .isMine(true)
                .build();
    }
    
    /**
     * 메시지를 읽음으로 표시
     */
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        // 메시지 읽음 처리
        chatMessageRepository.markMessagesAsRead(chatRoomId, userId);
        
        // 채팅방의 읽지 않은 수 초기화
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (user.getRole() == User.UserRole.USER) {
            chatRoom.setUnreadCountUser(0);
        } else {
            chatRoom.setUnreadCountOwner(0);
        }
        
        chatRoomRepository.save(chatRoom);
    }
    
    /**
     * 읽지 않은 채팅방 수 조회
     */
    @Transactional(readOnly = true)
    public Long getUnreadChatRoomCount(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            
            if (user.getRole() == User.UserRole.USER) {
                Long count = chatRoomRepository.countUnreadRoomsByUserId(userId);
                return count != null ? count : 0L;
            } else {
                Long count = chatRoomRepository.countUnreadRoomsByOwnerId(userId);
                return count != null ? count : 0L;
            }
        } catch (Exception e) {
            log.error("읽지 않은 채팅방 수 조회 오류: userId={}", userId, e);
            return 0L; // 에러 발생 시 0 반환
        }
    }
}

