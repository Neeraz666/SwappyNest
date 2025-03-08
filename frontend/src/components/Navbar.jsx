import { useState, useEffect } from "react"
import { AppBar, Toolbar, IconButton, InputBase, Box, Button, Avatar, Typography } from "@mui/material"
import { Search as SearchIcon, Add } from "@mui/icons-material"
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom"
import Logo from "../assets/nest-blue.svg"
import genericProfileImage from "../assets/profile.png"
import { useNotification } from "../context/notificationContext"

const BASE_URL = "http://127.0.1:8000"

const Navbar = () => {
  const { isAuth, logout, userData, fetchUserData } = useAuth()
  const { showNotification } = useNotification() 
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [avatarSrc, setAvatarSrc] = useState(genericProfileImage)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isAuth) {
          const data = await fetchUserData()
          if (data?.profilephoto) {
            setAvatarSrc(getFullImageUrl(data.profilephoto))
          } else {
            setAvatarSrc(genericProfileImage)
          }
        } else {
          setAvatarSrc(genericProfileImage)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setAvatarSrc(genericProfileImage)
      }
    }

    loadUserData()
  }, [isAuth, fetchUserData])

  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    return `${BASE_URL}${imagePath}?${new Date().getTime()}`
  }

  const handleSendToHome = () => {
    navigate("/")
  }

  const handleUploadProduct = () => {
    navigate("/upload")
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const response = await fetch(`${BASE_URL}/api/products/search/?q=${searchQuery}`)
      const data = await response.json()
      console.log("Searched", data)
      navigate("/searchedresult", {
        state: {
          results: data.results || data, // Ensure we're passing the correct data structure
          query: searchQuery,
        },
      })
    } catch (error) {
      console.error("Error during search:", error)
    }
  }

  const handleProfileClick = () => {
    if (isAuth && userData?.id) {
      navigate(`/profile/${userData.id}`)
    }
  }

  // Handle logout with notification
  const handleLogout = async () => {
    try {
      await logout()
      showNotification("You have been successfully logged out", "success")
      navigate("/")
    } catch (error) {
      console.error("Error during logout:", error)
      showNotification("There was a problem logging out", "error")
    }
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Toolbar
        sx={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 280px",
          alignItems: "center",
          paddingX: "1rem !important",
          height: "6rem",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }} onClick={handleSendToHome}>
          <img src={Logo || "/placeholder.svg"} alt="Swappy Nest Logo" style={{ height: "6rem", cursor: "pointer" }} />
          <Typography variant="h6" sx={{ ml: 2, fontWeight: 600, color: "primary.main", cursor: "pointer" }}>
            Swappy Nest
          </Typography>
        </Box>

        {/* Search bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e0e0e0",
            borderRadius: "24px",
            padding: "0.5rem 1rem",
            backgroundColor: "#f5f5f5",
            width: "100%",
            maxWidth: "calc(100% - 80px)",
            margin: "0 auto",
          }}
        >
          <SearchIcon sx={{ color: "#757575", mr: 1 }} />
          <InputBase
            placeholder="Search your egg..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flex: 1 }}
          />
        </Box>

        {/* Right section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingX: "0.5rem",
          }}
        >
          <IconButton onClick={handleUploadProduct}>
            <Add />
          </IconButton>

          {isAuth && (
            <IconButton onClick={handleProfileClick}>
              <Avatar src={avatarSrc} alt={userData?.username || "User"} />
            </IconButton>
          )}
          <Button variant="contained" color="primary" onClick={isAuth ? handleLogout : () => navigate("/login")}>
            {isAuth ? "Logout" : "Login"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

