import React, { useState, useEffect } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { chatAPI } from '../../demo/services/chatAPI';
import './ChatRoomList.css';

const ChatRoomList = ({ onSelectChatRoom }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChatRooms();
      // 5초마다 채팅방 목록 갱신
      const interval = setInterval(loadChatRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = user.role === 'USER' 
        ? await chatAPI.getUserChatRooms(user.userId)
        : await chatAPI.getOwnerChatRooms(user.userId);
      
      setChatRooms(response.data || []);
    } catch (error) {
      console.error('채팅방 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  if (loading && chatRooms.length === 0) {
    return (
      <div className="chat-room-list">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="chat-room-list">
        <div className="empty-state">
          <p>채팅방이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room-list">
      {chatRooms.map((room) => (
        <div
          key={room.id}
          className={`chat-room-item ${room.unreadCount > 0 ? 'unread' : ''}`}
          onClick={() => onSelectChatRoom(room)}
        >
          <div className="chat-room-info">
            <div className="chat-room-header">
              <h3>{user.role === 'USER' ? room.restaurantName : room.userName}</h3>
              {room.unreadCount > 0 && (
                <span className="unread-badge">{room.unreadCount}</span>
              )}
            </div>
            <p className="last-message">{room.lastMessage || '메시지가 없습니다.'}</p>
            {room.lastMessageAt && (
              <span className="last-message-time">{formatTime(room.lastMessageAt)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;



