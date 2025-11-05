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
    
    // 서버에서 LocalDateTime을 ISO 형식으로 받으면 타임존 정보가 없을 수 있음
    let date;
    if (typeof dateTime === 'string' && !dateTime.includes('T')) {
      dateTime = dateTime.replace(' ', 'T');
    }
    
    // ISO 8601 형식 문자열인 경우 (타임존 정보 없음)
    if (typeof dateTime === 'string' && dateTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/)) {
      // 한국 시간대(UTC+9)로 간주하여 처리
      date = new Date(dateTime + '+09:00');
    } else {
      date = new Date(dateTime);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateTime);
      return '';
    }
    
    const now = new Date();
    // 한국 시간대 기준으로 시간 차이 계산
    const nowKST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const dateKST = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const diff = nowKST - dateKST;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Asia/Seoul'
    });
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




