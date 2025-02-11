import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, TextField, Button, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ChatBox = ({ chat, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Open WebSocket connection when the component mounts
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chat.name}/`);
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, { sender: data.sender, text: data.message }]);
    };
  
    setSocket(ws);
  
    return () => {
      ws.close(); // Close WebSocket connection when the component unmounts
    };
  }, [chat]);
  

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Send the message to the WebSocket server
      socket.send(JSON.stringify({ message: newMessage }));
      setMessages([...messages, { sender: 'user', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <Paper elevation={3} sx={{ flex: 0.4, borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff', p: 2, borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #ddd', pb: 1, mb: 2 }}>
        <Typography variant="h6">Chat with {chat.name}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box key={index} display="flex" alignItems="center" justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
            {msg.sender === 'chat' && <Avatar sx={{ mr: 1 }}>C</Avatar>}
            <Paper sx={{ p: 1, backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#ffffff', borderRadius: '8px', maxWidth: '70%' }}>
              <Typography variant="body2">{msg.text}</Typography>
            </Paper>
            {msg.sender === 'user' && <Avatar sx={{ ml: 1 }}>U</Avatar>}
          </Box>
        ))}
      </Box>
      
      {/* Message Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          sx={{ flex: 1 }}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>Send</Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
