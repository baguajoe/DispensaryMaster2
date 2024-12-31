import React, { useEffect, useState } from 'react';
import { Client } from '@twilio/conversations';

const ChatBox = ({ identity }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        const setupChat = async () => {
            try {
                const response = await fetch('/api/get-chat-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identity }),
                });

                const { token } = await response.json();
                const client = new Client(token);

                client.on('messageAdded', (message) => {
                    setMessages((prevMessages) => [...prevMessages, { body: message.body, author: message.author }]);
                });

                const chatChannel = await client.getChannelByUniqueName('general');
                await chatChannel.join();
                setChannel(chatChannel);
            } catch (error) {
                console.error('Error setting up chat:', error);
            }
        };

        setupChat();
    }, [identity]);

    const sendMessage = async () => {
        if (channel && input.trim()) {
            await channel.sendMessage(input);
            setInput('');
        }
    };

    return (
        <div>
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.author}: </strong>
                        {msg.body}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatBox;
