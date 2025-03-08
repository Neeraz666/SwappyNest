import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Snackbar, Alert } from "@mui/material"
import ThemeComponent from "./theme"
import Home from "./pages/Home"
import SearchResultLayout from "./pages/SearchResultLayout"
import Profile from "./components/Profile"
import EditProfile from "./components/EditProfile"
import Login from "./components/Login"
import UploadProduct from "./components/UploadProduct"
import { AuthProvider } from "./context/authContext"
import { NotificationProvider, useNotification } from "./context/notificationContext"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./components/404"
import { LikedProductsProvider } from "./context/likedProductsContext"

const GlobalSnackbar = () => {
  const { notification, hideNotification } = useNotification()

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: "100%" }}>
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

function App() {
  return (
    <ThemeComponent>
      <NotificationProvider>
        <Router>
          <AuthProvider>
            <LikedProductsProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/searchedresult" element={<SearchResultLayout />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route
                  path="/profile/:userId/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadProduct />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <GlobalSnackbar />
            </LikedProductsProvider>
          </AuthProvider>
        </Router>
      </NotificationProvider>
    </ThemeComponent>
  )
}

export default App

