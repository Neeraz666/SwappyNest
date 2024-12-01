import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Typography,
  Box,
  Grid,
  Avatar,
  CardActions,
  IconButton,
} from '@mui/material';
import { FavoriteBorder, Share } from '@mui/icons-material';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { defaultComments } from '../defaultComment'; 
import CommentSection from './CommentSection';
import AvatarComponent from './AvatarComponent';

export default function ProductModal({ open, onClose, product }) {
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

  const renderCarousel = () => {
    const images = product?.images || [];

    if (images.length === 0) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
          }}
        >
          <Typography variant="h6">No images available</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                width: '100%',
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
              }}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          ))}
        </Carousel>

        <Box
          sx={{
            textAlign: 'center',
            mt: 2,
          }}
          className="custom-dot-wrapper"
        />
      </Box>
    );
  };

  if (!product) {
    return null; // or return a loading indicator, or an error message
  }
  console.log(product)

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
            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
              <Typography variant="h6" gutterBottom>{product.name || 'Not Provided'}</Typography>
              <Typography variant="body2" color="text.secondary">Upload Date: {product.uploadDate || 'Not Provided'}</Typography>
              <Typography variant="body2">Condition: {product.condition || 'Not Provided'}</Typography>
              <Typography variant="body2">Year of Purchase: {product.purchaseYear || 'Not Provided'}</Typography>
              <CardActions
                disableSpacing
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingY: 2,
                  paddingLeft: 0,
                  paddingRight: 0,
                  marginTop: 1,
                }}
              >
                <IconButton aria-label="like" sx={{ marginLeft: 0, padding: 0, '&:hover': { color: 'primary.dark' } }}>
                  <FavoriteBorder />
                </IconButton>



                <IconButton aria-label="share" sx={{ marginRight: 0, padding: 0, '&:hover': { color: 'primary.dark' } }}>
                  <Share />
                </IconButton>
              </CardActions>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" aria-label="product details tabs">
                  <Tab label="Description" />
                  <Tab label="Comments" />
                </Tabs>
              </Box>

              <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                  <Typography variant="body2">{product.description || 'No description provided'}</Typography>
                )}
                {tabValue === 1 && (
                  <Box sx={{ mt: 2 }}>
                    {/* Pass the defaultComments to the CommentSection component */}
                    <CommentSection comments={defaultComments} />
                  </Box>
                )}
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Uploaded By: {product.uploadedBy || 'Not Provided'}
              </Typography>
       
              <AvatarComponent src={product.userProfilePic} userId={product.userId} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
