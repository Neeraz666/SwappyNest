import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';
import Feed from '../components/Feed';

const Home = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Feed />
      </Container>
    </Box>
  );
};

export default Home;

