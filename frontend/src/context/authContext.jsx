import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper functions for token management
  const getAccessToken = () => localStorage.getItem('access_token');
  const getRefreshToken = () => localStorage.getItem('refresh_token');
  const setTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  };
  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Treat malformed tokens as expired
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token found');

      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = decoded.user_id;

      const response = await axios.get(`${BASE_URL}/api/user/profile/${userId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Fetched User Data:", response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setIsAuth(false); // Ensure auth state is reset on failure
      clearTokens(); // Clear invalid tokens
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/token/`, { email, password });
      const { access, refresh } = response.data;

      setTokens(access, refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuth(true);
      await fetchUserData();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken && refreshToken) {
        await axios.post(
          `${BASE_URL}/api/logout/`,
          { refresh_token: refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
      }

      clearTokens();
      delete axios.defaults.headers.common['Authorization'];

      setIsAuth(false);
      setUserData(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('There was an issue logging out. Please try again.');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      console.log("Access Token:", accessToken);
      if (accessToken && !isTokenExpired(accessToken)) {
        setIsAuth(true);
        await fetchUserData();
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } else {
        console.log("Token expired or missing.");
        clearTokens(); // Clear invalid tokens
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ fetchUserData, isAuth, login, logout, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};