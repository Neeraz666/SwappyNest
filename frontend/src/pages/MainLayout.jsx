import React from 'react';
import { Box } from '@mui/material';
import Categories from '../components/Categories';
import ChatList from '../components/ChatList';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
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
          overflowY: 'auto',
          height: '100%',
        }}>
          <Categories />
        </Box>

        {/* Main Content */}
        <Box sx={{
          gridArea: 'main',
          padding: '24px 40px',
          overflowY: 'scroll',
          height: '100%',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}>
          {children}
        </Box>

        {/* Chat Section */}
        <Box sx={{
          gridArea: 'chat',
          borderLeft: '1px solid #e0e0e0',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          height: '100%',
        }}>
          <ChatList />
        </Box>
      </Box>
    </>
  );
};

export default MainLayout;

