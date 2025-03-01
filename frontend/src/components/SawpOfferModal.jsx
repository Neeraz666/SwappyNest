"use client"

import { useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardMedia from "@mui/material/CardMedia"
import CardContent from "@mui/material/CardContent"
import Checkbox from "@mui/material/Checkbox"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import axios from "axios"
import { useAuth } from "../context/authContext"
import ProductModal from "./ProductModal" // Import the ProductModal component

const SwapOfferModal = ({ isOpen, onClose, selectedProduct }) => {
  const [userProducts, setUserProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [note, setNote] = useState("")
  const { userData } = useAuth()
  const BASE_URL = "http://localhost:8000"
  const socketRef = useRef(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedModalProduct, setSelectedModalProduct] = useState(null)

  useEffect(() => {
    if (isOpen && userData?.id) {
      fetchUserProducts()
    }
  }, [isOpen, userData?.id])

  const fetchUserProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user/${userData.id}/products`)
      console.log("Fetched user products:", response.data)
      setUserProducts(response.data)
    } catch (error) {
      console.error("Error fetching user products:", error)
    }
  }

  const handleProductSelect = (e, productId) => {
    e.stopPropagation() // Prevent the click event from bubbling up to the Card
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      return [...prev, productId]
    })
  }

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=140&width=200"
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`
  }

  const handleProductClick = (product) => {
    const formattedProduct = {
      id: product.id,
      name: product.productname,
      condition: product.condition,
      purchaseYear: product.purchaseyear,
      images: product.images.map((img) => getFullImageUrl(img.image)),
      description: product.description || "No description provided",
      uploadDate: product.created_at || "Not Provided",
      uploadedBy: userData.username,
      userId: userData.id,
      userProfilePic: getFullImageUrl(userData.profilephoto),
    }
    setSelectedModalProduct(formattedProduct)
    setProductModalOpen(true)
  }

  const sendMessage = (content) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        sender_id: userData.id,
        receiver_id: selectedProduct.user.id,
        message: content,
      }
      socketRef.current.send(JSON.stringify(message))
    }
  }

  const handleSubmit = async () => {
    // Establish WebSocket connection
    const conversationName = `conversation_${Math.min(userData.id, selectedProduct.user.id)}_${Math.max(userData.id, selectedProduct.user.id)}`
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${conversationName}/`)
    socketRef.current = ws

    ws.onopen = () => {
      // Send initial message
      sendMessage("I want to share:")

      // Send selected products
      const selectedProductsDetails = userProducts.filter((product) => selectedProducts.includes(product.id))
      selectedProductsDetails.forEach((product) => {
        const productMessage = JSON.stringify({
          type: "product",
          data: {
            id: product.id,
            name: product.productname,
            condition: product.condition,
            purchaseYear: product.purchaseyear,
            image: getFullImageUrl(product.images[0]?.image),
          },
        })
        sendMessage(productMessage)
      })

      // Send "With your product" message
      sendMessage("With your product:")

      // Send the selected product information
      const selectedProductMessage = JSON.stringify({
        type: "product",
        data: {
          id: selectedProduct.id,
          name: selectedProduct.productname,
          condition: selectedProduct.condition,
          purchaseYear: selectedProduct.purchaseyear,
          image: getFullImageUrl(selectedProduct.images[0]?.image),
        },
      })
      sendMessage(selectedProductMessage)

      // Send the custom note if it's not empty
      if (note.trim()) {
        sendMessage(note)
      }

      onClose()
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed")
    }
  }

  return (
    <>
      <Modal open={isOpen} onClose={onClose} aria-labelledby="swap-offer-modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 800,
            height: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ height: "10vh", mb: 2, position: "relative" }}>
            <Typography id="swap-offer-modal-title" variant="h6" component="h2">
              Select the products you want to swap
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ height: "55vh", overflow: "auto", mb: 2 }}>
            <Grid container spacing={3}>
              {userProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleProductClick(product)}
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleProductSelect(e, product.id)}
                      onClick={(e) => e.stopPropagation()} // Prevent the click event from bubbling up to the Card
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        zIndex: 1,
                        bgcolor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: 1,
                      }}
                    />
                    <CardMedia
                      component="img"
                      height="140"
                      image={getFullImageUrl(product.images[0]?.image)}
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
                      <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0, fontSize: "0.9rem" }}>
                        {product.productname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                        {product.condition} • {product.purchaseyear}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write something..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mb: 2, height: "15vh" }}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: "auto" }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={selectedProducts.length === 0}>
              Send Offer
            </Button>
          </Box>
        </Box>
      </Modal>
      <ProductModal open={productModalOpen} onClose={() => setProductModalOpen(false)} product={selectedModalProduct} />
    </>
  )
}

export default SwapOfferModal