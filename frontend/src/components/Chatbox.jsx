"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useAuth } from "../context/authContext"
import AvatarComponent from "./AvatarComponent"
import ProductModal from "./ProductModal" // Import the ProductModal component

const BASE_URL = "http://127.0.0.1:8000"

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg?height=140&width=200"
  return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`
}

const ChatBox = ({ chat, onClose }) => {
  const { userData } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedModalProduct, setSelectedModalProduct] = useState(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (token) {
      setLoading(true)
      fetch(`http://localhost:8000/api/chatapp/conversations/${chat.id}/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages(data)
          setLoading(false)
          scrollToBottom()
        })
        .catch((error) => {
          console.error("Error fetching messages:", error)
          setLoading(false)
        })
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chat.name}/`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: data.sender_id === userData.id ? userData.username : chat.otherParticipant.username,
          text: data.content,
        },
      ])
      scrollToBottom()
    }

    return () => ws.close()
  }, [chat, userData.id, userData.username, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          sender_id: userData.id,
          receiver_id: chat.otherParticipant.id,
          message: newMessage,
        }),
      )

      setNewMessage("")
    }
  }

  const handleProductClick = (product, msg) => {
    const formattedProduct = {
      id: product.id,
      name: product.name,
      condition: product.condition,
      purchaseYear: product.purchaseYear,
      images: [product.image],
      description: product.description || "No description provided",
      uploadDate: product.uploadDate || "Not Provided",
      uploadedBy: msg.sender,
      userId: msg.sender === userData.username ? userData.id : chat.otherParticipant.id,
      userProfilePic:
        msg.sender === userData.username
          ? getFullImageUrl(userData.profilephoto)
          : getFullImageUrl(chat.otherParticipant.profilephoto),
    }
    setSelectedModalProduct(formattedProduct)
    setProductModalOpen(true)
  }

  const renderMessage = (msg) => {
    try {
      const parsedMsg = JSON.parse(msg.text)
      if (parsedMsg.type === "product") {
        const product = parsedMsg.data
        return (
          <Card sx={{ maxWidth: 345, my: 1, cursor: "pointer" }} onClick={() => handleProductClick(product, msg)}>
            <CardMedia component="img" height="140" image={getFullImageUrl(product.image)} alt={product.name} />
            <CardContent>
              <Typography gutterBottom  component="div">
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.condition} • {product.purchaseYear}
              </Typography>
            </CardContent>
          </Card>
        )
      }
    } catch (e) {
      // If parsing fails, it's a regular text message
      return <Typography variant="body2">{msg.text}</Typography>
    }
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ borderBottom: "1px solid #ddd", p: 2 }}
        >
          <Typography variant="h6">Chat with {chat.otherParticipant.username}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2, backgroundColor: "#f9f9f9" }}>
          {loading ? (
            <CircularProgress sx={{ margin: "auto", display: "block" }} />
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender === userData.username
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    mb: 1,
                    alignItems: "center",
                  }}
                >
                  {!isCurrentUser && (
                    <AvatarComponent
                      src={getFullImageUrl(chat.otherParticipant.profilephoto)}
                      userId={chat.otherParticipant.id}
                      size={32}
                    />
                  )}
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: isCurrentUser ? "#dcf8c6" : "#ffffff",
                      borderRadius: "8px",
                      maxWidth: "70%",
                      ml: isCurrentUser ? 1 : 0,
                      mr: !isCurrentUser ? 1 : 0,
                    }}
                  >
                    {renderMessage(msg)}
                  </Paper>
                  {isCurrentUser && (
                    <AvatarComponent src={getFullImageUrl(userData.profilephoto)} userId={userData.id} size={32} />
                  )}
                </Box>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: "flex", gap: 1, p: 2, borderTop: "1px solid #ddd" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </Box>
      </Paper>
      <ProductModal open={productModalOpen} onClose={() => setProductModalOpen(false)} product={selectedModalProduct} />
    </>
  )
}

export default ChatBox

