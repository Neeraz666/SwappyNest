import React, { useState } from 'react';
import { TextField, Button, IconButton, Checkbox, Typography, Container, Box, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/authContext';

export const Login = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profilephoto, setProfilephoto] = useState(null);
  const [preview, setPreview] = useState(null); // New preview state
  const [password, setPassword] = useState('');
  const [password1, setPassword1] = useState('');

  const { login } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilephoto(file);

    // Set preview URL for selected image
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null); // Reset preview if no file is selected
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();

    if (password !== password1) {
      alert('Passwords do not match!');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('profilephoto', profilephoto);
    formData.append('password', password);
    formData.append('password1', password1);

    try {
      await axios.post('http://localhost:8000/api/user/signup/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsLoginForm(true);
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error || error.response.data);
      } else {
        console.error('Error signing up:', error);
        alert('An error occurred while signing up. Please try again.');
      }
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}
      >
        <Typography component="h1" variant="h5" mb={2}>
          {isLoginForm ? 'Login' : 'Signup'}
        </Typography>
        <form onSubmit={isLoginForm ? submitLogin : submitSignup}>
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isLoginForm && (
            <>
              <TextField
                label="Username"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="First Name"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <TextField
                label="Last Name"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
              <TextField
                label="Phone"
                variant="outlined"
                margin="normal"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                label="Address"
                variant="outlined"
                margin="normal"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 1 }}
              >
                Upload Profile Photo
                <input type="file" hidden onChange={handleFileChange} />
              </Button>

              {/* Display the preview image if a file is selected */}
              {preview && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img
                    src={preview}
                    alt="Profile Preview"
                    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                  />
                </Box>
              )}
            </>
          )}
          <TextField
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={togglePasswordVisibility}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              ),
            }}
          />
          {!isLoginForm && (
            <TextField
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />
          )}
          {isLoginForm && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Box display="flex" alignItems="center">
                <Checkbox />
                <Typography variant="body2">Remember me</Typography>
              </Box>
              <Link href="/resetpassword" variant="body2">
                Forgot password?
              </Link>
            </Box>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {isLoginForm ? 'Login Now' : 'Signup Now'}
          </Button>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              {isLoginForm
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Link
                href="#"
                onClick={toggleForm}
                variant="body2"
                sx={{ cursor: 'pointer' }}
              >
                {isLoginForm ? 'Signup' : 'Login'}
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
