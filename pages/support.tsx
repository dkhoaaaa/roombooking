// pages/support.tsx
import { useState, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: string;
}

const Support = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Dummy data to simulate chat history
  useEffect(() => {
    const initialMessages: Message[] = [
      { id: 1, text: 'Welcome to support chat!', sender: 'support' },
      { id: 2, text: 'How can we help you today?', sender: 'support' },
    ];
    setMessages(initialMessages);
  }, []);

  const sendMessage = () => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
    };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Support Chat</h1>
      <div
        style={{
          border: '1px solid #ddd',
          padding: '10px',
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ padding: '8px', marginBottom: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '8px 16px' }}>
        Send Message
      </button>
    </div>
  );
};

export default Support;
