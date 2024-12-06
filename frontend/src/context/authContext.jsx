import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAccessToken = () => {
    const token = localStorage.getItem('access_token');
    console.log('Retrieved access token:', token);
    return token;
  };

  const getRefreshToken = () => localStorage.getItem('refresh_token');

  const setTokens = (access, refresh) => {
    console.log('Setting tokens:', { access, refresh });
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  };

  const clearTokens = () => {
    console.log('Clearing tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const isTokenExpired = (token) => {
    if (!token) {
      console.log('Token is null or undefined');
      return true;
    }
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      console.log('Token expiration check:', { isExpired, exp: decoded.exp, currentTime });
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };


  const fetchUserData = async (userId = null) => {
    try {
      const accessToken = getAccessToken();
  
      if (!userId && accessToken) {
        const decoded = JSON.parse(atob(accessToken.split('.')[1]));
        userId = decoded.user_id;
      }
  
      const response = await axios.get(`${BASE_URL}/api/user/profile/${userId}/`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
  
      console.log("Fetched User Data:", response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to fetch user data. Please try logging in again.');
      throw error;
    }
  };
  
  const login = async (email, password) => {
    setError(null);
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`${BASE_URL}/api/token/`, { email, password });
      console.log('Login response:', response.data);

      const { access, refresh } = response.data;

      setTokens(access, refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuth(true);
      const userData = await fetchUserData();
      setUserData(userData);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.log('Error response:', error.response.data);
        setError(`Login failed: ${error.response.data.detail || 'Please check your credentials.'}`);
      } else if (error.request) {
        console.log('Error request:', error.request);
        setError('No response received from the server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      throw error;
    }
  };

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
      setError('There was an issue logging out. Please try again.');
    }
  };

  const updateUserData = (newData) => {
    setUserData((prevData) => ({ ...prevData, ...newData }));
  };

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      console.log("Access Token:", accessToken);
      if (accessToken && !isTokenExpired(accessToken)) {
        setIsAuth(true);
        try {
          const userData = await fetchUserData();
          setUserData(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          console.error('Error fetching user data during auth check:', error);
          clearTokens();
          setIsAuth(false);
        }
      } else {
        console.log("Token expired or missing.");
        clearTokens();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    isAuth,
    login,
    logout,
    userData,
    loading,
    error,
    updateUserData,
    fetchUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

