package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * 채팅 메시지 Repository
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // 채팅방의 모든 메시지 조회 (최신순)
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);
    
    // 채팅방의 읽지 않은 메시지 수
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId AND cm.isRead = false")
    Long countUnreadMessagesByChatRoomId(Long chatRoomId);
    
    // 채팅방의 특정 사용자가 읽지 않은 메시지 수
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId AND cm.isRead = false AND cm.senderId != :userId")
    Long countUnreadMessagesByChatRoomIdAndUserId(Long chatRoomId, Long userId);
    
    // 메시지를 읽음으로 표시
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true, cm.readAt = CURRENT_TIMESTAMP WHERE cm.chatRoomId = :chatRoomId AND cm.senderId != :userId AND cm.isRead = false")
    void markMessagesAsRead(Long chatRoomId, Long userId);
    
    // 채팅방의 마지막 메시지
    Optional<ChatMessage> findFirstByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);
}

