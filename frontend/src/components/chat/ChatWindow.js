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
      markAsRead();
      
      // 3초마다 메시지 갱신
      intervalRef.current = setInterval(() => {
        loadMessages();
      }, 3000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
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
      setMessages(messageList.reverse());
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
      setTimeout(loadMessages, 500);
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
    const date = new Date(dateTime);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
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
                    <span className="message-time">{formatTime(message.createdAt)}</span>
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

