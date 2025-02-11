import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Paper } from '@mui/material';
import ChatBox from './ChatBox';

const ChatList = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, is this still available?' },
    { id: 2, name: 'Jane Smith', lastMessage: 'I\'m interested in your product.' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Can we negotiate the price?' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat List */}
      <Paper elevation={3} sx={{ flex: selectedChat ? 0.6 : 1, overflowY: 'auto', transition: 'flex 0.3s ease', borderRadius: '8px', p: 2, backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Chats</Typography>
        <List>
          {chats.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton onClick={() => setSelectedChat(chat)} selected={selectedChat?.id === chat.id}>
                <ListItemAvatar>
                  <Avatar>{chat.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={chat.name} secondary={chat.lastMessage} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Box Component */}
      {selectedChat && <ChatBox chat={selectedChat} onClose={() => setSelectedChat(null)}  />}
    </Box>
  );
};

export default ChatList;