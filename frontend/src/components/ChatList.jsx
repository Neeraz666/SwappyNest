import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper } from '@mui/material';
import ChatBox from './Chatbox';
import { useAuth } from '../context/authContext'; // Adjust the import path as necessary

const ChatList = () => {
  const { isAuth } = useAuth(); // Use your authentication context
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    console.log('isAuthenticated:', isAuth); // Debugging line
  
    if (isAuth) {
      const token = localStorage.getItem('access_token'); // Get token from localStorage
  
      if (token) {
        // Add the token to the Authorization header
        fetch('http://localhost:8000/api/chatapp/conversations/', {
          headers: {
            'Authorization': `Bearer ${token}`, // Add token here
          },
        })
          .then(response => response.json())
          .then(data => {
            console.log('Fetched conversations:', data); // Debugging line
            setConversations(Array.isArray(data) ? data : []); // Ensure data is an array
          })
          .catch(error => console.error('Error fetching conversations:', error));
      } else {
        console.error('No access token found');
      }
    }
  }, [isAuth]);

  useEffect(() => {
    console.log('Conversations state:', conversations); // Debugging line
  }, [conversations]);

  if (!isAuth) {
    return <Typography variant='h6'>You need to log in first</Typography>; // Or render a message indicating the user is not authenticated
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat List */}
      <Paper elevation={3} sx={{ flex: selectedChat ? 0.6 : 1, overflowY: 'auto', transition: 'flex 0.3s ease', borderRadius: '8px', p: 2, backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Chats</Typography>
        <List>
          {conversations.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton onClick={() => setSelectedChat(chat)} selected={selectedChat?.id === chat.id}>
                <ListItemAvatar>
                  <Avatar>
                    {/* Safely access the first participant's username */}
                    {chat.participants && chat.participants[0] ? chat.participants[0].username[0] : 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.participants && chat.participants[1] ? chat.participants[1].username : 'Unknown'}
                  secondary="Last message..." // You can replace this with actual message content if available
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Box Component */}
      {selectedChat && <ChatBox chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </Box>
  );
};

export default ChatList;
