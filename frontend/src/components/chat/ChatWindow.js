import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import { chatAPI } from '../../demo/services/chatAPI';
import './ChatWindow.css';

const ChatWindow = ({ chatRoom, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (chatRoom && user) {
      loadMessages();
      
      // 채팅방 열 때 읽음 처리
      const markRead = async () => {
        try {
          await markAsRead();
          // 읽음 처리 후 메시지 다시 로드하여 읽음 상태 업데이트
          setTimeout(() => {
            loadMessages();
          }, 300);
        } catch (error) {
          console.error('읽음 처리 오류:', error);
        }
      };
      
      // 약간의 딜레이 후 읽음 처리 (메시지 로드 완료 후)
      const markReadTimeout = setTimeout(markRead, 500);
      
      // 3초마다 메시지 갱신 및 읽음 처리
      intervalRef.current = setInterval(() => {
        loadMessages();
        // 새 메시지가 있으면 읽음 처리
        markAsRead().catch(err => console.error('읽음 처리 오류:', err));
      }, 3000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (markReadTimeout) {
          clearTimeout(markReadTimeout);
        }
      };
    }
  }, [chatRoom?.id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!chatRoom || !user) return;

    try {
      const response = await chatAPI.getChatMessages(chatRoom.id, user.userId);
      const messageList = response.data || [];
      // 최신순으로 정렬 (가장 오래된 메시지가 위에)
      // isRead 필드 정규화 (백엔드에서 isRead로 오지만 read로도 접근 가능하도록)
      const normalizedMessages = messageList.map(msg => ({
        ...msg,
        read: msg.isRead !== undefined ? msg.isRead : msg.read
      }));
      setMessages(normalizedMessages.reverse());
    } catch (error) {
      console.error('메시지 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!chatRoom || !user) return;

    try {
      await chatAPI.markMessagesAsRead(chatRoom.id, user.userId);
    } catch (error) {
      console.error('읽음 처리 오류:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom || !user || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const messageRequest = {
        chatRoomId: chatRoom.id, // 이미 선택된 채팅방 ID 사용
        userId: user.userId,
        message: messageText
      };
      
      // 회원이 새로 채팅을 시작하는 경우에만 restaurantId 필요
      if (user.role === 'USER' && !chatRoom.id) {
        messageRequest.restaurantId = chatRoom.restaurantId;
      }
      
      await chatAPI.sendMessage(messageRequest);
      
      // 메시지 전송 후 즉시 갱신
      setTimeout(() => {
        loadMessages();
      }, 500);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송에 실패했습니다.');
      setNewMessage(messageText); // 실패 시 다시 입력
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    
    // 서버에서 LocalDateTime을 ISO 형식으로 받으면 타임존 정보가 없을 수 있음
    // ISO 형식 문자열인 경우 (예: "2025-10-31T08:30:00")
    let date;
    if (typeof dateTime === 'string' && !dateTime.includes('T')) {
      // 형식이 잘못된 경우 수정
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
    
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    });
  };

  const formatDate = (dateTime) => {
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
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 한국 시간대 기준으로 날짜 비교
    const dateStr = date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    const todayStr = today.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    const yesterdayStr = yesterday.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

    if (dateStr === todayStr) {
      return '오늘';
    } else if (dateStr === yesterdayStr) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'Asia/Seoul'
      });
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  const displayName = user?.role === 'USER' 
    ? chatRoom.restaurantName 
    : chatRoom.userName;

  let lastDate = null;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h3>{displayName}</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => {
          const messageDate = message.createdAt ? formatDate(message.createdAt) : null;
          const showDate = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <React.Fragment key={message.id}>
              {showDate && (
                <div className="date-divider">
                  <span>{messageDate}</span>
                </div>
              )}
              <div className={`message ${message.isMine ? 'mine' : 'other'}`}>
                <div className="message-content">
                  {!message.isMine && (
                    <div className="sender-name">{message.senderName}</div>
                  )}
                  <div className="message-bubble">
                    <p>{message.message}</p>
                    <div className="message-footer">
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                      {message.isMine && (
                        <span className={`message-read-status ${(message.isRead !== undefined ? message.isRead : message.read) ? 'read' : 'unread'}`}>
                          {(message.isRead !== undefined ? message.isRead : message.read) ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || sending}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

