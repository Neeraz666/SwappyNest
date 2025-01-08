import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import Categories from '../components/Categories';
import Feed from '../components/Feed';

const Home = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Navbar />
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        width: '100%',
      }}>
        <Categories />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflowY: 'auto', 
            height: 'calc(100vh - 80px)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Feed />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;

