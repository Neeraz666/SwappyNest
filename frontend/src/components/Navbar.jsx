import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, InputBase, Box, Button, Avatar, Typography } from "@mui/material";
import { Search as SearchIcon, Notifications, Add } from "@mui/icons-material";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/nest-blue.svg';
import genericProfileImage from '../assets/profile.png';

const BASE_URL = 'http://127.0.1:8000';

const Navbar = () => {
  const { isAuth, logout, userData, fetchUserData } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(genericProfileImage);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isAuth) {
          const data = await fetchUserData();
          if (data?.profilephoto) {
            setAvatarSrc(getFullImageUrl(data.profilephoto));
          } else {
            setAvatarSrc(genericProfileImage);
          }
        } else {
          setAvatarSrc(genericProfileImage);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAvatarSrc(genericProfileImage);
      }
    };

    loadUserData();
  }, [isAuth, fetchUserData]);

  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BASE_URL}${imagePath}?${new Date().getTime()}`;
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleUploadProduct = () => {
    navigate('/upload');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/api/products/search/?q=${searchQuery}`);
      const data = await response.json();
      console.log("Searched", data);
      navigate('/searchedresult', { state: { results: data, query: searchQuery } });
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const handleProfileClick = () => {
    if (isAuth && userData?.id) {
      navigate(`/profile/${userData.id}`);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#ffffff', 
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        '& .MuiToolbar-root': {
          padding: 0,
        }
      }} 
      elevation={0}
    >
      <Toolbar sx={{ 
        width: '100%', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: '80px',
        gap: '2rem' 
      }}>
        {/* Logo container with exact width matching Categories */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center",
          width: '320px', 
          flexShrink: 0,
          pl: '1rem' // 1rem left padding as you added
        }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <img
              src={Logo}
              alt="Swappy Nest Logo"
              style={{ height: '5rem' }}
            />
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: 'primary.main' }}>
              Swappy Nest
            </Typography>
          </Box>
        </Box>

        {/* Search bar with width matching Feed cards */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          border: "1px solid #e0e0e0",
          borderRadius: "24px",
          height: '48px',
          width: '800px', // Increased to 800px
          backgroundColor: '#f5f5f5',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.1)',
          },
        }}>
          <SearchIcon sx={{ color: '#757575', margin: '0 16px', height: '24px', width: '24px' }} />
          <InputBase
            placeholder="Search your egg..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{
              flex: 1,
              height: '100%',
              fontSize: '1rem',
              color: '#333333',
              '&::placeholder': {
                color: '#757575',
                opacity: 1,
              },
            }}
          />
        </Box>

        {/* Right section */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: '1rem',
          flexShrink: 0,
          pr: 2 
        }}>
          <IconButton
            sx={{
              height: "48px",
              width: "48px",
              backgroundColor: '#f0f0f0',
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
            onClick={handleUploadProduct}
          >
            <Add sx={{ height: "24px", width: "24px", color: '#333333' }} />
          </IconButton>
          <IconButton
            sx={{
              height: '48px',
              width: '48px',
              backgroundColor: '#f0f0f0',
              '&:hover': { backgroundColor: "#e0e0e0" },
            }}
          >
            <Notifications sx={{ height: '24px', width: '24px', color: '#333333' }} />
          </IconButton>

          {isAuth && (
            <IconButton
              onClick={handleProfileClick}
              sx={{
                height: '48px',
                width: '48px',
                padding: 0,
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Avatar
                src={avatarSrc}
                alt={userData?.username || "User"}
                sx={{ width: '48px', height: '48px' }}
              />
            </IconButton>
          )}

          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: '1rem',
              padding: '0.5rem 1.5rem',
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
            }}
            onClick={isAuth ? logout : () => navigate("/login")}
          >
            {isAuth ? 'Logout' : 'Login'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

