import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline, Share } from '@mui/icons-material';
import genericProfileImage from '../assets/profile.png';
import ProductModal from './ProductModal';
import { defaultComments } from '../defaultComment';
import CommentSection from './CommentSection';
import AvatarComponent from './AvatarComponent';

const BASE_URL = 'http://127.0.1:8000';

export default function Feed({ initialProducts = [] }) {
    const [products, setProducts] = useState(initialProducts);
    const [showMore, setShowMore] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const loader = useRef(null);
    const observer = useRef(null);

    console.log('Feed component rendered. Products:', products.length, 'NextPageUrl:', nextPageUrl, 'HasMore:', hasMore, 'Loading:', loading);

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
            console.log(`Fetching products from: ${nextPageUrl || `${BASE_URL}/api/products/listallproduct/`}`);
            const response = await fetch(nextPageUrl || `${BASE_URL}/api/products/listallproduct/`);
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
    }, [nextPageUrl, loading, hasMore]);

    useEffect(() => {
        if (initialProducts.length === 0) {
            fetchProducts();
        } else {
            setProducts(initialProducts);
        }
    }, []);

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
                <Box sx={{ height: 300, marginTop: 1, cursor: 'pointer' }} onClick={() => handleOpenModal(product)}>
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
        <Box>
            {products.map((product, index) => {
                const { id, productname, description, purchaseyear, condition, created_at, user, images, category } = product;
                const avatarSrc = user.profilephoto ? getFullImageUrl(user.profilephoto) : genericProfileImage;

                return (
                    <Card
                        key={id}
                        ref={index === products.length - 1 ? lastProductElementRef : null}
                        variant="outlined"
                        sx={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            marginTop: '1rem',
                            padding: 2,
                            boxShadow: 3,
                            border: '1px solid #ccc',
                            borderRadius: '8px',
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
                                aria-label="comment"
                                sx={{ marginLeft: 'auto', marginRight: 'auto', padding: 0, '&:hover': { color: 'primary.dark' } }}
                                onClick={() => handleOpenModal(product)}
                            >
                                <ChatBubbleOutline />
                            </IconButton>

                            <IconButton aria-label="share" sx={{ marginRight: 0, padding: 0, '&:hover': { color: 'primary.dark' } }}>
                                <Share />
                            </IconButton>
                        </CardActions>

                        <CommentSection comments={defaultComments.slice(0, 1)} />

                        <Box sx={{ marginTop: 1 }}>
                            <TextField
                                variant="standard"
                                size="small"
                                placeholder="Place your offer"
                                fullWidth
                                sx={{
                                    p: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    '& .MuiInputBase-root': {
                                        border: 'none',
                                    },
                                    '& .MuiInput-underline:before': {
                                        border: 'none',
                                    },
                                    '&:hover .MuiInput-underline:before': {
                                        border: 'none',
                                    },
                                    '&:focus .MuiInput-underline:before': {
                                        border: 'none',
                                    },
                                }}
                            />
                        </Box>
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
        </Box>
    );
}

