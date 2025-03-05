import { useState } from "react"
import { Dialog, DialogContent, Typography, Box, Grid, IconButton, CardActions } from "@mui/material"
import { FavoriteBorder, Share, Close } from "@mui/icons-material"
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import AvatarComponent from "./AvatarComponent"
import SwapOfferModal from "./SawpOfferModal"
import { useAuth } from "../context/authContext"

export default function ProductModal({ open, onClose, product }) {
  const [swapOfferModalOpen, setSwapOfferModalOpen] = useState(false)
  const { isAuth, userData } = useAuth()

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }

  const handleOpenSwapOffer = () => {
    setSwapOfferModalOpen(true)
  }

  const renderCarousel = () => {
    const images = product?.images || []

    if (images.length === 0) {
      return (
        <Box
          sx={{
            width: "100%",
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
          }}
        >
          <Typography variant="h6">No images available</Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Carousel
          responsive={responsive}
          showDots
          arrows
          renderDotsOutside
          draggable
          swipeable
          infinite
          minimumTouchDrag={50}
          transitionDuration={400}
          containerClass="carousel-container"
          dotListClass="custom-dot-list"
          itemClass="carousel-item"
        >
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                height: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Product ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Carousel>

        <Box
          sx={{
            textAlign: "center",
            mt: 2,
          }}
          className="custom-dot-wrapper"
        />
      </Box>
    )
  }

  if (!product) {
    return null
  }

  const isProductOwner = userData?.id === product.userId

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            width: "90%",
            maxWidth: "1200px",
            height: "90%",
            maxHeight: "800px",
            overflow: "hidden",
            borderRadius: "12px",
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            color: "grey.600",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              color: "black",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            },
          }}
        >
          <Close />
        </IconButton>
        <DialogContent sx={{ p: 0, height: "100%" }}>
          <Grid container sx={{ height: "100%" }}>
            <Grid
              item
              xs={12}
              lg={8}
              sx={{
                position: "relative",
                height: "100%",
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              {renderCarousel()}
            </Grid>

            <Grid
              item
              xs={12}
              lg={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "#fafafa", // Light background for better contrast
              }}
            >
              {/* Header section with fixed height */}
              <Box
                sx={{
                  p: 4,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "white",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    mb: 2.5,
                    color: "#333",
                  }}
                >
                  {product.name || "Not Provided"}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500, marginRight: "8px", color: "#555" }}>Upload Date:</span>
                    {product.uploadDate || "Not Provided"}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500, marginRight: "8px", color: "#555" }}>Condition:</span>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: "#e0e7ff",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "4px",
                        fontWeight: 500,
                      }}
                    >
                      {product.condition || "Not Provided"}
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500, marginRight: "8px", color: "#555" }}>Year of Purchase:</span>
                    {product.purchaseYear || "Not Provided"}
                  </Typography>
                </Box>

                <CardActions
                  disableSpacing
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingY: 2,
                    paddingLeft: 0,
                    paddingRight: 0,
                    marginTop: 2,
                  }}
                >
                  <IconButton
                    aria-label="like"
                    sx={{
                      marginLeft: 0,
                      padding: 1.5,
                      backgroundColor: "rgba(0,0,0,0.03)",
                      "&:hover": {
                        color: "primary.dark",
                        backgroundColor: "rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    <FavoriteBorder />
                  </IconButton>

                  <IconButton
                    disabled={!isAuth || isProductOwner}
                    aria-label="place an offer"
                    sx={{
                      marginLeft: "auto",
                      marginRight: "auto",
                      padding: 0,
                      color: "white",
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: "8px",
                      backgroundColor: isProductOwner ? "grey.400" : "primary.main",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: isProductOwner ? "grey.400" : "primary.dark",
                        transform: isProductOwner ? "none" : "translateY(-2px)",
                        boxShadow: isProductOwner ? "none" : "0px 6px 8px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                    onClick={() => !isProductOwner && handleOpenSwapOffer()}
                  >
                    <Typography
                      variant="button"
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                        padding: "10px 16px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Place an Offer
                    </Typography>
                  </IconButton>

                  <IconButton
                    aria-label="share"
                    sx={{
                      marginRight: 0,
                      padding: 1.5,
                      backgroundColor: "rgba(0,0,0,0.03)",
                      "&:hover": {
                        color: "primary.dark",
                        backgroundColor: "rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    <Share />
                  </IconButton>
                </CardActions>
              </Box>

              {/* Description section with flexible height and scrolling */}
              <Box
                sx={{
                  p: 4,
                  flexGrow: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "white",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    mb: 2.5,
                  }}
                >
                  Description
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    pr: 2,
                    // Custom scrollbar styling
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "rgba(0,0,0,0.03)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,0.15)",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.25)",
                      },
                    },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: "#444",
                      fontSize: "1rem",
                    }}
                  >
                    {product.description || "No description provided"}
                  </Typography>
                </Box>
              </Box>

              {/* Footer section with fixed height */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 4,
                  borderTop: 1,
                  borderColor: "divider",
                  backgroundColor: "white",
                  boxShadow: "0px -2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Uploaded By: <span style={{ color: "#333" }}>{product.uploadedBy || "Not Provided"}</span>
                </Typography>
                <AvatarComponent
                  src={product.userProfilePic}
                  userId={product.userId}
                  size={48} // Larger avatar
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <SwapOfferModal
        isOpen={swapOfferModalOpen}
        onClose={() => setSwapOfferModalOpen(false)}
        selectedProduct={product}
      />
    </>
  )
}

