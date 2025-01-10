import React from 'react';
import { Box } from '@mui/material';
import Categories from '../components/Categories';
import Feed from '../components/Feed';
import ChatList from '../components/ChatList';

const Home = () => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateAreas: `
        "sidebar main chat"
      `,
      gridTemplateRows: '1fr',
      gridTemplateColumns: '280px 1fr 280px',
      height: 'calc(100vh - 6rem)', // Full height minus Navbar
      backgroundColor: '#f5f5f5',
    }}>
      {/* Sidebar (Categories) */}
      <Box sx={{
        gridArea: 'sidebar',
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        overflowY: 'auto', // Independent scroll for sidebar
        height: '100%', // Occupies full parent height
      }}>
        <Categories />
      </Box>

      {/* Main Content (Feed) */}
      <Box sx={{
        gridArea: 'main',
        padding: '24px 40px',
        overflowY: 'scroll', // Enables scrolling
        height: '100%', // Occupies full parent height
        scrollbarWidth: 'none', // Hides scrollbar (for Firefox)
        '&::-webkit-scrollbar': {
          display: 'none', // Hides scrollbar (for Chrome, Edge, Safari)
        },
      }}>
        <Feed />
      </Box>

      {/* Chat Section */}
      <Box sx={{
        gridArea: 'chat',
        borderLeft: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        overflowY: 'auto', // Independent scroll for chat
        height: '100%', // Occupies full parent height
      }}>
        <ChatList />
      </Box>
    </Box>
  );
};

export default Home;
