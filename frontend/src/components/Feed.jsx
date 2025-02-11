import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Card, CardContent, CardActions, CircularProgress, Container } from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline, Share } from '@mui/icons-material';
import genericProfileImage from '../assets/profile.png';
import ProductModal from './ProductModal';
import AvatarComponent from './AvatarComponent';

const BASE_URL = 'http://127.0.1:8000';

export default function Feed({ initialProducts = [], searchQuery, categorySlug }) {
  const [products, setProducts] = useState(initialProducts);
  const [showMore, setShowMore] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const loader = useRef(null);
  const observer = useRef(null);

  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('Last product is visible, fetching more products');
        fetchProducts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      let url;
      if (categorySlug) {
        // Fetch products for the specific category
        url = nextPageUrl || `${BASE_URL}/api/products/${categorySlug}/`;
      } else if (searchQuery) {
        // Fetch products based on the search query
        url = nextPageUrl || `${BASE_URL}/api/products/search/?q=${searchQuery}`;
      } else {
        // Fetch all products
        url = nextPageUrl || `${BASE_URL}/api/products/listallproduct/`;
      }
      console.log(`Fetching products from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);

      if (data.results && data.results.length > 0) {
        setProducts(prevProducts => {
          const newProducts = data.results.filter(newProduct =>
            !prevProducts.some(existingProduct => existingProduct.id === newProduct.id)
          );
          console.log(`Adding ${newProducts.length} new products`);
          return [...prevProducts, ...newProducts];
        });
        setNextPageUrl(data.next);
        setHasMore(!!data.next);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [nextPageUrl, loading, hasMore, categorySlug, searchQuery]);

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts();
    } else {
      setProducts(initialProducts);
    }
  }, [categorySlug, searchQuery]); // Add categorySlug and searchQuery as dependencies

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BASE_URL}${imagePath}`;
  };

  const renderImages = (images, product) => {
    const totalImages = images.length;

    if (totalImages === 0) {
      return null;
    }

    if (totalImages === 1) {
      return (
        <Box sx={{ height: 400, marginTop: 1, cursor: 'pointer' }} onClick={() => handleOpenModal(product)}>
          <Box
            sx={{
              height: '100%',
              bgcolor: 'grey.300',
              backgroundImage: `url(${getFullImageUrl(images[0].image)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Box>
      );
    }

    if (totalImages === 2) {
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, height: 300, marginTop: 1, cursor: 'pointer' }} onClick={() => handleOpenModal(product)}>
          {images.map((img, index) => (
            <Box
              key={index}
              sx={{
                height: '100%',
                bgcolor: 'grey.300',
                backgroundImage: `url(${getFullImageUrl(img.image)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, height: 300, marginTop: 1, cursor: 'pointer' }} onClick={() => handleOpenModal(product)}>
        <Box
          sx={{
            gridRow: 'span 2',
            bgcolor: 'grey.300',
            backgroundImage: `url(${getFullImageUrl(images[0].image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            bgcolor: 'grey.300',
            backgroundImage: `url(${getFullImageUrl(images[1].image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            bgcolor: 'grey.300',
            backgroundImage: `url(${getFullImageUrl(images[2].image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {totalImages > 3 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white' }}>+{totalImages - 3}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const handleToggleDescription = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <Container
      sx={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 0,
        overflowY: 'auto', // Enable scrolling
        msOverflowStyle: 'none',  // Hide scrollbar for IE and Edge
        scrollbarWidth: 'none',   // Hide scrollbar for Firefox
        '&::-webkit-scrollbar': {
          display: 'none',        // Hide scrollbar for Chrome, Safari, and Opera
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '100%',
        }}
      >
        {products.map((product, index) => {
          const { id, productname, description, purchaseyear, condition, created_at, user, images, category } = product;
          const avatarSrc = user.profilephoto ? getFullImageUrl(user.profilephoto) : genericProfileImage;

          return (
            <Card
              key={id}
              ref={index === products.length - 1 ? lastProductElementRef : null}
              variant="outlined"
              sx={{
                width: '100%',
                maxWidth: '800px',
                padding: 2,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                mb: 3,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontSize: '2rem', fontWeight: 'bold' }}>{productname}</Typography>
                  <Typography component='span' variant="caption">{created_at} | </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#e0e7ff',
                      borderRadius: '4px',
                      color: '#000',
                    }}
                  >
                    {condition}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#ffd700',
                      borderRadius: '4px',
                      color: '#000',
                      marginLeft: '8px',
                    }}
                  >
                    {category}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ fontSize: '1.2rem', marginRight: 1 }}>{user.username}</Typography>
                  <AvatarComponent src={avatarSrc} userId={user.id} />
                </Box>
              </Box>

              <CardContent sx={{ paddingLeft: 0, paddingRight: 0 }}>
                <Typography sx={{ fontSize: '1.1rem', }} variant="body2">Year of Purchase: {purchaseyear}</Typography>
                <Typography variant="body2" sx={{ fontSize: '1.1rem', marginTop: 1 }}>
                  Description: {description.length > 100
                    ? (showMore[id]
                      ? description
                      : description.slice(0, 100))
                    : description}
                  {description.length > 100 && (
                    <>
                      {!showMore[id] && '...'}
                      <Typography
                        component="span"
                        variant="body2"
                        onClick={() => handleToggleDescription(id)}
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                          marginLeft: '4px',
                        }}
                      >
                        {showMore[id] ? 'Show less' : 'See more'}
                      </Typography>
                    </>
                  )}
                </Typography>
              </CardContent>

              {renderImages(images, product)}

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

                <IconButton
                  aria-label="place an offer"
                  sx={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    padding: 0,
                    color: 'white', // Changed to white for better contrast
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: '8px',
                    backgroundColor: 'primary.main', // More vibrant background
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Added shadow for depth
                    transition: 'all 0.3s ease', // Smooth transition for hover effects
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      color: 'white',
                      borderColor: 'primary.dark',
                      transform: 'translateY(-2px)', // Slight lift on hover
                      boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.15)', // Enhanced shadow on hover
                    },
                    '&:active': {
                      transform: 'translateY(0)', // Reset lift on click
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Reset shadow on click
                    },
                  }}
                  onClick={() => handleOpenModal(product)}
                >
                  <Typography
                    variant="button"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      padding: '6px 12px',
                      textTransform: 'uppercase', // Uppercase text for emphasis
                      letterSpacing: '0.05em', // Slight letter spacing for better readability
                    }}
                  >
                    Place an Offer
                  </Typography>
                </IconButton>

                <IconButton aria-label="share" sx={{ marginRight: 0, padding: 0, '&:hover': { color: 'primary.dark' } }}>
                  <Share />
                </IconButton>
              </CardActions>
            </Card>
          );
        })}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {!hasMore && (
          <Typography variant="body2" sx={{ textAlign: 'center', my: 2 }}>
            No more products to load
          </Typography>
        )}
      </Box>
      <ProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        product={selectedProduct ? {
          name: selectedProduct.productname,
          uploadDate: selectedProduct.created_at,
          condition: selectedProduct.condition,
          purchaseYear: selectedProduct.purchaseyear,
          description: selectedProduct.description,
          images: selectedProduct.images.map(img => getFullImageUrl(img.image)),
          uploadedBy: selectedProduct.user.username,
          userProfilePic: selectedProduct.user.profilephoto ? getFullImageUrl(selectedProduct.user.profilephoto) : genericProfileImage,
          userId: selectedProduct.user.id,
          category: selectedProduct.category
        } : null}
      />
    </Container>
  );
}