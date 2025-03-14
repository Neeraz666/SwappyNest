import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';

const LikedProductsContext = createContext();

export const LikedProductsProvider = ({ children }) => {
  const { isAuth } = useAuth();
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    if (isAuth) {
      fetchLikedProducts();
    }
  }, [isAuth]);

  const fetchLikedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products/listlikedproducts/');
      setLikedProducts(response.data);
    } catch (error) {
      console.error('Error fetching liked products:', error);
    }
  };

  const toggleLike = async (productId) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/products/likeproduct/',
        { product_id: productId }
      );
      fetchLikedProducts();
      return response.data.success;
    } catch (error) {
      console.error('Error toggling like:', error);
      return null;
    }
  };

  return (
    <LikedProductsContext.Provider value={{ likedProducts, toggleLike }}>
      {children}
    </LikedProductsContext.Provider>
  );
};

export const useLikedProducts = () => useContext(LikedProductsContext);