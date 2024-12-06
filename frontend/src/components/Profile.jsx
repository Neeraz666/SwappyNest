import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Avatar, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { Edit, Email, Person, Phone, LocationOn } from '@mui/icons-material';
import axios from 'axios';
import ProductModal from '../components/ProductModal';
import EditProfile from './EditProfile';
import { useAuth } from '../context/authContext';
import genericProfileImage from '../assets/profile.png';

const BASE_URL = 'http://127.0.0.1:8000';

export default function Profile() {
  const { userId } = useParams();
  const { userData, fetchUserData } = useAuth();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadProfileData = async () => {
    try {
      const user = await fetchUserData(userId);
      setUser(user);

      const productsResponse = await axios.get(`${BASE_URL}/api/user/${userId}/products`);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const handleEditOpen = () => {
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  const isAuthenticatedAndOwnProfile = userData && userData.id === parseInt(userId);

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Card elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 200,
              bgcolor: 'primary.main',
              position: 'relative',
              backgroundImage: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            <Avatar
              src={user.profilephoto ? `${BASE_URL}${user.profilephoto}` : genericProfileImage}
              alt={`${user.firstname} ${user.lastname}`}
              sx={{
                width: 150,
                height: 150,
                border: '5px solid white',
                position: 'absolute',
                bottom: -75,
                left: 50,
              }}
            />
          </Box>
          <Box sx={{ mt: 10, p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom>
                  {user.firstname || 'N/A'} {user.lastname || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {user.username || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {user.email || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {user.phone || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {user.address || 'N/A'}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                }}
              >
                {isAuthenticatedAndOwnProfile && (
                  <Button variant="contained" startIcon={<Edit />} onClick={handleEditOpen}>
                    Edit Profile
                  </Button>
                )}
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
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
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
                      : '/placeholder.svg?height=200&width=250'
                  }
                  alt={product.productname}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
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
          setOpenEditDialog(false);
          loadProfileData();
        }}
      />

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
                  : '/placeholder.svg?height=40&width=40',
              }
            : null
        }
      />
    </Container>
  );
}

