import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const BASE_URL = "http://127.0.0.1:8000"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const getAccessToken = () => {
    const token = localStorage.getItem("access_token")
    console.log("Retrieved access token:", token)
    return token
  }

  const getRefreshToken = () => localStorage.getItem("refresh_token")

  const setTokens = (access, refresh) => {
    console.log("Setting tokens:", { access, refresh })
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
  }

  const clearTokens = () => {
    console.log("Clearing tokens")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  const isTokenExpired = (token) => {
    if (!token) {
      console.log("Token is null or undefined")
      return true
    }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      const isExpired = decoded.exp < currentTime
      console.log("Token expiration check:", { isExpired, exp: decoded.exp, currentTime })
      return isExpired
    } catch (error) {
      console.error("Error decoding token:", error)
      return true
    }
  }

  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use a separate axios instance for token refresh to avoid interceptor loops
      const tokenAxios = axios.create();

      const response = await tokenAxios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh: refreshToken
      });

      const { access, refresh } = response.data;

      if (refresh) {
        setTokens(access, refresh);
      } else {
        localStorage.setItem('access_token', access);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (error) {
      console.error('Failed to refresh token:', error);

      // If the refresh token is invalid, clear tokens and redirect to login
      clearTokens();
      setIsAuth(false);
      setUserData(null);

      // Force redirect to login page
      window.location.href = '/login';

      throw error;
    }
  };

  // Create an axios interceptor to handle token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (!config.url.includes("/api/token/refresh/")) {
          const accessToken = getAccessToken()
          if (accessToken && isTokenExpired(accessToken)) {
            console.log("Access token expired, attempting to refresh")
            try {
              const newToken = await refreshAccessToken()
              config.headers.Authorization = `Bearer ${newToken}`
            } catch (error) {
              console.error("Failed to refresh token in interceptor:", error)
              // Let the request proceed without a token, it will fail and be caught by the response interceptor
            }
          }
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If the error is 401 Unauthorized and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axios(originalRequest)
          } catch (refreshError) {
            // If refresh fails, navigate to login
            navigate("/login")
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      },
    )

    // Clean up interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [navigate])

  const fetchUserData = async (userId = null) => {
    try {
      const accessToken = getAccessToken()

      if (!userId && accessToken) {
        const decoded = JSON.parse(atob(accessToken.split(".")[1]))
        userId = decoded.user_id
      }

      const response = await axios.get(`${BASE_URL}/api/user/profile/${userId}/`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      console.log("Fetched User Data:", response.data)
      return response.data
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setError("Failed to fetch user data. Please try logging in again.")
      throw error
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      console.log("Attempting login with:", { email })
      const response = await axios.post(`${BASE_URL}/api/token/`, { email, password })
      console.log("Login response:", response.data)

      const { access, refresh } = response.data

      setTokens(access, refresh)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`

      setIsAuth(true)
      const userData = await fetchUserData()
      setUserData(userData)
      navigate("/")
    } catch (error) {
      console.error("Login error:", error)
      if (error.response) {
        console.log("Error response:", error.response.data)
        setError(`Login failed: ${error.response.data.detail || "Please check your credentials."}`)
      } else if (error.request) {
        console.log("Error request:", error.request)
        setError("No response received from the server. Please try again.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (accessToken && refreshToken) {
        await axios.post(
          `${BASE_URL}/api/logout/`,
          { refresh_token: refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )
      }

      clearTokens()
      delete axios.defaults.headers.common["Authorization"]

      setIsAuth(false)
      setUserData(null)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      setError("There was an issue logging out. Please try again.")
    }
  }

  const updateUserData = (newData) => {
    setUserData((prevData) => ({ ...prevData, ...newData }))
  }

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken()
      console.log("Access Token:", accessToken)

      if (accessToken) {
        if (!isTokenExpired(accessToken)) {
          setIsAuth(true)
          try {
            const userData = await fetchUserData()
            setUserData(userData)
            axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
          } catch (error) {
            console.error("Error fetching user data during auth check:", error)
            // Try to refresh the token instead of immediately clearing
            try {
              await refreshAccessToken()
              setIsAuth(true)
              const userData = await fetchUserData()
              setUserData(userData)
            } catch (refreshError) {
              console.error("Failed to refresh token during auth check:", refreshError)
              clearTokens()
              setIsAuth(false)
            }
          }
        } else {
          console.log("Token expired, attempting to refresh")
          try {
            await refreshAccessToken()
            setIsAuth(true)
            const userData = await fetchUserData()
            setUserData(userData)
          } catch (error) {
            console.error("Failed to refresh token during auth check:", error)
            clearTokens()
            setIsAuth(false)
          }
        }
      } else {
        console.log("No access token found")
        clearTokens()
        setIsAuth(false)
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const value = {
    isAuth,
    login,
    logout,
    userData,
    loading,
    error,
    updateUserData,
    fetchUserData,
    getAccessToken,
    refreshAccessToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

