import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Delete as DeleteIcon, AddPhotoAlternate } from "@mui/icons-material"
import { useAuth } from "../context/authContext"

const BASE_URL = "http://127.0.0.1:8000"

export default function EditProfile({ open, onClose, onProfileUpdated }) {
  const { userId } = useParams()
  const { userData, fetchUserData, updateUserData } = useAuth()
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        let userResponse
        if (userData && userData.id) {
          userResponse = { data: userData }
        } else {
          userResponse = await axios.get(`${BASE_URL}/api/user/profile/${userId}/`)
        }

        setUser(userResponse.data)
        if (userResponse.data.profilephoto) {
          setProfilePicturePreview(`${BASE_URL}${userResponse.data.profilephoto}`)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userId, userData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUser((prevUser) => ({ ...prevUser, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      setProfilePicturePreview(URL.createObjectURL(file))
      setUser((prevUser) => ({ ...prevUser, profilephoto: file }))
    }
  }

  const handleRemoveImage = () => {
    setProfilePicture(null)
    setProfilePicturePreview(null)
    setUser((prevUser) => ({ ...prevUser, profilephoto: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append("email", user.email || "")
    formData.append("firstname", user.firstname || "")
    formData.append("lastname", user.lastname || "")
    formData.append("phone", user.phone || "")
    formData.append("address", user.address || "")

    if (profilePicture) {
      formData.append("profilephoto", profilePicture)
    } else if (profilePicturePreview === null) {
      formData.append("remove_profilephoto", "true")
    }

    try {
      const response = await axios.put(`${BASE_URL}/api/user/profile/${userId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      updateUserData(response.data)
      await fetchUserData()
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      })

      if (response.data.profilephoto) {
        onProfileUpdated(response.data.profilephoto)
      } else {
        onProfileUpdated(null)
      }

      onClose()
    } catch (error) {
      console.error("Error updating user data:", error)
      setError(`Failed to update profile: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Container
            maxWidth="sm"
            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
          >
            <CircularProgress />
          </Container>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Profile
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                {profilePicturePreview ? (
                  <Box sx={{ position: "relative", mb: 2 }}>
                    <Avatar src={profilePicturePreview} sx={{ width: 150, height: 150 }} />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Avatar sx={{ width: 150, height: 150, mb: 2 }} />
                )}
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="profile-picture-upload">
                  <Button variant="outlined" component="span" startIcon={<AddPhotoAlternate />}>
                    {profilePicturePreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                </label>
              </Box>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={user.email || ""}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                name="username"
                value={user.username || ""}
                InputProps={{
                  readOnly: true,
                }}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="First Name"
                name="firstname"
                value={user.firstname || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="lastname"
                value={user.lastname || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Phone"
                name="phone"
                value={user.phone || ""}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Address"
                name="address"
                value={user.address || ""}
                onChange={handleInputChange}
                multiline
              />
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} onClick={handleSubmit}>
            {saving ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar - shown outside the dialog */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

