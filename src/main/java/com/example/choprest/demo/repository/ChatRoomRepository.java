package com.example.choprest.demo.repository;

import com.example.choprest.demo.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * 채팅방 Repository
 */
@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    // 회원과 식당으로 채팅방 찾기
    Optional<ChatRoom> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    
    // 회원의 모든 채팅방 조회
    List<ChatRoom> findByUserIdOrderByLastMessageAtDesc(Long userId);
    
    // 가게 주인의 모든 채팅방 조회 (식당 ID로)
    List<ChatRoom> findByRestaurantIdOrderByLastMessageAtDesc(Long restaurantId);
    
    // 가게 주인의 user_id로 채팅방 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.ownerId = :ownerId ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findByOwnerIdOrderByLastMessageAtDesc(Long ownerId);
    
    // 회원의 읽지 않은 채팅방 수
    @Query("SELECT COUNT(cr) FROM ChatRoom cr WHERE cr.userId = :userId AND cr.unreadCountUser > 0")
    Long countUnreadRoomsByUserId(Long userId);
    
    // 가게 주인의 읽지 않은 채팅방 수
    @Query("SELECT COUNT(cr) FROM ChatRoom cr WHERE cr.ownerId = :ownerId AND cr.unreadCountOwner > 0")
    Long countUnreadRoomsByOwnerId(Long ownerId);
}



