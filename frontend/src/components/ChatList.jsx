import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';

const ChatList = () => {
  // This is dummy data. Replace with actual chat data in a real application.
  const chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, is this still available?' },
    { id: 2, name: 'Jane Smith', lastMessage: 'I\'m interested in your product.' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
  ];

  return (
    <Box sx={{ padding: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Recent Chats</Typography>
      <List>
        {chats.map((chat) => (
          <ListItem key={chat.id} button>
            <ListItemAvatar>
              <Avatar>{chat.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={chat.name} secondary={chat.lastMessage} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatList;

