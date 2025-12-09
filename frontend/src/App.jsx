// frontend/src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Send, Bot, User, Loader2, BookOpen, Trash2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// --- Styled Components ---

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 85vh;
  border: 1px solid #eef0f5;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderTitle = styled.div`
  h1 { margin: 0; font-size: 1.2rem; font-weight: 600; }
  p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.8; }
`;

const ClearButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const ChatWindow = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  gap: 12px;
  align-items: flex-start;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${props => (props.isUser ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#fff')};
  border: ${props => (props.isUser ? 'none' : '1px solid #e2e8f0')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.isUser ? 'white' : '#64748b')};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.isUser ? 'flex-end' : 'flex-start')};
  max-width: 75%;
`;

const Bubble = styled.div`
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;
  
  /* Markdown Styles */
  & p { margin: 0 0 8px 0; &:last-child { margin: 0; } }
  & ul, & ol { margin: 0; padding-left: 20px; margin-bottom: 8px; }
  & strong { font-weight: 600; }

  background-color: ${props => (props.isUser ? '#3b82f6' : 'white')};
  color: ${props => (props.isUser ? 'white' : '#1e293b')};
  border: ${props => (props.isUser ? 'none' : '1px solid #e2e8f0')};
  box-shadow: ${props => (props.isUser ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.03)')};
  border-top-left-radius: ${props => (props.isUser ? '16px' : '4px')};
  border-top-right-radius: ${props => (props.isUser ? '4px' : '16px')};
`;

const SourceBox = styled.div`
  margin-top: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
`;

const TimeStamp = styled.span`
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 6px;
  margin-right: 4px;
`;

const InputArea = styled.form`
  padding: 24px;
  background: white;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  outline: none;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SendButton = styled.button`
  background: #0f172a;
  color: white;
  border: none;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #1e293b; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:disabled { background: #cbd5e1; cursor: not-allowed; }
`;


// Automatically use Localhost for development, or the Production URL for deployment
const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api/chat' 
  : 'https://smart-chatbot-backend.onrender.com/api/chat'; // <-- We will update this URL in Step 4

// --- Main Component ---

function App() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Lazy initialize messages from LocalStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      return JSON.parse(saved);
    } else {
      return [
        { 
          sender: 'bot', 
          text: '**Hello!** 👋 \nI am your intelligent support assistant. \n\nI can help you with:\n- Billing & Refunds\n- Account Issues\n- Technical Support\n- Shipping Info',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
  });

  // Save to LocalStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = () => {
    localStorage.removeItem('chat_history');
    setMessages([{ 
      sender: 'bot', 
      text: '**Chat cleared.** \nHow can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { sender: 'user', text: input, timestamp };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL , { query: userMessage.text });
      
      const botMessage = { 
        sender: 'bot', 
        text: response.data.botResponse, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.data.contextUsed 
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "⚠️ I'm having trouble connecting to the server.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
            <Bot size={28} />
          </div>
          <HeaderTitle>
            <h1>Smart Customer Support</h1>
            <p>Powered by RAG & Gemini AI</p>
          </HeaderTitle>
        </HeaderLeft>
        <ClearButton onClick={handleClearChat} title="Clear Chat History">
          <Trash2 size={16} /> Clear History
        </ClearButton>
      </Header>

      <ChatWindow>
        {messages.map((msg, index) => (
          <MessageRow key={index} isUser={msg.sender === 'user'}>
            {msg.sender === 'bot' && <Avatar><Bot size={20} /></Avatar>}
            
            <MessageContent isUser={msg.sender === 'user'}>
              <Bubble isUser={msg.sender === 'user'}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </Bubble>
              
              {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                <SourceBox>
                  <BookOpen size={14} />
                  <div>
                    <strong>Source:</strong> "{msg.sources[0].question}"
                  </div>
                </SourceBox>
              )}

              <TimeStamp>{msg.timestamp}</TimeStamp>
            </MessageContent>

            {msg.sender === 'user' && <Avatar isUser><User size={20} /></Avatar>}
          </MessageRow>
        ))}

        {isLoading && (
          <MessageRow>
             <Avatar><Bot size={20} /></Avatar>
             <Bubble>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                 <Loader2 size={16} className="animate-spin" /> 
                 <span>Searching database...</span>
               </div>
             </Bubble>
          </MessageRow>
        )}
        <div ref={chatEndRef} />
      </ChatWindow>

      <InputArea onSubmit={handleSend}>
        <Input 
          type="text" 
          placeholder="Ask about refunds, shipping, passwords..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <SendButton type="submit" disabled={isLoading}>
          <Send size={22} />
        </SendButton>
      </InputArea>
    </Container>
  );
}

export default App;