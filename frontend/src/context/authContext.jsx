import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      console.log("Access Token:", accessToken);
      if (accessToken && !isTokenExpired(accessToken)) {
        setIsAuth(true);
        await fetchUserData();
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } else {
        console.log("Token expired or missing.");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');

      // Decode the token to get the user_id
      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = decoded.user_id;

      const response = await axios.get(`http://127.0.0.1:8000/api/user/profile/${userId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Fetched User Data:", response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Don't set isAuth to false here, as it might log out the user unexpectedly
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', { email, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setIsAuth(true);
      await fetchUserData();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

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
      setUserData(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('There was an issue logging out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{fetchUserData, isAuth, login, logout, userData, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

