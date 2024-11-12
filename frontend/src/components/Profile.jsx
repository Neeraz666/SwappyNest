import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import Feed from "./Feed";

const Profile = () => {
  return (
    <Box sx={{ maxWidth: '700px', margin: '0 auto', mt: 4 }}>
      {/* User Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <img 
          src="/profile.jpg" 
          alt="Profile" 
          style={{ height: '100px', width: '100px', borderRadius: '50%', marginRight: 10 }} 
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">John Doe</Typography>
          <Typography variant="body2">john.doe@example.com</Typography>
        </Box>
        <IconButton>
          <Edit />
        </IconButton>
      </Box>
      
      {/* User's Posts */}
      <Typography variant="h6" sx={{ mb: 2 }}>Your Posts</Typography>
      <Feed />
    </Box>
  );
};

export default Profile;
