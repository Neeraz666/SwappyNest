import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Avatar
} from '@mui/material';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function ProductModal({ open, onClose, product }) {
  const defaultProduct = {
    name: "MacBook",
    uploadDate: "2024-11-15 10:11",
    condition: "Used",
    purchaseYear: "2022",
    description: "Product description goes here",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600"
    ],
    uploadedBy: "username"
  };

  product = product || defaultProduct;

  const [tabValue, setTabValue] = useState(0);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderCarousel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Carousel
        responsive={responsive}
        showDots
        arrows // Remove navigation arrows
        renderDotsOutside // Render dots outside
        draggable // Enable drag
        swipeable // Enable swipe
        infinite // Enable infinite scrolling
        minimumTouchDrag={50} // Reduce drag threshold
        transitionDuration={400} // Smooth transition
        containerClass="carousel-container"
        dotListClass="custom-dot-list"
        itemClass="carousel-item"
      >
        {product.images.map((image, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '80vh', // Fixed height for image container in the modal (adjust as needed)
              display: 'flex',
              alignItems: 'center', // Center the image vertically
              justifyContent: 'center', // Center the image horizontally
              backgroundColor: '#fff', // Light greyish color for the empty space
            }}
          >
            <img
              src={image}
              alt={`Product ${index + 1}`}
              style={{
                width: '100%', // Ensure it fills the width of the container
                height: '100%', // Ensure it fills the height of the container
                objectFit: 'contain', // Ensure the image fits within the box without cropping
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Carousel>


      {/* Dots Wrapper for Styling */}
      <Box
        sx={{
          textAlign: 'center',
          mt: 2,
        }}
        className="custom-dot-wrapper"
      />
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          width: '90%',
          maxWidth: '1200px',
          height: '90%',
          maxHeight: '800px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Left side - Carousel */}
          <Grid
            item
            xs={12}
            lg={8}
            sx={{
              position: 'relative',
              height: '100%',
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            {renderCarousel()}
          </Grid>

          {/* Right side - Product Details */}
          <Grid
            item
            xs={12}
            lg={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>Product Name: {product.name}</Typography>
              <Typography variant="body2" color="text.secondary">Upload Date: {product.uploadDate}</Typography>
              <Typography variant="body2">Condition: {product.condition}</Typography>
              <Typography variant="body2">Year of Purchase: {product.purchaseYear}</Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" aria-label="product details tabs">
                  <Tab label="Description" />
                  <Tab label="Comments" />
                </Tabs>
              </Box>
              <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                  <Typography variant="body2">{product.description}</Typography>
                )}
                {tabValue === 1 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>CA</Avatar>
                    <Box>
                      <Typography variant="subtitle2">Comment Author</Typography>
                      <Typography variant="body2" color="text.secondary">This is a sample comment.</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Uploaded By: {product.uploadedBy}
              </Typography>
              <Avatar sx={{ width: 40, height: 40 }} src={product.userProfilePic} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
