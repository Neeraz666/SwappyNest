import React from 'react';
import { Box, Typography, Paper, IconButton, TextField, Button, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ChatBox = ({ chat, onClose }) => {
  // Dummy conversation messages
  const messages = [
    { sender: 'user', text: 'Hey, is this still available?' },
    { sender: 'chat', text: 'Yes, it is. Would you like more details?' },
    { sender: 'user', text: 'Yes, please. Can you share the pricing and features?' },
    { sender: 'chat', text: 'Sure! The price is $100, and it includes free shipping.' },
  ];

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
        <TextField fullWidth variant="outlined" placeholder="Type a message..." sx={{ flex: 1 }} />
        <Button variant="contained" color="primary">Send</Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
