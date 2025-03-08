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
import {
  Edit,
  Email,
  Person,
  Phone,
  LocationOn,
  Star,
  Favorite,
  RateReview,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material"
import axios from "axios"
import ProductModal from "../components/ProductModal"
import EditProfile from "./EditProfile"
import { useAuth } from "../context/authContext"
import genericProfileImage from "../assets/profile.png"
import MainLayout from "../pages/MainLayout"
import ReviewsModal from "./ReviewsModal"
import LikedPostsModal from "./LikedModalProducts"
import AvatarComponent from "./AvatarComponent"

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
  const [reviewContentError, setReviewContentError] = useState("") // New state for validation
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [likedPostsModalOpen, setLikedPostsModalOpen] = useState(false)
  const [userReviews, setUserReviews] = useState([])
  const [existingReview, setExistingReview] = useState(null) // Added state for existing review

  const [expandedReviews, setExpandedReviews] = useState({})

  const [reviewerInfo, setReviewerInfo] = useState({})

  const isAuthenticatedAndNotOwnProfile = userData && userData.id !== Number.parseInt(userId)
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  const loadProfileData = async () => {
    try {
      const user = await fetchUserData(userId)
      setUser(user)

      const productsResponse = await axios.get(`${BASE_URL}/api/user/${userId}/products`)
      setProducts(productsResponse.data)

      // Check if the profile belongs to the authenticated user
      const isAuthenticatedAndOwnProfile = userData && userData.id === Number.parseInt(userId)

      if (isAuthenticatedAndOwnProfile) {
        const reviewsResponse = await axios.get(`${BASE_URL}/api/user/byuserreviewlist/${userId}/`)
        setUserReviews(reviewsResponse.data)

        // Fetch reviewer information for each review
        const reviewerInfoPromises = reviewsResponse.data.map((review) => fetchUserData(review.reviewed_user))
        const reviewerInfoResults = await Promise.all(reviewerInfoPromises)
        const reviewerInfoMap = {}
        reviewerInfoResults.forEach((reviewer, index) => {
          reviewerInfoMap[reviewsResponse.data[index].reviewed_user] = reviewer
        })
        setReviewerInfo(reviewerInfoMap)
      }

      // Check if the authenticated user has already reviewed this profile user
      if (isAuthenticatedAndNotOwnProfile) {
        try {
          const userReviewsResponse = await axios.get(`${BASE_URL}/api/user/byuserreviewlist/${userData.id}/`)
          // Find if there's an existing review for this profile user
          const review = userReviewsResponse.data.find((r) => r.reviewed_user === Number(userId))
          if (review) {
            setExistingReview(review)
          }
        } catch (error) {
          console.error("Error fetching user reviews:", error)
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    }
  }

  useEffect(() => {
    if (userId) {
      loadProfileData()
    }
  }, [userId, userData]) // Added userData to dependencies

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
    if (existingReview) {
      setRating(existingReview.rating)
      setReviewContent(existingReview.content)
    } else {
      setRating(0)
      setReviewContent("")
    }
    setOpenReviewModal(true)
  }

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false)
    setRating(0)
    setReviewContent("")
    setReviewContentError("") // Reset error state when closing
  }

  const handleSubmitReview = async () => {
    // Reset error state
    setReviewContentError("")

    // Validate rating
    if (rating === 0) {
      setSnackbar({ open: true, message: "Please provide a rating", severity: "error" })
      return
    }

    // Validate review content length
    if (!reviewContent || reviewContent.trim().length < 15) {
      setReviewContentError("Review must be at least 15 characters long")
      return
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/createreview/`,
        {
          reviewed_user: user.email,
          rating,
          content: reviewContent,
        }
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

  const handleOpenReviewsModal = () => {
    setReviewsModalOpen(true)
  }

  const handleCloseReviewsModal = () => {
    setReviewsModalOpen(false)
  }

  const handleOpenLikedPostsModal = () => {
    setLikedPostsModalOpen(true)
  }

  const handleCloseLikedPostsModal = () => {
    setLikedPostsModalOpen(false)
  }

  if (!user) {
    return (
      <MainLayout>
        <Typography>Loading...</Typography>
      </MainLayout>
    )
  }

  const isAuthenticatedAndOwnProfile = userData && userData.id === Number.parseInt(userId)


  return (
    <MainLayout>
      <Box>
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
                      startIcon={<Favorite />}
                      onClick={handleOpenLikedPostsModal}
                      sx={{ width: "fit-content" }}
                    >
                      Liked Products
                    </Button>
                  )}
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
                      startIcon={existingReview ? <Edit /> : <Star />}
                      onClick={handleCreateReview}
                      sx={{ width: "fit-content" }}
                    >
                      {existingReview ? "Edit Review" : "Create Review"}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<RateReview />}
                    onClick={handleOpenReviewsModal}
                    sx={{ width: "fit-content" }}
                  >
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
        <Card
          elevation={3}
          sx={{
            mb: 4,
            overflow: "hidden",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ p: 3, maxHeight: "80vh", overflow: "auto" }}>
            {products.length > 0 ? (
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
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)",
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
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products uploaded yet
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {isAuthenticatedAndOwnProfile
                    ? "You haven't uploaded any products. Start sharing your items with the community!"
                    : "This user hasn't uploaded any products yet."}
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
        {isAuthenticatedAndOwnProfile && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, mt: 4 }}>
              My Reviews
            </Typography>
            <Card elevation={3} sx={{ mb: 4, overflow: "hidden", borderRadius: "8px" }}>
              <Box sx={{ p: 3, maxHeight: "80vh", overflow: "auto" }}>
                {userReviews.length > 0 ? (
                  <Grid container spacing={3}>
                    {userReviews.map((review) => (
                      <Grid item xs={12} sm={6} md={4} key={review.id}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                              boxShadow: 3,
                              transform: "translateY(-4px)",
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <AvatarComponent
                                src={
                                  reviewerInfo[review.reviewed_user]?.profilephoto
                                    ? `${BASE_URL}${reviewerInfo[review.reviewed_user].profilephoto}`
                                    : genericProfileImage
                                }
                                userId={review.reviewed_user}
                                size={40}
                              />
                              <Typography variant="subtitle1" sx={{ ml: 2 }}>
                                {reviewerInfo[review.reviewed_user]?.username || "Unknown User"}
                              </Typography>
                            </Box>
                            <Typography gutterBottom variant="h6" component="div">
                              Rating: {review.rating}/5
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {expandedReviews[review.id]
                                ? review.content
                                : `${review.content.substring(0, 100)}${review.content.length > 100 ? "..." : ""}`}
                            </Typography>
                            {review.content.length > 100 && (
                              <Button
                                onClick={() => toggleReviewExpansion(review.id)}
                                endIcon={expandedReviews[review.id] ? <ExpandLess /> : <ExpandMore />}
                                sx={{ mt: 1, p: 0 }}
                              >
                                {expandedReviews[review.id] ? "Show Less" : "Show More"}
                              </Button>
                            )}
                          </CardContent>
                          <CardContent>
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 8,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No reviews written yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      You haven't written any reviews yet. Start sharing your experiences with the community!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </>
        )}
      </Box>

      <EditProfile
        open={openEditDialog}
        onClose={handleEditClose}
        onProfileUpdated={() => {
          setOpenEditDialog(false)
          loadProfileData()
        }}
      />

      <Dialog open={openReviewModal} onClose={handleCloseReviewModal} maxWidth={false}>
        <DialogTitle>{existingReview ? "Edit Review" : "Create Review"}</DialogTitle>
        <DialogContent sx={{ width: "500px" }}>
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
            onChange={(e) => {
              setReviewContent(e.target.value)
              if (e.target.value.trim().length >= 15) {
                setReviewContentError("")
              }
            }}
            error={!!reviewContentError}
            helperText={reviewContentError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewModal}>Cancel</Button>
          <Button onClick={handleSubmitReview}>{existingReview ? "Update" : "Submit"}</Button>
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
              id: selectedProduct.id,
            }
            : null
        }
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <ReviewsModal open={reviewsModalOpen} onClose={handleCloseReviewsModal} userId={userId} />
      <LikedPostsModal open={likedPostsModalOpen} onClose={handleCloseLikedPostsModal} />
    </MainLayout>
  )
}

