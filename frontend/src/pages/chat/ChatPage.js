import React, { useState } from 'react';
import { useAuth } from '../../demo/context/AuthContext';
import ChatRoomList from '../../components/chat/ChatRoomList';
import ChatWindow from '../../components/chat/ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  if (!user) {
    return (
      <div className="chat-page">
        <div className="login-required">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {selectedChatRoom ? (
        <ChatWindow
          chatRoom={selectedChatRoom}
          onBack={() => setSelectedChatRoom(null)}
        />
      ) : (
        <div className="chat-page-content">
          <div className="chat-page-header">
            <h2>채팅</h2>
          </div>
          <ChatRoomList onSelectChatRoom={setSelectedChatRoom} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;



