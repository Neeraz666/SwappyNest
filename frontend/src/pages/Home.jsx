import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Categories from '../components/Categories';
import Feed from '../components/Feed';
import ChatList from '../components/ChatList';

const Home = () => {
  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateAreas: `
        "nav nav nav"
        "sidebar main chat"
      `,
      gridTemplateRows: 'auto 1fr',
      gridTemplateColumns: '280px 1fr 280px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{ gridArea: 'nav' }}>
        <Navbar />
      </Box>
      
      <Box sx={{ 
        gridArea: 'sidebar', 
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
        height: 'calc(100vh - 6rem)', // Updated height calculation
        padding: 0,
      }}>
        <Categories />
      </Box>
      
      <Box sx={{ 
        gridArea: 'main', 
        padding: '24px 40px',
        overflowY: 'auto',
        height: 'calc(100vh - 6rem)', // Updated height calculation
      }}>
        <Feed />
      </Box>
      
      <Box sx={{ 
        gridArea: 'chat', 
        borderLeft: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
        height: 'calc(100vh - 6rem)', // Updated height calculation
      }}>
        <ChatList />
      </Box>
    </Box>
  );
};

export default Home;