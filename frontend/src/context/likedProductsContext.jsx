"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./authContext"

const LikedProductsContext = createContext()

export const LikedProductsProvider = ({ children }) => {
  const { isAuth, getAccessToken } = useAuth()
  const [likedProducts, setLikedProducts] = useState([])

  useEffect(() => {
    if (isAuth) {
      fetchLikedProducts()
    } else {
      // Reset liked products when not authenticated
      setLikedProducts([])
    }
  }, [isAuth])

  const fetchLikedProducts = async () => {
    try {
      const token = getAccessToken()
      if (!token) {
        console.error("No access token available")
        return
      }

      const response = await axios.get("http://localhost:8000/api/products/listlikedproducts/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setLikedProducts(response.data)
    } catch (error) {
      console.error("Error fetching liked products:", error)
      // If token expired, the interceptor in authContext should handle refresh
    }
  }

  const toggleLike = async (productId) => {
    try {
      const token = getAccessToken()
      if (!token) {
        console.error("No access token available")
        return null
      }

      const response = await axios.post(
        "http://localhost:8000/api/products/likeproduct/",
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      fetchLikedProducts()
      return response.data.success
    } catch (error) {
      console.error("Error toggling like:", error)
      return null
    }
  }

  return (
    <LikedProductsContext.Provider value={{ likedProducts, toggleLike, fetchLikedProducts }}>
      {children}
    </LikedProductsContext.Provider>
  )
}

export const useLikedProducts = () => useContext(LikedProductsContext)

