"use client"

import { useState, useEffect } from "react"
import { Modal, Box, Typography, Rating, Divider, CircularProgress, IconButton } from "@mui/material"
import { Close } from "@mui/icons-material"
import axios from "axios"
import AvatarComponent from "./AvatarComponent" // Using your existing component

const BASE_URL = "http://localhost:8000"

const ReviewsModal = ({ open, onClose, userId }) => {
  const [reviews, setReviews] = useState([])
  const [reviewersData, setReviewersData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMore, setShowMore] = useState({})

  useEffect(() => {
    if (open && userId) {
      fetchReviews()
    }
  }, [open, userId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/user/foruserreviewlist/${userId}`)
      setReviews(response.data.results)

      // Fetch reviewer information for each review
      const reviewerIds = [...new Set(response.data.results.map((review) => review.reviewer))]
      await fetchReviewersData(reviewerIds)

      setError(null)
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Failed to load reviews. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewersData = async (reviewerIds) => {
    const reviewersInfo = {}

    try {
      // Fetch data for each reviewer in parallel
      const promises = reviewerIds.map(async (reviewerId) => {
        try {
          const response = await axios.get(`${BASE_URL}/api/user/profile/${reviewerId}/`)
          reviewersInfo[reviewerId] = response.data
        } catch (error) {
          console.error(`Error fetching data for reviewer ${reviewerId}:`, error)
          // Set default data if we can't fetch the reviewer info
          reviewersInfo[reviewerId] = {
            firstname: "Unknown",
            lastname: "User",
            profilephoto: null,
          }
        }
      })

      await Promise.all(promises)
      setReviewersData(reviewersInfo)
    } catch (error) {
      console.error("Error fetching reviewer data:", error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReviewerName = (reviewerId) => {
    const reviewer = reviewersData[reviewerId]
    if (!reviewer) return `Reviewer #${reviewerId}`

    const firstName = reviewer.firstname || ""
    const lastName = reviewer.lastname || ""

    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }

    return reviewer.username || `Reviewer #${reviewerId}`
  }

  const getReviewerPhoto = (reviewerId) => {
    const reviewer = reviewersData[reviewerId]
    if (!reviewer || !reviewer.profilephoto) return null

    return `${BASE_URL}${reviewer.profilephoto}`
  }

  // Handler to close modal when clicking on a reviewer's avatar
  const handleAvatarClick = () => {
    onClose() // Close the modal
    // Navigation will be handled by the AvatarComponent's Link
  }

  // Handler to toggle showing more/less text for a review
  const handleToggleDescription = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reviews-modal-title"
      aria-describedby="reviews-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "600px" },
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          outline: "none",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" id="reviews-modal-title">
            User Reviews
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="medium">
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 3,
            overflowY: "auto",
            flexGrow: 1,
          }}
          id="reviews-modal-description"
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" py={2}>
              {error}
            </Typography>
          ) : reviews.length === 0 ? (
            <Typography align="center" py={2}>
              No reviews available for this user.
            </Typography>
          ) : (
            <Box sx={{ py: 1 }}>
              {reviews.map((review, index) => (
                <Box key={review.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                    <Box onClick={handleAvatarClick}>
                      <AvatarComponent
                        userId={review.reviewer}
                        size={40}
                        src={getReviewerPhoto(review.reviewer) || `/placeholder.svg?height=40&width=40`}
                      />
                    </Box>
                    <Box sx={{ ml: 2, width: "100%" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {getReviewerName(review.reviewer)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" precision={0.5} sx={{ mt: 0.5 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.content.length > 100
                          ? showMore[review.id]
                            ? review.content
                            : review.content.slice(0, 100)
                          : review.content}
                        {review.content.length > 100 && (
                          <>
                            {!showMore[review.id] && "..."}
                            <Typography
                              component="span"
                              variant="body2"
                              onClick={() => handleToggleDescription(review.id)}
                              sx={{
                                color: "primary.main",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                                marginLeft: "4px",
                                display: "inline-block",
                              }}
                            >
                              {showMore[review.id] ? "Show less" : "See more"}
                            </Typography>
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          )}
        </Box>

      </Box>
    </Modal>
  )
}

export default ReviewsModal

