import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';

const SimpleLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box sx={{ padding: 2 }}>
        {children}
      </Box>
    </>
  );
};

export default SimpleLayout;