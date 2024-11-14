import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create AuthContext
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuth(true);
      fetchUserData(); // Fetch user data if authenticated
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }, []);

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < currentTime; // Returns true if token is expired
  };

  // Fetch user profile data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { email, password });
      const { access, refresh } = response.data;

      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Set axios default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuth(true);
      fetchUserData(); // Fetch user data on successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found.');

      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken,
      });

      const { access } = response.data;

      // Store new access token in localStorage
      localStorage.setItem('access_token', access);

      // Set axios default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Log the user out if refresh fails
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (accessToken && refreshToken) {
        await axios.post(
          'http://localhost:8000/api/logout/',
          { refresh_token: refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }

      // Remove tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Remove Authorization header from axios
      delete axios.defaults.headers.common['Authorization'];

      // Reset the auth state
      setIsAuth(false);
      setUserData(null);  // Clear user data on logout
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
      alert('There was an issue logging out. Please try again.');
    }
  };

  // Axios request interceptor to check if the access token is expired
  axios.interceptors.response.use(
    response => response, // If the response is successful, return it
    async (error) => {
      const originalRequest = error.config;
      const accessToken = localStorage.getItem('access_token');
      
      // Check if the error is due to token expiration (status 401)
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Refresh token if expired
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          // Set new access token to axios header
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // Retry the original request with the new access token
          return axios(originalRequest);
        }
      }

      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ isAuth, login, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
