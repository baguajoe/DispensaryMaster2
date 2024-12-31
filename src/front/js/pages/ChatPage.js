import React from 'react';
import ChatBox from '../component/Chatbox';


const ChatPage = () => {
    const userIdentity = 'user123'; // Replace with dynamic user identity from context/auth

    return (
        <div>
            <h1>Chat</h1>
            <ChatBox identity={userIdentity} />
        </div>
    );
};

export default ChatPage;
