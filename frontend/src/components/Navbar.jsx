import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, InputBase, Box, Button, Avatar } from "@mui/material";
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
    <AppBar position="sticky" sx={{ backgroundColor: '#f9f8f6', padding: 0 }} elevation={0}>
      <Toolbar sx={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              display: "flex",
              marginRight: "1rem",
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
              style={{ height: '6rem' }}
            />
          </Box>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            border: "1px solid #ccc",
            padding: "2px 8px",
            borderRadius: "4px",
            height: '3rem',
            width: '40rem',
            mr: '5rem'
          }}>
            <SearchIcon sx={{ color: '#727271', marginRight: 1, height: '1.5rem', width: '1.5rem' }} />
            <InputBase
              placeholder="Search your egg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: 1,
                height: '100%',
                fontSize: '1rem',
                minWidth: 0
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <IconButton
            sx={{
              height: "4rem",
              width: "4rem",
              "&:hover": { color: "primary.dark" },
            }}
            onClick={handleUploadProduct}
          >
            <Add sx={{ height: "2rem", width: "2rem" }} />
          </IconButton>
          <IconButton
            sx={{
              height: '4rem',
              width: '4rem',
              '&:hover': { color: 'primary.dark' }
            }}
          >
            <Notifications sx={{ height: '2rem', width: '2rem' }} />
          </IconButton>

          {isAuth && (
            <IconButton
              onClick={handleProfileClick}
              sx={{
                height: '4rem',
                width: '4rem',
                '&:hover': { color: 'primary.dark' }
              }}
            >
              <Avatar
                src={avatarSrc}
                alt={userData?.username || "User"}
                sx={{ width: '3rem', height: '3rem' }}
              />
            </IconButton>
          )}

          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: '1.2rem',
              padding: '0.5rem 1rem',
              '&:hover': { backgroundColor: 'primary.dark' }
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

