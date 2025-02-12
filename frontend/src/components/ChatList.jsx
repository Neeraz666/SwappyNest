import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper, CircularProgress } from '@mui/material';
import ChatBox from './Chatbox';
import { useAuth } from '../context/authContext';

const ChatList = () => {
  const { isAuth, userId } = useAuth(); // Get userId from auth context
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (isAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        setLoading(true); // Set loading before fetching
        fetch('http://localhost:8000/api/chatapp/conversations/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            // Filter out the logged-in user and show the other participants
            const filteredChats = data.map(chat => {
              const otherParticipant = chat.participants.find(user => user.id !== userId);
              return { ...chat, otherParticipant };
            }).filter(chat => chat.otherParticipant); // Only keep chats with other participants

            setConversations(filteredChats); // Set filtered conversations
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching conversations:', error);
            setLoading(false);
          });
      } else {
        console.error('No access token found');
        setLoading(false);
      }
    }
  }, [isAuth, userId]);

  if (!isAuth) {
    return <Typography variant='h6'>You need to log in first</Typography>;
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);

    // Set sender and receiver IDs
    const receiverId = chat.otherParticipant.id;
    const senderId = userId;

    // Pass sender and receiver info to the chat component
    chat.receiverId = receiverId;
    chat.senderId = senderId;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat List */}
      <Paper elevation={3} sx={{ flex: selectedChat ? 0.6 : 1, overflowY: 'auto', transition: 'flex 0.3s ease', borderRadius: '8px', p: 2, backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Chats</Typography>
        {loading ? (
          <CircularProgress sx={{ margin: 'auto', display: 'block' }} />
        ) : (
          <List>
            {conversations.map((chat) => (
              <ListItem key={chat.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelectChat(chat)}
                  selected={selectedChat?.id === chat.id}
                >
                  <ListItemAvatar>
                    <Avatar>{chat.otherParticipant.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.otherParticipant.username}
                    secondary="Last message..." // Replace with actual last message if available
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Chat Box */}
      {selectedChat && <ChatBox chat={selectedChat} onClose={() => setSelectedChat(null)} />}
    </Box>
  );
};

export default ChatList;
