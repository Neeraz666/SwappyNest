import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/authContext';
import AvatarComponent from './AvatarComponent';

const BASE_URL = "http://127.0.0.1:8000";

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
};

const ChatBox = ({ chat, onClose }) => {
  const { userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null); // Store WebSocket instance

  useEffect(() => {
    const token = localStorage.getItem('access_token');
  
    // Fetch existing messages from the backend
    if (token) {
      setLoading(true);
      fetch(`http://localhost:8000/api/chatapp/conversations/${chat.id}/messages/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
          setLoading(false);
        });
    }
  
    // Establish WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chat.name}/`);
    socketRef.current = ws;
  
    // Handle incoming WebSocket messages
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: data.sender_id === userData.id ? userData.username : chat.otherParticipant.username,
          text: data.content,
        },
      ]);
    };
  
    // Handle WebSocket errors
    ws.onerror = (error) => console.error('WebSocket Error:', error);
  
    // Cleanup WebSocket on component unmount
    return () => ws.close();
  }, [chat]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      // Send the message via WebSocket
      socketRef.current.send(
        JSON.stringify({
          sender_id: userData.id,
          receiver_id: chat.otherParticipant.id,
          message: newMessage,
        })
      );
  
      // Clear the input field
      setNewMessage('');
    }
  };

  return (
    <Paper elevation={3} sx={{ flex: 0.4, borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff', p: 2, borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #ddd', pb: 1, mb: 2 }}>
        <Typography variant="h6">Chat with {chat.otherParticipant.username}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Message List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px', mb: 2 }}>
        {loading ? (
          <CircularProgress sx={{ margin: 'auto', display: 'block' }} />
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.sender === userData.username;
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  mb: 1,
                  alignItems: 'center',
                }}
              >
                {!isCurrentUser && (
                  <AvatarComponent
                    src={getFullImageUrl(chat.otherParticipant.profilephoto)}
                    userId={chat.otherParticipant.id}
                    size={32}
                  />
                )}
                <Paper
                  sx={{
                    p: 1,
                    backgroundColor: isCurrentUser ? '#dcf8c6' : '#ffffff',
                    borderRadius: '8px',
                    maxWidth: '70%',
                    ml: isCurrentUser ? 1 : 0,
                    mr: !isCurrentUser ? 1 : 0,
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
                {isCurrentUser && (
                  <AvatarComponent
                    src={getFullImageUrl(userData.profilephoto)}
                    userId={userData.id}
                    size={32}
                  />
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Input Field & Send Button */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          sx={{ flex: 1 }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;