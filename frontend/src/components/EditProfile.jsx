import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, AddPhotoAlternate } from '@mui/icons-material';
import { useAuth } from '../context/authContext';

const BASE_URL = 'http://127.0.0.1:8000';

export default function EditProfile({ open, onClose, onProfileUpdated }) {
  const { userId } = useParams();
  const { userData, fetchUserData } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (userData && userData.user) {
        setUser(userData.user);
        if (userData.user.profilephoto) {
          setProfilePicturePreview(`${BASE_URL}${userData.user.profilephoto}`);
        }
        setLoading(false);
      } else {
        try {
          const response = await axios.get(`${BASE_URL}/api/user/profile/${userId}/`);
          setUser(response.data.user);
          if (response.data.user.profilephoto) {
            setProfilePicturePreview(`${BASE_URL}${response.data.user.profilephoto}`);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setSnackbar({ open: true, message: 'Failed to load user data', severity: 'error' });
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [userId, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file); // Store the file for submission
      setProfilePicturePreview(URL.createObjectURL(file)); // Show the preview
      setUser((prevUser) => ({ ...prevUser, profilephoto: file })); // Update user state
    }
  };
  
  const handleRemoveImage = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setUser((prevUser) => ({ ...prevUser, profilephoto: null })); 
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  const formData = new FormData();
  formData.append('email', user.email);
  formData.append('firstname', user.firstname);
  formData.append('lastname', user.lastname);
  formData.append('phone', user.phone || '');
  formData.append('address', user.address || '');

  if (profilePicture) {
    formData.append('profilephoto', profilePicture); // Add new photo if uploaded
  } else if (profilePicturePreview === null) {
    formData.append('remove_profilephoto', 'true'); // Notify backend to remove photo
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const response = await axios.put(`${BASE_URL}/api/user/profile/${userId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await fetchUserData(); // Refresh user data after successful update
    setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    onProfileUpdated();
    onClose();
  } catch (error) {
    console.error('Error updating user data:', error);
    setSnackbar({ open: true, message: `Failed to update profile: ${error.response?.data || error.message}`, severity: 'error' });
  } finally {
    setSaving(false);
  }
};

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Container>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Profile
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              {profilePicturePreview ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Avatar
                    src={profilePicturePreview}
                    sx={{ width: 150, height: 150 }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Avatar sx={{ width: 150, height: 150, mb: 2 }} />
              )}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternate />}
                >
                  {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              value={user.email || ''}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={user.username || ''}
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              name="firstname"
              value={user.firstname || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              name="lastname"
              value={user.lastname || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              name="phone"
              value={user.phone || ''}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Address"
              name="address"
              value={user.address || ''}
              onChange={handleInputChange}
              multiline
            />
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving} onClick={handleSubmit}>
          {saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}