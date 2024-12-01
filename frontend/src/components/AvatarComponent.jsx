import React from 'react';
import { Avatar } from '@mui/material';
import { Link } from 'react-router-dom';


const AvatarComponent = ({ src, userId, size = 40 }) => {

  return (
    <Link to={`/profile/${userId}`}>
      <Avatar
        src={src}
        alt="User Avatar"
        sx={{
          width: size,
          height: size,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      />
    </Link>
  );
};

export default AvatarComponent;