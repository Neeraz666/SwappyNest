"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import axios from "axios"
import ProductModal from "./ProductModal"

const BASE_URL = "http://localhost:8000"

export default function LikedPostsModal({ open, onClose }) {
  const [likedProducts, setLikedProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLikedProducts()
    }
  }, [open])

  const fetchLikedProducts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/products/listlikedproducts/`)
      setLikedProducts(response.data || [])
    } catch (error) {
      console.error("Error fetching liked products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setProductModalOpen(true)
  }

  const handleCloseProductModal = () => {
    setProductModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: "80vh",
            maxHeight: "80vh",
            width: "90%",
            maxWidth: "1000px",
          },
        }}
      >
        <DialogTitle>
          Liked Posts
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : likedProducts.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="h6" color="text.secondary">
                You have not liked any products yet.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {likedProducts.map((product) => (
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
                      image={product.images[0]?.image || "/placeholder.svg?height=200&width=250"}
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
          )}
        </DialogContent>
      </Dialog>

      <ProductModal
        open={productModalOpen}
        onClose={handleCloseProductModal}
        product={
          selectedProduct
            ? {
              id: selectedProduct.id,
              name: selectedProduct.productname,
              uploadDate: selectedProduct.created_at,
              condition: selectedProduct.condition,
              purchaseYear: selectedProduct.purchaseyear,
              description: selectedProduct.description,
              images: selectedProduct.images.map((img) => img.image),
              uploadedBy: selectedProduct.user.username,
              userId: selectedProduct.user.id,
              userProfilePic: selectedProduct.user.profilephoto,
              category: selectedProduct.category,
            }
            : null
        }
      />
    </>
  )
}

