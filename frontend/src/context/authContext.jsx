import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create AuthContext
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);  // New userData state
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsAuth(true);
      fetchUserData();  // Fetch user data if authenticated
    }
  }, []);

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

  // Log the user in
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { email, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuth(true);
      fetchUserData();  // Fetch user data on successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Log the user out
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

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete axios.defaults.headers.common['Authorization'];

      setIsAuth(false);
      setUserData(null);  // Clear user data on logout
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('There was an issue logging out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
