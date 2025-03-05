"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material"
import { Edit, Email, Person, Phone, LocationOn, Star, Favorite, RateReview } from "@mui/icons-material"
import axios from "axios"
import ProductModal from "../components/ProductModal"
import EditProfile from "./EditProfile"
import { useAuth } from "../context/authContext"
import genericProfileImage from "../assets/profile.png"
import MainLayout from "../pages/MainLayout"

const BASE_URL = "http://127.0.0.1:8000"

export default function Profile() {
  const { userId } = useParams()
  const { userData, fetchUserData } = useAuth()
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const loadProfileData = async () => {
    try {
      const user = await fetchUserData(userId)
      setUser(user)

      const productsResponse = await axios.get(`${BASE_URL}/api/user/${userId}/products`)
      setProducts(productsResponse.data)
    } catch (error) {
      console.error("Error fetching profile data:", error)
    }
  }

  useEffect(() => {
    if (userId) {
      loadProfileData()
    }
  }, [userId]) // Removed loadProfileData from dependencies

  const handleEditOpen = () => {
    setOpenEditDialog(true)
  }

  const handleEditClose = () => {
    setOpenEditDialog(false)
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  const handleCreateReview = () => {
    setOpenReviewModal(true)
  }

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false)
    setRating(0)
    setReviewContent("")
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setSnackbar({ open: true, message: "Please provide a rating", severity: "error" })
      return
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/createreview/`,
        {
          reviewed_user: user.email,
          rating,
          content: reviewContent,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )

      if (response.data.success) {
        setSnackbar({ open: true, message: "Review submitted successfully", severity: "success" })
        handleCloseReviewModal()
        loadProfileData() // Refresh profile data to show the new review
      } else {
        setSnackbar({ open: true, message: "Failed to submit review", severity: "error" })
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.error || "An error occurred", severity: "error" })
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  if (!user) {
    return (
      <MainLayout>
        <Typography>Loading...</Typography>
      </MainLayout>
    )
  }

  const isAuthenticatedAndOwnProfile = userData && userData.id === Number.parseInt(userId)
  const isAuthenticatedAndNotOwnProfile = userData && userData.id !== Number.parseInt(userId)

  return (
    <MainLayout>
      <Box sx={{ py: 4 }}>
        <Card elevation={3} sx={{ mb: 4, overflow: "hidden" }}>
          <Box
            sx={{
              height: 200,
              bgcolor: "primary.main",
              position: "relative",
              backgroundImage: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            }}
          >
            <Avatar
              src={user.profilephoto ? `${BASE_URL}${user.profilephoto}` : genericProfileImage}
              alt={`${user.firstname} ${user.lastname}`}
              sx={{
                width: 150,
                height: 150,
                border: "5px solid white",
                position: "absolute",
                bottom: -75,
                left: 50,
              }}
            />
          </Box>
          <Box sx={{ mt: 10, p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  {user.firstname || "N/A"} {user.lastname || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                  {user.username || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Email sx={{ mr: 1, verticalAlign: "middle" }} />
                  {user.email || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Phone sx={{ mr: 1, verticalAlign: "middle" }} />
                  {user.phone || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                  {user.address || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  {isAuthenticatedAndOwnProfile && (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditOpen}
                      sx={{ width: "fit-content" }}
                    >
                      Edit Profile
                    </Button>
                  )}
                  {isAuthenticatedAndNotOwnProfile && (
                    <Button
                      variant="contained"
                      startIcon={<Star />}
                      onClick={handleCreateReview}
                      sx={{ width: "fit-content" }}
                    >
                      Create Review
                    </Button>
                  )}
                  <Button variant="contained" startIcon={<Favorite />} sx={{ width: "fit-content" }}>
                    Liked Posts
                  </Button>
                  <Button variant="contained" startIcon={<RateReview />} sx={{ width: "fit-content" }}>
                    Reviews
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          My Products
        </Typography>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                onClick={() => handleProductClick(product)}
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product.images[0]
                      ? `${BASE_URL}${product.images[0].image}`
                      : "/placeholder.svg?height=200&width=250"
                  }
                  alt={product.productname}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0 }}>
                    {product.productname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.condition} • {product.purchaseyear}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <EditProfile
        open={openEditDialog}
        onClose={handleEditClose}
        onProfileUpdated={() => {
          setOpenEditDialog(false)
          loadProfileData()
        }}
      />

      <Dialog open={openReviewModal} onClose={handleCloseReviewModal}>
        <DialogTitle>Create Review</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue)
              }}
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="review"
            label="Review"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewModal}>Cancel</Button>
          <Button onClick={handleSubmitReview}>Submit Review</Button>
        </DialogActions>
      </Dialog>

      <ProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        product={
          selectedProduct
            ? {
                name: selectedProduct.productname,
                uploadDate: selectedProduct.created_at,
                condition: selectedProduct.condition,
                purchaseYear: selectedProduct.purchaseyear,
                description: selectedProduct.description,
                images: selectedProduct.images.map((img) => `${BASE_URL}${img.image}`),
                uploadedBy: user.username,
                userId: user.id,
                userProfilePic: user.profilephoto
                  ? `${BASE_URL}${user.profilephoto}`
                  : "/placeholder.svg?height=40&width=40",
              }
            : null
        }
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  )
}

